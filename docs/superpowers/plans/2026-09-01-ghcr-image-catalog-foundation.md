# GHCR Image Catalog Foundation Implementation Plan

> **For agentic workers:** REQUIRED WORKFLOW: execute this plan inline, task-by-task, with a review checkpoint after each task. Repository policy forbids subagents.

**Goal:** Build and locally verify Loom's custom multi-platform runtime image definitions and machine-readable image catalog.

**Architecture:** An `images/catalog.json` file is the single source of truth for custom and mirrored images. Focused Node scripts validate the catalog and drive Podman builds/tests; each custom image owns a Containerfile and a public-behavior smoke test.

**Tech Stack:** OCI Containerfiles, Podman, Node.js 24, `node:test`, Bash, PHP 8.4, JSON Schema-style validation.

**Spec:** `docs/superpowers/specs/2026-09-01-ghcr-image-catalog-design.md`

## Global Constraints

- Registry namespace is exactly `ghcr.io/loom-development`.
- Custom images target `linux/amd64` and `linux/arm64`.
- Templates continue using their current images until GHCR manifests are published.
- PHP supports the extension contract in the spec; Xdebug is installed but disabled by default.
- No runtime image installs OS packages or extensions during container startup.
- Preserve all unrelated and existing uncommitted template edits.

---

### Task 1: Catalog schema and validator

**Files:**
- Create: `images/catalog.json`
- Create: `scripts/images/catalog.mjs`
- Create: `scripts/images/catalog.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `loadCatalog(path): Promise<ImageCatalog>` and `validateCatalog(value): string[]`.
- `ImageCatalog.images[]` contains `name`, `kind`, `source`, `version`, `platforms`, and `context` for custom images.

- [ ] **Step 1: Write failing catalog validation tests**

Test a valid minimal catalog and rejection of duplicate names, non-GHCR targets, mutable source references, missing platforms, and a custom image without a context. Use `node:test` and temporary JSON files.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test scripts/images/catalog.test.mjs`

Expected: FAIL because `catalog.mjs` does not exist.

- [ ] **Step 3: Implement the validator and initial catalog**

Export:

```js
export async function loadCatalog(path) {}
export function validateCatalog(value) {}
```

Seed entries for `loom-php`, `loom-wordpress`, Node 22/24, Python 3.12,
Ruby 3.3, Bun 1, Java 21, .NET 8, SQLite 3, and the seven infrastructure
mirrors. Record both required platforms on every entry.

- [ ] **Step 4: Add the image test to repository verification**

Add `test:images` and include it in `verify` before workspace tests.

- [ ] **Step 5: Run tests**

Run: `pnpm test:images && pnpm lint && pnpm typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add images/catalog.json scripts/images/catalog.mjs scripts/images/catalog.test.mjs package.json
git commit -m "feat(images): add validated image catalog"
```

### Task 2: Shared build and contract-test driver

**Files:**
- Create: `scripts/images/build.mjs`
- Create: `scripts/images/build.test.mjs`
- Create: `scripts/images/test-image.mjs`
- Create: `scripts/images/process.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `loadCatalog()` from Task 1.
- Produces: `buildImage(name, options)` and `testImage(name, reference, options)`.
- `process.mjs` exports `run(command, args, options)` so process execution can be unit-tested without a shell.

- [ ] **Step 1: Write failing argument-construction tests**

Assert that custom builds use explicit context, Containerfile, target platform,
and local tag; mirror entries reject local build attempts. Assert commands are
argument arrays and never interpolate a shell string.

- [ ] **Step 2: Confirm the tests fail**

Run: `node --test scripts/images/build.test.mjs`

Expected: FAIL because the build module is absent.

- [ ] **Step 3: Implement the minimal driver**

Support:

```text
node scripts/images/build.mjs <catalog-name> [--platform linux/amd64]
node scripts/images/test-image.mjs <catalog-name> <local-or-published-reference>
```

Reject unknown names, mirrors passed to the build command, unsupported
platforms, and missing image test scripts with actionable messages.

- [ ] **Step 4: Add package scripts**

Add `images:build`, `images:test`, and extend `test:images` to run all
`scripts/images/*.test.mjs` tests.

- [ ] **Step 5: Verify unit behavior**

Run: `pnpm test:images`

Expected: PASS without requiring Podman or network access.

- [ ] **Step 6: Commit**

```bash
git add scripts/images package.json
git commit -m "feat(images): add build and contract test driver"
```

### Task 3: Comprehensive PHP runtime

**Files:**
- Create: `images/php/Containerfile`
- Create: `images/php/php.ini-development`
- Create: `images/php/loom-apache-entrypoint`
- Create: `images/php/contract.sh`
- Create: `images/php/extensions.txt`
- Modify: `images/catalog.json`

**Interfaces:**
- Consumes: Task 2's build/test driver.
- Produces: `localhost/loom-php:<version>` exposing Apache on port 80 and honoring `LOOM_DOCUMENT_ROOT`.
- `extensions.txt` is the exact machine-readable PHP extension contract.

- [ ] **Step 1: Write the failing PHP contract**

The contract must compare `php -m` with `extensions.txt`, run
`composer --version`, assert `xdebug.mode=off`, assert Apache `rewrite_module`
is loaded, and serve an `index.php` from a bind-mounted configurable document
root. It must verify files created in the bind mount have the invoking UID/GID.

- [ ] **Step 2: Confirm the contract fails against the current official image**

Run: `node scripts/images/test-image.mjs loom-php docker.io/library/php:8.4.10-apache`

Expected: FAIL listing absent framework extensions.

- [ ] **Step 3: Implement the PHP image**

Build extensions during image construction only. Include the exact spec set:
database drivers; internationalization; XML/SOAP/XSL; GD JPEG/WebP/FreeType;
zip, Imagick, Redis, Memcached, APCu, OPcache, and Xdebug. Install Composer by
copying its binary from a digest-pinned Composer build stage. Enable Apache
rewrite and make document-root configuration idempotent in the entrypoint.

- [ ] **Step 4: Build and run the contract**

Run: `pnpm images:build -- loom-php --platform linux/amd64`

Run: `pnpm images:test -- loom-php localhost/loom-php:dev`

Expected: PASS; Xdebug remains disabled.

- [ ] **Step 5: Run PHP framework compatibility fixtures**

Use minimal checked-in fixtures or generated lockfiles to start representative
Laravel, Symfony, Drupal, and WordPress front controllers. Check Magento's
published required extension list against `extensions.txt` without installing
Magento.

- [ ] **Step 6: Commit**

```bash
git add images/php images/catalog.json
git commit -m "feat(images): add comprehensive PHP runtime"
```

### Task 4: WordPress runtime variant

**Files:**
- Create: `images/wordpress/Containerfile`
- Create: `images/wordpress/contract.sh`
- Modify: `images/catalog.json`

**Interfaces:**
- Consumes: the local/published `loom-php` image contract.
- Produces: a WordPress-compatible Apache runtime without generating or embedding `wp-config.php` content.

- [ ] **Step 1: Write the failing WordPress contract**

Assert the image contains WordPress core, preserves a mounted project, accepts
database configuration through normal WordPress mechanisms, starts Apache, and
does not create a Loom-owned `wp-config.php`.

- [ ] **Step 2: Confirm failure before the image exists**

Run: `pnpm images:test -- loom-wordpress localhost/loom-wordpress:dev`

Expected: FAIL because the image is unavailable.

- [ ] **Step 3: Implement the thin variant**

Use the Loom PHP runtime as the base, copy digest/version-pinned WordPress core,
and keep WordPress-specific entrypoint behavior separate from the generic PHP
entrypoint.

- [ ] **Step 4: Build and verify**

Run: `pnpm images:build -- loom-wordpress --platform linux/amd64`

Run: `pnpm images:test -- loom-wordpress localhost/loom-wordpress:dev`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add images/wordpress images/catalog.json
git commit -m "feat(images): add WordPress runtime"
```

### Task 5: JavaScript runtimes

**Files:**
- Create: `images/node/22/Containerfile`
- Create: `images/node/24/Containerfile`
- Create: `images/node/contract.sh`
- Create: `images/bun/Containerfile`
- Create: `images/bun/contract.sh`
- Modify: `images/catalog.json`

**Interfaces:**
- Produces: Node 22/24 images with npm, Corepack, pnpm, and Yarn; Bun 1 with its native package manager.

- [ ] **Step 1: Write failing runtime contracts**

Verify exact major versions, package-manager availability, install a local
file-based fixture without network access, execute it as the host UID/GID, and
check bind-mounted ownership.

- [ ] **Step 2: Confirm contracts fail for missing local tags**

Run the driver for all three `localhost/...:dev` references and expect image-not-found failures.

- [ ] **Step 3: Implement the three images**

Install build dependencies at image build time, pre-enable pinned Corepack
package managers, and configure writable cache/home defaults without startup
package installation.

- [ ] **Step 4: Build and verify each image**

Run `pnpm images:build` and `pnpm images:test` for `loom-node-22`,
`loom-node-24`, and `loom-bun` on `linux/amd64`.

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add images/node images/bun images/catalog.json
git commit -m "feat(images): add JavaScript runtimes"
```

### Task 6: Python and Ruby runtimes

**Files:**
- Create: `images/python/3.12/Containerfile`
- Create: `images/python/contract.sh`
- Create: `images/ruby/3.3/Containerfile`
- Create: `images/ruby/contract.sh`
- Modify: `images/catalog.json`

**Interfaces:**
- Produces: Python 3.12 with pip/venv and Ruby 3.3 with Bundler, both supporting host-aligned bind mounts.

- [ ] **Step 1: Write failing contracts**

Python creates a venv, installs a local wheel fixture, and starts a minimal WSGI
application. Ruby installs a local gem fixture and starts a minimal Rack
application. Both assert host-owned output files.

- [ ] **Step 2: Confirm missing-image failures**

Run both contracts against their not-yet-built local tags.

- [ ] **Step 3: Implement images with native framework libraries baked in**

Include the runtime libraries needed by Django/Flask/FastAPI and Rails/Hotwire.
Do not install application dependencies in the image or during entrypoint
startup.

- [ ] **Step 4: Build and verify**

Run the build and test driver for both images on `linux/amd64`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add images/python images/ruby images/catalog.json
git commit -m "feat(images): add Python and Ruby runtimes"
```

### Task 7: Java, .NET, and SQLite runtimes

**Files:**
- Create: `images/java/21/Containerfile`
- Create: `images/java/contract.sh`
- Create: `images/dotnet/8/Containerfile`
- Create: `images/dotnet/contract.sh`
- Create: `images/sqlite/3/Containerfile`
- Create: `images/sqlite/contract.sh`
- Modify: `images/catalog.json`

**Interfaces:**
- Produces: Temurin 21/Maven, .NET SDK 8, and SQLite CLI catalog images.

- [ ] **Step 1: Write failing contracts**

Verify Java/Maven versions and compile an offline fixture; verify the .NET SDK
and run an offline console fixture; verify SQLite creates, writes, and reads a
database on a host bind mount with correct ownership.

- [ ] **Step 2: Confirm missing-image failures**

Run all three contracts against their local development tags.

- [ ] **Step 3: Implement the runtime definitions**

Use digest-pinned upstream build stages and include only tools promised by the
catalog. Preserve upstream runtime behavior unless Loom needs writable cache
defaults for rootless development.

- [ ] **Step 4: Build and verify**

Run the build and test driver for all three images on `linux/amd64`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add images/java images/dotnet images/sqlite images/catalog.json
git commit -m "feat(images): add compiled and SQLite runtimes"
```

### Task 8: Foundation documentation and full local gate

**Files:**
- Create: `images/README.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Documents catalog fields, local build/test commands, PHP extensions, platform expectations, and image contribution rules.

- [ ] **Step 1: Add a documentation assertion**

Extend catalog tests to require every custom image name and PHP's
`extensions.txt` path to appear in `images/README.md`.

- [ ] **Step 2: Confirm the assertion fails**

Run: `pnpm test:images`

Expected: FAIL because the documentation is absent.

- [ ] **Step 3: Write the catalog documentation**

Document exact commands, directory ownership, tag conventions, local-only
development tags, adding an image, and why mirrors are not wrapped.

- [ ] **Step 4: Run the full foundation gate**

Run: `pnpm verify`

Run each custom image contract against its local `linux/amd64` build.

Expected: all PASS. Record `arm64` execution as a release-CI requirement when
the local host cannot execute that architecture.

- [ ] **Step 5: Commit**

```bash
git add images/README.md README.md package.json scripts/images
git commit -m "docs(images): document runtime catalog"
```

## Foundation Completion Gate

Do not begin GHCR automation until all custom images build locally, every
contract passes on `linux/amd64`, the catalog validator passes, and `pnpm verify`
is green. Existing stack templates remain on their prior images at this gate.
