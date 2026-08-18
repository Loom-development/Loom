import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { findStackDefinition, stackDefinitions } from "./index.js";
import { validateGeneratorVersion, validateRuntimeImage, validateStackDefinition } from "./definition.js";

test("pin validators reject floating versions and accept exact tag families", () => {
  for (const reference of ["node", "node:latest", "node:24", "postgres:16", "composer:2"]) {
    assert.throws(() => validateRuntimeImage({ env: "NODE_IMAGE", reference }), /exact version tag/i);
  }
  for (const reference of [
    "node:24.4.1-alpine", "postgres:16.9-alpine", "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04",
    `node:24.4.1-alpine@sha256:${"a".repeat(64)}`
  ]) assert.doesNotThrow(() => validateRuntimeImage({ env: "NODE_IMAGE", reference }));
  assert.throws(() => validateRuntimeImage({ env: "node_image", reference: "node:24.4.1-alpine" }), /uppercase/i);

  for (const version of ["", "latest", "next", "nightly", "unversioned", "^7.1.5", "7.x", "*"]) {
    assert.throws(() => validateGeneratorVersion(version), /exact generator version/i);
  }
  for (const version of ["7.1.5", "11.1", "6.8.2-beta.1"]) assert.doesNotThrow(() => validateGeneratorVersion(version));
});

test("definitions enforce version, aliases, canonical assets, and maintenance safety", () => {
  const node = findStackDefinition("node")!;
  assert.throws(() => validateStackDefinition({ ...node, definitionVersion: 0 }), /positive integer/i);
  assert.throws(() => validateStackDefinition({ ...node, assetPath: "../node" }), /unsafe asset path/i);
  assert.throws(() => validateStackDefinition({ ...node, legacyScaffoldVersions: ["1", "1"] }), /duplicate legacy/i);
  assert.throws(() => validateStackDefinition({ ...node, legacyScaffoldVersions: ["z", "a"] }), /sorted/i);
  for (const definition of stackDefinitions) assert.doesNotThrow(() => validateStackDefinition(definition));
});

test("Node template inventory and bytes match the approved migration fixture", async () => {
  const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "node");
  const expected = JSON.parse(await readFile(resolve(root, "fixtures/expected.json"), "utf8")) as Record<string, string>;
  const entries = (await readdir(resolve(root, "templates"))).sort();
  assert.deepEqual(entries, Object.keys(expected).sort());
  for (const entry of entries) {
    const bytes = await readFile(resolve(root, "templates", entry));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected[entry], entry);
  }
  assert.match(await readFile(resolve(root, "templates/loom.yaml"), "utf8"), /node:24\.4\.1-alpine/);
});
