import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function runCli(args: string[]) {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const cliPath = resolve(currentFileDir, "index.js");

  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8"
  });
}

test("logs reports unknown service with suggestion and available services", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-logs-"));
  const configPath = join(tempRoot, "loom.yaml");
  await writeFile(
    configPath,
    [
      "version: 1",
      "name: ux-test",
      "runtime:",
      "  engine: podman",
      "  rootless: true",
      "services:",
      "  app:",
      "    type: node",
      "    image: node:20-alpine"
    ].join("\n"),
    "utf8"
  );

  const result = runCli(["logs", "ap", "--config", configPath, "--no-follow"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Service 'ap' is not defined/i);
  assert.match(result.stderr || result.stdout, /Did you mean 'app'\?/i);
  assert.match(result.stderr || result.stdout, /Available services: app/i);
});

test("exec reports unknown service with suggestion", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-exec-"));
  const configPath = join(tempRoot, "loom.yaml");
  await writeFile(
    configPath,
    [
      "version: 1",
      "name: ux-test",
      "runtime:",
      "  engine: podman",
      "  rootless: true",
      "services:",
      "  app:",
      "    type: node",
      "    image: node:20-alpine"
    ].join("\n"),
    "utf8"
  );

  const result = runCli(["exec", "ap", "--config", configPath, "--", "echo", "hello"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Service 'ap' is not defined/i);
  assert.match(result.stderr || result.stdout, /Did you mean 'app'\?/i);
});
