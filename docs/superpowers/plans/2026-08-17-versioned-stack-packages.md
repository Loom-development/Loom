# Versioned Stack Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy generator `examples/` tree with typed, self-contained `stacks/<id>/` packages, exact generator/runtime pins, and published CLI assets that work without repository paths.

**Architecture:** Add a root `@loom/stacks` workspace whose TypeScript registry imports one definition from every stack directory while templates remain colocated under that directory. Migrate stack families with output-comparison tests, then switch source, package, release, and installer resolution to `stacks/` and remove the legacy asset tree.

**Tech Stack:** TypeScript 5.9, Node.js 24, pnpm workspaces, Node test runner, esbuild, Podman for remote pin verification and bootstrap smoke tests.

**Spec:** `docs/superpowers/specs/2026-08-17-versioned-stacks-release-gate-design.md`

## Global Constraints

- Preserve all 31 public stack IDs and CLI syntax.
- `examples/runnable/` starts empty except for explanatory documentation.
- Generators use exact versions; runtime images use exact version tags. Floating tags and `unversioned` are invalid.
- Image environment overrides remain supported; only their defaults are pinned.
- Existing manifest scaffold identifiers remain accepted through explicit legacy aliases.
- Application source, lockfiles, `.env`, database state, and `.loom/` state are not migration targets.
- The final CLI has no fallback to legacy `examples/` generator paths.
- Do not check generated dependencies, caches, build output, or bootstrap-generated framework source into `stacks/`.

---

### Task 1: Stack Workspace, Definition Schema, and Node Vertical Slice

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `tsconfig.json`
- Modify: `apps/cli/package.json`
- Modify: `apps/cli/tsconfig.json`
- Create: `stacks/package.json`
- Create: `stacks/tsconfig.json`
- Create: `stacks/definition.ts`
- Create: `stacks/pins.ts`
- Create: `stacks/index.ts`
- Create: `stacks/definition.test.ts`
- Create: `stacks/node/stack.ts`
- Move: `examples/node/{.env.example,README.md,loom.yaml,package-lock.json,package.json,server.js}` to `stacks/node/templates/`
- Modify: `apps/cli/src/stacks.ts`
- Modify: `apps/cli/src/stacks.test.ts`
- Modify: explicit `StackDefinition` fixtures in CLI tests

**Interfaces:**
- Produces `@loom/stacks` exports: `stackIds`, `StackId`, `StackDefinition`, `defineStack`, `validateStackDefinition`, `stackDefinitions`, `findStackDefinition`, and `listStackIds`.
- Extends each definition with `definitionVersion`, `legacyScaffoldVersions`, `generator`, `runtimeImages`, `install`, `start`, `readiness`, `hostWrites`, and `verification` while retaining ownership/maintenance fields used by the CLI.

```ts
export type StackGenerator =
  | { kind: "none" }
  | { kind: "command"; package: string; version: string; command: readonly string[] };

export interface StackRuntimeImage {
  env: string;
  reference: string;
}

export interface StackDefinition {
  id: StackId;
  definitionVersion: number;
  legacyScaffoldVersions: readonly string[];
  assetPath: string;
  generator: StackGenerator;
  runtimeImages: readonly StackRuntimeImage[];
  install: readonly string[];
  start: readonly string[];
  readiness: { kind: "command" | "http" | "port"; value: string; timeoutSeconds: number };
  hostWrites: readonly string[];
  verification: readonly string[];
  loomOwnedFiles: readonly string[];
  generatedPaths: readonly StackGeneratedPath[];
  protectedPaths: readonly string[];
  compatibility: StackCompatibility;
}
```

- [ ] **Step 1: Write failing schema and pin tests**

Require safe asset containment, positive integer definition versions, unique legacy aliases, exact generator versions, exact image tags, uppercase image environment names, deterministic arrays, and existing maintenance validation. Reject at least:

```ts
for (const reference of ["node", "node:latest", "node:24", "postgres:16", "composer:2"]) {
  assert.throws(() => validateRuntimeImage({ env: "NODE_IMAGE", reference }), /exact version tag/i);
}
for (const version of ["", "latest", "next", "nightly", "unversioned", "^7.1.5", "7.x", "*"]) {
  assert.throws(() => validateGeneratorVersion(version), /exact generator version/i);
}
```

The accepted-image tests must include semver patch tags with variants, date/CU tags such as SQL Server, and optional `@sha256:` digests.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `pnpm typecheck && pnpm --filter @loom/stacks test`

Expected: the workspace and definition module do not exist.

- [ ] **Step 3: Add the stack workspace and deep validation module**

Add `stacks` to `pnpm-workspace.yaml`, reference it from the root and CLI TypeScript projects, and make it a CLI workspace dependency. Implement one validator that checks schema, pin syntax, path containment, ordering, overlap, and legacy aliases. `assetPath` is always `<id>/templates`, relative to the stack workspace root.

Create `stacks/pins.ts` as the only literal inventory for shared image references and bootstrap generators. Every value is an exact tag or version. Before committing a pin, verify the reference exists with:

```bash
podman manifest inspect <reference>
```

Record the verification date and upstream registry URL in comments beside each group. Do not add a runtime resolver that selects newer tags.

- [ ] **Step 4: Implement the Node definition and move only its own assets**

Move the six Node project files into `stacks/node/templates/`; do not move `mean`, `mern`, `t3`, `.loom`, or `node_modules` with them. Define Node with `generator: { kind: "none" }`, the exact Node 24 Alpine pin, its existing install/start/readiness behavior, `node_modules`/`dist` maintenance paths, and a verification command that requests its health endpoint.

- [ ] **Step 5: Replace the CLI-owned type with workspace imports**

Turn `apps/cli/src/stacks.ts` into a compatibility re-export from `@loom/stacks`. Update strong test fixtures with all required fields; do not make new fields optional. Keep existing lookup results and ordering unchanged.

- [ ] **Step 6: Add a Node old-versus-new output comparison**

Copy the pre-migration Node asset snapshot into a test fixture under `stacks/node/fixtures/expected/` excluding README-only prose if it intentionally changes. Initialize from the new definition into a temporary directory and assert every copied path and byte matches the fixture except the approved exact image default and incremented definition/scaffold version.

- [ ] **Step 7: Run focused and workspace tests**

Run: `pnpm install --lockfile-only && pnpm typecheck && pnpm --filter @loom/stacks test && node --test apps/cli/dist/stacks.test.js apps/cli/dist/init.integration.test.js apps/cli/dist/project-upgrade.test.js`

Expected: schema, Node generation, manifest, upgrade, doctor, and cleanup behavior pass.

- [ ] **Step 8: Commit Task 1**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json apps/cli stacks/node stacks/definition.ts stacks/definition.test.ts stacks/index.ts stacks/package.json stacks/pins.ts stacks/tsconfig.json
git commit -m "feat: add versioned stack package workspace"
```

### Task 2: Copy-Based Application and Database Stack Packages

**Files:**
- Create: one `stack.ts`, `templates/`, and focused fixture metadata beneath each of:
  - `stacks/node-mean`, `stacks/node-mern`, `stacks/node-t3`, `stacks/bun`
  - `stacks/python`, `stacks/python-django`, `stacks/python-flask`, `stacks/python-fastapi`
  - `stacks/php`, `stacks/dotnet`, `stacks/jamstack`, `stacks/serverless`
  - `stacks/spring-react`, `stacks/spring-boot`, `stacks/astro`, `stacks/django-react`
  - `stacks/db-mysql`, `stacks/db-sqlserver`, `stacks/db-postgres`, `stacks/db-mongodb`, `stacks/db-redis`, `stacks/db-elasticsearch`, `stacks/db-sqlite`, `stacks/db-mariadb`, `stacks/db-all`
- Move: corresponding tracked source assets from `examples/`
- Modify: `stacks/index.ts`
- Modify: `stacks/pins.ts`
- Modify: `stacks/definition.test.ts`
- Create: `stacks/migration-output.test.ts`

**Interfaces:**
- Expands `stackDefinitions` from the Node vertical slice to 26 copy-based definitions.
- Produces no compatibility fallback; legacy path resolution remains temporarily in the CLI until Task 4.

- [ ] **Step 1: Write a failing registry-completeness test for the 26-stack set**

Assert the exact IDs, unique definition versions, exact pins, existing legacy scaffold aliases, and `assetPath === `${id}/templates``. Assert no tracked path beneath a template directory matches `.loom`, `node_modules`, `vendor`, `.venv`, `dist`, `build`, `target`, `bin`, `obj`, `data`, `.next`, `.angular`, `__pycache__`, `*.pyc`, or `*.tsbuildinfo`.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `pnpm --filter @loom/stacks build && pnpm --filter @loom/stacks test`

Expected: the registry is incomplete.

- [ ] **Step 3: Move assets by public stack ID**

Flatten legacy family paths into ID directories:

```text
examples/node/mean       -> stacks/node-mean/templates
examples/node/mern       -> stacks/node-mern/templates
examples/node/t3         -> stacks/node-t3/templates
examples/python/django   -> stacks/python-django/templates
examples/php             -> stacks/php/templates (root files only)
examples/databases/all   -> stacks/db-all/templates
```

Apply the same ID mapping for every listed stack. Exclude family README aggregators and generated artifacts. In particular, delete the tracked `.NET` `src/bin` and `src/obj` outputs instead of migrating them.

- [ ] **Step 4: Add exact definitions and pins**

For each moved `loom.yaml`, extract every `${ENV:-image}` default into its definition's `runtimeImages`, replace floating defaults with verified exact references from `pins.ts`, and increment `definitionVersion`. Set `generator: { kind: "none" }`. Record commands/readiness/host writes/verification from the generated config rather than inventing a second runtime behavior.

The pin test scans all template `loom.yaml` files, extracts image defaults, and asserts exact equality with the selected definition. A template image without metadata or metadata without a template use is a failure.

- [ ] **Step 5: Add family migration comparisons**

For each ID, compare the tracked pre-migration file inventory captured by the test fixture with the new template inventory. Permit only: path relocation, exact image-default replacement, documentation path wording, removal of generated artifacts, and Loom-owned definition/scaffold metadata changes. Application source and dependency manifests/lockfiles remain byte-identical.

- [ ] **Step 6: Run generation and ownership tests for all copy stacks**

Run: `pnpm typecheck && pnpm --filter @loom/stacks test && node --test apps/cli/dist/init.integration.test.js apps/cli/dist/project-manifest.test.js apps/cli/dist/project-clean.test.js apps/cli/dist/project-doctor.test.js`

Expected: all 26 definitions validate and generated developer-owned files match their migration fixtures.

- [ ] **Step 7: Commit Task 2**

```bash
git add -A examples stacks apps/cli/src/stacks.ts apps/cli/src/stacks.test.ts
git commit -m "feat: migrate copy-based stack packages"
```

### Task 3: Pinned Bootstrap-Heavy Stack Packages

**Files:**
- Create: `stacks/php-wordpress/stack.ts` and `templates/`
- Create: `stacks/php-drupal/stack.ts` and `templates/`
- Create: `stacks/php-symfony/stack.ts` and `templates/`
- Create: `stacks/rails7/stack.ts` and `templates/`
- Create: `stacks/rails7-hotwire/stack.ts` and `templates/`
- Move: corresponding tracked Loom-owned assets from `examples/php/{wordpress,drupal,symfony}` and `examples/{rails7,rails7-hotwire}`
- Modify: `stacks/index.ts`
- Modify: `stacks/pins.ts`
- Modify: `apps/cli/src/init-template.ts`
- Modify: `apps/cli/src/init-template.test.ts`
- Modify: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Completes all 31 stack definitions.
- `prepareInitTarget` consumes `StackDefinition.generator`; bootstrap commands no longer contain independent image or version literals.

- [ ] **Step 1: Write failing bootstrap-command tests from definitions**

For Drupal, Symfony, WordPress, Rails, and Rails Hotwire, inject command execution and assert the Podman image, generator package, exact version, and arguments come from the selected definition. Assert no command contains an unversioned Composer package or `gem install` without an exact version.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `pnpm typecheck && node --test apps/cli/dist/init-template.test.js`

Expected: bootstrap functions still contain hard-coded floating Composer/Ruby references and unversioned Drupal/Symfony packages.

- [ ] **Step 3: Define exact bootstrap metadata**

Use command generator definitions for Drupal (`drupal/recommended-project:<exact>`), Symfony (`symfony/skeleton:<exact>` plus an exact compatible `symfony/webapp-pack`), Rails `7.1.5`, and Rails Hotwire `7.1.5`. WordPress uses an exact WordPress image version as its source generator. Pin Composer and Ruby bootstrap images to verified exact patch tags.

Legacy aliases include the existing `unversioned`, Rails strings, and WordPress scaffold string so old manifests remain diagnosable and upgradeable.

- [ ] **Step 4: Make bootstrap execution definition-driven**

Pass the selected definition into `prepareInitTarget`. Build Podman arguments from `generator.image`, `generator.package`, `generator.version`, and `generator.command`; retain current mount, user namespace, error classification, and existing-project detection. Error text still names the public stack ID.

- [ ] **Step 5: Move only Loom-owned bootstrap templates**

Move `loom.yaml`, `.env.example`, README, and WordPress `wp-config.php`/intentionally shipped content. Do not check generated Rails, Drupal, Symfony, or WordPress core source into the stack package.

- [ ] **Step 6: Run bootstrap unit and integration tests**

Run: `pnpm typecheck && pnpm --filter @loom/stacks test && node --test apps/cli/dist/init-template.test.js apps/cli/dist/init.integration.test.js apps/cli/dist/project-upgrade.test.js`

Expected: exact definition values drive every bootstrap invocation; local-source preservation behavior remains unchanged.

- [ ] **Step 7: Commit Task 3**

```bash
git add -A examples stacks apps/cli/src/init-template.ts apps/cli/src/init-template.test.ts apps/cli/src/init.integration.test.ts
git commit -m "feat: pin bootstrap stack generators"
```

### Task 4: Canonical CLI, Package, Release, and Installer Assets

**Files:**
- Modify: `apps/cli/src/index.ts`
- Modify: `apps/cli/src/init.integration.test.ts`
- Modify: `apps/cli/src/project-upgrade.ts`
- Modify: `apps/cli/src/project-upgrade.test.ts`
- Modify: `apps/cli/package.json`
- Modify: `scripts/build-cli-package-assets.mjs`
- Modify: `scripts/build-release-assets.mjs`
- Modify: `scripts/install.sh`
- Modify: `scripts/install.ps1`
- Create: `apps/cli/src/package-assets.integration.test.ts`

**Interfaces:**
- Renames internal `templatesRoot` concepts to `stacksRoot`.
- Source resolver candidates are only `./stacks` beside the bundle and repository-root `stacks`; no `examples` fallback remains.
- CLI npm package and release archives contain `stacks/` and no generator `examples/` directory.

- [ ] **Step 1: Write failing packaged-install tests**

Build the CLI, copy its publishable files into a temporary isolated directory, run the bundled executable with the repository root unavailable, and initialize Node plus one nested legacy-family ID. Assert generated files and v2 manifest stack/version data. Inspect package contents and assert `dist/stacks/**` exists while `dist/examples/**` does not.

- [ ] **Step 2: Run the package test and confirm failure**

Run: `pnpm --filter @loomdev/cli build && node --test apps/cli/dist/package-assets.integration.test.js`

Expected: the current build copies and resolves `examples/`.

- [ ] **Step 3: Switch CLI asset resolution atomically**

Replace `resolveTemplatesRoot` with `resolveStacksRoot`; update init, adopt, and upgrade callers together. Resolve each selected definition's `assetPath` beneath that root using containment validation. Update all missing-asset errors to say `stack assets`, not `template examples`.

- [ ] **Step 4: Update package/release copying**

Copy the `stacks/` workspace runtime assets into `apps/cli/dist/stacks/`, excluding TypeScript sources, tests, fixtures not marked for publication, dependencies, caches, runtime state, data, and build output. Include compiled definition data needed by the bundled CLI. Update npm `files`, release tar/zip members, and archive assertions from `examples` to `stacks`.

- [ ] **Step 5: Update Unix and Windows installers**

Remove an existing installed `stacks` directory before copying the new one. Stop copying release `examples`. Installation must be replace-safe so assets removed by a newer Loom release do not remain stale.

- [ ] **Step 6: Run packaged and CLI regression tests**

Run: `pnpm typecheck && pnpm --filter @loomdev/cli build && node --test apps/cli/dist/package-assets.integration.test.js apps/cli/dist/init.integration.test.js apps/cli/dist/ux.integration.test.js apps/cli/dist/project-upgrade.test.js`

Expected: source and isolated packaged execution both use only canonical stack assets.

- [ ] **Step 7: Commit Task 4**

```bash
git add apps/cli scripts/build-cli-package-assets.mjs scripts/build-release-assets.mjs scripts/install.sh scripts/install.ps1
git commit -m "feat: package canonical stack assets"
```

### Task 5: Remove Legacy Generator Assets and Document the Layout

**Files:**
- Delete: remaining generator content beneath `examples/`
- Create: `examples/runnable/README.md`
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `docs/examples-matrix.md`
- Modify: `docs/roadmap.md`
- Modify: `docs/superpowers/specs/2026-08-17-local-first-stack-workflows-design.md`
- Modify: `scripts/smoke-examples.sh`

**Interfaces:**
- Leaves `examples/runnable/README.md` as the only checked-in examples content until a direct-start project passes the future release harness.
- Existing `smoke:examples` becomes generated-stack smoke or is renamed consistently; it never starts stack assets in place.

- [ ] **Step 1: Add a failing no-legacy-reference test**

Search tracked code, scripts, package metadata, and current-behavior docs for generator-path uses of `examples/`. Allow only `examples/runnable`, historical migration specs/plans, and prose explicitly describing the removed layout. Assert no tracked generated artifacts remain under `stacks/`.

- [ ] **Step 2: Remove the legacy tree and create the runnable boundary**

Delete all remaining family aggregators and generator assets under `examples/`, then add `examples/runnable/README.md` explaining the admission gate and that the directory intentionally has no runnable project yet.

- [ ] **Step 3: Convert direct-example smoke entry points**

Update `scripts/smoke-examples.sh` to initialize disposable projects by stack ID before starting them, or rename it to `smoke-generated-stacks.sh` and update `package.json`. Do not point it at `stacks/<id>/templates/loom.yaml` directly.

- [ ] **Step 4: Update current-versus-planned documentation**

Document `stacks/` as canonical and `examples/runnable/` as verified-only. Document definition versions, exact generator/runtime tags, legacy manifest aliases, and packaged assets. Leave the complete 31-stack lifecycle matrix marked planned for the second implementation plan.

- [ ] **Step 5: Run the full gates and representative generated smoke tests**

Run: `git diff --check && pnpm verify`

Then generate and lifecycle-test Node, PHP, Python, a database, and one bootstrap-heavy stack from canonical assets. Verify developer-file hashes, readiness, host ownership, and scoped stop cleanup. Build both npm and release assets and inspect archives for `stacks/` with no legacy generator `examples/`.

Expected: all static/tests pass; representative projects are healthy; package archives are self-contained; only host-integration warnings are non-fatal.

- [ ] **Step 6: Commit Task 5**

```bash
git add -A examples stacks apps/cli scripts package.json README.md docs
git commit -m "docs: complete canonical stack migration"
```
