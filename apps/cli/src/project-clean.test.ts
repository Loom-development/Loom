import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LoomProjectManifestV2 } from "./project-manifest.js";
import { applyProjectClean, planProjectClean } from "./project-clean.js";
import type { StackDefinition, StackGeneratedPath } from "./stacks.js";

async function fixture(generatedPaths: readonly StackGeneratedPath[] = [
  { path: "dist", category: "build" },
  { path: "node_modules", category: "dependency" }
]) {
  const root = await mkdtemp(join(tmpdir(), "loom-clean-"));
  const projectRoot = join(root, "project");
  await mkdir(join(projectRoot, ".loom", "database"), { recursive: true });
  await mkdir(join(projectRoot, "src"), { recursive: true });
  await writeFile(join(projectRoot, ".loom", "database", "data"), "database\n");
  await writeFile(join(projectRoot, "src", "app.ts"), "source\n");
  await writeFile(join(projectRoot, "loom.yaml"), "name: demo\n");
  await writeFile(join(projectRoot, ".env"), "SECRET=value\n");
  await writeFile(join(projectRoot, "package.json"), "{}\n");
  await writeFile(join(projectRoot, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  await writeFile(join(projectRoot, "notes.txt"), "unrelated\n");
  const stack: StackDefinition = {
    id: "node", assetPath: "node", scaffoldVersion: "1", loomOwnedFiles: ["loom.yaml"],
    generatedPaths, protectedPaths: ["src"],
    compatibility: { architectures: ["x64"], runtime: "podman-rootless" }
  };
  const manifest: LoomProjectManifestV2 = {
    version: 2, loomVersion: "0.3.4", stack: { id: "node", scaffoldVersion: "1" },
    ownedFiles: { "loom.yaml": { sha256: "a".repeat(64), baselinePath: ".loom/baselines/loom" } },
    renderInputs: { projectName: "demo", databases: [], adopted: false }
  };
  return { root, projectRoot, stack, manifest };
}

test("planner sorts generated paths and totals regular files without changing the project", async () => {
  const value = await fixture();
  try {
    await mkdir(join(value.projectRoot, "dist", "nested"), { recursive: true });
    await writeFile(join(value.projectRoot, "dist", "nested", "app.js"), "built output\n");
    const before = await readFile(join(value.projectRoot, "notes.txt"));
    const plan = await planProjectClean(value);
    assert.deepEqual(plan.items.map(({ path, exists }) => ({ path, exists })), [
      { path: "dist", exists: true },
      { path: "node_modules", exists: false }
    ]);
    assert.equal(plan.totalBytes, Buffer.byteLength("built output\n"));
    assert.deepEqual(await readFile(join(value.projectRoot, "notes.txt")), before);
  } finally { await rm(value.root, { recursive: true, force: true }); }
});

test("planner returns an empty plan for stacks without generated paths", async () => {
  const value = await fixture([]);
  try {
    assert.deepEqual(await planProjectClean(value), {
      projectRoot: value.projectRoot, items: [], totalBytes: 0, protectedPaths: [".env", "loom.yaml", "src"]
    });
  } finally { await rm(value.root, { recursive: true, force: true }); }
});

test("planner rejects unsafe and protected declarations before returning a plan", async () => {
  const cases = ["", ".", "../outside", "/tmp/outside", "bad\\path", ".loom", ".loom/cache", "loom.yaml", ".env", "package.json", "pnpm-lock.yaml", "src", "owned/loom.yaml"];
  for (const path of cases) {
    const value = await fixture([{ path, category: "cache" }]);
    try {
      value.manifest.ownedFiles["owned/loom.yaml"] = { sha256: "b".repeat(64), baselinePath: ".loom/baselines/owned" };
      await assert.rejects(planProjectClean(value), /unsafe|protected/i, path);
    } finally { await rm(value.root, { recursive: true, force: true }); }
  }
});

test("planner rejects symlinked targets, parents, and entries encountered during size walking", async () => {
  for (const kind of ["target", "parent", "child"] as const) {
    const path = kind === "parent" ? "cache/generated" : "cache";
    const value = await fixture([{ path, category: "cache" }]);
    try {
      const outside = join(value.root, "outside");
      await mkdir(outside);
      if (kind === "target") await symlink(outside, join(value.projectRoot, "cache"));
      if (kind === "parent") await symlink(outside, join(value.projectRoot, "cache"));
      if (kind === "child") {
        await mkdir(join(value.projectRoot, "cache"));
        await symlink(outside, join(value.projectRoot, "cache", "linked"));
      }
      await assert.rejects(planProjectClean(value), /symlink/i);
    } finally { await rm(value.root, { recursive: true, force: true }); }
  }
});

test("planner rejects dependency manifests and lockfiles nested within a generated target", async () => {
  for (const file of ["package.json", "nested/Gemfile.lock"]) {
    const value = await fixture([{ path: "output", category: "build" }]);
    try {
      await mkdir(join(value.projectRoot, "output", "nested"), { recursive: true });
      await writeFile(join(value.projectRoot, "output", file), "protected\n");
      await assert.rejects(planProjectClean(value), /protected/i);
    } finally { await rm(value.root, { recursive: true, force: true }); }
  }
});

test("executor removes only planned paths, reports missing paths, and preserves protected state", async () => {
  const value = await fixture();
  try {
    await mkdir(join(value.projectRoot, "dist"));
    await writeFile(join(value.projectRoot, "dist", "app.js"), "output\n");
    const preserved = [".loom/database/data", "src/app.ts", "loom.yaml", ".env", "package.json", "pnpm-lock.yaml", "notes.txt"];
    const snapshots = new Map(await Promise.all(preserved.map(async (path) => [path, await readFile(join(value.projectRoot, path))] as const)));
    const result = await applyProjectClean(await planProjectClean(value));
    assert.deepEqual(result, { removed: ["dist"], missing: ["node_modules"] });
    for (const [path, contents] of snapshots) assert.deepEqual(await readFile(join(value.projectRoot, path)), contents);
  } finally { await rm(value.root, { recursive: true, force: true }); }
});

test("executor revalidates each target and stops when a target becomes a symlink", async () => {
  const value = await fixture([
    { path: "a-cache", category: "cache" },
    { path: "b-cache", category: "cache" },
    { path: "c-cache", category: "cache" }
  ]);
  try {
    for (const path of ["a-cache", "b-cache", "c-cache"]) {
      await mkdir(join(value.projectRoot, path));
      await writeFile(join(value.projectRoot, path, "data"), path);
    }
    const plan = await planProjectClean(value);
    const outside = join(value.root, "outside");
    await mkdir(outside);
    await rm(join(value.projectRoot, "b-cache"), { recursive: true });
    await symlink(outside, join(value.projectRoot, "b-cache"));
    await assert.rejects(applyProjectClean(plan), /symlink/i);
    await assert.rejects(readFile(join(value.projectRoot, "a-cache", "data")));
    assert.equal(await readFile(join(value.projectRoot, "c-cache", "data"), "utf8"), "c-cache");
  } finally { await rm(value.root, { recursive: true, force: true }); }
});
