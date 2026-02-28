#!/usr/bin/env sh
set -eu

REPO="${LOOM_REPO:-Loom-development/Loom}"
VERSION="${LOOM_VERSION:-latest}"
INSTALL_DIR="${LOOM_INSTALL_DIR:-$HOME/.local/bin}"

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

echo "Installed loom to $INSTALL_DIR/loom"
case ":$PATH:" in
  *":$INSTALL_DIR:"*)
    ;;
  *)
    echo "Add $INSTALL_DIR to PATH to use loom globally"
    ;;
esac
