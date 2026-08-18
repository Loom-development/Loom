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

## What’s next

### 1) Deeper new and existing project support

- Expand stack-specific adoption validation and previews.
- Improve detection evidence and require an explicit choice when multiple stacks match.
- Add stack-specific ignore-entry management without overwriting user rules.

### 2) Reproducible stack definitions

- Pin generator and runtime versions to each Loom release.
- Record install, start, health-check, ownership, and generated-path behavior in versioned stack definitions.
- Gate releases on generated-project startup and host-ownership checks for every published stack.

### 3) Broader safe configuration lifecycle

- Expand stack-version migration coverage while retaining the manifest ownership boundary.
- Improve upgrade previews for locally modified Loom configuration.
- Keep framework and application upgrades developer-controlled.

### 4) Faster diagnosis and cleanup

- Add `loom doctor` for ownership, runtime, lockfile, port, and architecture problems.
- Add `loom clean` for declared dependency/build paths with an explicit deletion preview.
- Report failures by phase: generator, image pull, dependency install, process launch, readiness, routes, or host integration.

### 5) Clear examples

- Separate verified generated-project fixtures from stack generator assets, and label any intentionally hand-runnable example explicitly.
- Test bootstrap-heavy frameworks through `loom init`, not by starting incomplete generator fixtures in place.
- Publish a per-release stack verification report.

Detailed design: [Local-First Stack Workflows](superpowers/specs/2026-08-17-local-first-stack-workflows-design.md).

## Product direction

Loom is being shaped for developers who want this outcome:

"I can create or clone a project, let Loom configure its local runtime safely, and start building immediately without losing ownership of my files."
