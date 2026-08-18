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

test("language application stacks publish exact versioned package definitions", () => {
  const expected = {
    python: [{ env: "PYTHON_IMAGE", reference: "docker.io/library/python:3.12.11-slim" }],
    "python-django": [{ env: "PYTHON_IMAGE", reference: "docker.io/library/python:3.12.11-slim" }],
    "python-flask": [{ env: "PYTHON_IMAGE", reference: "docker.io/library/python:3.12.11-slim" }],
    "python-fastapi": [{ env: "PYTHON_IMAGE", reference: "docker.io/library/python:3.12.11-slim" }],
    php: [
      { env: "MEMCACHED_IMAGE", reference: "docker.io/library/memcached:1.6.39-alpine" },
      { env: "PHP_IMAGE", reference: "docker.io/library/php:8.4.10-apache" }
    ],
    dotnet: [{ env: "DOTNET_IMAGE", reference: "mcr.microsoft.com/dotnet/sdk:8.0.412" }],
    "spring-react": [
      { env: "JAVA_IMAGE", reference: "docker.io/library/maven:3.9.11-eclipse-temurin-21" },
      { env: "NODE_IMAGE", reference: "docker.io/library/node:22.17.1-alpine" }
    ],
    "spring-boot": [{ env: "JAVA_IMAGE", reference: "docker.io/library/maven:3.9.11-eclipse-temurin-21" }],
    "django-react": [
      { env: "NODE_IMAGE", reference: "docker.io/library/node:24.4.1-alpine" },
      { env: "PYTHON_IMAGE", reference: "docker.io/library/python:3.12.11-slim" }
    ]
  } as const;

  for (const [id, runtimeImages] of Object.entries(expected)) {
    const definition = findStackDefinition(id)!;
    assert.equal(definition.definitionVersion, 2, id);
    assert.deepEqual(definition.legacyScaffoldVersions, ["1"], id);
    assert.equal(definition.assetPath, `${id}/templates`, id);
    assert.deepEqual(definition.generator, { kind: "none" }, id);
    assert.deepEqual(definition.runtimeImages, runtimeImages, id);
  }

  assert.deepEqual(findStackDefinition("php")!.generatedPaths, [{ path: "vendor", category: "dependency" }]);
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
