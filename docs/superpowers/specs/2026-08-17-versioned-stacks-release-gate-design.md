# Versioned Stacks and Release Gate Design

## Status

Approved design for migrating Loom's generator assets into self-contained,
versioned stack packages and enforcing generated-project verification before a
stack ships.

## Goals

- Make `stacks/` the single canonical home for stack definitions, templates,
  generator metadata, and verification fixtures.
- Preserve every existing public stack ID and the generated output expected by
  current `loom init`, `adopt`, `upgrade`, `doctor`, and `clean` workflows.
- Require exact generator versions and exact runtime image tags for every
  published stack.
- Separate generator assets from examples that are intentionally runnable in
  place.
- Block releases when any published stack fails its declared lifecycle or
  host-ownership checks.

## Repository Structure

Each published stack lives beneath its public ID:

```text
stacks/
  node/
    stack.ts
    templates/
    fixtures/
  php-wordpress/
    stack.ts
    templates/
    fixtures/
examples/
  runnable/
```

`stack.ts` contains the typed definition. `templates/` contains only files used
to initialize or adopt a project. `fixtures/` contains compact inputs and
expected metadata used by detection, generation, or verification tests; it is
not copied into user projects.

`examples/runnable/` begins empty. A project enters that directory only after a
direct `loom start`, readiness, ownership, and stop test exists for it. An empty
directory is retained with explanatory documentation rather than placeholder
application code.

The legacy `examples/` generator tree is removed after migration. The repository
does not maintain duplicate canonical assets. A temporary compatibility
resolver may read legacy paths only while individual families are being moved;
it is deleted in the final migration task and is never included in a release.

## Typed Stack Packages

The CLI retains a compiled TypeScript registry. The registry imports one
definition from each `stacks/<id>/stack.ts`, validates it, and provides the
existing lookup interface. Public IDs do not change.

Each definition declares:

- Public ID, definition version, and asset directory.
- Exact upstream generator name and version, or `kind: "none"` for stacks that
  only copy Loom-owned templates.
- Generator command and arguments when a generator is present.
- Exact runtime image tags used by every generated service.
- Dependency install and application start behavior.
- Ports, routes, readiness probe, and timeout.
- Loom-owned, generated, cache, build, protected, and expected host-write paths.
- Supported host architectures and rootless runtime requirements.
- Verification command and expected result.

Definition versions are integers incremented when generated behavior changes.
They replace informal or `unversioned` scaffold identifiers in new manifests.
Existing manifests retain compatibility through explicit legacy-version aliases
in the corresponding definition.

## Pinning Rules

Generators must use exact versions. The validator rejects empty versions,
`latest`, `next`, `canary`, `nightly`, `unversioned`, wildcard/range syntax, and
commands that implicitly resolve an unspecified generator version. A generator
archive or image may additionally use a digest, but the exact version remains
human-readable in metadata.

Runtime images may initially use exact version tags without digests. The
validator rejects missing tags, `latest`, floating channel tags, and bare major
tags. Acceptable examples include `node:24.4.1-alpine` and
`postgres:16.9-alpine`; `node:24`, `postgres:16`, and `node:latest` are rejected.
Digest pinning is a later hardening phase and can be added without changing the
definition interface.

Every environment-overridable image in generated `loom.yaml` has an exact
pinned default. User overrides remain supported and are reported by doctor as a
reproducibility warning rather than silently rewritten.

## Generation and Packaging

The CLI resolves assets through the selected stack definition, not by assuming
an `examples/<path>` layout. Source checkouts resolve from repository `stacks/`;
the published CLI resolves the copied `dist/stacks/` tree. The package builder
copies only declared template and fixture assets, excluding generated
dependencies, runtime state, database data, caches, and build output.

Bootstrap-heavy stacks run their exact pinned generator in a disposable
workspace. Loom copies the resulting application source into the requested
local project and then writes only Loom-owned configuration. Generator output
never becomes part of a runtime image or a checked-in runnable example.

Migration proceeds by stack family. Before removing a legacy family, tests run
old and new initialization against fixtures and compare all generated files
that are intended to remain stable. Intentional changes require a definition
version increment and an explicit expected-output update.

## Verification Harness

A single matrix harness consumes the typed registry and executes named phases:

1. Validate definition and packaged assets.
2. Initialize a disposable project with the pinned generator.
3. Start the project and wait for declared readiness.
4. Run the stack's verification command.
5. Create a declared host-write artifact and assert host ownership/writability.
6. Stop the project.
7. Assert no project-scoped containers remain.

Cleanup runs in a `finally` path after every phase. A failure record contains the
stack ID, definition version, phase, duration, concise error, and paths to
captured stdout/stderr. Host integration limitations such as inability to edit
`/etc/hosts` are recorded as warnings and do not fail an otherwise reachable
stack.

The harness emits both JSON and Markdown reports. JSON is the stable input for
automation; Markdown is uploaded for humans. Reports distinguish pass, warning,
failure, and skipped results and include the Loom commit and host/runtime facts.

## Continuous Integration and Release Gate

Every pull request runs:

- Validation for all 31 stack definitions, pin rules, asset completeness, and
  package contents.
- Deterministic initialization and ownership-boundary tests without starting
  every stack.
- Lifecycle smoke tests for representative Node, PHP, Python, database, and
  bootstrap-heavy stacks.

Every push to `main` runs the complete 31-stack lifecycle matrix. The matrix is
also available through manual dispatch for diagnosis. Jobs may be sharded, but
the aggregate report and release decision cover every published stack.

A generator, packaging, initialization, start, readiness, verification,
ownership, cleanup, or stop failure makes the workflow fail. No stack can be
excluded merely because it is slow or bootstrap-heavy. An explicitly unsupported
host architecture may be skipped only when the definition declares that
limitation and another required job verifies the stack on a supported host.

## Compatibility

- Public stack IDs and CLI command syntax remain unchanged.
- Existing v1 and v2 manifests continue to load.
- Legacy scaffold identifiers map to explicit compatibility aliases.
- Existing project source, lockfiles, `.env`, database state, and `.loom/`
  runtime state are not changed by the repository migration.
- The final packaged CLI contains no dependency on the removed legacy
  generator-asset paths.

## Testing and Completion Criteria

Implementation is deliberately split into two independently reviewable
subprojects. The first migrates canonical stack packages, pin validation, and
published CLI assets while preserving generated output. The second builds the
verification harness, reports, and CI gates on top of the completed registry.
Each subproject receives its own implementation plan and must leave the
repository releasable before the next begins.

Unit tests cover definition validation, pin parsing, registry completeness,
asset containment, and report serialization. Integration tests build and pack
the CLI, install it into an isolated directory, remove access to repository
assets, and prove initialization still succeeds from packaged `dist/stacks/`.

Family migration tests compare generated output before legacy assets are
deleted. Failure tests inject an error into each harness phase and prove the
phase is reported and scoped cleanup still runs.

The migration is complete when the old generator tree is gone,
`examples/runnable/` contains no unverified projects, package-install tests use
only `dist/stacks/`, all 31 definitions pass pin validation, the representative
pull-request smoke is green, and the complete main-branch report is green.
