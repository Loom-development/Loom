import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadLoomConfig, loadLoomProject } from "./index.js";

test("config exports are available", () => {
  assert.equal(typeof loadLoomConfig, "function");
  assert.equal(typeof loadLoomProject, "function");
});

test("loadLoomProject resolves config from parent directories", async () => {
  const root = await mkdtemp(join(tmpdir(), "loom-config-"));
  const nested = join(root, "a", "b");
  await mkdir(nested, { recursive: true });

  const configPath = join(root, "loom.yaml");
  await writeFile(
    configPath,
    [
      "version: 1",
      "name: test-project",
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

  const previousCwd = process.cwd();
  process.chdir(nested);
  try {
    const loaded = await loadLoomProject();
    assert.equal(loaded.config.name, "test-project");
    assert.equal(loaded.projectRoot, root);
  } finally {
    process.chdir(previousCwd);
  }
});

test("loadLoomProject rejects unsafe service names", async () => {
  const root = await mkdtemp(join(tmpdir(), "loom-config-invalid-service-"));
  const configPath = join(root, "loom.yaml");

  await writeFile(
    configPath,
    [
      "version: 1",
      "name: test-project",
      "runtime:",
      "  engine: podman",
      "services:",
      "  bad service:",
      "    type: node",
      "    image: node:20-alpine"
    ].join("\n"),
    "utf8"
  );

  await assert.rejects(() => loadLoomProject(configPath), /Service names must start with an alphanumeric character/i);
});

test("loadLoomProject rejects invalid route host", async () => {
  const root = await mkdtemp(join(tmpdir(), "loom-config-invalid-host-"));
  const configPath = join(root, "loom.yaml");

  await writeFile(
    configPath,
    [
      "version: 1",
      "name: test-project",
      "runtime:",
      "  engine: podman",
      "services:",
      "  app:",
      "    type: node",
      "    image: node:20-alpine",
      "routes:",
      "  - host: bad host",
      "    service: app",
      "    port: 3000"
    ].join("\n"),
    "utf8"
  );

  await assert.rejects(() => loadLoomProject(configPath), /Route host must be a valid hostname/i);
});
