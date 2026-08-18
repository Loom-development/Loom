import test from "node:test";
import assert from "node:assert/strict";
import {
  findStackDefinition,
  listStackIds,
  stackDefinitions,
  stackIds,
  validateStackDefinition
} from "./stacks.js";

test("stack registry contains unique definitions for every published stack", () => {
  const ids = stackDefinitions.map((definition) => definition.id);

  assert.equal(ids.length, 31);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(listStackIds(), [...ids].sort());
});

test("stack definitions expose assets, scaffold versions, and initial Loom ownership", () => {
  const rails = findStackDefinition("rails7");
  assert.equal(rails?.id, "rails7");
  assert.equal(rails?.assetPath, "rails7");
  assert.equal(rails?.scaffoldVersion, "rails-7.1.5");
  assert.deepEqual(rails?.loomOwnedFiles, ["loom.yaml", ".env.example"]);
  assert.equal(findStackDefinition("missing"), undefined);
});

test("every stack has explicit, deterministic maintenance metadata", () => {
  assert.deepEqual([...stackIds].sort(), listStackIds());

  for (const definition of stackDefinitions) {
    assert.doesNotThrow(() => validateStackDefinition(definition));
    assert.deepEqual(
      definition.generatedPaths.map(({ path }) => path),
      definition.generatedPaths.map(({ path }) => path).sort()
    );
    assert.equal(
      new Set(definition.generatedPaths.map(({ path }) => path)).size,
      definition.generatedPaths.length
    );
    assert.deepEqual([...definition.protectedPaths], [...definition.protectedPaths].sort());
    assert.deepEqual(definition.compatibility, {
      architectures: ["arm", "arm64", "x64"],
      runtime: "podman-rootless"
    });
  }
});

test("representative stacks expose their exact generated paths", () => {
  assert.deepEqual(findStackDefinition("node")?.generatedPaths, [
    { path: "dist", category: "build" },
    { path: "node_modules", category: "dependency" }
  ]);
  assert.deepEqual(findStackDefinition("php")?.generatedPaths, [
    { path: "vendor", category: "dependency" }
  ]);
  assert.deepEqual(findStackDefinition("db-postgres")?.generatedPaths, []);
});

test("stack validation rejects unsafe, duplicate, unsorted, and overlapping paths", () => {
  const node = findStackDefinition("node")!;
  const unsafePaths = ["", ".", "/tmp/cache", "../cache", "cache/../dist", ".loom", ".loom/cache"];

  for (const path of unsafePaths) {
    assert.throws(
      () => validateStackDefinition({ ...node, generatedPaths: [{ path, category: "cache" }] }),
      /unsafe generated path/i
    );
  }

  assert.throws(
    () => validateStackDefinition({
      ...node,
      generatedPaths: [
        { path: "dist", category: "build" },
        { path: "dist", category: "cache" }
      ]
    }),
    /duplicate generated path/i
  );
  assert.throws(
    () => validateStackDefinition({
      ...node,
      generatedPaths: [
        { path: "node_modules", category: "dependency" },
        { path: "dist", category: "build" }
      ]
    }),
    /sorted/i
  );
  assert.throws(
    () => validateStackDefinition({ ...node, protectedPaths: ["../src"] }),
    /unsafe protected path/i
  );
  assert.throws(
    () => validateStackDefinition({
      ...node,
      generatedPaths: [{ path: "src", category: "cache" }]
    }),
    /contains protected path/i
  );
});
