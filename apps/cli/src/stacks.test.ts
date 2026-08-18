import test from "node:test";
import assert from "node:assert/strict";
import { findStackDefinition, listStackIds, stackDefinitions } from "./stacks.js";

test("stack registry contains unique definitions for every published stack", () => {
  const ids = stackDefinitions.map((definition) => definition.id);

  assert.equal(ids.length, 31);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(listStackIds(), [...ids].sort());
});

test("stack definitions expose assets, scaffold versions, and initial Loom ownership", () => {
  assert.deepEqual(findStackDefinition("rails7"), {
    id: "rails7",
    assetPath: "rails7",
    scaffoldVersion: "rails-7.1.5",
    loomOwnedFiles: ["loom.yaml", ".env.example"]
  });
  assert.equal(findStackDefinition("missing"), undefined);
});
