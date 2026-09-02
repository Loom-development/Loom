import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("multi-line Java and PHP probes cannot trigger pipefail through grep --quiet", async () => {
  for (const contract of ["images/java/21/contract.sh", "images/php/contract.sh"]) {
    const source = await readFile(path.join(repositoryRoot, contract), "utf8");
    assert.doesNotMatch(source, /\|\s*grep\s+[^\n]*q/);
  }
});

test("Node tool version failures report expected and actual versions", async () => {
  const source = await readFile(path.join(repositoryRoot, "images/node/contract.sh"), "utf8");
  assert.match(source, /Expected npm 11\.19\.1, got/);
  assert.match(source, /Expected npm tar 7\.5\.22, got/);
  assert.match(source, /Expected pnpm 10\.15\.0, got/);
  assert.match(source, /Expected Yarn 4\.9\.2, got/);
  assert.match(source, /Node contract failed at line/);
  assert.match(source, /install --mode=skip-build/);
  assert.match(source, /runtime_command=\(yarn node\)/);
  assert.match(source, /YARN_ENABLE_GLOBAL_CACHE=false/);
});

test("PHP-family contracts report the command that failed", async () => {
  for (const contract of ["images/php/contract.sh", "images/wordpress/contract.sh"]) {
    const source = await readFile(path.join(repositoryRoot, contract), "utf8");
    assert.match(source, /contract failed at line/);
    assert.match(source, /xdebug_info\("mode"\) === \[\]/);
    assert.doesNotMatch(source, /ini_get\("xdebug\.mode"\)/);
  }
});

test("WordPress version probe searches for the literal PHP variable", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "images/wordpress/contract.sh"),
    "utf8"
  );
  assert.match(source, /'\$wp_version = '/);
  assert.doesNotMatch(source, /'\\\$wp_version = '/);
});

test("WordPress contract removes container-owned fixtures inside the Podman user namespace", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "images/wordpress/contract.sh"),
    "utf8"
  );
  assert.match(source, /podman unshare rm -rf -- "\$\{test_directory\}"/);
  assert.doesNotMatch(source, /^\s*rm -rf "\$\{test_directory\}"/m);
});

test("PHP entrypoint authorizes a custom Apache document root", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "images/php/docker-entrypoint-loom"),
    "utf8"
  );
  assert.match(source, /<Directory \"%s\">/);
  assert.match(source, /Require all granted/);
  assert.match(source, /conf-enabled\/zz-loom-document-root\.conf/);
});
