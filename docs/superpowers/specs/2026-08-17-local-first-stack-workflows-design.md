# Local-First Stack Workflows

> **Status: implementation in progress.** The stack registry, upgrade-safe v2
> ownership manifest, `loom adopt`, and manifest-aware `loom upgrade` are
> implemented. Pinned generators, diagnostics, cleanup, repository restructuring,
> and the complete release matrix remain target behavior unless explicitly
> identified as current behavior.

## Summary

Loom supports creating new projects and adopting existing projects as equally
important workflows. Application source, dependency manifests, and lockfiles
live on the host for normal editing, Git use, and debugging. Stack definitions
may also keep installed dependency directories in the bind-mounted project for
IDE indexing and reuse. Containers provide runtimes, operating-system packages,
and services, but do not own or embed application source.

Each Loom release pins and tests the scaffold generator and runtime versions
for every published stack. Given the same Loom release and inputs, `loom init`
must produce a predictable project. Framework upgrades remain under the
developer's control; `loom upgrade` changes only Loom-owned files.

## Ownership Model

### Developer-owned files

- Application source and tests
- Dependency manifests and lockfiles
- Locally installed dependencies such as `node_modules`, `.venv`, `vendor`,
  and configured Ruby bundle directories
- Framework build output and caches

Loom may create these files during initialization, but it does not overwrite
them during adoption or upgrade.

### Loom-owned files

- `loom.yaml`
- `.env.example`
- Explicitly generated Loom helper scripts
- `.loom/manifest.json`, which records the selected stack, scaffold version,
  Loom version, render inputs, and baselines for Loom-owned files

The manifest is authoritative: files not declared there are never changed by
`loom upgrade`.

### Runtime-owned content

Runtime images contain language runtimes, system libraries, package managers,
and service executables. They contain no project source and no project-specific
application dependencies.

Loom runtime state, certificates, and internal caches remain local and ignored
under `.loom/`.

## Stack Definitions

A versioned stack definition shipped with a Loom release declares:

- Stack identity and detection signals
- Pinned upstream generator and generator version
- Pinned runtime image tags or digests
- Supported host architectures
- Generator command and arguments
- Dependency install and application start commands
- Dependency, build-output, and cache paths
- Ports, routes, health checks, and readiness timeouts
- Loom-owned templates and stack-specific `.gitignore` entries
- Compatibility metadata used by `loom doctor`

Definitions are data-driven where possible. Stack-specific code is limited to
cases that cannot be represented safely by the definition format.

## Planned New-Project Workflow

`loom init <stack>` will perform these steps:

1. Resolve the stack definition shipped with the installed Loom release.
2. Validate Podman, host architecture, disk space, target-directory state, and
   required ports.
3. Run the pinned upstream generator in a temporary container.
4. Write the generated project into the target directory as the host UID/GID.
5. Add Loom-owned configuration and stack-specific ignore entries.
6. Validate the generated configuration without starting long-running
   services.
7. Record ownership and version metadata in `.loom/manifest.json`.

Initialization does not depend on application source embedded in a runtime
image. If initialization fails before committing output, Loom removes its
temporary workspace. If cleanup is unsafe or diagnostics are valuable, Loom
preserves the workspace and prints its location and an exact retry command.

## Planned Existing-Project Workflow

`loom adopt [stack]` will treat the current project as developer-owned:

1. Detect signals such as `package.json`, `Gemfile`, `composer.json`,
   `pyproject.toml`, framework configuration, lockfiles, and conventional
   source paths.
2. Present the detected stack, package manager, runtime, ports, and databases
   before writing files.
3. Require an explicit stack when detection is ambiguous.
4. Generate only Loom-owned files and relevant ignore entries.
5. Record those files in `.loom/manifest.json`.

Adoption never modifies application source, dependency manifests, or lockfiles.
Tests enforce this by comparing these files byte for byte before and after the
operation.

## Upgrade Workflow

`loom upgrade` updates only manifest-declared Loom-owned files:

1. Read the ownership manifest and target Loom version.
2. Render updated files into a temporary directory.
3. Compare current hashes with the manifest and show a concise diff.
4. Replace unchanged Loom-owned files automatically.
5. Skip a locally modified Loom-owned file unless `--force-modified` explicitly
   authorizes replacement; a skip causes a nonzero exit.
6. Update the manifest after successful replacement.

It never invokes a framework generator or edits application source,
dependencies, manifests, or lockfiles. Native framework tooling remains the
supported path for framework upgrades.

The command is non-interactive and accepts `--config <path>`. Projects with a
v1 manifest must first run `loom upgrade --initialize-baseline`. That migration
records the current manifest-declared files as v2 baselines and exits without
replacing project files. Running `--initialize-baseline` against an existing v2
manifest is refused.

## Runtime and Dependency Behavior

Project source is bind-mounted at a consistent path such as `/workspace`.
Stack definitions may place dependency directories beside the local source for
IDE visibility and reuse. Other stacks may use container-managed cache paths;
in either case, application source, dependency manifests, and lockfiles remain
in the bind-mounted local project.
Containers perform installation and application startup as the host UID/GID;
root is used only for narrowly scoped operating-system setup before privileges
are dropped.

Loom uses the project's selected package manager and lockfile. It does not
silently generate or rewrite lockfiles. Dependency installation can be skipped
when a fingerprint of the lockfile, runtime image, install command, and relevant
stack definition has not changed.

The planned `loom clean` command will list and remove only generated paths declared by the selected
stack. It requires confirmation unless a non-interactive force option is
explicitly supplied.

The planned `loom doctor` command will diagnose at least:

- Incorrect host ownership or permissions
- Missing, conflicting, or stale lockfiles and dependencies
- Unsupported architecture or runtime image
- Port conflicts
- Podman availability and rootless configuration
- Invalid routes and host integration limitations
- Stack-definition and project compatibility mismatches

Errors identify the failed phase: generator, image pull, dependency install,
process launch, readiness, route proxy, or host integration.

## Target Examples and Repository Structure

The repository will separate verified generated-project fixtures from generator
assets and explicitly label any examples intended for direct execution:

- a dedicated runnable-example area will contain only complete projects verified
  to support direct `loom start`;
- `stacks/` contains stack definitions, Loom-owned templates, generator
  metadata, and test fixtures.

Incomplete framework skeletons must not appear runnable. Bootstrap-heavy
stacks such as Rails, Drupal, Symfony, and WordPress are tested through their
generated output rather than by starting generator assets in place.

## Verification and Release Gate

Every published stack must pass:

1. `loom init <stack>` using the pinned generator.
2. `loom start` and declared readiness checks.
3. A service-specific execution and host-write ownership assertion.
4. `loom stop` with no remaining scoped containers.

Adoption tests start from realistic existing projects and prove developer-owned
files remain unchanged. Upgrade tests prove that only manifest-declared files
change and cover locally modified Loom-owned files. Failure tests cover cleanup
after every initialization and startup phase.

CI runs the stack matrix on supported host platforms and architectures where
available. A stack cannot ship unless its generator, runtime, health check,
ownership behavior, and cleanup pass. The release report distinguishes stack
failures from host integration warnings such as insufficient permission to
edit `/etc/hosts`.

## Migration

Migration should proceed in bounded phases:

1. Introduce stack definitions and the ownership manifest without changing
   existing command behavior.
2. Add `loom adopt` and manifest-aware safe writes.
3. Move bootstrap-heavy templates to pinned generator definitions.
4. Add manifest-driven `loom upgrade` (complete), then `loom doctor` and
   `loom clean`.
5. Split repository examples into runnable projects and stack assets.
6. Require the complete generated-stack matrix as a release gate.

Existing projects without a manifest remain supported by existing runtime
commands, but `loom upgrade` requires initialization or adoption first. Projects
with a v1 manifest migrate with `loom upgrade --initialize-baseline`; the command
records current manifest-declared files without replacing them, and a later
`loom upgrade` performs the normal comparison.
