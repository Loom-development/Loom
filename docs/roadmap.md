# Loom Roadmap (For Users)

This roadmap focuses on what users will feel and gain as Loom evolves.

## Current focus

- Better onboarding for new users.
- More stable startup and readiness behavior.
- Improved cross-platform reliability (Linux, macOS, Windows).
- A local-first project model where source and dependencies stay visible to the host and IDE.

## What’s next

### 1) New and existing projects as equal workflows

- Keep `loom init <stack>` focused on creating complete local projects.
- Add `loom adopt [stack]` to configure existing projects without rewriting application files or lockfiles.
- Improve detection while requiring an explicit choice when multiple stacks match.

### 2) Reproducible stack definitions

- Pin generator and runtime versions to each Loom release.
- Record install, start, health-check, ownership, and generated-path behavior in versioned stack definitions.
- Gate releases on generated-project startup and host-ownership checks for every published stack.

### 3) Safe Loom-owned configuration

- Add `.loom/manifest.json` to identify Loom-owned files precisely.
- Add `loom upgrade` for Loom-owned files only; framework and application upgrades remain developer-controlled.
- Preserve and show diffs for locally modified Loom configuration.

### 4) Faster diagnosis and cleanup

- Add `loom doctor` for ownership, runtime, lockfile, port, and architecture problems.
- Add `loom clean` for declared dependency/build paths with an explicit deletion preview.
- Report failures by phase: generator, image pull, dependency install, process launch, readiness, routes, or host integration.

### 5) Clear examples

- Separate complete directly runnable examples from stack generator assets.
- Test bootstrap-heavy frameworks through `loom init`, not by starting incomplete generator fixtures in place.
- Publish a per-release stack verification report.

Detailed design: [Local-First Stack Workflows](superpowers/specs/2026-08-17-local-first-stack-workflows-design.md).

## Product direction

Loom is being shaped for developers who want this outcome:

"I can create or clone a project, let Loom configure its local runtime safely, and start building immediately without losing ownership of my files."
