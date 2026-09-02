import assert from "node:assert/strict";
import test from "node:test";

import { createDigestDocument, validateDigestDocument } from "./digests.mjs";

const hash = (character) => `sha256:${character.repeat(64)}`;
const identity = "https://github.com/Loom-development/Loom/.github/workflows/images-release.yml@refs/heads/main";
const catalog = {
  schemaVersion: 1,
  registry: "ghcr.io/loom-development",
  images: [
    {
      name: "loom-node-24",
      kind: "custom",
      source: `docker.io/library/node:24@${hash("a")}`,
      version: "24.20.0-loom.2",
      platforms: ["linux/amd64", "linux/arm64"],
      context: "images/node"
    },
    {
      name: "postgres-16",
      kind: "mirror",
      source: `docker.io/library/postgres:16@${hash("b")}`,
      version: "16.9-alpine",
      platforms: ["linux/amd64", "linux/arm64"]
    }
  ]
};
const releases = [
  {
    name: "postgres-16",
    digest: hash("d"),
    platforms: ["linux/amd64", "linux/arm64"]
  },
  {
    name: "loom-node-24",
    digest: hash("c"),
    platforms: ["linux/amd64", "linux/arm64"]
  }
];

test("creates a stable complete GHCR digest document with mirror provenance", () => {
  const document = createDigestDocument(catalog, releases, identity);
  assert.deepEqual(document, {
    schemaVersion: 1,
    registry: catalog.registry,
    signatureIdentity: identity,
    images: [
      {
        name: "loom-node-24",
        version: "24.20.0-loom.2",
        image: "ghcr.io/loom-development/loom-node-24",
        digest: hash("c"),
        platforms: ["linux/amd64", "linux/arm64"]
      },
      {
        name: "postgres-16",
        version: "16.9-alpine",
        image: "ghcr.io/loom-development/postgres-16",
        digest: hash("d"),
        platforms: ["linux/amd64", "linux/arm64"],
        upstreamDigest: hash("b")
      }
    ]
  });
  assert.deepEqual(validateDigestDocument(document, catalog), []);
});

test("rejects incomplete, malformed, wrong-namespace, and wrong-platform documents", () => {
  const document = createDigestDocument(catalog, releases, identity);
  document.images.pop();
  document.images[0].digest = "sha256:not-a-digest";
  document.images[0].image = "docker.io/library/node";
  document.images[0].platforms = ["linux/amd64"];

  assert.match(
    validateDigestDocument(document, catalog).join("\n"),
    /missing postgres-16.*valid sha256.*GHCR namespace.*platforms/s
  );
});

test("requires mirror upstream provenance and one release per catalog image", () => {
  assert.throws(
    () => createDigestDocument(catalog, releases.slice(0, 1), identity),
    /missing release digest for loom-node-24/
  );
  const document = createDigestDocument(catalog, releases, identity);
  delete document.images[1].upstreamDigest;
  assert.match(validateDigestDocument(document, catalog).join("\n"), /upstream digest/);
});
