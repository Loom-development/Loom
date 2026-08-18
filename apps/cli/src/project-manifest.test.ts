import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProjectManifest, loadProjectManifest, writeProjectManifest } from "./project-manifest.js";
import { findStackDefinition } from "./stacks.js";

const nodeStack = findStackDefinition("node");
if (!nodeStack) {
  throw new Error("node stack definition missing");
}

const renderInputs = {
  projectName: "loom-demo",
  databases: ["redis", "postgres"],
  adopted: false
};

test("buildProjectManifest records v2 render inputs and baseline paths", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await writeFile(join(targetDir, "loom.yaml"), "version: 1\n", "utf8");

    const manifest = await buildProjectManifest(targetDir, "0.3.4", nodeStack, nodeStack.loomOwnedFiles, renderInputs);

    assert.deepEqual(manifest, {
      version: 2,
      loomVersion: "0.3.4",
      stack: { id: "node", scaffoldVersion: "1" },
      ownedFiles: {
        "loom.yaml": {
          sha256: createHash("sha256").update("version: 1\n").digest("hex"),
          baselinePath: ".loom/baselines/loom.yaml"
        }
      },
      renderInputs: {
        projectName: "loom-demo",
        databases: ["postgres", "redis"],
        adopted: false
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

    const manifestPath = await writeProjectManifest(targetDir, "0.3.4", nodeStack, nodeStack.loomOwnedFiles, renderInputs);
    const first = await readFile(manifestPath, "utf8");
    await writeProjectManifest(targetDir, "0.3.4", nodeStack, nodeStack.loomOwnedFiles, renderInputs);
    const second = await readFile(manifestPath, "utf8");

    assert.equal(first, second);
    assert.match(first, /"loomVersion": "0\.3\.4"/);
    assert.match(first, /"\.env\.example"/);

    const loaded = await loadProjectManifest(targetDir);
    assert.equal(loaded.kind, "ready");
    if (loaded.kind !== "ready") throw new Error("expected ready manifest");
    assert.deepEqual(loaded.manifest.renderInputs, {
      projectName: "loom-demo",
      databases: ["postgres", "redis"],
      adopted: false
    });
    assert.equal(
      await readFile(join(targetDir, loaded.manifest.ownedFiles["loom.yaml"].baselinePath), "utf8"),
      await readFile(join(targetDir, "loom.yaml"), "utf8")
    );
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test("buildProjectManifest can record only files created during adoption", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await writeFile(join(targetDir, "loom.yaml"), "version: 1\n", "utf8");
    await writeFile(join(targetDir, ".env.example"), "USER_OWNED=true\n", "utf8");

    const manifest = await buildProjectManifest(targetDir, "0.3.4", nodeStack, ["loom.yaml"], renderInputs);

    assert.deepEqual(Object.keys(manifest.ownedFiles), ["loom.yaml"]);
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test("loadProjectManifest reports missing and v1 manifests distinctly", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    assert.deepEqual(await loadProjectManifest(targetDir), { kind: "missing" });
    await mkdir(join(targetDir, ".loom"), { recursive: true });
    const v1 = {
      version: 1,
      loomVersion: "0.3.4",
      stack: { id: "node", scaffoldVersion: "1" },
      ownedFiles: { "loom.yaml": { sha256: "a".repeat(64) } }
    };
    await writeFile(join(targetDir, ".loom", "manifest.json"), JSON.stringify(v1), "utf8");
    assert.deepEqual(await loadProjectManifest(targetDir), { kind: "migration-required", manifest: v1 });
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test("loadProjectManifest rejects unknown versions and unsafe owned paths", async () => {
  const targetDir = await mkdtemp(join(tmpdir(), "loom-manifest-"));
  try {
    await mkdir(join(targetDir, ".loom"), { recursive: true });
    const manifestPath = join(targetDir, ".loom", "manifest.json");
    await writeFile(manifestPath, JSON.stringify({ version: 3 }), "utf8");
    await assert.rejects(loadProjectManifest(targetDir), /unsupported manifest version/i);

    await writeFile(manifestPath, JSON.stringify({
      version: 2,
      loomVersion: "0.3.4",
      stack: { id: "node", scaffoldVersion: "1" },
      ownedFiles: { "../outside": { sha256: "a".repeat(64), baselinePath: ".loom/baselines/outside" } },
      renderInputs: { projectName: "loom-demo", databases: [], adopted: false }
    }), "utf8");
    await assert.rejects(loadProjectManifest(targetDir), /unsafe owned file path/i);
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});
