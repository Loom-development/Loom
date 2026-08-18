# How Loom Works (User-Friendly)

This page explains what Loom does for you when you run commands, in plain terms.

## Local-first ownership

Loom is a runtime coordinator, not a containerized source-code store.

- Application source, tests, manifests, and lockfiles live in the local project directory. Templates that support local dependency visibility also place dependency directories inside that bind-mounted workspace.
- Service containers provide language runtimes, operating-system libraries, and backing services.
- Loom bind-mounts the local project into each application container, normally under `/workspace` or another stack-specific work directory.
- Processes that write into the project use host-aligned UID/GID mapping where the platform supports it.
- Loom runtime state and development certificates live under the ignored local `.loom/` directory.

This boundary keeps files visible to editors, Git, debuggers, and host command-line tools while retaining a consistent container runtime.

## Project creation and adoption

- `loom init <stack>` creates a new local project from a stack's bundled assets or upstream bootstrap flow.
- `loom adopt [stack]` configures an existing project. With no stack argument, Loom detects common project signals; an explicit stack resolves unsupported or ambiguous layouts.
- Adoption refuses to overwrite an existing `loom.yaml` and does not modify application source, dependency manifests, lockfiles, or an existing `.env.example`.
- Successful initialization and adoption write an upgrade-safe v2 `.loom/manifest.json` with the stack identity, scaffold metadata, render inputs, Loom version, and baselines for files created and owned by Loom.

## Canonical stack packages

All 31 public stack IDs resolve through the typed registry under `stacks/`.
Each `stacks/<id>/stack.ts` declares an integer definition version, a current
scaffold identifier, exact generator and default runtime image versions,
readiness and verification commands, ownership metadata, and
generated/protected paths. Existing scaffold identifiers remain explicit legacy
aliases so older manifests continue to resolve; new manifests record the
current scaffold identifier.

`stacks/<id>/templates/` contains only initialization assets, while private
fixtures stay outside generated projects. The npm CLI ships a filtered copy at
`dist/stacks/`, and standalone release archives ship the same self-contained
asset tree. Source checkouts, installed packages, and release archives no longer
resolve generator files through the removed example-family layout.

Optional database services injected during init and replayed during upgrade
resolve their exact default image from the corresponding standalone database
definition, rather than maintaining a second set of renderer-local tags.

`examples/runnable/` has a different contract: it may contain only complete
projects with a direct-start readiness, host-ownership, and scoped-stop release
test. It intentionally has no runnable project today.

## Safe configuration upgrades

`loom upgrade` operates only on paths declared as Loom-owned in the project manifest. It renders candidates from the installed Loom release without running a framework generator, then compares each current file with its recorded baseline.

- Missing and baseline-unchanged Loom files are updated automatically.
- Locally modified Loom files are skipped unless `--force-modified` is supplied; skipped files make the command exit with status 1.
- Application source, dependency manifests, lockfiles, `.env`, and unlisted paths are never upgrade targets.
- Successful writes refresh the recorded baselines. Candidate or staging failures leave the prior manifest and baseline metadata intact.
- A v1 manifest is migration-only. `loom upgrade --initialize-baseline` records the current owned files as v2 baselines and exits without replacing project files; a subsequent `loom upgrade` evaluates updates.

The command also accepts `--config <path>` to locate a project outside the current directory. It is non-interactive: replacement of modified Loom-owned files always requires the explicit `--force-modified` flag.

## Diagnostics and generated-path cleanup

`loom doctor` runs deterministic checks for the project manifest and stack, rootless Podman, host architecture, lockfiles, dependency ownership, configured ports, routes, and host integration. The default renderer labels checks as pass, warning, or failure; `--json` exposes the same structured result list. Warnings exit 0, including host-integration limitations such as inability to update `/etc/hosts`; any failure exits 1.

`loom clean` derives its plan exclusively from generated paths declared by the manifest-selected stack. It always displays the paths, categories, presence, and byte total before deletion. `--dry-run` stops after that preview. Interactive use requires confirmation, while non-interactive use requires `--force`; that flag bypasses only confirmation, never safety validation.

The planner and executor reject traversal, project-root targets, and symlinked targets or parents. They protect `.loom/` and its database/runtime state, source roots, project configuration and environment files, dependency manifests and lockfiles, manifest-declared Loom-owned files, and every unlisted path. Execution is intentionally best effort rather than transactional: every item is revalidated immediately before removal, cleanup stops on the first newly unsafe path or filesystem error, and earlier successful deletions remain deleted. Missing declared paths are successful no-ops. Database lifecycle stays with `loom backup` and `loom restore`; cleanup does not reset data.

## What Loom is doing in the background

When you run `loom start`, Loom:

1. Checks Podman is available.
2. Reads your `loom.yaml`.
3. Starts services in the right dependency order.
4. Waits for them to become actually ready.
5. Sets up local route proxy + HTTPS certs if routes are configured.

This is why Loom feels predictable even for bigger stacks.

## Runtime flow diagram

```mermaid
flowchart LR
   subgraph Host[Host OS: Linux / macOS / Windows]
      CLI[loom CLI (Node.js + pnpm)]
      CFG[loom.yaml + local project files]
      CERTS[.loom/certs + local metadata]
   end

   subgraph Engine[Podman Engine]
      NET[Project network]
      PROXY[caddy route proxy container]
      APP[App service containers]
      DB[Database/cache containers]
   end

   subgraph VM[Podman Machine VM (macOS/Windows only)]
      ENGINEVM[Podman daemon + containers]
   end

   CLI -->|reads| CFG
   CLI -->|manages certs| CERTS
   CLI -->|podman CLI/API calls| Engine
   CLI -->|init/start/inspect| VM
   VM --> ENGINEVM
   ENGINEVM --> Engine

   NET --> PROXY
   NET --> APP
   NET --> DB
   PROXY --> APP
```

## Host vs Podman Machine (simple explanation)

- Loom runs as a CLI on your computer.
- On Linux, Loom talks to Podman directly.
- On macOS/Windows, Loom uses Podman Machine automatically when needed.
- Your app services still run in containers either way.

## `loom start` sequence

```mermaid
sequenceDiagram
   participant User
   participant CLI as loom CLI (host)
   participant CFG as Config Loader
   participant RT as Podman Runtime Adapter
   participant PM as Podman Machine
   participant PE as Podman Engine
   participant ORCH as Orchestrator
   participant NET as Network/HTTPS Layer

   User->>CLI: loom start --config loom.yaml
   CLI->>CFG: Load + validate config
   CFG-->>CLI: Project model

   CLI->>RT: detectPodmanCapabilities()
   RT-->>CLI: availability/rootless/machine state

   alt macOS/Windows and machine not running
      CLI->>PM: machine init/start
      PM-->>CLI: machine running
   end

   CLI->>ORCH: start(project)
   ORCH->>PE: ensure project network
   ORCH->>PE: start services in dependency order

   loop each service
      ORCH->>PE: create/start container
      ORCH->>PE: wait readiness (healthcheck/port)
   end

   ORCH->>NET: resolve routes + ensure local certs
   NET->>PE: start/update proxy container

   ORCH-->>CLI: startup summary (services, routes, cert paths)
   CLI-->>User: success output
```

## Why this matters for beginners

- Fewer startup surprises.
- Faster onboarding for new projects.
- Same command flow across many stacks.
- Cleaner local environments with one stop command.

## Internal module boundaries

The main runtime and orchestration packages are now split into smaller modules so behavior can be tested without changing the public package APIs.

### `@loom/core`

- `src/index.ts` is the public orchestrator facade.
- `src/runtime.ts` handles runtime readiness checks.
- `src/service-start.ts` handles per-service startup and readiness.
- `src/routes.ts` handles route resolution, HTTPS cert selection, proxy startup, and startup summaries.
- `src/backup.ts` handles backup support checks, path resolution, and backup orchestration.
- `src/status.ts`, `src/services.ts`, `src/tasks.ts`, `src/startup.ts`, and `src/lifecycle.ts` hold status assembly, validated lookups, formatting, and stop-flow logic.

### `@loom/runtime-podman`

- `src/podman.ts` owns low-level Podman command execution.
- `src/containers.ts` owns container metadata and run-argument helpers.
- `src/lifecycle.ts` owns container lifecycle, exec, logs, and Composer support.
- `src/readiness.ts` owns readiness probing.
- `src/backup.ts` owns database backup strategy and streaming.
- `src/machine.ts` owns capability detection and machine startup.

Service definitions can now also opt into Podman user mapping through `user` and `userns: keep-id` when a bind-mounted workspace needs host-aligned write ownership.

## Stack lifecycle direction

The approved local-first design makes new-project generation and existing-project adoption equal workflows. The stack registry, exact version pins, canonical packaged assets, ownership manifest, adoption, manifest-aware upgrade, structured diagnostics, and safe generated-path cleanup are available now. A representative generated-project smoke covers Node, base PHP, Python, SQLite, and bootstrap-heavy WordPress.

The complete 31-stack lifecycle harness, structured reports, CI matrix, and mandatory release gate remain planned as the second implementation subproject. The complete approved design is documented in [Local-First Stack Workflows](superpowers/specs/2026-08-17-local-first-stack-workflows-design.md).

### Why the split matters

- Public imports stay stable for CLI and downstream packages.
- Side-effecting boundaries are narrower, which makes tests more direct and less brittle.
- The orchestrator reads as high-level phase sequencing instead of a single large mixed-responsibility file.
