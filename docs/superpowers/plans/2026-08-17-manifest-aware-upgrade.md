# Manifest-Aware Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe `loom upgrade` command that updates only Loom-owned files while preserving project-specific initialization choices and refusing silent overwrites.

**Architecture:** Upgrade safety is owned by `project-manifest.ts`, which records final rendered baselines and the inputs needed to render future candidates. `project-upgrade.ts` performs planning and application without CLI concerns. The CLI presents the plan and requires explicit flags for baseline migration or replacement of modified files.

**Tech Stack:** TypeScript 5.9, Node.js 24 filesystem and crypto APIs, `node:test`, CAC CLI.

**Spec:** `docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md`

## Global Constraints

- Application source, dependency manifests, lockfiles, and `.env` are developer-owned and must never be changed.
- Only paths listed in `.loom/manifest.json` may be considered for replacement.
- Existing v1 manifests must not be guessed into a safe baseline.
- Modified Loom-owned files require `--force-modified`; non-interactive execution never prompts.
- Every resolved write path must remain inside the project root.
- Writes use a temporary sibling followed by atomic rename.
- Existing `loom init`, `loom adopt`, and projects without manifests remain compatible.

---

### Task 1: Manifest v2 Baselines and Render Inputs

**Files:**
- Modify: `apps/cli/src/project-manifest.ts`
- Modify: `apps/cli/src/project-manifest.test.ts`
- Modify: `apps/cli/src/index.ts`
- Test: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Produces: `LoomProjectManifestV2`, `loadProjectManifest(targetDir)`, and `writeProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs)`.
- `renderInputs` is `{ projectName: string; phpDocroot?: string; databases: string[]; adopted: boolean }`.
- Each owned file entry is `{ sha256: string; baselinePath: string }`.

- [ ] **Step 1: Write failing manifest v2 tests**

Add tests that require `version: 2`, deterministic sorted database names, baseline copies under `.loom/baselines/`, strict rejection of unknown versions, and preservation of v1 parsing as a migration-required result:

```ts
const loaded = await loadProjectManifest(targetDir);
assert.equal(loaded.kind, "ready");
assert.deepEqual(loaded.manifest.renderInputs, {
  projectName: "loom-demo",
  databases: ["postgres", "redis"],
  adopted: false
});
assert.equal(
  await readFile(join(targetDir, loaded.manifest.ownedFiles["loom.yaml"].baselinePath), "utf8"),
  await readFile(join(targetDir, "loom.yaml"), "utf8")
);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm typecheck && node --test apps/cli/dist/project-manifest.test.js`

Expected: failure because `loadProjectManifest`, v2 fields, and baseline copies do not exist.

- [ ] **Step 3: Implement v2 serialization and strict loading**

Define this load result so callers cannot accidentally treat v1 as upgrade-ready:

```ts
export type LoadedProjectManifest =
  | { kind: "ready"; manifest: LoomProjectManifestV2 }
  | { kind: "migration-required"; manifest: LoomProjectManifestV1 }
  | { kind: "missing" };
```

Validate JSON fields manually, reject path keys containing `..`, absolute paths, or empty segments, copy each final owned file to `.loom/baselines/<encoded-relative-path>`, and atomically write the manifest after all baselines succeed.

- [ ] **Step 4: Pass render inputs from init and adoption**

During init, pass the final project name, effective PHP docroot, sorted `dbsToAdd`, and `adopted: false`. During adoption, pass the generated project name, no PHP docroot, no databases, and `adopted: true`. Obtain the project name from the same `deriveProjectName(targetDir)` function used to rewrite `loom.yaml`.

- [ ] **Step 5: Run focused tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-manifest.test.js apps/cli/dist/init.integration.test.js`

Expected: all tests pass and generated manifests contain v2 baselines without claiming `.env`.

- [ ] **Step 6: Commit Task 1**

```bash
git add apps/cli/src/project-manifest.ts apps/cli/src/project-manifest.test.ts apps/cli/src/index.ts apps/cli/src/init.integration.test.ts
git commit -m "feat: record upgrade-safe project baselines"
```

### Task 2: Pure Upgrade Planner

**Files:**
- Create: `apps/cli/src/project-upgrade.ts`
- Create: `apps/cli/src/project-upgrade.test.ts`
- Modify: `apps/cli/src/index.ts` to export or move reusable template rendering helpers

**Interfaces:**
- Consumes: `LoadedProjectManifest`, `StackDefinition`, template assets, and stored render inputs.
- Produces: `planProjectUpgrade(options): Promise<ProjectUpgradePlan>`.
- `ProjectUpgradePlan.files` contains `{ path, state: "unchanged" | "modified" | "missing", currentSha256?, baselineSha256, candidateSha256, candidatePath }`.

- [ ] **Step 1: Write planner tests for all ownership states**

Create temporary projects covering an unchanged file, locally modified file, missing file, candidate identical to current, path traversal in a forged manifest, and an unrelated source file. Assert unrelated source is absent from `plan.files`.

```ts
const plan = await planProjectUpgrade({ projectRoot, templatesRoot, manifest, stack });
assert.deepEqual(
  plan.files.map(({ path, state }) => ({ path, state })),
  [
    { path: ".env.example", state: "missing" },
    { path: "loom.yaml", state: "modified" }
  ]
);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm typecheck && node --test apps/cli/dist/project-upgrade.test.js`

Expected: failure because the planner module does not exist.

- [ ] **Step 3: Implement candidate rendering in a temporary directory**

Copy only `stack.loomOwnedFiles` from the stack assets, apply the stored project name and PHP docroot using extracted reusable helpers, then apply each stored database addition. Never run a framework generator during upgrade. Reject a stack definition whose required owned asset is missing.

- [ ] **Step 4: Implement hash-based state classification**

Compare current, baseline, and candidate hashes. Classify absent current files as `missing`, current equal to baseline as `unchanged`, and all other current content as `modified`. Sort file plans by path for deterministic output.

- [ ] **Step 5: Run planner tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-upgrade.test.js`

Expected: all planner and containment tests pass.

- [ ] **Step 6: Commit Task 2**

```bash
git add apps/cli/src/project-upgrade.ts apps/cli/src/project-upgrade.test.ts apps/cli/src/index.ts
git commit -m "feat: plan Loom-owned file upgrades"
```

### Task 3: Atomic Upgrade Application

**Files:**
- Modify: `apps/cli/src/project-upgrade.ts`
- Modify: `apps/cli/src/project-upgrade.test.ts`

**Interfaces:**
- Consumes: `ProjectUpgradePlan` and `{ forceModified: boolean }`.
- Produces: `applyProjectUpgrade(plan, options): Promise<{ updated: string[]; skipped: string[] }>`.

- [ ] **Step 1: Write failing apply tests**

Require unchanged and missing Loom-owned files to update, modified files to skip by default, modified files to update only with `forceModified: true`, source files to remain byte-identical, and manifest/baselines to remain unchanged if any candidate write fails.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm typecheck && node --test apps/cli/dist/project-upgrade.test.js`

Expected: failure because `applyProjectUpgrade` does not exist.

- [ ] **Step 3: Implement staged atomic writes**

Copy approved candidates to `.loom/upgrade-stage/`, verify their hashes, then rename each staged file into its resolved project path. After all writes succeed, regenerate baselines and the manifest with the new Loom version. On failure, remove the stage and retain the previous manifest and baseline metadata.

- [ ] **Step 4: Run apply tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-upgrade.test.js`

Expected: all apply, rollback-metadata, and preservation tests pass.

- [ ] **Step 5: Commit Task 3**

```bash
git add apps/cli/src/project-upgrade.ts apps/cli/src/project-upgrade.test.ts
git commit -m "feat: apply Loom-owned upgrades atomically"
```

### Task 4: CLI Command and v1 Migration Gate

**Files:**
- Modify: `apps/cli/src/index.ts`
- Modify: `apps/cli/src/ux.integration.test.ts`
- Modify: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Adds: `loom upgrade --config <path> [--force-modified] [--initialize-baseline]`.
- Consumes: manifest loader, stack registry, planner, and applier from Tasks 1–3.

- [ ] **Step 1: Write failing CLI integration tests**

Cover missing manifest, unknown stack, v1 migration refusal, v1 `--initialize-baseline`, dry summary with no changes, modified-file refusal, `--force-modified`, and preservation of `package.json`, lockfiles, and `.env`.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `pnpm typecheck && node --test apps/cli/dist/ux.integration.test.js apps/cli/dist/init.integration.test.js`

Expected: failure because `upgrade` is not registered.

- [ ] **Step 3: Register the upgrade command**

Print one deterministic line per owned file:

```text
unchanged loom.yaml -> update available
modified .env.example -> skipped (use --force-modified to replace)
```

Exit with status 1 when modified files block a complete upgrade. `--initialize-baseline` records current v1-owned files as baselines and exits without replacing them.

- [ ] **Step 4: Run CLI integration tests**

Run: `pnpm typecheck && node --test apps/cli/dist/ux.integration.test.js apps/cli/dist/init.integration.test.js`

Expected: all upgrade UX and preservation tests pass.

- [ ] **Step 5: Commit Task 4**

```bash
git add apps/cli/src/index.ts apps/cli/src/ux.integration.test.ts apps/cli/src/init.integration.test.ts
git commit -m "feat: add safe loom upgrade command"
```

### Task 5: Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md`

**Interfaces:**
- Documents the exact CLI flags and v1 migration behavior from Task 4.

- [ ] **Step 1: Update current-versus-planned documentation**

Move `loom upgrade` and manifest baselines into current behavior. Document that framework source is never upgraded, modified Loom files require `--force-modified`, and v1 manifests require `--initialize-baseline` before replacement.

- [ ] **Step 2: Run documentation and code gates**

Run: `git diff --check && pnpm verify`

Expected: no whitespace errors; lint, typecheck, and every workspace test pass.

- [ ] **Step 3: Run generated Node smoke test**

Initialize a Node project, modify `package.json`, run upgrade, and confirm the source hash is unchanged and the service reaches healthy state after `loom start --recreate`.

- [ ] **Step 4: Commit Task 5**

```bash
git add README.md docs/architecture.md docs/roadmap.md docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md
git commit -m "docs: document safe Loom upgrades"
```
