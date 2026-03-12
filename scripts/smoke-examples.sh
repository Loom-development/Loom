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

for cfg in $configs; do
  echo "===== SMOKE: $cfg ====="

  pnpm --filter @loom/cli dev stop --config "$cfg" >/dev/null 2>&1 || true

  if pnpm --filter @loom/cli dev start --config "$cfg"; then
    pnpm --filter @loom/cli dev ps --config "$cfg" || true
    pnpm --filter @loom/cli dev stop --config "$cfg" || true
    echo "===== PASS: $cfg ====="
    pass=$((pass + 1))
  else
    pnpm --filter @loom/cli dev stop --config "$cfg" >/dev/null 2>&1 || true
    echo "===== FAIL: $cfg ====="
    fail=$((fail + 1))
  fi

  echo
 done

echo "RESULT: pass=$pass fail=$fail"
if [ "$fail" -gt 0 ]; then
  exit 1
fi
