import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadCatalog, validateCatalog } from "./catalog.mjs";

const validCatalog = {
  schemaVersion: 1,
  registry: "ghcr.io/loom-development",
  images: [
    {
      name: "loom-php",
      kind: "custom",
      source: "docker.io/library/php:8.4.10-apache@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      version: "8.4.10-loom.1",
      platforms: ["linux/amd64", "linux/arm64"],
      context: "images/php"
    }
  ]
};

test("accepts a complete Loom image catalog", () => {
  assert.deepEqual(validateCatalog(validCatalog), []);
});

test("rejects duplicate image names", () => {
  const catalog = structuredClone(validCatalog);
  catalog.images.push(structuredClone(catalog.images[0]));

  assert.deepEqual(validateCatalog(catalog), [
    'images contains duplicate name "loom-php"'
  ]);
});

test("rejects catalog entries that cannot produce immutable Loom images", () => {
  const catalog = structuredClone(validCatalog);
  catalog.registry = "docker.io/example";
  catalog.images[0].source = "docker.io/library/php:8.4-apache";
  catalog.images[0].platforms = ["linux/amd64"];
  delete catalog.images[0].context;

  assert.deepEqual(validateCatalog(catalog), [
    'registry must be "ghcr.io/loom-development"',
    'image "loom-php" source must include an immutable sha256 digest',
    'image "loom-php" must support linux/amd64 and linux/arm64',
    'custom image "loom-php" must define a relative context under images/'
  ]);
});

test("loads a valid catalog from disk", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "loom-image-catalog-"));
  const catalogPath = path.join(directory, "catalog.json");
  await writeFile(catalogPath, JSON.stringify(validCatalog));

  assert.deepEqual(await loadCatalog(catalogPath), validCatalog);
});

test("repository catalog covers every approved runtime and mirror", async () => {
  const repositoryRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../.."
  );
  const catalog = await loadCatalog(path.join(repositoryRoot, "images/catalog.json"));

  assert.deepEqual(
    catalog.images.map(({ name }) => name),
    [
      "loom-php",
      "loom-wordpress",
      "loom-node-22",
      "loom-node-24",
      "loom-python-3.12",
      "loom-ruby-3.3",
      "loom-bun-1",
      "loom-java-21",
      "loom-dotnet-8",
      "loom-sqlite-3",
      "postgres-16",
      "mysql-8.4",
      "mariadb-11.8",
      "redis-7.4",
      "mongo-7.0",
      "elasticsearch-8.17",
      "mssql-2022"
    ]
  );
});

test("reports an invalid catalog document instead of throwing", () => {
  assert.deepEqual(validateCatalog(null), ["catalog must be an object"]);
  assert.deepEqual(validateCatalog({}), [
    "schemaVersion must be 1",
    'registry must be "ghcr.io/loom-development"',
    "images must be an array"
  ]);
});

test("reports malformed image entry fields", () => {
  const catalog = {
    schemaVersion: 1,
    registry: "ghcr.io/loom-development",
    images: [
      {
        name: "Bad Name",
        kind: "copy",
        source: 42,
        version: "",
        platforms: "linux/amd64",
        context: "../outside"
      }
    ]
  };

  assert.deepEqual(validateCatalog(catalog), [
    'image at index 0 has invalid name "Bad Name"',
    'image "Bad Name" kind must be custom or mirror',
    'image "Bad Name" source must include an immutable sha256 digest',
    'image "Bad Name" must define a non-empty version',
    'image "Bad Name" platforms must be an array'
  ]);
});

test("requires a reason when an upstream mirror lacks ARM64", () => {
  const catalog = structuredClone(validCatalog);
  catalog.images[0] = {
    name: "mssql-2022",
    kind: "mirror",
    source: "mcr.microsoft.com/mssql/server:2022@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    version: "2022",
    platforms: ["linux/amd64"]
  };

  assert.deepEqual(validateCatalog(catalog), [
    'mirror "mssql-2022" without linux/arm64 must define platformLimit'
  ]);
});
