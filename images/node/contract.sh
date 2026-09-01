#!/usr/bin/env bash
set -euo pipefail

image_reference="${1:?usage: contract.sh <image-reference>}"
test_directory="$(mktemp -d)"
container_name="loom-node-contract-$$"

cleanup() {
  podman rm --force "${container_name}" >/dev/null 2>&1 || true
  rm -rf "${test_directory}"
}
trap cleanup EXIT

node_major="$(podman run --rm "${image_reference}" node --print \
  'process.versions.node.split(".")[0]')"
case "${node_major}" in
  22|24) ;;
  *)
    printf 'Expected Node 22 or 24, got %s\n' "${node_major}" >&2
    exit 1
    ;;
esac

podman run --rm "${image_reference}" npm --version >/dev/null
podman run --rm "${image_reference}" pnpm --version | grep -qx '10\.15\.0'
podman run --rm "${image_reference}" yarn --version | grep -qx '4\.9\.2'

mkdir -p "${test_directory}/dependency"
printf '%s\n' \
  '{"name":"loom-contract-dependency","version":"1.0.0","main":"index.js"}' \
  >"${test_directory}/dependency/package.json"
printf '%s\n' 'module.exports = "loom-node-ready";' \
  >"${test_directory}/dependency/index.js"

for package_manager in npm pnpm yarn; do
  project_directory="${test_directory}/${package_manager}"
  mkdir -p "${project_directory}"
  printf '%s\n' \
    '{"name":"loom-contract-app","version":"1.0.0","private":true,"dependencies":{"loom-contract-dependency":"file:../dependency"}}' \
    >"${project_directory}/package.json"

  podman run --rm \
    --volume "${test_directory}:/contract:Z" \
    --workdir "/contract/${package_manager}" \
    "${image_reference}" "${package_manager}" install --ignore-scripts >/dev/null
  podman run --rm \
    --volume "${test_directory}:/contract:Z" \
    --workdir "/contract/${package_manager}" \
    "${image_reference}" node --eval \
    'if (require("loom-contract-dependency") !== "loom-node-ready") process.exit(1);'
done

printf '%s\n' \
  'require("http").createServer((_request, response) => response.end("loom-node-ready")).listen(3000);' \
  >"${test_directory}/server.js"
podman run --detach --name "${container_name}" \
  --volume "${test_directory}:/contract:Z" \
  --workdir /contract \
  "${image_reference}" node server.js >/dev/null

ready=0
for _attempt in 1 2 3 4 5 6 7 8 9 10; do
  if [[ "$(podman exec "${container_name}" node --input-type=module --eval \
    'process.stdout.write(await (await fetch("http://127.0.0.1:3000")).text())' \
    2>/dev/null)" == "loom-node-ready" ]]; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "${ready}" -ne 1 ]]; then
  podman logs "${container_name}" >&2
  exit 1
fi

host_uid="$(id -u)"
host_gid="$(id -g)"
podman run --rm --user "${host_uid}:${host_gid}" --userns keep-id \
  --volume "${test_directory}:/contract:Z" \
  --workdir /contract "${image_reference}" \
  node --eval 'require("fs").writeFileSync("contract-owned.txt", "ok")'

actual_owner="$(stat -c '%u:%g' "${test_directory}/contract-owned.txt")"
if [[ "${actual_owner}" != "${host_uid}:${host_gid}" ]]; then
  printf 'Expected host-owned file %s:%s, got %s\n' \
    "${host_uid}" "${host_gid}" "${actual_owner}" >&2
  exit 1
fi
