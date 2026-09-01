# GHCR Image Release Automation Implementation Plan

> **For agentic workers:** REQUIRED WORKFLOW: execute this plan inline, task-by-task, with a review checkpoint after each task. Repository policy forbids subagents.

**Goal:** Publish signed, scanned, multi-platform Loom runtime images and verified infrastructure mirrors to GHCR with weekly update pull requests.

**Architecture:** GitHub Actions consumes the validated catalog and a deterministic matrix generator. Pull requests build and test without publishing; protected-branch releases publish with GitHub credentials, sign with Cosign, scan with Trivy, and generate an immutable digest catalog.

**Tech Stack:** GitHub Actions, Podman/Buildah or Docker Buildx, GHCR, Cosign keyless signing, Trivy, Node.js 24.

**Spec:** `docs/superpowers/specs/2026-09-01-ghcr-image-catalog-design.md`

## Global Constraints

- This plan starts only after the catalog-foundation completion gate passes.
- Publish `linux/amd64` and `linux/arm64` manifests below `ghcr.io/loom-development`.
- Pull-request workflows have no package write permission and never publish.
- Release jobs use `GITHUB_TOKEN` with `packages: write` and `id-token: write`; no personal token.
- Trivy blocks fixable `CRITICAL` vulnerabilities; exceptions require identifier, rationale, owner, and expiration within 30 days.
- Cosign keyless-signs every released manifest.

---

### Task 1: Deterministic workflow matrices

**Files:**
- Create: `scripts/images/matrix.mjs`
- Create: `scripts/images/matrix.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `images/catalog.json` through `loadCatalog()`.
- Produces: `createBuildMatrix(catalog, names?)` and `createMirrorMatrix(catalog, names?)` with stable ordering.

- [ ] Write failing tests for custom/mirror separation, both platforms, stable ordering, and unknown-name rejection.
- [ ] Run `node --test scripts/images/matrix.test.mjs`; expect module-not-found failure.
- [ ] Implement the two pure matrix functions and a CLI that writes compact JSON to stdout.
- [ ] Run `pnpm test:images`; expect PASS.
- [ ] Commit with `git commit -m "feat(images): generate release matrices"`.

### Task 2: Pull-request multi-platform verification

**Files:**
- Create: `.github/workflows/images-ci.yml`
- Create: `scripts/images/workflow-policy.test.mjs`

**Interfaces:**
- Consumes: Task 1 matrix JSON and image contract driver.
- Produces: build/test checks for every changed catalog image without registry publication.

- [ ] Write a failing policy test that parses the workflow and rejects `packages: write`, registry pushes, missing platforms, or missing contract-test steps in pull-request jobs.
- [ ] Run `node --test scripts/images/workflow-policy.test.mjs`; expect failure because the workflow is absent.
- [ ] Add a workflow with read-only repository permissions, matrix builds for both platforms, native contract execution where supported, and manifest/build inspection for the other platform.
- [ ] Run `pnpm test:images`; expect PASS.
- [ ] Commit with `git commit -m "ci(images): verify multi-platform image builds"`.

### Task 3: Vulnerability policy and expiring exceptions

**Files:**
- Create: `images/security-exceptions.json`
- Create: `scripts/images/security-policy.mjs`
- Create: `scripts/images/security-policy.test.mjs`
- Modify: `.github/workflows/images-ci.yml`

**Interfaces:**
- Produces: `validateSecurityExceptions(entries, now): string[]` and Trivy invocation that ignores unfixed findings but blocks fixable critical findings.

- [ ] Write failing tests for valid entries, missing owner/rationale, expiration beyond 30 days, expired entries, and identifiers absent from the Trivy report.
- [ ] Run the focused test and confirm failure.
- [ ] Implement validation and an initially empty exception list; wire Trivy JSON output through the policy script.
- [ ] Run `pnpm test:images`; expect PASS.
- [ ] Commit with `git commit -m "ci(images): enforce vulnerability release policy"`.

### Task 4: Protected-branch publishing and signing

**Files:**
- Create: `.github/workflows/images-release.yml`
- Modify: `scripts/images/workflow-policy.test.mjs`

**Interfaces:**
- Produces: versioned GHCR tags, multi-platform manifests, provenance, and keyless Cosign signatures.

- [ ] Extend policy tests to require `contents: read`, `packages: write`, and `id-token: write`, to forbid `pull_request` publication, and to require digest-based Cosign signing.
- [ ] Run the focused policy test; expect failure.
- [ ] Add protected-default-branch workflow jobs that authenticate with `GITHUB_TOKEN`, publish both architectures, assemble the manifest, scan the final digest, and sign that digest.
- [ ] Run `pnpm test:images`; expect PASS.
- [ ] Commit with `git commit -m "ci(images): publish and sign GHCR catalog"`.

### Task 5: Verified infrastructure mirroring

**Files:**
- Create: `scripts/images/mirror.mjs`
- Create: `scripts/images/mirror.test.mjs`
- Create: `scripts/images/test-mirror.mjs`
- Modify: `.github/workflows/images-release.yml`

**Interfaces:**
- Consumes: mirror catalog entries containing digest-pinned upstream sources.
- Produces: byte-equivalent GHCR manifests and minimal readiness-test results.

- [ ] Write failing tests that require a digest source, prohibit Dockerfile contexts on mirrors, and construct source/destination copy arguments without a shell.
- [ ] Run the test and confirm failure.
- [ ] Implement manifest-list copying, source/destination digest verification, and readiness probes for PostgreSQL, MySQL, MariaDB, Redis, MongoDB, Elasticsearch, and SQL Server.
- [ ] Wire mirrors into the release workflow and sign their destination digests.
- [ ] Run `pnpm test:images`; expect PASS.
- [ ] Commit with `git commit -m "feat(images): mirror verified infrastructure images"`.

### Task 6: Published digest catalog

**Files:**
- Create: `images/digests.json`
- Create: `scripts/images/digests.mjs`
- Create: `scripts/images/digests.test.mjs`
- Modify: `.github/workflows/images-release.yml`

**Interfaces:**
- Produces: `images/digests.json` mapping each catalog name and version to GHCR manifest digest, platforms, signature identity, and upstream digest for mirrors.

- [ ] Write failing tests for complete catalog coverage, `sha256:` digest syntax, both platforms, exact GHCR namespace, and mirror provenance.
- [ ] Run the focused test and confirm failure.
- [ ] Implement deterministic digest-document generation from release outputs and validation against the source catalog.
- [ ] Make release automation open a follow-up pull request containing only catalog digest and downstream pin/fixture updates.
- [ ] Run `pnpm test:images`; expect PASS using a checked-in test fixture, not fabricated production digests.
- [ ] Commit with `git commit -m "feat(images): record published manifest digests"`.

### Task 7: Weekly upstream update pull requests

**Files:**
- Create: `.github/workflows/images-update.yml`
- Create: `scripts/images/check-updates.mjs`
- Create: `scripts/images/check-updates.test.mjs`
- Modify: `images/README.md`

**Interfaces:**
- Produces: a weekly, idempotent update branch and pull request only when catalog inputs change.

- [ ] Write failing tests with mocked registry metadata for no-change, changed digest, changed tool version, and registry failure behavior.
- [ ] Run the focused test and confirm failure.
- [ ] Implement deterministic metadata updates and a workflow scheduled once weekly with manual dispatch support.
- [ ] Configure the workflow to reuse one stable branch/PR and make no commit when generated bytes are unchanged.
- [ ] Document the cadence, review path, and recovery from registry failure.
- [ ] Run `pnpm verify`; expect PASS.
- [ ] Commit with `git commit -m "ci(images): automate weekly catalog updates"`.

### Task 8: Initial publication gate

**Files:**
- Modify: `images/digests.json`
- Modify: `images/README.md`

**Interfaces:**
- Produces: the first verified production digest catalog consumed by template migration.

- [ ] Confirm repository Actions settings allow package publication from the protected default branch.
- [ ] Run the release workflow from the protected branch; do not publish from a local personal token.
- [ ] Verify every GHCR manifest contains `amd64` and `arm64`, every digest has a valid workflow-identity signature, and every image passes its published-reference contract.
- [ ] Apply the workflow-generated digest pull request and run `pnpm verify`.
- [ ] Commit only workflow-generated documentation corrections, if any, with `git commit -m "docs(images): record initial GHCR release"`.

## Release Automation Completion Gate

Do not migrate templates until every required image exists in GHCR, signatures
and scans pass, both architectures are present, and `images/digests.json`
contains verified production digests for the complete catalog.
