# GHCR Image Catalog Design

Date: 2026-09-01

## Objective

Give every Loom stack template a fast, reproducible default image hosted by the
`Loom-development` GitHub organization. Loom will build application runtime
images that benefit from customization and mirror infrastructure images that
should retain their upstream behavior. Templates will use immutable
multi-platform digests from `ghcr.io/loom-development` and will not install OS
packages or compile language extensions during service startup.

This design supersedes the existing stack-simplification design wherever that
document excludes custom images or requires choosing an existing PHP image.
The rest of the simplification contract remains in force.

## Scope and Delivery Order

The work is split into three ordered sub-projects:

1. **Image catalog foundation:** add image definitions, shared build helpers,
   version metadata, local contract tests, and contributor documentation.
2. **GHCR automation and initial publication:** add multi-platform builds,
   signing, vulnerability scanning, weekly update pull requests, infrastructure
   mirrors, and a generated digest catalog. Publish the initial catalog.
3. **Template migration:** move every template to a published Loom digest,
   update pins, fixtures, and documentation, and run repository and generated
   stack smoke tests.

Templates must not reference an image until its manifest has been published and
verified. Existing uncommitted template-simplification work will be preserved
and reconciled during the third sub-project. The partial Server Side Up PHP
image experiment will be replaced by the Loom-owned PHP image.

## Registry and Platform Contract

- All catalog images live below `ghcr.io/loom-development`.
- Every catalog entry supports `linux/amd64` and `linux/arm64` unless an
  upstream vendor does not publish one of those platforms. An unsupported
  platform blocks migration of the affected template until explicitly
  resolved.
- Human-facing version tags are published for discoverability, for example
  `php:8.4` and `php:8.4-loom.1`.
- Loom templates use an immutable multi-platform manifest digest, never a
  mutable tag.
- Released tags and digests referenced by Loom are retained. Registry cleanup
  may remove untagged intermediate build artifacts only.
- Template image environment variables remain available so advanced users can
  override the default.

## Catalog Architecture

The repository gains an `images/` subsystem. Each maintained image directory
owns its Dockerfile or mirror definition, version metadata, promised capability
manifest, and contract tests. Shared build and test logic belongs in focused
helpers rather than being copied into every image directory.

### Custom Runtime Images

- `loom-php`: PHP 8.4, Apache, Composer, framework extensions, and a
  configurable document root.
- `loom-wordpress`: built from `loom-php`, adding WordPress-specific filesystem
  and entrypoint behavior.
- `loom-node:22` and `loom-node:24`: Node with Corepack and support for npm,
  pnpm, and Yarn.
- `loom-python:3.12`: Python with pip, venv, and the native runtime support
  required by the catalog's Python frameworks.
- `loom-ruby:3.3`: Ruby with Bundler and Rails-compatible native runtime
  libraries.
- `loom-bun:1`.
- `loom-java:21`: Eclipse Temurin and Maven.
- `loom-dotnet:8`: the .NET SDK runtime used by Loom development templates.
- `loom-sqlite:3`: SQLite CLI tooling with rootless bind-mount behavior.

Related templates share a runtime image when their promised runtime contents
are identical. Loom will not publish duplicate MEAN, MERN, Astro, Django, or
FastAPI images merely to give each template a unique name. Every template is
still explicitly mapped to an intentional Loom-owned catalog entry.

### Verified Infrastructure Mirrors

PostgreSQL, MySQL, MariaDB, Redis, MongoDB, Elasticsearch, and SQL Server are
mirrored into Loom's GHCR namespace without modification. Mirroring preserves
upstream entrypoints and behavior while giving templates one registry source.
Each mirror records and verifies its upstream source digest. Other immutable
generator images used during `loom init`, such as Composer, may be added to the
mirror catalog when template migration shows that doing so removes a remaining
external runtime dependency.

## PHP Compatibility Contract

The default PHP image targets common Laravel, Symfony, Drupal, WordPress,
Magento, and general Composer applications. It includes:

- Database extensions: `mysqli`, `pdo_mysql`, `pdo_pgsql`, and `pdo_sqlite`.
- Text and internationalization: `mbstring`, `intl`, and `gettext`.
- XML and web-service support: `dom`, `simplexml`, `xml`, `xmlreader`,
  `xmlwriter`, `soap`, and `xsl`.
- Files and media: `fileinfo`, `gd` with JPEG, WebP, and FreeType support,
  `exif`, and `zip`.
- Application support: `bcmath`, `curl`, `ctype`, `filter`, `ftp`, `hash`,
  `iconv`, `openssl`, `pcntl`, `posix`, `sockets`, Sodium, SPL, and tokenizer.
- Performance and integrations: OPcache, Redis, Memcached, APCu, and Imagick.
- Development tooling: Composer and Xdebug.

Xdebug is installed but disabled by default so normal startup does not pay its
performance cost. It is enabled only through documented development
configuration. Apache rewrite support is enabled, and the document root is
configurable for frameworks that serve from `public/`, `web/`, or the project
root.

Oracle and Microsoft SQL Server PHP drivers are not included in the default
image. Their proprietary or unusually large system dependencies make them
separate optional variants if Loom adds templates that require them.

## Build and Release Flow

GitHub Actions performs releases with least-privilege package permissions:

1. A weekly scheduled workflow checks upstream base-image digests and pinned
   tool versions.
2. When inputs change, automation opens a pull request updating version
   metadata. It does not publish code from the pull request.
3. Pull-request CI builds affected images for `amd64` and `arm64`, executes
   image contract tests, scans for policy-breaking vulnerabilities, and checks
   the promised capability manifest.
4. After merge to the protected default branch, a release workflow builds,
   signs, and publishes the multi-platform images to GHCR.
5. The workflow records published manifest digests in a generated catalog
   artifact checked by repository tests.
6. A follow-up pull request updates `stacks/pins.ts`, generated fixtures, and
   any affected documentation to the new immutable digests.
7. Template migration occurs only after tests pass against those exact
   published digests.

The repository's GitHub Actions configuration must grant `packages: write` to
the release job. No personal registry token is stored. Publication jobs use
GitHub's short-lived workflow credentials and only run from the protected
repository context.

## Failure Handling and Supply-Chain Policy

Publication stops when an image has a source/digest mismatch, a missing target
architecture, a failed contract test, an unsigned manifest, or a vulnerability
that violates the release threshold. Trivy scans the final image and blocks a
release on fixable `CRITICAL` vulnerabilities. A temporary exception requires
a repository-tracked allowlist entry containing the vulnerability identifier,
rationale, owner, and an expiration no more than 30 days in the future. Cosign
keyless signing binds published manifests to the protected GitHub Actions
workflow identity.

If image publication succeeds but catalog generation or template verification
fails, templates remain pinned to their previous working digest. A failed
weekly check does not replace or delete a known-good release. Infrastructure
mirrors are never modified to make a test pass; incompatibilities are resolved
through template configuration or an explicitly designed custom image.

## Testing Strategy

### Image Contract Tests

Every custom image is started and tested through its public container behavior.
Tests verify runtime and package-manager versions, dependency installation as a
host-aligned user, bind-mounted file ownership, readiness behavior, and a
minimal representative application startup.

The PHP contract additionally verifies every promised extension, Composer,
Apache rewrite support, configurable document roots, Xdebug disabled by
default, and representative Laravel, Symfony, Drupal, and WordPress startup.
Magento compatibility is checked against its published extension and runtime
requirements without requiring a full Magento installation in routine CI.

Infrastructure mirrors are checked against their expected upstream digest and
receive minimal entrypoint and readiness tests. The published manifest list is
inspected to confirm both target platforms.

### Repository and Template Tests

Repository tests enforce that:

- Every template default image belongs to `ghcr.io/loom-development`.
- Every default uses an immutable digest present in the generated catalog.
- No template installs OS packages or language extensions at startup.
- Template fixtures and stack metadata remain synchronized.
- Each generated stack retains its expected services, routes, ports, health
  checks, dependency restoration, and rootless bind-mount behavior.

`pnpm verify` and applicable generated-stack smoke tests must pass before the
template migration is complete. Network- or platform-blocked tests are reported
explicitly and are not represented as successful verification.

## Documentation

The repository documents catalog contents, supported platforms, tags, digests,
update cadence, local build and test commands, release permissions, and the
process for adding or updating an image. Documentation clearly distinguishes
custom Loom runtimes from verified upstream mirrors and lists the PHP extension
contract in a machine-checkable form shared with its tests.

## Completion Criteria

The program is complete when:

- All custom runtime images and infrastructure mirrors are published for both
  target platforms under `ghcr.io/loom-development`.
- Published artifacts are signed, scanned, contract-tested, and recorded in the
  generated digest catalog.
- Weekly update automation opens pull requests only when inputs change.
- Every stack template defaults to a published immutable Loom catalog digest.
- No template performs startup-time OS package or extension installation.
- Repository verification and applicable generated-stack smoke tests pass.
- Contributor and user documentation describes image contents, overrides,
  releases, and update behavior.
