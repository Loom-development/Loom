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

  assert.equal(reference, "localhost/loom-php:8.4.25-loom.1");
  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "build",
        "--platform",
        "linux/amd64",
        "--build-arg",
        "LOOM_BASE_IMAGE=docker.io/library/php:8.4.25-apache@sha256:51da594c844a97f31b1cd6b1ac6660982f40788f4fe13e75f7fd39e2f9b58651",
        "--file",
        path.join(repositoryRoot, "images/php/Containerfile"),
        "--tag",
        "localhost/loom-php:8.4.25-loom.1",
        path.join(repositoryRoot, "images/php")
      ],
      options: { cwd: repositoryRoot }
    }
  ]);
});

test("builds a runtime dependency before its dependent image", async () => {
  const calls = [];
  const reference = await buildImage("loom-wordpress", {
    catalogPath: path.join(repositoryRoot, "images/catalog.json"),
    platform: "linux/amd64",
    execute: async (command, args, options) => {
      calls.push({ command, args, options });
    }
  });

  assert.equal(reference, "localhost/loom-wordpress:6.8.3-php8.4-loom.1");
  assert.equal(calls.length, 2);
  assert.equal(calls[0].args.at(-2), "localhost/loom-php:8.4.25-loom.1");
  assert.deepEqual(
    calls[1].args.filter((argument) => argument.startsWith("LOOM_")),
    [
      "LOOM_BASE_IMAGE=localhost/loom-php:8.4.25-loom.1",
      "LOOM_SOURCE_IMAGE=docker.io/library/wordpress:6.8.3-php8.4-apache@sha256:da2a1ff20daa435abf260853ebfd829b1f5f9b8400938940c7393f786a63bf94"
    ]
  );
  assert.equal(
    calls[1].args.at(-2),
    "localhost/loom-wordpress:6.8.3-php8.4-loom.1"
  );
});

test("stops when a runtime dependency build fails", async () => {
  const failure = new Error("runtime build failed");
  const calls = [];

  await assert.rejects(
    buildImage("loom-wordpress", {
      catalogPath: path.join(repositoryRoot, "images/catalog.json"),
      execute: async (command, args) => {
        calls.push({ command, args });
        throw failure;
      }
    }),
    (error) => error === failure
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].args.at(-2), "localhost/loom-php:8.4.25-loom.1");
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
