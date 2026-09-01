# Stack Template Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit and safely simplify all 30 non-WordPress stack templates while preserving generated-project startup, writable bind mounts, database composition, and public CLI behavior.

**Architecture:** Treat `loom init <stack>` as the public seam and change one runtime family at a time. Each family starts with failing generation/metadata assertions, removes startup-time OS package management, aligns stack metadata and documentation, updates migration digests, and returns to green before the next family begins.

**Tech Stack:** TypeScript, Node.js test runner, YAML Loom templates, Podman, pnpm workspace scripts.

**Spec:** `docs/superpowers/specs/2026-09-01-stack-template-simplification-design.md`

## Global Constraints

- Do not use subagents; repository `AGENTS.md` requires inline execution.
- Do not alter framework versions or Loom's configuration schema.
- Do not introduce or publish custom runtime images.
- Never run `apt-get`, `apk add`, PECL, or runtime-extension compilation in application service startup.
- Preserve language dependency restoration when source cannot boot without it.
- Preserve database initialization, persistent data, routes, ports, and health checks.
- Leave already-minimal templates unchanged unless a test proves redundant or unsafe behavior.
- Existing uncommitted WordPress changes are user work: do not stage them in family commits.

---

### Task 1: Add Cross-Template Simplification Guardrails

**Files:**
- Modify: `stacks/migration-output.test.ts`
- Modify: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Consumes: `stackDefinitions`, each definition's `assetPath`, and generated `loom.yaml` files.
- Produces: repository-wide protection against startup OS package installation and family-specific generated-config assertions.

- [ ] **Step 1: Add a failing repository-wide template test**

Add this test to `stacks/migration-output.test.ts`:

```ts
test("application templates never install operating-system packages during startup", async () => {
  const forbidden = /\b(?:apt-get|apk\s+add|pecl\s+install|docker-php-ext-(?:install|enable))\b/;
  for (const definition of stackDefinitions) {
    if (definition.id.startsWith("db-")) continue;
    const yaml = await readFile(resolve(root, "..", definition.assetPath, "loom.yaml"), "utf8");
    assert.doesNotMatch(yaml, forbidden, definition.id);
  }
});
```

- [ ] **Step 2: Run the test and verify red**

Run:

```bash
pnpm build
node --test --test-name-pattern="application templates never install" stacks/dist/migration-output.test.js
```

Expected: FAIL naming at least `node`, `python`, `php`, or `rails7`.

- [ ] **Step 3: Add generated-project negative assertions**

In the existing PHP, Node, Python, and Rails init integration tests, assert:

```ts
assert.doesNotMatch(generatedConfig, /apt-get|apk add|pecl install|docker-php-ext-install/i);
```

Do not change production templates in this task.

- [ ] **Step 4: Commit the red guardrails**

```bash
git add stacks/migration-output.test.ts apps/cli/src/init.integration.test.ts
git commit -m "test: forbid runtime system package installation"
```

### Task 2: Simplify Node and Frontend Runtime Templates

**Files:**
- Modify: `stacks/node/templates/loom.yaml`
- Modify: `stacks/astro/templates/loom.yaml`
- Modify: `stacks/node-mean/templates/loom.yaml`
- Modify: `stacks/node-mern/templates/loom.yaml`
- Modify: `stacks/node-t3/templates/loom.yaml`
- Modify affected `.env.example` and `README.md` files in those template directories
- Modify matching `stacks/*/stack.ts` lifecycle metadata
- Modify matching `stacks/*/fixtures/migration.json`
- Modify: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Consumes: `HOST_UID`, `HOST_GID`, source bind mounts, and each package manager's existing install/start scripts.
- Produces: rootless Node-family services that restore dependencies without OS package managers or `setpriv`.

- [ ] **Step 1: Make Node-family generation expectations fail**

For generated Node-family configs, require direct host-user execution and the existing dependency/start command:

```ts
assert.match(generatedConfig, /user:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
assert.doesNotMatch(generatedConfig, /user:\s*root|setpriv|apt-get|apk add/);
```

Keep stack-specific assertions for `npm install`, `pnpm install`, `npm start`, and framework dev-server ports.

- [ ] **Step 2: Verify the Node-family tests fail**

```bash
pnpm build
node --test --test-name-pattern="init (node|astro|node-mean|node-mern|node-t3)" apps/cli/dist/init.integration.test.js
```

Expected: FAIL because current templates run as root and install native build tools.

- [ ] **Step 3: Replace root/setpriv wrappers with direct users**

For each affected service, use this shape while retaining its exact package-manager and server command:

```yaml
user: ${HOST_UID:-1000}:${HOST_GID:-1000}
userns: keep-id
command: sh -c 'npm install && npm start'
```

For T3 retain `pnpm install && pnpm dev`; for Astro retain `npm install && npx astro dev --host 0.0.0.0 --port 4321`. Remove `user: root`, `setpriv`, OS-package branches, and environment variables used only by those branches.

- [ ] **Step 4: Align definitions and documentation**

Remove native-tool installation entries from each affected `stack.ts` `install` array while retaining language install/start metadata. Remove README claims that first startup installs compilers or database headers. Keep image pins unchanged.

- [ ] **Step 5: Update only affected migration fixtures**

Recalculate each changed template's normalized `sourceDigest` and `loomDigest` using the algorithm in `stacks/migration-output.test.ts`; preserve `fileCount` unless inventory changed.

- [ ] **Step 6: Run the Node-family and migration tests**

```bash
pnpm build
node --test --test-name-pattern="init (node|astro|node-mean|node-mern|node-t3)" apps/cli/dist/init.integration.test.js
node --test stacks/dist/migration-output.test.js stacks/dist/definition.test.js
```

Expected: PASS.

- [ ] **Step 7: Commit the Node-family slice**

```bash
git add stacks/node stacks/astro stacks/node-mean stacks/node-mern stacks/node-t3 apps/cli/src/init.integration.test.ts
git commit -m "refactor: simplify node stack startup"
```

### Task 3: Simplify Python Runtime Templates

**Files:**
- Modify: `stacks/python/templates/loom.yaml`
- Modify: `stacks/python-django/templates/loom.yaml`
- Modify: `stacks/python-flask/templates/loom.yaml`
- Modify: `stacks/python-fastapi/templates/loom.yaml`
- Modify affected README, `.env.example`, `stack.ts`, and migration fixture files
- Modify: `apps/cli/src/init.integration.test.ts`

**Interfaces:**
- Consumes: requirements files, `HOST_UID`, `HOST_GID`, and framework server commands.
- Produces: direct rootless Python services with dependencies installed into a writable `/tmp/loom-home`.

- [ ] **Step 1: Add failing Python-family assertions**

```ts
assert.match(generatedConfig, /user:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
assert.match(generatedConfig, /HOME="?\/tmp\/loom-home"?/);
assert.match(generatedConfig, /pip install --disable-pip-version-check --user -r requirements\.txt/);
assert.doesNotMatch(generatedConfig, /user:\s*root|setpriv|apt-get|apk add/);
```

- [ ] **Step 2: Verify red**

```bash
pnpm build
node --test --test-name-pattern="init python" apps/cli/dist/init.integration.test.js
```

Expected: FAIL on root/setpriv and OS package installation.

- [ ] **Step 3: Implement the direct-user Python command**

Use this base command, appending each framework's existing migrate/start operation:

```yaml
user: ${HOST_UID:-1000}:${HOST_GID:-1000}
userns: keep-id
command: >-
  sh -c 'mkdir -p /tmp/loom-home/.local /tmp/loom-home/.cache/pip &&
  HOME=/tmp/loom-home PATH=/tmp/loom-home/.local/bin:$PATH
  PIP_CACHE_DIR=/tmp/loom-home/.cache/pip
  pip install --disable-pip-version-check --user -r requirements.txt &&
  python app.py'
```

Retain Django migrations, Flask's `flask --app app run`, and FastAPI's `uvicorn` command exactly. Remove OS-package detection and `setpriv`.

- [ ] **Step 4: Align definitions, docs, and fixtures**

Set affected `install` metadata to the corresponding `pip install` command only. Remove native-package documentation and recalculate migration hashes.

- [ ] **Step 5: Run focused verification**

```bash
pnpm build
node --test --test-name-pattern="init python" apps/cli/dist/init.integration.test.js
node --test stacks/dist/definition.test.js stacks/dist/migration-output.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit the Python-family slice**

```bash
git add stacks/python stacks/python-django stacks/python-flask stacks/python-fastapi apps/cli/src/init.integration.test.ts
git commit -m "refactor: simplify python stack startup"
```

### Task 4: Simplify Rails Runtime Templates

**Files:**
- Modify: `stacks/rails7/templates/loom.yaml`
- Modify: `stacks/rails7-hotwire/templates/loom.yaml`
- Modify matching README, `.env.example`, `stack.ts`, fixtures, and CLI integration assertions

**Interfaces:**
- Consumes: Rails source, Bundler manifests, host UID/GID.
- Produces: rootless Rails startup with writable temporary Bundler state and no OS package installation.

- [ ] **Step 1: Add failing Rails assertions**

```ts
assert.match(generatedConfig, /user:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
assert.match(generatedConfig, /BUNDLE_PATH="?\/tmp\/loom-home\/bundle"?/);
assert.doesNotMatch(generatedConfig, /user:\s*root|setpriv|apt-get|apk add/);
```

- [ ] **Step 2: Verify red**

```bash
pnpm build
node --test --test-name-pattern="init rails7" apps/cli/dist/init.integration.test.js
```

- [ ] **Step 3: Implement direct-user Bundler startup**

```yaml
user: ${HOST_UID:-1000}:${HOST_GID:-1000}
userns: keep-id
command: >-
  sh -c 'mkdir -p /tmp/loom-home/bundle /tmp/loom-home/bundle-config &&
  HOME=/tmp/loom-home BUNDLE_PATH=/tmp/loom-home/bundle
  BUNDLE_APP_CONFIG=/tmp/loom-home/bundle-config
  bundle install && bin/rails server -b 0.0.0.0 -p 3006'
```

Use port `3008` for Hotwire. Preserve routes, mounts, and health checks.

- [ ] **Step 4: Align metadata, docs, fixtures, and run tests**

```bash
pnpm build
node --test --test-name-pattern="init rails7" apps/cli/dist/init.integration.test.js
node --test stacks/dist/definition.test.js stacks/dist/migration-output.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the Rails slice**

```bash
git add stacks/rails7 stacks/rails7-hotwire apps/cli/src/init.integration.test.ts
git commit -m "refactor: simplify rails stack startup"
```

### Task 5: Simplify PHP, Drupal, and Symfony

**Files:**
- Modify: `stacks/php/templates/loom.yaml`
- Modify: `stacks/php-drupal/templates/loom.yaml`
- Modify: `stacks/php-symfony/templates/loom.yaml`
- Modify corresponding `.env.example`, README, `stack.ts`, fixtures, and tests
- Modify: `stacks/pins.ts` only if an already-supported compatible image pin is required

**Interfaces:**
- Consumes: generated PHP/Drupal/Symfony source and Composer manifests.
- Produces: Apache services with required PHP extensions supplied by the selected image, Composer restoration, writable bind mounts, and no Memcached.

- [ ] **Step 1: Add failing PHP-family assertions**

```ts
assert.doesNotMatch(generatedConfig, /memcached|apt-get|pecl install|docker-php-ext-install/i);
assert.match(generatedConfig, /composer install/);
assert.match(generatedConfig, /apache2-foreground/);
```

- [ ] **Step 2: Verify red**

```bash
pnpm build
node --test --test-name-pattern="init php" apps/cli/dist/init.integration.test.js
```

- [ ] **Step 3: Prove required extensions before changing images**

Test the currently pinned PHP runtime directly:

```bash
podman run --rm docker.io/library/php:8.4.10-apache php -r 'exit(extension_loaded("pdo_mysql") && extension_loaded("intl") && extension_loaded("zip") ? 0 : 1);'
```

For Drupal also verify `gd`; for Symfony verify the extensions listed in its committed Composer lock. If no already-supported image passes, stop this task and report the exact missing extensions; do not retain runtime compilation or invent an unpinned image.

- [ ] **Step 4: Remove optional cache and runtime compilation**

Remove the `cache` service, Memcached image metadata, `dependsOn: cache`, Memcached environment variables, OS installation, PECL, and `docker-php-ext-*` commands. Retain the collision-safe `www-data` UID/GID mapping, `composer install`, Apache configuration, and `apache2-foreground`.

- [ ] **Step 5: Align metadata, docs, fixtures, and test**

Set each definition's `install` metadata to Composer restoration only and reduce readiness from the former 300-second compilation allowance to the measured boot budget plus 30 seconds.

```bash
pnpm build
node --test --test-name-pattern="init php" apps/cli/dist/init.integration.test.js
node --test stacks/dist/definition.test.js stacks/dist/migration-output.test.js
```

Expected: PASS, or the explicit compatible-image gate from Step 3 blocks the PHP slice without weakening it.

- [ ] **Step 6: Commit the PHP slice if green**

```bash
git add stacks/php stacks/php-drupal stacks/php-symfony stacks/pins.ts apps/cli/src/init.integration.test.ts
git commit -m "refactor: simplify php stack startup"
```

### Task 6: Remove SQLite Startup Package Installation

**Files:**
- Modify: `stacks/db-sqlite/templates/loom.yaml`
- Modify: `stacks/db-all/templates/loom.yaml`
- Modify matching README, `.env.example`, stack definitions, fixtures, and database integration assertions

**Interfaces:**
- Consumes: `/data/loom.db` persistent path and the SQLite verification task.
- Produces: SQLite services whose selected image already contains `sqlite3`.

- [ ] **Step 1: Add a failing database-template assertion**

```ts
assert.doesNotMatch(sqliteYaml, /apk add|apt-get/);
assert.match(sqliteYaml, /sqlite3 \/data\/loom\.db 'select 1;'/i);
```

- [ ] **Step 2: Verify red**

```bash
pnpm build
node --test --test-name-pattern="database" stacks/dist/definition.test.js
```

- [ ] **Step 3: Select the repository's pinned SQLite-capable image**

Use `docker.io/keinos/sqlite3:3.46.1` as the concrete candidate and verify it directly before changing pins:

```bash
podman run --rm --entrypoint sqlite3 docker.io/keinos/sqlite3:3.46.1 :memory: "select 1;"
```

Update both templates and runtime pin metadata to the exact verified reference. Keep the existing database path, tail process, health check, backup command, and verification command.

- [ ] **Step 4: Align docs/fixtures and run focused tests**

```bash
pnpm build
node --test --test-name-pattern="database" stacks/dist/definition.test.js
node --test stacks/dist/migration-output.test.js
```

- [ ] **Step 5: Commit the SQLite slice**

```bash
git add stacks/db-sqlite stacks/db-all stacks/pins.ts
git commit -m "refactor: use ready sqlite runtime image"
```

### Task 7: Audit Already-Minimal Templates

**Files:**
- Inspect: `stacks/bun/templates/loom.yaml`
- Inspect: `stacks/jamstack/templates/loom.yaml`
- Inspect: `stacks/serverless/templates/loom.yaml`
- Inspect: `stacks/django-react/templates/loom.yaml`
- Inspect: `stacks/dotnet/templates/loom.yaml`
- Inspect: `stacks/spring-boot/templates/loom.yaml`
- Inspect: `stacks/spring-react/templates/loom.yaml`
- Inspect all non-SQLite database template YAML files
- Modify only tests or documentation that contradict the simplification contract

**Interfaces:**
- Consumes: the cross-template guardrail from Task 1.
- Produces: documented evidence that all remaining templates already comply or narrowly scoped changes where they do not.

- [ ] **Step 1: Run the static audit**

```bash
rg -n "apt-get|apk add|pecl install|docker-php-ext|setpriv|type: memcached" stacks/*/templates/loom.yaml
```

Expected after Tasks 2–6: no application-template OS package installation and no unconsumed Memcached service.

- [ ] **Step 2: Verify service/environment consumption**

For each inspected template, match every `dependsOn` entry to a declared service and every image environment in YAML to its `stack.ts` `runtimeImages`. Remove only fields proven unused by the service command, generated application, or Loom database composition.

- [ ] **Step 3: Run all stack contracts**

```bash
pnpm build
node --test stacks/dist/**/*.test.js
```

Expected: PASS.

- [ ] **Step 4: Commit any audit corrections**

```bash
git add stacks apps/cli/src/init.integration.test.ts
git commit -m "refactor: finish stack template simplification audit"
```

Skip the commit when the audit produces no changes.

### Task 8: Full Verification and Generated-Stack Smoke Tests

**Files:**
- Modify only failing tests, fixtures, or docs directly attributable to Tasks 1–7
- Do not weaken assertions to make failures disappear

**Interfaces:**
- Consumes: all simplified template families.
- Produces: repository-wide proof and a smoke-test result matrix.

- [ ] **Step 1: Run repository verification**

```bash
pnpm verify
```

Expected: lint, type checking, and every workspace test pass.

- [ ] **Step 2: Generate every stack without starting it**

```bash
pnpm smoke:generated
```

Expected: every stack generates successfully and packaged assets match definitions.

- [ ] **Step 3: Smoke-start locally available families**

Run the repository's generated-stack smoke command for images and dependencies already cached locally. For each started project, require `loom start`, `loom status`, and the stack definition's verification command to succeed. Do not request unrestricted downloads merely to convert an environment limitation into a passing result.

- [ ] **Step 4: Record blocked smoke cases**

In the final handoff, list each skipped template and the exact external image or dependency unavailable locally. Do not classify an unrun network-dependent smoke as passing.

- [ ] **Step 5: Review the complete diff**

```bash
git diff --check
git status --short
rg -n "apt-get|apk add|pecl install|docker-php-ext" stacks/*/templates/loom.yaml
```

Expected: no whitespace errors, only intentional files modified, and no forbidden application startup installation.

- [ ] **Step 6: Commit final verification corrections if needed**

```bash
git add apps packages stacks
git commit -m "test: verify simplified stack templates"
```

Skip this commit when verification required no corrections.
