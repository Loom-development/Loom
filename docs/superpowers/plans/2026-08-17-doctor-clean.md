# Loom Doctor and Clean Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured project diagnostics and a preview-first cleanup command that removes only stack-declared generated paths.

**Architecture:** Extend the typed stack registry with compatibility, generated-path, and protected-path metadata. Keep diagnostics and cleanup in separate modules with injected probes and filesystem dependencies; the CLI only loads project context, renders results, prompts, and selects the exit code.

**Tech Stack:** TypeScript 5.9, Node.js 24 built-ins, CAC, Zod-backed `@loom/config`, `@loom/runtime-podman`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-17-doctor-clean-design.md`

## Global Constraints

- Cleanup preserves database volumes and every path under `.loom/`.
- Cleanup never removes application source, `loom.yaml`, `.env`, dependency manifests, lockfiles, or manifest-declared Loom-owned files.
- `--force` bypasses confirmation only; it never bypasses validation.
- Doctor warnings exit 0; any doctor failure exits 1.
- Doctor and cleanup output is deterministic.
- All paths are project-relative literals and are checked without following symlinks.
- Multi-path deletion is best effort, not transactional; each target is revalidated immediately before removal.

---

### Task 1: Versioned Stack Maintenance Metadata

**Files:**
- Modify: `apps/cli/src/stacks.ts`
- Modify: `apps/cli/src/stacks.test.ts`

**Interfaces:**
- Produces: `GeneratedPathCategory`, `StackGeneratedPath`, `StackCompatibility`, and the extended `StackDefinition` consumed by Tasks 2–5.
- Produces: `stackIds` as the canonical readonly ID tuple and `StackId = typeof stackIds[number]`; definitions and metadata records are keyed by this type.
- `StackDefinition.generatedPaths` is a readonly list of `{ path, category }`.
- `StackDefinition.protectedPaths` contains source roots and project files that generated paths must not equal or contain.
- `StackDefinition.compatibility.architectures` contains Node architecture identifiers; `runtime` is exactly `"podman-rootless"`.

- [ ] **Step 1: Write failing metadata validation tests**

Add registry tests that iterate all 31 definitions, require unique generated paths, require sorted arrays, reject absolute/traversal/empty/`.loom` paths through exported `validateStackDefinition`, and assert representative metadata:

```ts
assert.deepEqual(findStackDefinition("node")?.generatedPaths, [
  { path: "dist", category: "build" },
  { path: "node_modules", category: "dependency" }
]);
assert.deepEqual(findStackDefinition("php")?.generatedPaths, [
  { path: "vendor", category: "dependency" }
]);
assert.deepEqual(findStackDefinition("db-postgres")?.generatedPaths, []);
assert.throws(() => validateStackDefinition({
  ...findStackDefinition("node")!,
  generatedPaths: [{ path: ".loom/cache", category: "cache" }]
}), /unsafe generated path/i);
```

- [ ] **Step 2: Run the registry test and confirm it fails**

Run: `pnpm typecheck && node --test apps/cli/dist/stacks.test.js`

Expected: compilation fails because the maintenance metadata and validator do not exist.

- [ ] **Step 3: Add typed metadata and one centralized validator**

Define:

```ts
export const stackIds = [
  "node", "node-mean", "node-mern", "node-t3", "bun", "python",
  "python-django", "python-flask", "python-fastapi", "php",
  "php-wordpress", "php-drupal", "php-symfony", "db-mysql",
  "db-sqlserver", "db-postgres", "db-mongodb", "db-redis",
  "db-elasticsearch", "db-sqlite", "db-mariadb", "db-all", "dotnet",
  "rails7", "rails7-hotwire", "jamstack", "serverless", "spring-react",
  "spring-boot", "astro", "django-react"
] as const;
export type StackId = typeof stackIds[number];
export type GeneratedPathCategory = "dependency" | "cache" | "build";
export interface StackGeneratedPath { path: string; category: GeneratedPathCategory }
export interface StackCompatibility {
  architectures: readonly NodeJS.Architecture[];
  runtime: "podman-rootless";
}
```

Use these generated-path families, sorting each final list by path:

```ts
const nodeGenerated = [generated("dist", "build"), generated("node_modules", "dependency")];
const nextGenerated = [generated(".next", "build"), ...nodeGenerated];
const phpGenerated = [generated("vendor", "dependency")];
const pythonGenerated = [generated(".pytest_cache", "cache"), generated("__pycache__", "cache"), generated(".venv", "dependency")];
const railsGenerated = [generated("log", "cache"), generated("tmp", "cache"), generated("vendor/bundle", "dependency")];
const springGenerated = [generated("target", "build")];
const dotnetGenerated = [generated("bin", "build"), generated("obj", "build")];
```

Assign the metadata with an explicit record so no stack inherits behavior by
prefix or guesswork:

```ts
const generatedPathsByStack: Record<StackId, readonly StackGeneratedPath[]> = {
  node: nodeGenerated,
  "node-mean": nestedNodeGenerated("api", "web"),
  "node-mern": nestedNodeGenerated("api", "web"),
  "node-t3": [generated(".next", "build"), generated("node_modules", "dependency")],
  bun: nodeGenerated,
  python: pythonGenerated,
  "python-django": pythonGenerated,
  "python-flask": pythonGenerated,
  "python-fastapi": pythonGenerated,
  php: phpGenerated,
  "php-wordpress": [],
  "php-drupal": [generated("vendor", "dependency")],
  "php-symfony": [generated("var/cache", "cache"), generated("vendor", "dependency")],
  "db-mysql": [], "db-sqlserver": [], "db-postgres": [], "db-mongodb": [],
  "db-redis": [], "db-elasticsearch": [], "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: [generated("src/bin", "build"), generated("src/obj", "build")],
  rails7: railsGenerated,
  "rails7-hotwire": railsGenerated,
  jamstack: nestedNodeGenerated("api", "web"),
  serverless: [generated("node_modules", "dependency"), generated("web/node_modules", "dependency"), generated("web/dist", "build")],
  "spring-react": [generated("backend/target", "build"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")],
  "spring-boot": springGenerated,
  astro: nodeGenerated,
  "django-react": [generated("backend/.venv", "dependency"), generated("backend/.pytest_cache", "cache"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")]
};
```

`nestedNodeGenerated("api", "web")` returns sorted dependency and build paths
for both roots. Use this exhaustive protected-root record; Task 2 separately
protects dependency manifests and lockfiles at any depth:

```ts
const protectedPathsByStack: Record<StackId, readonly string[]> = {
  node: ["src"],
  "node-mean": ["api/src", "web/src"],
  "node-mern": ["api/src", "web/src"],
  "node-t3": ["apps", "packages"],
  bun: ["src"],
  python: ["app.py"],
  "python-django": ["project"],
  "python-flask": ["app.py", "templates"],
  "python-fastapi": ["app"],
  php: ["public", "src"],
  "php-wordpress": ["wp-content"],
  "php-drupal": ["modules", "themes", "web"],
  "php-symfony": ["config", "public", "src", "templates"],
  "db-mysql": [], "db-sqlserver": [], "db-postgres": [], "db-mongodb": [],
  "db-redis": [], "db-elasticsearch": [], "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: ["src"],
  rails7: ["app", "config", "db", "lib"],
  "rails7-hotwire": ["app", "config", "db", "lib"],
  jamstack: ["api/src", "web/src"],
  serverless: ["src", "web/src"],
  "spring-react": ["backend/src", "frontend/src"],
  "spring-boot": ["src"],
  astro: ["public", "src"],
  "django-react": ["backend/project", "frontend/src"]
};
```

The registry test asserts both records contain exactly `listStackIds()`,
preventing fallback metadata. All current stacks support `x64`, `arm64`, and
`arm`; compatibility requires rootless Podman.

`validateStackDefinition` must reject unsafe, duplicate, or unsorted generated paths, unsafe protected paths, and any generated path that equals or contains a protected path. Run validation once when constructing the exported registry.

- [ ] **Step 4: Run focused tests**

Run: `pnpm typecheck && node --test apps/cli/dist/stacks.test.js`

Expected: all registry tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add apps/cli/src/stacks.ts apps/cli/src/stacks.test.ts
git commit -m "feat: declare stack maintenance metadata"
```

### Task 2: Pure Cleanup Planning and Guarded Execution

**Files:**
- Create: `apps/cli/src/project-clean.ts`
- Create: `apps/cli/src/project-clean.test.ts`

**Interfaces:**
- Consumes: `projectRoot`, `StackDefinition`, loaded v2 manifest, and optional injected filesystem dependencies.
- Produces: `planProjectClean(options): Promise<ProjectCleanPlan>` and `applyProjectClean(plan, dependencies?): Promise<{ removed: string[]; missing: string[] }>`.

```ts
export interface ProjectCleanItem {
  path: string;
  category: GeneratedPathCategory;
  exists: boolean;
  bytes: number;
}
export interface ProjectCleanPlan {
  projectRoot: string;
  items: ProjectCleanItem[];
  totalBytes: number;
}
```

- [ ] **Step 1: Write failing cleanup planner tests**

Cover deterministic ordering, recursive byte totals without following symlinks, missing entries, an empty plan, and preservation of unrelated files. Add table-driven rejection cases for `""`, `"."`, `"../outside"`, absolute paths, `.loom`, `loom.yaml`, `.env`, `package.json`, lockfiles, manifest-owned files, a symlinked target, and a symlinked parent.

```ts
const plan = await planProjectClean({ projectRoot, stack, manifest });
assert.deepEqual(plan.items.map(({ path, exists }) => ({ path, exists })), [
  { path: "dist", exists: true },
  { path: "node_modules", exists: false }
]);
assert.equal(plan.totalBytes, Buffer.byteLength("built output\n"));
```

- [ ] **Step 2: Run the cleanup test and confirm it fails**

Run: `pnpm typecheck && node --test apps/cli/dist/project-clean.test.js`

Expected: compilation fails because `project-clean.ts` does not exist.

- [ ] **Step 3: Implement the cleanup planner**

Resolve the real project root once. Validate every declaration before inspecting sizes. Walk with `lstat` and `readdir`; reject any symlink encountered and sum regular-file sizes. Build a protected set from stack metadata, manifest-owned paths, `loom.yaml`, `.env`, known dependency manifests, and known lockfiles. Reject a generated path when it equals or contains a protected path. Return sorted items and an exact total.

- [ ] **Step 4: Write failing executor tests**

Require the executor to delete only existing planned paths, report missing paths, revalidate immediately before each deletion, stop when a target becomes a symlink after planning, and leave later items untouched. Verify `.loom`, database directories, source, manifests, lockfiles, `.env`, and unrelated files byte-for-byte.

- [ ] **Step 5: Implement guarded best-effort execution**

For each sorted plan item, repeat containment, declaration, and `lstat`-chain validation, then call `rm(target, { recursive: true, force: false })`. Do not expose an option that disables validation. Return sorted removed and missing lists; propagate the first unsafe or filesystem error.

- [ ] **Step 6: Run focused cleanup tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-clean.test.js`

Expected: all planner, size, preservation, symlink, and revalidation tests pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add apps/cli/src/project-clean.ts apps/cli/src/project-clean.test.ts
git commit -m "feat: plan and apply safe project cleanup"
```

### Task 3: Structured Doctor Engine

**Files:**
- Create: `apps/cli/src/project-doctor.ts`
- Create: `apps/cli/src/project-doctor.test.ts`

**Interfaces:**
- Consumes: project/config/manifest/stack context and `DoctorProbes`.
- Produces: `runProjectDoctor(options): Promise<DoctorResult[]>`.

```ts
export type DoctorStatus = "pass" | "warning" | "failure";
export interface DoctorResult { id: string; status: DoctorStatus; summary: string; detail?: string }
export interface DoctorProbes {
  podman(): Promise<PodmanCapabilities>;
  architecture(): NodeJS.Architecture;
  pathState(path: string): Promise<{ exists: boolean; uid?: number; writable: boolean }>;
  portAvailable(port: number): Promise<boolean>;
  hostsWritable(): Promise<boolean>;
}
```

- [ ] **Step 1: Write failing diagnostic tests with injected probes**

Cover missing/migrating/current manifest, unknown stack, scaffold drift, unavailable Podman, non-rootless Podman, unsupported architecture, conflicting Node lockfiles, wrong-owner/unwritable dependency paths, unavailable configured host ports, invalid route targets, and non-writable hosts integration. Assert stable result IDs and sorting independent of probe completion order.

```ts
assert.deepEqual(results.map(({ id, status }) => ({ id, status })), [
  { id: "manifest", status: "pass" },
  { id: "podman", status: "pass" },
  { id: "architecture", status: "pass" }
]);
```

- [ ] **Step 2: Run the doctor test and confirm it fails**

Run: `pnpm typecheck && node --test apps/cli/dist/project-doctor.test.js`

Expected: compilation fails because `project-doctor.ts` does not exist.

- [ ] **Step 3: Implement deterministic diagnostic checks**

Use one function per check and combine results in fixed ID order. Parse host ports from service mappings including `host:container`, `ip:host:container`, and optional `/tcp`; malformed mappings are failures. A route whose service or container port is absent is a failure. Hosts integration is checked only when routes exist and produces a warning. Dependency ownership compares an existing path UID with `process.getuid?.()` when available; a mismatch or non-writable path is a failure. Multiple lockfiles for the same ecosystem are failures; zero lockfiles are warnings only when that ecosystem has a dependency manifest.

- [ ] **Step 4: Implement default host probes**

Use `detectPodmanCapabilities`, `process.arch`, `lstat` plus `access(W_OK)`, a temporary `net.Server` bind to test host ports without accepting traffic, and `access("/etc/hosts", W_OK)` on Unix. On Windows, hosts writability is a warning-level unavailable result rather than an attempted mutation. No doctor probe starts Podman, binds persistent listeners, edits files, or changes the project.

- [ ] **Step 5: Run focused doctor tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-doctor.test.js`

Expected: all diagnostic and deterministic-order tests pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add apps/cli/src/project-doctor.ts apps/cli/src/project-doctor.test.ts
git commit -m "feat: add structured project diagnostics"
```

### Task 4: Doctor and Clean CLI Commands

**Files:**
- Modify: `apps/cli/src/index.ts`
- Modify: `apps/cli/src/ux.integration.test.ts`

**Interfaces:**
- Adds: `loom doctor [--config <path>] [--json]`.
- Adds: `loom clean [--config <path>] [--force] [--dry-run]`.
- Consumes the engines from Tasks 2 and 3; command actions contain no path deletion or diagnostic policy.

- [ ] **Step 1: Extend the CLI test runner for input and environment control**

Change `runCli` to accept `{ input?: string; env?: NodeJS.ProcessEnv }`, pass input through `spawnSync`, and merge the environment. Preserve current callers unchanged through a default options object.

- [ ] **Step 2: Write failing doctor CLI integration tests**

Cover help text, deterministic human rendering, parseable JSON with no decorative output, warnings exiting 0, failures exiting 1, missing manifest, and unknown manifest stack. Use an environment-gated probe adapter only if dependency injection cannot cross the process boundary; the adapter must be enabled solely by `LOOM_TEST_DOCTOR_FIXTURE` under `NODE_ENV=test`.

- [ ] **Step 3: Register `loom doctor`**

Load config and manifest relative to `--config`, find the manifest-selected stack, call the doctor engine, render `[PASS]`, `[WARN]`, and `[FAIL]` lines or `JSON.stringify(results, null, 2)`, and set `process.exitCode = 1` exactly when any result is `failure`.

- [ ] **Step 4: Write failing clean CLI integration tests**

Cover dry-run, interactive yes/no, non-TTY refusal without `--force`, forced cleanup, an empty/missing plan, exact path/size preview, and unsafe-plan refusal before any deletion. Verify protected and unrelated files remain unchanged in every case.

- [ ] **Step 5: Register `loom clean`**

Load the current v2 manifest and stack, plan first, and always render the plan. `--dry-run` returns after preview. With a TTY, prompt exactly `Remove these generated paths? [y/N] ` and accept only `y` or `yes` case-insensitively. Without a TTY, require `--force`. Render removed and missing counts after execution. Never pass `--force` into the cleanup engine.

- [ ] **Step 6: Run CLI and engine tests**

Run: `pnpm typecheck && node --test apps/cli/dist/project-clean.test.js apps/cli/dist/project-doctor.test.js apps/cli/dist/ux.integration.test.js`

Expected: all command, output, exit-code, confirmation, and preservation tests pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add apps/cli/src/index.ts apps/cli/src/ux.integration.test.ts
git commit -m "feat: add loom doctor and clean commands"
```

### Task 5: Documentation and Release Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md`

**Interfaces:**
- Documents the exact flags, protected paths, exit codes, and best-effort cleanup behavior shipped in Task 4.

- [ ] **Step 1: Update current behavior documentation**

Add doctor human/JSON examples and its warning/failure exit semantics. Add clean preview, interactive, `--dry-run`, and `--force` examples. State that cleanup is best effort, stops on a newly unsafe path, and never removes databases or `.loom`; direct users to backup/restore rather than implying clean resets data.

- [ ] **Step 2: Run all static and automated gates**

Run: `git diff --check && pnpm verify`

Expected: no whitespace errors; lint, typecheck, and every workspace test pass.

- [ ] **Step 3: Run generated Node and PHP smoke tests**

For each stack, run `loom init` into a temporary directory, `loom start --recreate`, `loom doctor`, create representative declared generated paths, hash developer-owned files, run `loom clean --force`, and compare hashes. Start again to prove dependencies regenerate, check health, then stop. Use `node` and `php`; localhost health checks are acceptable when `/etc/hosts` cannot be modified.

Expected: doctor has no failures; only declared paths are removed; developer-owned hashes remain identical; both stacks reach readiness before and after cleanup; stop succeeds.

- [ ] **Step 4: Commit Task 5**

```bash
git add README.md docs/architecture.md docs/roadmap.md docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md
git commit -m "docs: document doctor and safe cleanup"
```
