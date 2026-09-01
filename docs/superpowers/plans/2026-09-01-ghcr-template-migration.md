# GHCR Template Migration Implementation Plan

> **For agentic workers:** REQUIRED WORKFLOW: execute this plan inline, task-by-task, with a review checkpoint after each task. Repository policy forbids subagents.

**Goal:** Move every Loom template to verified immutable Loom GHCR images while preserving simplified, fast, rootless startup behavior.

**Architecture:** `images/digests.json` is transformed into typed runtime pins in `stacks/pins.ts`. Contract tests prohibit mutable or external defaults, and templates migrate by runtime family with fixtures and smoke tests updated in the same task.

**Tech Stack:** TypeScript, Vitest, YAML templates, Podman, GHCR OCI manifests.

**Spec:** `docs/superpowers/specs/2026-09-01-ghcr-image-catalog-design.md`

## Global Constraints

- Start only after the release-automation completion gate and initial publication.
- Every default image is `ghcr.io/loom-development/...@sha256:<manifest>` and exists in `images/digests.json`.
- Keep image override environment variables.
- Do not add OS package managers, PECL, extension compilation, or privilege-switch wrappers to startup commands.
- Preserve database selection, routes, ports, health checks, dependency restoration, and host-owned bind mounts.
- Reconcile rather than discard the existing uncommitted template simplification edits.

---

### Task 1: Typed digest pins and global template guardrail

**Files:**
- Modify: `stacks/pins.ts`
- Modify: `stacks/definition.test.ts`
- Modify: `stacks/migration-output.test.ts`
- Create: `stacks/image-catalog.test.ts`

**Interfaces:**
- Consumes: `images/digests.json`.
- Produces: typed runtime pins and a test mapping every template default to a published catalog digest.

- [ ] Write failing tests rejecting external registries, mutable tags, unknown digests, missing platforms, and startup install commands.
- [ ] Run `pnpm exec vitest run stacks/image-catalog.test.ts stacks/migration-output.test.ts`; expect failures on existing defaults.
- [ ] Replace pin values with exact published GHCR manifest references while retaining descriptive key names used by stack definitions.
- [ ] Add the digest catalog consistency check without duplicating catalog parsing logic.
- [ ] Run the focused tests; expect remaining failures only from unmigrated template bytes.
- [ ] Commit with `git commit -m "test(stacks): enforce published Loom image pins"` after the first family migration makes the test incrementally enforceable.

### Task 2: PHP and WordPress templates

**Files:**
- Modify: `stacks/php/**`
- Modify: `stacks/php-drupal/**`
- Modify: `stacks/php-symfony/**`
- Modify: `stacks/php-wordpress/**`
- Modify: `apps/cli/src/init.integration.test.ts`
- Modify: `apps/cli/src/project-upgrade.ts`

**Interfaces:**
- Uses: `loom-php` and `loom-wordpress` published pins.
- Preserves: WordPress database installation flow without embedding `wp-config.php` content in `loom.yaml`.

- [ ] Update focused tests first to expect Loom GHCR digests, no cache service unless consumed, no runtime extension installation, and short readiness periods.
- [ ] Run PHP/CLI focused tests and confirm expected failures.
- [ ] Update PHP-family templates, stack metadata, READMEs, environment examples, upgrade output, and migration fixtures.
- [ ] Run focused tests and generate all four projects.
- [ ] Start each generated project against published images; verify readiness and bind-mount ownership.
- [ ] Commit with `git commit -m "feat(stacks): migrate PHP templates to Loom images"`.

### Task 3: JavaScript templates

**Files:**
- Modify: `stacks/node/**`, `stacks/astro/**`, `stacks/bun/**`
- Modify: `stacks/jamstack/**`, `stacks/serverless/**`
- Modify: `stacks/node-mean/**`, `stacks/node-mern/**`, `stacks/node-t3/**`
- Modify: `stacks/spring-react/**`, `stacks/django-react/**`

**Interfaces:**
- Uses: Loom Node 22/24 and Bun pins.
- Preserves: package-manager restoration and frontend/backend service relationships.

- [ ] Change family tests to require published Loom digests and direct host-user execution.
- [ ] Run focused tests and confirm failures.
- [ ] Update templates, environment examples, READMEs, metadata, and fixtures without reintroducing Alpine package installation.
- [ ] Run focused tests and generated-project migration checks.
- [ ] Smoke-start one representative npm, pnpm, Yarn/Corepack, and Bun project.
- [ ] Commit with `git commit -m "feat(stacks): migrate JavaScript templates to Loom images"`.

### Task 4: Python templates

**Files:**
- Modify: `stacks/python/**`, `stacks/python-django/**`
- Modify: `stacks/python-flask/**`, `stacks/python-fastapi/**`
- Modify: `stacks/django-react/**`

**Interfaces:**
- Uses: Loom Python 3.12 and Node 24 pins.
- Preserves: dependency restoration, migrations, server commands, and writable caches.

- [ ] Update Python-family tests first and confirm failures.
- [ ] Replace defaults and reconcile existing direct-host-user simplifications across templates, metadata, docs, and fixtures.
- [ ] Run focused tests and generate every Python stack.
- [ ] Smoke-start Django, Flask, and FastAPI representatives against published digests.
- [ ] Commit with `git commit -m "feat(stacks): migrate Python templates to Loom images"`.

### Task 5: Ruby, Java, and .NET templates

**Files:**
- Modify: `stacks/rails7/**`, `stacks/rails7-hotwire/**`
- Modify: `stacks/spring-boot/**`, `stacks/spring-react/**`
- Modify: `stacks/dotnet/**`

**Interfaces:**
- Uses: Loom Ruby 3.3, Java 21, Node 22, and .NET 8 pins.

- [ ] Update compiled/runtime-family tests first and confirm failures.
- [ ] Replace defaults, preserve build/run commands, and reconcile rootless writable-path handling.
- [ ] Update metadata, docs, environment examples, and fixtures.
- [ ] Run focused tests and smoke-start Rails, Spring Boot, and .NET representatives.
- [ ] Commit with `git commit -m "feat(stacks): migrate compiled runtime templates"`.

### Task 6: Database templates and combined database stack

**Files:**
- Modify: `stacks/db-mysql/**`, `stacks/db-mariadb/**`, `stacks/db-postgres/**`
- Modify: `stacks/db-mongodb/**`, `stacks/db-redis/**`, `stacks/db-elasticsearch/**`
- Modify: `stacks/db-sqlserver/**`, `stacks/db-sqlite/**`, `stacks/db-all/**`

**Interfaces:**
- Uses: verified GHCR mirror digests and Loom SQLite digest.
- Preserves: upstream entrypoints, credentials, persistent data, and readiness probes.

- [ ] Update database tests first to require exact catalog digests and unchanged service contracts.
- [ ] Replace all defaults and update environment examples, READMEs, metadata, and fixtures.
- [ ] Run focused tests.
- [ ] Start each database independently, run a write/read probe, stop it cleanly, and verify persisted data after restart.
- [ ] Start the combined database stack and verify all health checks without port collisions.
- [ ] Commit with `git commit -m "feat(stacks): migrate databases to Loom image catalog"`.

### Task 7: Full generated-stack verification

**Files:**
- Modify: `scripts/smoke-generated-stacks.sh`
- Modify: `website/README.md`
- Modify: `README.md`

**Interfaces:**
- Produces: a repeatable smoke report for all templates and user documentation for image overrides and updates.

- [ ] Extend the smoke script to record template, digest, startup duration, readiness result, and cleanup result; ensure cleanup targets only the generated test project.
- [ ] Add tests or dry-run assertions for template enumeration and exact cleanup scope.
- [ ] Run `pnpm verify`; expect PASS.
- [ ] Run `pnpm smoke:generated` with registry/network access; expect every template to pass or produce an explicit environment-blocked result with evidence.
- [ ] Verify `rg -n 'apt-get|apk add|pecl install|docker-php-ext|setpriv' stacks/*/templates/loom.yaml` returns no matches.
- [ ] Document GHCR defaults, immutable pins, overrides, weekly updates, and the distinction between custom runtimes and mirrors.
- [ ] Commit with `git commit -m "test(stacks): verify GHCR template catalog"`.

### Task 8: Migration completion audit

**Files:**
- Modify only files identified by the audit.

**Interfaces:**
- Confirms complete spec coverage and no stale external defaults.

- [ ] Compare every `stacks/*/templates/loom.yaml` image with `images/digests.json`; require exact coverage.
- [ ] Run `pnpm verify` and the applicable release smoke suite.
- [ ] Inspect `git diff --check`, fixture synchronization, and documentation links.
- [ ] Confirm no partial Server Side Up pin or obsolete Memcached requirement remains.
- [ ] Commit audit corrections with `git commit -m "fix(stacks): complete GHCR image migration"`; omit the commit if no corrections exist.

## Migration Completion Gate

Migration is complete only when all template defaults resolve to signed,
multi-platform Loom GHCR manifest digests, repository verification passes, and
generated-stack smoke results are recorded without claiming blocked tests as
successful.
