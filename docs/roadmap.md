# Loom Roadmap (For Users)

This roadmap focuses on what users will feel and gain as Loom evolves.

## Current focus

- Better onboarding for new users.
- More stable startup and readiness behavior.
- Improved cross-platform reliability (Linux, macOS, Windows).
- A local-first project model where source and dependencies stay visible to the host and IDE.

## Available now

- `loom init <stack>` for creating local projects.
- `loom adopt [stack]` for configuring existing projects without replacing application files or lockfiles.
- Upgrade-safe v2 `.loom/manifest.json` ownership records and baselines for newly initialized and adopted projects.
- `loom upgrade` for updating only manifest-declared Loom files. Missing and unchanged files update automatically; locally modified Loom files require `--force-modified`.
- One-time migration of v1 manifests with `loom upgrade --initialize-baseline`, which records current baselines without replacing project files.
- `loom doctor` with human-readable and JSON diagnostics for project ownership, rootless Podman, lockfiles, ports, routes, architecture, and host integration. Warnings exit 0; failures exit 1.
- `loom clean` with an exact preview and stack-declared dependency, cache, and build paths. It preserves source, configuration, lockfiles, `.loom/`, and database state; `--force` bypasses confirmation only.
- Canonical `stacks/<id>/` packages for all 31 public IDs, with integer definition versions, exact generator versions, exact default runtime image tags, and explicit aliases for older manifest scaffold identifiers.
- Self-contained npm and standalone release assets that ship filtered `stacks/` content without the removed generator-example tree.
- A verified-only `examples/runnable/` boundary and representative generated-project smoke for Node, base PHP, Python, SQLite, and bootstrap-heavy WordPress.

## What’s next

### 1) Deeper new and existing project support

- Expand stack-specific adoption validation and previews.
- Improve detection evidence and require an explicit choice when multiple stacks match.
- Add stack-specific ignore-entry management without overwriting user rules.

### 2) Complete generated-stack release verification

- Build the registry-driven lifecycle harness and structured JSON/Markdown reports.
- Run init, start, readiness, verification, host-write ownership, stop, and scoped cleanup for all 31 published stacks.
- Make the complete main-branch matrix a required release gate while reporting host-integration limitations as warnings.

### 3) Broader safe configuration lifecycle

- Expand stack-version migration coverage while retaining the manifest ownership boundary.
- Improve upgrade previews for locally modified Loom configuration.
- Keep framework and application upgrades developer-controlled.

### 4) Deeper diagnosis and cleanup

- Expand stack-specific diagnostic guidance while retaining stable JSON result identifiers.
- Expand release smoke coverage for stack-declared generated paths and preservation boundaries.
- Report failures by phase: generator, image pull, dependency install, process launch, readiness, routes, or host integration.

### 5) Verified runnable examples

- Admit a direct-start project to `examples/runnable/` only after its dedicated release test passes.
- Publish a per-release stack verification report.

Detailed design: [Local-First Stack Workflows](superpowers/specs/2026-08-17-local-first-stack-workflows-design.md).

## Product direction

Loom is being shaped for developers who want this outcome:

"I can create or clone a project, let Loom configure its local runtime safely, and start building immediately without losing ownership of my files."
