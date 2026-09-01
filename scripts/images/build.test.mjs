import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildImage, main } from "./build.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

test("builds a custom catalog image with an argument-array invocation", async () => {
  const calls = [];
  const reference = await buildImage("loom-php", {
    catalogPath: path.join(repositoryRoot, "images/catalog.json"),
    platform: "linux/amd64",
    execute: async (command, args, options) => {
      calls.push({ command, args, options });
    }
  });

  assert.equal(reference, "localhost/loom-php:8.4.10-loom.1");
  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "build",
        "--platform",
        "linux/amd64",
        "--build-arg",
        "LOOM_BASE_IMAGE=docker.io/library/php:8.4.10-apache@sha256:d79e472947b150b581240b8d16ba234c0dd3a6a484881ebbed3bc9f53c81bd0b",
        "--file",
        path.join(repositoryRoot, "images/php/Containerfile"),
        "--tag",
        "localhost/loom-php:8.4.10-loom.1",
        path.join(repositoryRoot, "images/php")
      ],
      options: { cwd: repositoryRoot }
    }
  ]);
});

test("CLI accepts an image name and platform", async () => {
  const calls = [];
  await main(["loom-node-24", "--platform", "linux/arm64"], {
    build: async (name, options) => calls.push({ name, options })
  });

  assert.deepEqual(calls, [
    {
      name: "loom-node-24",
      options: { platform: "linux/arm64" }
    }
  ]);
});

test("rejects unknown, mirrored, and unsupported build requests", async () => {
  const catalogPath = path.join(repositoryRoot, "images/catalog.json");
  await assert.rejects(
    buildImage("missing", { catalogPath, execute: async () => {} }),
    /Unknown image "missing"/
  );
  await assert.rejects(
    buildImage("postgres-16", { catalogPath, execute: async () => {} }),
    /is a mirror and cannot be built/
  );
  await assert.rejects(
    buildImage("loom-php", {
      catalogPath,
      platform: "linux/s390x",
      execute: async () => {}
    }),
    /does not support linux\/s390x/
  );
});
