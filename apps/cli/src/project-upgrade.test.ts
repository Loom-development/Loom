import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LoomProjectManifestV2 } from "./project-manifest.js";
import { applyProjectUpgrade, planProjectUpgrade } from "./project-upgrade.js";
import type { StackDefinition } from "./stacks.js";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "loom-upgrade-"));
  const projectRoot = join(root, "project");
  const templatesRoot = join(root, "templates");
  const assetRoot = join(templatesRoot, "node");
  await mkdir(join(projectRoot, ".loom", "baselines"), { recursive: true });
  await mkdir(assetRoot, { recursive: true });
  await writeFile(join(assetRoot, "loom.yaml"), "name: template\nservices:\n  app:\n    type: node\n", "utf8");
  await writeFile(join(assetRoot, ".env.example"), "NODE_IMAGE=node:24\n", "utf8");
  const oldLoom = "name: loom-demo\nservices:\n  app:\n    type: node\n";
  const oldEnv = "NODE_IMAGE=node:22\n";
  await writeFile(join(projectRoot, "loom.yaml"), `${oldLoom}# local\n`, "utf8");
  await writeFile(join(projectRoot, "source.ts"), "developer owned\n", "utf8");
  await writeFile(join(projectRoot, ".loom", "baselines", "loom"), oldLoom, "utf8");
  await writeFile(join(projectRoot, ".loom", "baselines", "env"), oldEnv, "utf8");
  const stack: StackDefinition = {
    id: "node",
    assetPath: "node",
    scaffoldVersion: "2",
    definitionVersion: 1, legacyScaffoldVersions: [], generator: { kind: "none" }, runtimeImages: [], install: [], start: [], readiness: { kind: "command", value: "true", timeoutSeconds: 1 }, hostWrites: [], verification: [],
    loomOwnedFiles: ["loom.yaml", ".env.example"],
    generatedPaths: [
      { path: "dist", category: "build" },
      { path: "node_modules", category: "dependency" }
    ],
    protectedPaths: ["src"],
    compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
  };
  const manifest: LoomProjectManifestV2 = {
    version: 2,
    loomVersion: "0.3.4",
    stack: { id: "node", scaffoldVersion: "1" },
    ownedFiles: {
      "loom.yaml": { sha256: sha256(oldLoom), baselinePath: ".loom/baselines/loom" },
      ".env.example": { sha256: sha256(oldEnv), baselinePath: ".loom/baselines/env" }
    },
    renderInputs: { projectName: "loom-demo", databases: [], adopted: false }
  };
  return { root, projectRoot, templatesRoot, stack, manifest };
}

test("planner classifies only manifest-owned files and renders candidates", async () => {
  const value = await fixture();
  try {
    const plan = await planProjectUpgrade(value);
    assert.deepEqual(plan.files.map(({ path, state }) => ({ path, state })), [
      { path: ".env.example", state: "missing" },
      { path: "loom.yaml", state: "modified" }
    ]);
    assert.equal(await readFile(plan.files[0].candidatePath, "utf8"), "NODE_IMAGE=node:24\n");
    assert.match(await readFile(plan.files[1].candidatePath, "utf8"), /^name: loom-demo$/m);
    assert.equal(plan.files.some((file) => file.path === "source.ts"), false);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("planner marks baseline-identical current files unchanged and hashes identical candidates", async () => {
  const value = await fixture();
  try {
    const baseline = await readFile(join(value.projectRoot, ".loom/baselines/loom"), "utf8");
    await writeFile(join(value.projectRoot, "loom.yaml"), baseline, "utf8");
    await writeFile(join(value.projectRoot, ".env.example"), "NODE_IMAGE=node:24\n", "utf8");
    const plan = await planProjectUpgrade(value);
    assert.equal(plan.files.find((file) => file.path === "loom.yaml")?.state, "unchanged");
    const env = plan.files.find((file) => file.path === ".env.example");
    assert.equal(env?.state, "modified");
    assert.equal(env?.currentSha256, env?.candidateSha256);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("planner rejects forged traversal and missing owned template assets", async () => {
  const value = await fixture();
  try {
    const forged = structuredClone(value.manifest);
    forged.ownedFiles["../outside"] = { sha256: "a".repeat(64), baselinePath: ".loom/baselines/outside" };
    await assert.rejects(planProjectUpgrade({ ...value, manifest: forged }), /unsafe owned file path/i);

    await rm(join(value.templatesRoot, "node", ".env.example"));
    await assert.rejects(planProjectUpgrade(value), /missing Loom-owned asset.*\.env\.example/i);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("planner replays stored PHP docroot and database additions", async () => {
  const value = await fixture();
  try {
    value.stack = { ...value.stack, id: "php", assetPath: "node" };
    value.manifest = {
      ...value.manifest,
      stack: { id: "php", scaffoldVersion: "1" },
      renderInputs: { projectName: "loom-php", phpDocroot: "public", databases: ["redis"], adopted: false }
    };
    await writeFile(join(value.templatesRoot, "node", "loom.yaml"), [
      "name: template", "services:", "  app:", "    type: php", "    command: |", "      old", "    volumes:", "      - ./:/app", ""
    ].join("\n"), "utf8");
    const plan = await planProjectUpgrade(value);
    const candidate = await readFile(plan.files.find((file) => file.path === "loom.yaml")!.candidatePath, "utf8");
    assert.match(candidate, /^name: loom-php$/m);
    assert.match(candidate, /DocumentRoot \/app\/public/);
    assert.match(candidate, /^ {2}redis:$/m);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("applier updates missing and unchanged files while skipping modified files", async () => {
  const value = await fixture();
  try {
    const baseline = await readFile(join(value.projectRoot, ".loom/baselines/loom"), "utf8");
    await writeFile(join(value.projectRoot, "loom.yaml"), baseline, "utf8");
    const sourceBefore = await readFile(join(value.projectRoot, "source.ts"));
    const plan = await planProjectUpgrade(value);
    const result = await applyProjectUpgrade(plan, { forceModified: false });
    assert.deepEqual(result, { updated: [".env.example", "loom.yaml"], skipped: [] });
    assert.equal(await readFile(join(value.projectRoot, ".env.example"), "utf8"), "NODE_IMAGE=node:24\n");
    assert.match(await readFile(join(value.projectRoot, "loom.yaml"), "utf8"), /^name: loom-demo$/m);
    assert.deepEqual(await readFile(join(value.projectRoot, "source.ts")), sourceBefore);
    const manifest = JSON.parse(await readFile(join(value.projectRoot, ".loom/manifest.json"), "utf8"));
    assert.equal(manifest.version, 2);
    assert.equal(manifest.stack.scaffoldVersion, "2");
    assert.equal(manifest.ownedFiles["loom.yaml"].sha256, sha256(await readFile(join(value.projectRoot, "loom.yaml"), "utf8")));
    assert.equal((await readdir(join(value.projectRoot, ".loom"))).some((path) => path.startsWith("upgrade-")), false);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("applier replaces modified files only when forced", async () => {
  const value = await fixture();
  try {
    let plan = await planProjectUpgrade(value);
    assert.deepEqual(await applyProjectUpgrade(plan, { forceModified: false }), { updated: [".env.example"], skipped: ["loom.yaml"] });
    assert.match(await readFile(join(value.projectRoot, "loom.yaml"), "utf8"), /# local/);
    plan = await planProjectUpgrade(value);
    assert.deepEqual(await applyProjectUpgrade(plan, { forceModified: true }), { updated: [".env.example", "loom.yaml"], skipped: [] });
    assert.doesNotMatch(await readFile(join(value.projectRoot, "loom.yaml"), "utf8"), /# local/);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("applier preserves manifest and baselines when a destination write fails", async () => {
  const value = await fixture();
  try {
    await writeFile(join(value.projectRoot, ".loom", "manifest.json"), "old manifest\n", "utf8");
    const baselineBefore = await readFile(join(value.projectRoot, ".loom", "baselines", "loom"));
    const plan = await planProjectUpgrade(value);
    await mkdir(join(value.projectRoot, ".env.example"));
    await assert.rejects(applyProjectUpgrade(plan, { forceModified: true }));
    assert.equal(await readFile(join(value.projectRoot, ".loom", "manifest.json"), "utf8"), "old manifest\n");
    assert.deepEqual(await readFile(join(value.projectRoot, ".loom", "baselines", "loom")), baselineBefore);
    assert.equal((await readdir(join(value.projectRoot, ".loom"))).some((path) => path.startsWith("upgrade-")), false);
  } finally {
    await rm(value.root, { recursive: true, force: true });
  }
});

test("applier rejects symlinked owned files and parent directories that escape the project", async () => {
  for (const parentSymlink of [false, true]) {
    const value = await fixture();
    try {
      const outside = join(value.root, "outside");
      await mkdir(outside);
      const path = parentSymlink ? "owned/loom.yaml" : "loom.yaml";
      value.stack = { ...value.stack, loomOwnedFiles: [path] };
      value.manifest = { ...value.manifest, ownedFiles: { [path]: value.manifest.ownedFiles["loom.yaml"] } };
      await mkdir(join(value.templatesRoot, "node", "owned"), { recursive: true });
      await writeFile(join(value.templatesRoot, "node", path), "name: template\n", "utf8");
      if (parentSymlink) await symlink(outside, join(value.projectRoot, "owned"));
      else {
        await rm(join(value.projectRoot, "loom.yaml"));
        await symlink(join(outside, "escaped.yaml"), join(value.projectRoot, "loom.yaml"));
      }
      const plan = await planProjectUpgrade(value);
      await assert.rejects(applyProjectUpgrade(plan, { forceModified: true }), /symlink/i);
      await assert.rejects(lstat(join(outside, parentSymlink ? "loom.yaml" : "escaped.yaml")));
    } finally {
      await rm(value.root, { recursive: true, force: true });
    }
  }
});
