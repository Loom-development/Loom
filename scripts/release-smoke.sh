#!/usr/bin/env sh
set -eu

LOOM_BIN="${LOOM_BIN:-loom}"
KEEP_WORK_ROOT="${LOOM_RELEASE_SMOKE_KEEP:-0}"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

run_loom() {
  if [ -n "${LOOM_BIN_PATH:-}" ]; then
    "$LOOM_BIN_PATH" "$@"
    return
  fi

  if [ -n "${LOOM_BIN_NODE_ENTRY:-}" ]; then
    node "$LOOM_BIN_NODE_ENTRY" "$@"
    return
  fi

  echo "Unable to resolve Loom CLI executable." >&2
  exit 1
}

resolve_loom_bin() {
  if command -v "$LOOM_BIN" >/dev/null 2>&1; then
    LOOM_BIN_PATH="$(command -v "$LOOM_BIN")"
    return
  fi

  if [ "$LOOM_BIN" != "loom" ]; then
    echo "Missing required command: $LOOM_BIN" >&2
    exit 1
  fi

  local_cli_entry="$REPO_ROOT/apps/cli/dist/index.js"
  if [ -f "$local_cli_entry" ]; then
    require_command node
    LOOM_BIN_NODE_ENTRY="$local_cli_entry"
    echo "Using local Loom CLI build at $LOOM_BIN_NODE_ENTRY"
    return
  fi

  echo "Missing required command: loom" >&2
  echo "Build the local CLI first with: pnpm --dir apps/cli build" >&2
  exit 1
}

resolve_loom_bin
require_command podman
require_command perl
require_command stat
require_command id
require_command grep

uid="$(id -u)"
gid="$(id -g)"

if [ -n "${LOOM_RELEASE_SMOKE_DIR:-}" ]; then
  work_root="$LOOM_RELEASE_SMOKE_DIR"
  mkdir -p "$work_root"
  KEEP_WORK_ROOT=1
else
  work_root="$(mktemp -d "${TMPDIR:-/tmp}/loom-release-smoke-XXXXXX")"
fi

cleanup() {
  if [ "$KEEP_WORK_ROOT" = "0" ] && [ -d "$work_root" ]; then
    if rm -rf "$work_root" 2>/dev/null; then
      return 0
    fi

    if podman unshare rm -rf "$work_root" 2>/dev/null; then
      return 0
    fi

    echo "Warning: failed to remove release smoke workspace cleanly; preserved: $work_root" >&2
    return 0
  else
    echo "Preserved release smoke workspace: $work_root"
  fi
}

trap cleanup EXIT

pass=0
fail=0

stop_project() {
  project_dir="$1"
  if [ -d "$project_dir" ]; then
    (
      cd "$project_dir"
      run_loom stop >/dev/null 2>&1 || true
    )
  fi
}

assert_owner() {
  path="$1"
  expected="$2"
  actual="$(stat -c '%u:%g' "$path")"
  if [ "$actual" != "$expected" ]; then
    echo "Ownership mismatch for $path: expected $expected, got $actual" >&2
    return 1
  fi
}

set_env_value() {
  file="$1"
  key="$2"
  value="$3"

  if grep -q "^${key}=" "$file"; then
    perl -0pi -e "s/^${key}=.*$/${key}=${value}/m" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
  fi
}

configure_host_ids() {
  env_file="$1"
  set_env_value "$env_file" HOST_UID "$uid"
  set_env_value "$env_file" HOST_GID "$gid"
}

smoke_stack() {
  label="$1"
  template="$2"
  image_override="$3"
  project_dir="$work_root/$label"

  echo "===== RELEASE SMOKE: $label ====="

  if ! run_loom init "$template" --dir "$project_dir" --image "$image_override"; then
    echo "init failed for $label" >&2
    fail=$((fail + 1))
    KEEP_WORK_ROOT=1
    echo
    return
  fi

  if (
    cd "$project_dir"
    configure_host_ids .env
    run_loom start --recreate || exit 1

    case "$label" in
      node)
        run_loom exec app -- sh -c 'id && pwd && printf "node-write\n" > owned-by-host.txt && ls -ld node_modules' || exit 1
        assert_owner owned-by-host.txt "$uid:$gid" || exit 1
        assert_owner node_modules "$uid:$gid" || exit 1
        ;;
      python)
        run_loom exec app -- sh -c 'id && pwd && printf "python-write\n" > owned-by-host.txt && ls -l index.html' || exit 1
        assert_owner owned-by-host.txt "$uid:$gid" || exit 1
        assert_owner index.html "$uid:$gid" || exit 1
        ;;
      rails7)
        run_loom exec app -- sh -c 'id && pwd && mkdir -p tmp && printf "rails-write\n" > tmp/owned-by-host.txt && ls -ld tmp tmp/owned-by-host.txt' || exit 1
        assert_owner tmp/owned-by-host.txt "$uid:$gid" || exit 1
        ;;
      wordpress)
        run_loom exec app -- sh -c 'id && pwd && mkdir -p wp-content/uploads && printf "wordpress-write\n" > wp-content/uploads/owned-by-host.txt && ls -ld wp-content/uploads wp-content/uploads/owned-by-host.txt' || exit 1
        assert_owner wp-content/uploads/owned-by-host.txt "$uid:$gid" || exit 1
        ;;
      django-react)
        run_loom exec backend -- sh -c 'id && pwd && printf "django-react-write\n" > owned-by-host.txt && ls -l db.sqlite3' || exit 1
        assert_owner backend/owned-by-host.txt "$uid:$gid" || exit 1
        assert_owner backend/db.sqlite3 "$uid:$gid" || exit 1
        assert_owner frontend/node_modules "$uid:$gid" || exit 1
        ;;
      *)
        echo "Unknown release smoke label: $label" >&2
        exit 1
        ;;
    esac
  ); then
    stop_project "$project_dir"
    echo "===== PASS: $label ====="
    pass=$((pass + 1))
  else
    stop_project "$project_dir"
    echo "===== FAIL: $label =====" >&2
    fail=$((fail + 1))
    KEEP_WORK_ROOT=1
  fi

  echo
}

smoke_stack node node "NODE_IMAGE=docker.io/library/node:22-alpine"
smoke_stack python python "PYTHON_IMAGE=docker.io/library/python:3.12-slim"
smoke_stack rails7 rails7 "RUBY_IMAGE=docker.io/library/ruby:3.3"
smoke_stack wordpress php-wordpress "PHP_IMAGE=docker.io/library/php:8.3-apache"
smoke_stack django-react django-react "PYTHON_IMAGE=docker.io/library/python:3.12-slim"

echo "RESULT: pass=$pass fail=$fail"
if [ "$fail" -gt 0 ]; then
  exit 1
fi
