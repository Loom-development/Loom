# Loom image catalog

Loom publishes application runtimes and verified infrastructure mirrors below
`ghcr.io/loom-development`. After the initial release gate, stack templates
will consume immutable manifest digests from `images/digests.json`; they will
not consume the human-readable tags.

## Catalog contents

Custom runtimes are built from the Containerfiles in this directory: PHP and
WordPress, Node 22 and 24, Python 3.12, Ruby 3.3, Bun 1, Java 21, .NET 8, and
SQLite 3. PostgreSQL, MySQL, MariaDB, Redis, MongoDB, Elasticsearch, and SQL
Server are unmodified mirrors of digest-pinned upstream manifests.

Every entry targets `linux/amd64` and `linux/arm64` unless `platformLimit` in
`catalog.json` records an upstream vendor restriction. SQL Server 2022 is
currently limited to `linux/amd64` by Microsoft.

## Local development

Run the catalog tests with:

```sh
pnpm test:images
```

Build and contract-test a custom runtime with:

```sh
node scripts/images/build.mjs loom-node-24 --platform linux/amd64
node scripts/images/test-image.mjs loom-node-24 localhost/loom-node-24:24.4.1-loom.1
```

Mirror and readiness-test an infrastructure image after authenticating to
GHCR with Podman/Skopeo:

```sh
node scripts/images/mirror.mjs redis-7.4
node scripts/images/test-mirror.mjs redis-7.4 ghcr.io/loom-development/redis-7.4:7.4.5-alpine
```

## Release and update flow

Pull requests build, contract-test, and scan both supported architectures but
cannot publish packages. A merge to protected `main` uses `GITHUB_TOKEN` with
`packages: write` and OIDC permissions to publish manifests, reject fixable
critical vulnerabilities, keyless-sign each digest, and attach build
provenance. The release opens a stable follow-up PR containing the real digest
catalog. Until that PR exists, `digests.json` remains marked
`pending-initial-release`; production digests must never be invented locally.

Every Monday at 09:17 UTC, `images-update.yml` checks whether the registry
digest behind each explicitly pinned upstream tag changed. It reuses
`automation/image-updates` and makes no commit when generated catalog bytes are
unchanged. Version-tag upgrades are intentionally explicit: update the source
tag and Loom version together, then let normal image CI verify the change.

A registry lookup failure stops the update before `catalog.json` is written.
Rerun the workflow after the registry recovers; the last known-good release and
template digests remain untouched.

To add or update an image, edit `catalog.json`, preserve digest-pinned sources,
declare exact platforms, add or update its Containerfile/contract or mirror
readiness probe, and run `pnpm verify`. Temporary vulnerability exceptions in
`security-exceptions.json` require an identifier, rationale, owner, and an
expiration no more than 30 days away.
