# Local-First Stack Workflows Implementation Plan

## Goal

Move Loom from an ad hoc template map to versioned stack metadata, then add
safe ownership-aware workflows without breaking existing `loom init` projects.

## Phase 1: Stack Registry and Ownership Manifest

1. Add `apps/cli/src/stacks.ts` with a typed registry for every current
   template. Initially it owns the template id, asset path, scaffold version,
   and Loom-owned file list while existing prompt/bootstrap code remains in
   place.
2. Replace the private `templateMap` in `apps/cli/src/index.ts` with registry
   lookups. Preserve the current CLI names, copied assets, prompts, and error
   messages.
3. Add `apps/cli/src/project-manifest.ts` to write
   `.loom/manifest.json` atomically after successful initialization. Version 1
   records the Loom version, stack id, scaffold version, and SHA-256 hashes of
   Loom-owned files that exist.
4. Treat `loom.yaml` and `.env.example` as the initial Loom-owned set. Do not
   claim ownership of `.env`, application files, lockfiles, or framework
   configuration.
5. Add unit tests for registry completeness, stable manifest serialization,
   hashing, missing optional files, and atomic replacement. Extend CLI init
   integration tests to verify the manifest while proving existing generated
   output is unchanged.

## Phase 2: First-Class Adoption

1. Extract stack detection into a typed detector returning evidence and
   confidence, rather than a single suggestion string.
2. Add `loom adopt [stack]` with a preview-first flow. It writes only files
   declared as Loom-owned by the selected stack.
3. Refuse ambiguous automatic detection and non-interactive adoption without
   an explicit stack.
4. Snapshot developer-owned files before and after adoption in integration
   tests and require byte-for-byte equality.

## Phase 3: Safe Loom Upgrades

1. Add manifest loading, schema migration, and ownership validation.
2. Render candidate Loom-owned files into a temporary directory.
3. Add `loom upgrade` with diff output. Replace files whose current hash still
   matches the manifest; require confirmation for locally modified files.
4. Never invoke framework generators or modify manifests and lockfiles during
   upgrade.

## Phase 4: Doctor and Clean

1. Add stack-declared dependency, cache, and build-output paths.
2. Implement `loom doctor` checks for runtime support, ownership, lockfiles,
   port conflicts, and stack compatibility.
3. Implement `loom clean` with an exact deletion preview, safe project-root
   containment checks, and explicit non-interactive confirmation.

## Phase 5: Repository and Release Migration

1. Move generator definitions/assets under `stacks/` and complete runnable
   projects under `examples/runnable/`.
2. Update package asset copying to ship stack definitions rather than treating
   every checked-in example as directly runnable.
3. Replace the direct Rails smoke with generated-project coverage.
4. Expand the release matrix until every published stack passes init, start,
   readiness, host-write ownership, and stop cleanup.

## Compatibility Rules

- Existing `loom.yaml` files continue to load without a manifest.
- Existing command names and template ids remain stable.
- Phase 1 adds metadata only after initialization succeeds.
- A failed manifest write fails initialization visibly but does not remove the
  generated developer project.
- New manifest fields are additive and versioned.

## Verification

Each phase must pass focused unit/integration tests, `pnpm verify`, and the
relevant generated-stack smoke tests. Manifest fixtures must use deterministic
JSON formatting so changes remain reviewable.
