# Dependent Image Builds Design

Date: 2026-09-01

## Objective

Allow a custom Loom image to inherit another custom Loom runtime while also
consuming a separately pinned upstream image. The first consumer is
`loom-wordpress`: it inherits the maintained `loom-php` runtime and copies
WordPress-specific files and entrypoint behavior from the pinned upstream
WordPress image.

This design refines the image catalog foundation in
`2026-09-01-ghcr-image-catalog-design.md`. It does not change standalone custom
images or infrastructure mirrors.

## Catalog Model

Standalone custom images keep their current fields and behavior. A dependent
custom image adds a `runtime` field containing the catalog name of another
custom image:

```json
{
  "name": "loom-wordpress",
  "kind": "custom",
  "source": "docker.io/library/wordpress:6.8.2-php8.3-apache@sha256:09ac1315368f234db7559e4f9dcca3178a5efc6f2193b88289252abe18551522",
  "runtime": "loom-php",
  "version": "6.8.2-php8.4-loom.1",
  "platforms": ["linux/amd64", "linux/arm64"],
  "context": "images/wordpress"
}
```

`source` remains the immutable upstream content source. `runtime` is a catalog
relationship, not an image reference. The referenced entry must exist, must be
custom, must support every platform declared by the dependent image, and must
not create a dependency cycle. Mirrors cannot be runtimes because they are
preserved without modification.

The initial schema supports at most one runtime dependency per image. Multiple
named dependencies are deferred until a real image requires them.

## Build Interface

The build helper resolves the requested image as a dependency graph. It visits
the runtime first, builds each catalog entry at most once per invocation, and
then builds the requested image.

Standalone images continue receiving:

```text
LOOM_BASE_IMAGE=<image.source>
```

Dependent images receive:

```text
LOOM_BASE_IMAGE=<local reference returned by the runtime build>
LOOM_SOURCE_IMAGE=<dependent image.source>
```

The dependent image's final reference remains
`localhost/<name>:<version>`. Calling the programmatic `buildImage` function or
the CLI returns only that requested final reference. Dependency builds are an
internal implementation detail visible through normal Podman build output.

The existing CLI syntax remains unchanged:

```text
node scripts/images/build.mjs loom-wordpress --platform linux/amd64
```

The helper does not pull or substitute a published GHCR runtime during local
builds. This ensures that a local WordPress build tests the PHP source in the
same checkout. Release automation may later supply a dedicated published-build
path, but that is outside this foundation change.

## WordPress Image Composition

`images/wordpress/Containerfile` uses two stages:

1. `LOOM_SOURCE_IMAGE` supplies the pinned WordPress distribution, scripts, and
   WordPress-specific entrypoint assets.
2. `LOOM_BASE_IMAGE` supplies Loom's PHP 8.4, Apache, Composer, extensions,
   rewrite configuration, configurable document-root support, and Xdebug
   defaults.

Only WordPress-owned application and entrypoint assets are copied from the
source stage. PHP binaries, PHP configuration, Apache binaries, OS libraries,
and compiled extensions are never copied from upstream WordPress. This avoids
silently replacing parts of `loom-php` with the upstream PHP 8.3 runtime.

The final image keeps Loom's entrypoint as the outer entrypoint. A focused
WordPress wrapper performs WordPress filesystem initialization and then
delegates to the Loom PHP entrypoint. The default document root is
`/var/www/html`, and `LOOM_DOCUMENT_ROOT` remains available for advanced
overrides.

## Failure Handling

Catalog validation rejects:

- a missing runtime entry;
- a runtime that is a mirror;
- a dependent image platform not supported by its runtime;
- a self-reference or longer dependency cycle;
- a non-string or invalid runtime name.

Build-time errors include the requested image and dependency chain. A failed
runtime build prevents the dependent build. A dependency is recorded as built
only after its Podman command succeeds, so failed builds are never reused.

## Testing

Catalog unit tests cover valid dependencies, missing or mirrored runtimes,
platform mismatches, malformed names, self-references, and multi-image cycles.

Build-helper unit tests verify:

- standalone command construction is unchanged;
- the runtime builds before its dependent image;
- the dependent command receives both named build arguments;
- each dependency builds once per invocation;
- the requested final reference is returned;
- dependency failures stop the build.

The WordPress public container contract verifies:

- the full `loom-php` extension manifest is inherited;
- PHP reports version 8.4;
- Composer is available and Xdebug is disabled by default;
- WordPress files and its CLI entrypoint behavior are present;
- Apache serves a minimally initialized WordPress filesystem;
- the document root remains configurable;
- bind-mounted writes retain host ownership.

The shared image-tool unit suite and repository whitespace/shell gates must pass.
The local `loom-php` and `loom-wordpress` images must both build and their public
contracts must pass on `linux/amd64`. Multi-platform publication remains part of
the later GHCR automation sub-project.

## Completion Criteria

- The catalog represents the WordPress-to-PHP dependency explicitly.
- Invalid dependency graphs fail validation before Podman runs.
- Local builds resolve and deduplicate dependencies deterministically.
- Standalone custom-image behavior and CLI syntax remain compatible.
- `loom-wordpress` contains WordPress behavior without replacing Loom PHP.
- PHP and WordPress container contracts pass against the locally composed
  images.
