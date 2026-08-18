import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProjectManifest, writeProjectManifest } from "./project-manifest.js";
import { findStackDefinition } from "./stacks.js";

const nodeStack = findStackDefinition("node");
if (!nodeStack) {
  throw new Error("node stack definition missing");
}

test("buildProjectManifest hashes existing Loom-owned files and skips missing optional files", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await writeFile(join(targetDir, "loom.yaml"), "version: 1\n", "utf8");

    const manifest = await buildProjectManifest(targetDir, "0.3.4", nodeStack);

    assert.deepEqual(manifest, {
      version: 1,
      loomVersion: "0.3.4",
      stack: { id: "node", scaffoldVersion: "1" },
      ownedFiles: {
        "loom.yaml": {
          sha256: createHash("sha256").update("version: 1\n").digest("hex")
        }
      }
    });
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test("writeProjectManifest atomically replaces deterministic JSON", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await writeFile(join(targetDir, "loom.yaml"), "version: 1\n", "utf8");
    await writeFile(join(targetDir, ".env.example"), "NODE_IMAGE=node:24\n", "utf8");

    const manifestPath = await writeProjectManifest(targetDir, "0.3.4", nodeStack);
    const first = await readFile(manifestPath, "utf8");
    await writeProjectManifest(targetDir, "0.3.4", nodeStack);
    const second = await readFile(manifestPath, "utf8");

    assert.equal(first, second);
    assert.match(first, /"loomVersion": "0\.3\.4"/);
    assert.match(first, /"\.env\.example"/);
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test("buildProjectManifest can record only files created during adoption", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await writeFile(join(targetDir, "loom.yaml"), "version: 1\n", "utf8");
    await writeFile(join(targetDir, ".env.example"), "USER_OWNED=true\n", "utf8");

    const manifest = await buildProjectManifest(targetDir, "0.3.4", nodeStack, ["loom.yaml"]);

    assert.deepEqual(Object.keys(manifest.ownedFiles), ["loom.yaml"]);
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});
