#!/usr/bin/env sh
set -eu

REPO="${LOOM_REPO:-Loom-development/Loom}"
VERSION="${LOOM_VERSION:-latest}"
INSTALL_DIR="${LOOM_INSTALL_DIR:-$HOME/.local/bin}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1"
    exit 1
  fi
}

require_command node
require_command podman
require_command tar
require_command install

node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
if [ -z "$node_major" ] || [ "$node_major" -lt 24 ]; then
  echo "Node.js 24+ is required. Current version: $(node -v 2>/dev/null || echo unknown)"
  exit 1
fi

if ! podman info >/dev/null 2>&1; then
  echo "Warning: Podman is installed but not currently reachable."
  echo "Run 'loom start' after installation; Loom will auto-start Podman Machine on macOS/Windows."
fi

uname_s="$(uname -s)"
uname_m="$(uname -m)"

case "$uname_s" in
  Linux) os="linux" ;;
  Darwin) os="darwin" ;;
  *)
    echo "Unsupported OS: $uname_s"
    exit 1
    ;;
esac

case "$uname_m" in
  x86_64|amd64) arch="x64" ;;
  aarch64|arm64) arch="arm64" ;;
  *)
    echo "Unsupported architecture: $uname_m"
    exit 1
    ;;
esac

asset="loom-${os}-${arch}.tar.gz"
if [ "$VERSION" = "latest" ]; then
  url="https://github.com/${REPO}/releases/latest/download/${asset}"
else
  url="https://github.com/${REPO}/releases/download/${VERSION}/${asset}"
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$INSTALL_DIR"

echo "Downloading $url"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$url" -o "$tmp_dir/loom.tar.gz"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$tmp_dir/loom.tar.gz" "$url"
else
  echo "curl or wget is required"
  exit 1
fi

tar -xzf "$tmp_dir/loom.tar.gz" -C "$tmp_dir"
install -m 0755 "$tmp_dir/loom" "$INSTALL_DIR/loom"
install -m 0644 "$tmp_dir/loom.mjs" "$INSTALL_DIR/loom.mjs"
rm -rf "$INSTALL_DIR/examples"
if [ -d "$tmp_dir/examples" ]; then
  cp -R "$tmp_dir/examples" "$INSTALL_DIR/examples"
fi

echo "Installed loom to $INSTALL_DIR/loom"
case ":$PATH:" in
  *":$INSTALL_DIR:"*)
    ;;
  *)
    echo "Add $INSTALL_DIR to PATH to use loom globally"
    ;;
esac
