import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LoomProjectManifestV2 } from "./project-manifest.js";
import { planProjectUpgrade } from "./project-upgrade.js";
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
  const stack: StackDefinition = { id: "node", assetPath: "node", scaffoldVersion: "2", loomOwnedFiles: ["loom.yaml", ".env.example"] };
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
