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

test("database stacks publish exact versioned package definitions and lifecycle metadata", () => {
  const expected = {
    "db-mysql": {
      runtimeImages: [{ env: "MYSQL_IMAGE", reference: "docker.io/library/mysql:8.4.6" }],
      start: [], readiness: { kind: "command", value: "mysqladmin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
      verification: ["mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-ploomroot"]
    },
    "db-sqlserver": {
      runtimeImages: [{ env: "MSSQL_IMAGE", reference: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04" }],
      start: [], readiness: { kind: "port", value: "127.0.0.1:1433", timeoutSeconds: 300 },
      verification: ["/opt/mssql-tools18/bin/sqlcmd", "-S", "127.0.0.1", "-U", "sa", "-P", "LoomDev!Passw0rd", "-C", "-Q", "SELECT 1"]
    },
    "db-postgres": {
      runtimeImages: [{ env: "POSTGRES_IMAGE", reference: "docker.io/library/postgres:16.9-alpine" }],
      start: [], readiness: { kind: "command", value: "pg_isready -U loom", timeoutSeconds: 95 },
      verification: ["pg_isready", "-U", "loom"]
    },
    "db-mongodb": {
      runtimeImages: [{ env: "MONGO_IMAGE", reference: "docker.io/library/mongo:7.0.21" }],
      start: [], readiness: { kind: "port", value: "127.0.0.1:27017", timeoutSeconds: 120 },
      verification: ["mongosh", "--quiet", "--username", "loom", "--password", "loom", "--authenticationDatabase", "admin", "--eval", "quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)"]
    },
    "db-redis": {
      runtimeImages: [{ env: "REDIS_IMAGE", reference: "docker.io/library/redis:7.4.5-alpine" }],
      start: ["redis-server --appendonly yes"], readiness: { kind: "command", value: "redis-cli ping | grep PONG", timeoutSeconds: 92 },
      verification: ["redis-cli", "ping"]
    },
    "db-elasticsearch": {
      runtimeImages: [{ env: "ELASTICSEARCH_IMAGE", reference: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10" }],
      start: [], readiness: { kind: "http", value: "http://127.0.0.1:9200/_cluster/health", timeoutSeconds: 300 },
      verification: ["curl", "--fail", "http://127.0.0.1:9200/_cluster/health"]
    },
    "db-sqlite": {
      runtimeImages: [{ env: "SQLITE_IMAGE", reference: "docker.io/library/alpine:3.20.7" }],
      start: ["sh -c \"apk add --no-cache sqlite && sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\""],
      readiness: { kind: "command", value: "sqlite3 /data/loom.db 'select 1;'", timeoutSeconds: 60 },
      verification: ["sqlite3", "/data/loom.db", "select 1;"]
    },
    "db-mariadb": {
      runtimeImages: [{ env: "MARIADB_IMAGE", reference: "docker.io/library/mariadb:11.8.2" }],
      start: [], readiness: { kind: "command", value: "mariadb-admin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
      verification: ["mariadb-admin", "ping", "-h", "127.0.0.1", "-uroot", "-ploomroot"]
    },
    "db-all": {
      runtimeImages: [
        { env: "ELASTICSEARCH_IMAGE", reference: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10" },
        { env: "MARIADB_IMAGE", reference: "docker.io/library/mariadb:11.8.2" },
        { env: "MONGO_IMAGE", reference: "docker.io/library/mongo:7.0.21" },
        { env: "MSSQL_IMAGE", reference: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04" },
        { env: "MYSQL_IMAGE", reference: "docker.io/library/mysql:8.4.6" },
        { env: "POSTGRES_IMAGE", reference: "docker.io/library/postgres:16.9-alpine" },
        { env: "REDIS_IMAGE", reference: "docker.io/library/redis:7.4.5-alpine" },
        { env: "SQLITE_IMAGE", reference: "docker.io/library/alpine:3.20.7" }
      ],
      start: ["redis-server --appendonly yes", "sh -c \"apk add --no-cache sqlite && sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\""],
      readiness: { kind: "http", value: "http://127.0.0.1:9200/_cluster/health", timeoutSeconds: 300 },
      verification: ["loom", "status"]
    }
  } as const;

  for (const [id, metadata] of Object.entries(expected)) {
    const definition = findStackDefinition(id)!;
    assert.equal(definition.definitionVersion, 2, id);
    assert.deepEqual(definition.legacyScaffoldVersions, ["1"], id);
    assert.equal(definition.assetPath, `${id}/templates`, id);
    assert.deepEqual(definition.generator, { kind: "none" }, id);
    assert.deepEqual(definition.runtimeImages, metadata.runtimeImages, `${id} images`);
    assert.deepEqual(definition.install, [], `${id} install`);
    assert.deepEqual(definition.start, metadata.start, `${id} start`);
    assert.deepEqual(definition.readiness, metadata.readiness, `${id} readiness`);
    assert.deepEqual(definition.verification, metadata.verification, `${id} verification`);
    assert.deepEqual(definition.hostWrites, [], `${id} host writes`);
    assert.deepEqual(definition.generatedPaths, [], `${id} generated paths`);
    assert.deepEqual(definition.protectedPaths, [], `${id} protected paths`);
  }

  assert.deepEqual(
    stackDefinitions.filter(({ definitionVersion }) => definitionVersion === 1).map(({ id }) => id),
    ["php-wordpress", "php-drupal", "php-symfony", "rails7", "rails7-hotwire"]
  );
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
