# Dependent Image Builds Implementation Plan

> **For agentic workers:** Execute this plan inline, task by task. The repository's `AGENTS.md` forbids subagents. Keep checkbox state current and stop at each commit boundary for review.

**Goal:** Build `loom-wordpress` from the local `loom-php` runtime and a separately pinned upstream WordPress source through an explicit catalog dependency.

**Architecture:** Add one optional `runtime` relationship to custom entries. The builder recursively builds it once, then passes its local reference as `LOOM_BASE_IMAGE` and the dependent entry's pinned source as `LOOM_SOURCE_IMAGE`; standalone builds remain compatible. WordPress copies only application assets from upstream and initializes them before delegating Apache startup to Loom PHP.

**Tech Stack:** Node.js ES modules and `node:test`, JSON catalog metadata, Podman/Containerfiles, Bash contracts, PHP 8.4/Apache, official WordPress assets.

**Spec:** `docs/superpowers/specs/2026-09-01-dependent-image-builds-design.md`

## Global Constraints

- `runtime` supports exactly one custom catalog dependency and is optional.
- Every image input remains pinned with a `sha256` digest.
- Both `linux/amd64` and `linux/arm64` remain supported.
- Standalone images receive only `LOOM_BASE_IMAGE=<image.source>`.
- Dependent images receive `LOOM_BASE_IMAGE=<local runtime reference>` and `LOOM_SOURCE_IMAGE=<image.source>`.
- CLI syntax and final local reference format do not change.
- WordPress inherits Loom PHP 8.4 and its complete extension contract; upstream PHP binaries and configuration are not copied.
- Xdebug remains installed and disabled by default.
- Rootless bind-mounted writes retain host ownership.

---

### Task 1: Validate catalog runtime dependencies

**Files:**
- Modify: `images/catalog.json`
- Modify: `scripts/images/catalog.mjs`
- Test: `scripts/images/catalog.test.mjs`

**Interfaces:**
- Consumes: `validateCatalog(value): string[]` and `loadCatalog(path): Promise<object>`.
- Produces: optional `image.runtime: string`, accepted only when it names a compatible custom image in an acyclic graph.

- [ ] **Step 1: Write failing tests for valid and invalid runtime graphs**

Add a valid dependent entry:

```js
const dependent = {
  name: "loom-wordpress",
  kind: "custom",
  source: "docker.io/library/wordpress@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  runtime: "loom-php",
  version: "6.8.2-php8.4-loom.1",
  platforms: ["linux/amd64", "linux/arm64"],
  context: "images/wordpress"
};
const catalog = structuredClone(validCatalog);
catalog.images.push(dependent);
assert.deepEqual(validateCatalog(catalog), []);
```

Add focused cases asserting these messages:

```text
image "loom-wordpress" has invalid runtime "Bad Runtime"
image "loom-wordpress" runtime "missing" does not exist
image "loom-wordpress" runtime "postgres-16" must be custom
image "loom-wordpress" platform "linux/arm64" is not supported by runtime "loom-php"
image runtime dependency cycle: loom-php -> loom-wordpress -> loom-php
```

- [ ] **Step 2: Run the catalog tests and verify failure**

```bash
podman run --rm --volume "$PWD:/repo:Z" --workdir /repo localhost/loom-node-24:24.4.1-loom.1 node --test scripts/images/catalog.test.mjs
```

Expected: missing/mirrored/platform/cycle assertions fail because `runtime` is not validated.

- [ ] **Step 3: Add the WordPress relationship**

Add to the existing `loom-wordpress` entry in `images/catalog.json`:

```json
"runtime": "loom-php"
```

- [ ] **Step 4: Implement field, compatibility, and cycle validation**

After existing per-entry validation, index entries and validate edges:

```js
const imagesByName = new Map(value.images.map((image) => [image.name, image]));
for (const image of value.images) {
  if (!("runtime" in image)) continue;
  if (typeof image.runtime !== "string" || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(image.runtime)) {
    errors.push(`image "${image.name}" has invalid runtime "${String(image.runtime)}"`);
    continue;
  }
  const runtime = imagesByName.get(image.runtime);
  if (!runtime) errors.push(`image "${image.name}" runtime "${image.runtime}" does not exist`);
  else if (runtime.kind !== "custom") errors.push(`image "${image.name}" runtime "${image.runtime}" must be custom`);
  else for (const platform of image.platforms ?? []) {
    if (!runtime.platforms?.includes(platform)) errors.push(`image "${image.name}" platform "${platform}" is not supported by runtime "${image.runtime}"`);
  }
}
```

Add depth-first cycle detection with `visiting`, `visited`, and a path array. Emit one deterministic message per cycle.

- [ ] **Step 5: Run all image-tool tests**

```bash
podman run --rm --volume "$PWD:/repo:Z" --workdir /repo localhost/loom-node-24:24.4.1-loom.1 node --test scripts/images/catalog.test.mjs scripts/images/build.test.mjs scripts/images/test-image.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add images/catalog.json scripts/images/catalog.mjs scripts/images/catalog.test.mjs
git commit -m "feat(images): validate runtime dependencies"
```

### Task 2: Build custom runtime dependencies

**Files:**
- Modify: `scripts/images/build.mjs`
- Test: `scripts/images/build.test.mjs`

**Interfaces:**
- Consumes: validated entries with optional `runtime: string`.
- Produces: unchanged `buildImage(name, options): Promise<string>` and an internal recursive build that deduplicates successful entries.

- [ ] **Step 1: Write the failing dependency-order test**

Call `buildImage("loom-wordpress", ...)` with a recording executor. Assert two calls, PHP first, and these dependent build arguments:

```js
assert.deepEqual(
  calls[1].args.filter((argument, index, args) => args[index - 1] === "--build-arg"),
  [
    "LOOM_BASE_IMAGE=localhost/loom-php:8.4.10-loom.1",
    "LOOM_SOURCE_IMAGE=docker.io/library/wordpress:6.8.2-php8.3-apache@sha256:09ac1315368f234db7559e4f9dcca3178a5efc6f2193b88289252abe18551522"
  ]
);
assert.equal(reference, "localhost/loom-wordpress:6.8.2-php8.4-loom.1");
```

- [ ] **Step 2: Write the dependency-failure test**

Make the runtime executor call throw `new Error("runtime failed")`; assert the dependent call never occurs and the original error propagates. The completion map remains an internal invariant: the current one-runtime schema produces a linear ancestry chain, so a public single-root build cannot encounter the same valid ancestor twice.

- [ ] **Step 3: Run build tests and verify failure**

```bash
podman run --rm --volume "$PWD:/repo:Z" --workdir /repo localhost/loom-node-24:24.4.1-loom.1 node --test scripts/images/build.test.mjs
```

Expected: order and dual-argument assertions fail.

- [ ] **Step 4: Implement recursion without changing the public API**

Create `completed: Map<string, string>` and `active: Set<string>` inside `buildImage`. A nested `buildEntry(image, chain)` begins:

```js
if (completed.has(image.name)) return completed.get(image.name);
if (active.has(image.name)) throw new Error(`Image build dependency cycle: ${[...chain, image.name].join(" -> ")}`);
active.add(image.name);
```

Resolve and recursively build `image.runtime`. Construct arguments as:

```js
const buildArguments = image.runtime
  ? ["--build-arg", `LOOM_BASE_IMAGE=${runtimeReference}`, "--build-arg", `LOOM_SOURCE_IMAGE=${image.source}`]
  : ["--build-arg", `LOOM_BASE_IMAGE=${image.source}`];
```

Run Podman, clear `active` in `finally`, and add to `completed` only after success.

- [ ] **Step 5: Run focused and complete tests**

```bash
podman run --rm --volume "$PWD:/repo:Z" --workdir /repo localhost/loom-node-24:24.4.1-loom.1 node --test scripts/images/build.test.mjs scripts/images/catalog.test.mjs scripts/images/test-image.test.mjs
```

Expected: all pass, including the exact standalone PHP command assertion.

- [ ] **Step 6: Commit**

```bash
git add scripts/images/build.mjs scripts/images/build.test.mjs
git commit -m "feat(images): build runtime dependencies"
```

### Task 3: Compose and contract-test WordPress

**Files:**
- Create: `images/wordpress/Containerfile`
- Create: `images/wordpress/docker-entrypoint-wordpress`
- Create: `images/wordpress/contract.sh`
- Reuse: `images/php/extensions.txt`

**Interfaces:**
- Consumes: `LOOM_BASE_IMAGE`, `LOOM_SOURCE_IMAGE`, `/usr/local/bin/docker-entrypoint-loom`, `/usr/src/wordpress`, `LOOM_DOCUMENT_ROOT`.
- Produces: `localhost/loom-wordpress:6.8.2-php8.4-loom.1` with WordPress initialization followed by Loom PHP startup.

- [ ] **Step 1: Write the failing public contract**

Follow `images/php/contract.sh`. Verify PHP 8.4, Composer, Xdebug-off, the complete normalized extension list, and WordPress 6.8.2:

```bash
podman run --rm "${image_reference}" php -r 'exit(PHP_MAJOR_VERSION === 8 && PHP_MINOR_VERSION === 4 ? 0 : 1);'
podman run --rm "${image_reference}" composer --version >/dev/null
podman run --rm "${image_reference}" php -r 'exit(ini_get("xdebug.mode") === "off" ? 0 : 1);'
podman run --rm "${image_reference}" grep -Fq '\$wp_version = '\''6.8.2'\''' /usr/src/wordpress/wp-includes/version.php
```

Start Apache with an empty bind mount and wait for `index.php` plus an HTTP response containing `WordPress` or `Error establishing a database connection`. Repeat with `LOOM_DOCUMENT_ROOT=/workspace/public`. Run the standard host-aligned ownership assertion.

- [ ] **Step 2: Prove the image is absent**

```bash
./images/wordpress/contract.sh localhost/loom-wordpress:6.8.2-php8.4-loom.1
```

Expected: FAIL because the image does not exist.

- [ ] **Step 3: Add the two-stage Containerfile**

```Dockerfile
ARG LOOM_SOURCE_IMAGE
FROM ${LOOM_SOURCE_IMAGE} AS wordpress-source
ARG LOOM_BASE_IMAGE
FROM ${LOOM_BASE_IMAGE}
COPY --from=wordpress-source /usr/src/wordpress /usr/src/wordpress
COPY docker-entrypoint-wordpress /usr/local/bin/docker-entrypoint-wordpress
ENTRYPOINT ["docker-entrypoint-wordpress"]
CMD ["apache2-foreground"]
```

Do not copy `/usr/local`, `/etc/php`, `/etc/apache2`, or OS library directories from the source stage.

- [ ] **Step 4: Implement initialization and Loom delegation**

Create an executable Bash entrypoint with `set -euo pipefail`. For `apache2-foreground`, require an absolute `LOOM_DOCUMENT_ROOT`, create it, and initialize it only when `index.php` is absent:

```bash
tar --create --directory /usr/src/wordpress . | tar --extract --directory "${LOOM_DOCUMENT_ROOT}"
cd "${LOOM_DOCUMENT_ROOT}"
```

Always finish with:

```bash
exec docker-entrypoint-loom "$@"
```

For arbitrary commands, skip initialization. Do not invoke upstream's entrypoint or require `gosu`; rootless Podman maps container-root writes to the host user.

- [ ] **Step 5: Build through the public helper**

```bash
node scripts/images/build.mjs loom-wordpress --platform linux/amd64
```

If host Node is unavailable, run that command through the local Node image with the repository mounted. Expected final reference: `localhost/loom-wordpress:6.8.2-php8.4-loom.1`.

- [ ] **Step 6: Run both public contracts**

```bash
./images/php/contract.sh localhost/loom-php:8.4.10-loom.1
./images/wordpress/contract.sh localhost/loom-wordpress:6.8.2-php8.4-loom.1
```

Expected: both pass.

- [ ] **Step 7: Run repository image gates**

```bash
bash -n images/wordpress/contract.sh images/wordpress/docker-entrypoint-wordpress
git diff --check
podman run --rm --volume "$PWD:/repo:Z" --workdir /repo localhost/loom-node-24:24.4.1-loom.1 node --test scripts/images/build.test.mjs scripts/images/catalog.test.mjs scripts/images/test-image.test.mjs
```

Expected: syntax and whitespace gates exit zero; all tests pass.

- [ ] **Step 8: Commit**

```bash
git add -f images/wordpress/Containerfile images/wordpress/docker-entrypoint-wordpress images/wordpress/contract.sh
git commit -m "feat(images): add WordPress runtime image"
```

### Task 4: Verify the complete dependency flow

**Files:**
- Verify only; modify a task-owned file only when a gate identifies a defect.

**Interfaces:**
- Consumes: catalog, recursive builder, PHP image, WordPress image.
- Produces: evidence from catalog name through passing public contract.

- [ ] **Step 1: Rebuild and test through public drivers**

```bash
node scripts/images/build.mjs loom-wordpress --platform linux/amd64
node scripts/images/test-image.mjs loom-wordpress localhost/loom-wordpress:6.8.2-php8.4-loom.1
```

Use the local Node image when host Node is unavailable. Expected: both exit zero.

- [ ] **Step 2: Run all image tests and hygiene gates**

```bash
node --test scripts/images/*.test.mjs
bash -n images/php/contract.sh images/wordpress/contract.sh images/wordpress/docker-entrypoint-wordpress
git diff --check
git status --short
```

Expected: tests pass, syntax and whitespace checks exit zero, and only intended files appear.

- [ ] **Step 3: Commit a focused correction only when required**

When Step 2 is already clean, create no commit. If a gate required a correction, stage only the corrected task-owned files and run:

```bash
git commit -m "test(images): complete WordPress dependency coverage"
```
