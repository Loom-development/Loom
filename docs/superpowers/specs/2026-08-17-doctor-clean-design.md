# Loom Doctor and Clean Design

## Status

Approved design for the next local-first workflow phase. This specification
covers diagnostics and safe removal of generated dependency, cache, and build
output paths. It does not cover database reset, runtime-state removal, framework
upgrades, or repository restructuring.

## Goals

- Diagnose project, host, runtime, and stack compatibility problems before they
  become startup failures.
- Make generated-path cleanup predictable, inspectable, and safe for local
  source trees.
- Give humans readable output and CI a stable structured result.
- Keep application source, project configuration, lockfiles, secrets, database
  data, and Loom runtime state outside the cleanup boundary.

## Stack Metadata

Each `StackDefinition` declares its generated paths in three explicit groups:

- Dependency paths, such as `node_modules` or `vendor`.
- Cache paths, such as framework caches.
- Build-output paths, such as `dist` or `build`.

It also declares protected source roots and project files for that stack. Clean
metadata is invalid when a generated path equals or contains a protected path;
a protected root may contain a more specific generated directory such as
`node_modules`.

Definitions also declare compatibility information required by diagnostics,
including supported host architectures and runtime requirements. Paths are
project-relative literals. Empty paths, absolute paths, traversal components,
the project root, and paths within `.loom` are invalid definitions.

The stack registry remains the source of current stack capabilities. The
project manifest identifies the stack and scaffold version used by the project.
Doctor reports version drift; clean uses only paths that are valid for the
manifest-selected stack.

## Doctor Architecture

A read-only diagnostic engine consumes the project root, loaded configuration,
project manifest, stack definition, and host/runtime probes. It returns ordered
structured checks rather than printing or exiting directly. Each result has a
stable identifier, status (`pass`, `warning`, or `failure`), summary, and
optional detail.

The initial checks cover:

- Project manifest presence, version, selected stack, and scaffold compatibility.
- Podman availability and rootless operation.
- Host architecture support.
- Missing or conflicting package-manager lockfiles.
- Ownership and writability of existing declared dependency paths.
- Availability of configured host ports.
- Route validity and host integration limitations.

Environmental limitations that do not prevent the stack from running, such as
an unavailable `/etc/hosts` integration when localhost access remains possible,
are warnings. Conditions that make the project configuration invalid or prevent
its declared services from running are failures.

`loom doctor [--config <path>] [--json]` renders checks in deterministic order.
Human output is concise and grouped by status. JSON output uses the same result
objects and contains no decorative logging. Passes and warnings exit with code
0; one or more failures exit with code 1.

Probe failures are converted into diagnostic results when their meaning is
known. Unexpected internal errors retain the CLI's normal error handling and
exit nonzero rather than being mislabeled as an environmental diagnosis.

## Clean Architecture

Cleanup is split into a pure planner and a narrow executor. The planner consumes
the project root and selected stack definition, validates every declared path,
inspects existing entries without following symlinks, and returns a
deterministically sorted plan. Each item includes its category, relative path,
existence, and estimated byte size.

Before returning a plan, the planner rejects the whole operation if any path:

- Is empty, absolute, contains traversal, or resolves to the project root.
- Is `.loom` or is nested within `.loom`.
- Is or traverses a symbolic link.
- Equals or contains a stack-declared protected source path, `loom.yaml`,
  `.env`, a project or workspace dependency manifest or lockfile discovered
  outside declared generated roots, or a manifest-declared Loom-owned file.
  Dependency metadata nested inside a declared generated root remains cleanable.
- Is not explicitly declared by the selected stack.

Protection is deny-first: an unsafe declaration prevents all deletion. The
executor receives only a validated plan and removes existing planned paths. A
missing path is a successful no-op. Database volumes, all `.loom/` runtime
state, certificates, backups, and internal caches are preserved by default and
are not part of this command.

`loom clean [--config <path>] [--force] [--dry-run]` always prints the exact
plan and estimated total size. `--dry-run` never prompts or deletes. Interactive
execution requires explicit confirmation. Non-interactive execution refuses to
delete unless `--force` is supplied. `--force` bypasses confirmation only; it
does not bypass path validation or protected-path checks.

The command does not provide a database-reset or deep-clean flag. Those are
materially different destructive workflows and require a separate future
design.

## Failure and Concurrency Behavior

Planning performs all safety validation before the first removal. The executor
revalidates path containment and symlink state immediately before each removal
to reduce time-of-check/time-of-use risk. If the filesystem changes after the
preview and makes a path unsafe, cleanup stops and reports the path; remaining
items are untouched. Already removed generated paths are not restored.

This best-effort deletion behavior is stated in command output and tests. Loom
does not claim multi-path filesystem deletion is transactional.

## Testing

Registry tests require valid cleanup and compatibility metadata for every
published stack. Doctor unit tests use injected probes to cover each status and
stable ordering without depending on the developer's machine. CLI integration
tests cover human and JSON output plus warning/failure exit codes.

Cleanup tests use temporary projects and cover empty and missing paths, byte
estimation, dry runs, confirmation, forced non-interactive execution, traversal,
absolute paths, project-root targets, `.loom`, protected files, symlinked targets
and parents, and revalidation immediately before deletion. They verify source,
configuration, lockfiles, `.env`, database state, and unrelated files remain
byte-identical.

The phase closes with `pnpm verify` and generated Node and PHP smoke projects.
Doctor must report no failures for healthy generated projects. Clean must remove
only declared generated paths, after which the projects must start successfully
and recreate their dependencies without changing developer-owned files.

## Documentation

The README documents command examples, exit semantics, protected data, and the
difference between clean and database reset. Architecture and roadmap documents
move doctor and clean from planned behavior to current behavior only after the
commands and release gates pass.
