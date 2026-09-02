import assert from "node:assert/strict";
import test from "node:test";

import { createPublishedImageResolver } from "./image-pins.js";

const digest = (character: string): string => `sha256:${character.repeat(64)}`;
const validDocument = {
  schemaVersion: 1,
  registry: "ghcr.io/loom-development",
  images: [
    {
      name: "loom-node-24",
      image: "ghcr.io/loom-development/loom-node-24",
      digest: digest("a")
    }
  ]
};

test("resolves a published image to its immutable GHCR manifest", () => {
  const resolveImage = createPublishedImageResolver(validDocument);

  assert.equal(
    resolveImage("loom-node-24"),
    `ghcr.io/loom-development/loom-node-24@${digest("a")}`
  );
});

test("rejects an unsupported schema and registry", () => {
  assert.throws(
    () => createPublishedImageResolver({ ...validDocument, schemaVersion: 2 }),
    /schemaVersion.*1/i
  );
  assert.throws(
    () => createPublishedImageResolver({ ...validDocument, registry: "docker.io/loom-development" }),
    /registry.*ghcr\.io\/loom-development/i
  );
});

test("rejects duplicate, malformed, and mismatched image records", () => {
  assert.throws(
    () => createPublishedImageResolver({
      ...validDocument,
      images: [...validDocument.images, validDocument.images[0]]
    }),
    /duplicate.*loom-node-24/i
  );
  assert.throws(
    () => createPublishedImageResolver({
      ...validDocument,
      images: [{ ...validDocument.images[0], image: "ghcr.io/loom-development/wrong" }]
    }),
    /loom-node-24.*repository/i
  );
  for (const invalidDigest of [`sha256:${"A".repeat(64)}`, "sha256:short"]) {
    assert.throws(
      () => createPublishedImageResolver({
        ...validDocument,
        images: [{ ...validDocument.images[0], digest: invalidDigest }]
      }),
      /loom-node-24.*digest/i
    );
  }
});

test("rejects an unknown requested image", () => {
  const resolveImage = createPublishedImageResolver(validDocument);

  assert.throws(() => resolveImage("loom-node-22"), /unknown.*loom-node-22/i);
});
