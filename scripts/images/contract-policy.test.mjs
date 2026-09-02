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
  assert.match(source, /Expected pnpm 10\.15\.0, got/);
  assert.match(source, /Expected Yarn 4\.9\.2, got/);
  assert.match(source, /Node contract failed at line/);
  assert.match(source, /install --mode=skip-build/);
  assert.match(source, /runtime_command=\(yarn node\)/);
});

test("WordPress version probe searches for the literal PHP variable", async () => {
  const source = await readFile(
    path.join(repositoryRoot, "images/wordpress/contract.sh"),
    "utf8"
  );
  assert.match(source, /'\$wp_version = '/);
  assert.doesNotMatch(source, /'\\\$wp_version = '/);
});
