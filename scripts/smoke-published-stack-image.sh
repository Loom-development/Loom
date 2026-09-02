#!/usr/bin/env sh
set -eu

if [ "$#" -gt 1 ]; then
  echo "Usage: smoke-published-stack-image.sh [stack-id]" >&2
  exit 1
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
export LOOM_PUBLISHED_IMAGE_PREFLIGHT=1
export LOOM_GENERATED_SMOKE_KEEP="${LOOM_PUBLISHED_SMOKE_KEEP:-0}"

exec "$SCRIPT_DIR/smoke-generated-stacks.sh" "${1:-node}"
