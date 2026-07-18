#!/usr/bin/env sh
set -eu

configs="
examples/dotnet/loom.yaml
examples/rails7/loom.yaml
examples/jamstack/loom.yaml
examples/serverless/loom.yaml
examples/spring-react/loom.yaml
"

pass=0
fail=0

# Stop any running Loom proxies before the suite
podman ps --filter name=-proxy --format '{{.Names}}' 2>/dev/null | while read -r name; do
  podman rm -f "$name" 2>/dev/null || true
done
sleep 2

for cfg in $configs; do
  echo "===== SMOKE: $cfg ====="

  pnpm --filter @loomdev/cli dev stop --config "$cfg" >/dev/null 2>&1 || true

  if pnpm --filter @loomdev/cli dev start --config "$cfg"; then
    pnpm --filter @loomdev/cli dev ps --config "$cfg" || true
    pnpm --filter @loomdev/cli dev stop --config "$cfg" || true
    echo "===== PASS: $cfg ====="
    pass=$((pass + 1))
  else
    pnpm --filter @loomdev/cli dev stop --config "$cfg" >/dev/null 2>&1 || true
    echo "===== FAIL: $cfg ====="
    fail=$((fail + 1))
  fi

  # Wait for port to free
  sleep 2

  echo
done

echo "RESULT: pass=$pass fail=$fail"
if [ "$fail" -gt 0 ]; then
  exit 1
fi
