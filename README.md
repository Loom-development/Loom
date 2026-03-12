# Loom

Loom is a beginner-friendly local development CLI powered by Podman.

It gives you a ready-to-run app stack in minutes with one command, so you can stop wrestling with container setup and start building features.

## Why Loom is worth using

- **Fast onboarding**: spin up full stacks from templates (`Node`, `Python`, `PHP`, databases, and more).
- **Simple commands**: start, stop, logs, exec, backups — all through one CLI.
- **Safer startup**: Loom waits for dependencies to become ready before continuing.
- **Cross-platform**: works on Linux, macOS, and Windows with Podman.
- **Built for local DX**: local networking, automatic HTTPS certs for routes, and predictable workflows.

## Install Loom

See the full install guide: [docs/installation.md](docs/installation.md)

Quickest path:

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh

# then verify
loom --help
```

## 60-second quick start

```bash
# 1) create a project from a template
loom init node --dir my-app

# 2) enter project
cd my-app

# 3) start stack
loom start

# 4) check health
loom status
```

When you are done:

```bash
loom stop
```

If you run `loom init` without a template, Loom now prompts you to choose one interactively and suggests a default when it recognizes common root files such as `package.json`, `composer.json`, `pyproject.toml`, or `Gemfile`.

Initialized templates now copy `.env.example` to `.env` when present. For templates that expose image tags, you can switch to a different LTS or runtime version by editing the `*_IMAGE` values in `.env` instead of changing `loom.yaml` directly.

When `loom init` runs in an interactive terminal, supported templates now prompt for the primary runtime image during init. For scripted or non-interactive use, pass one or more `--image KEY=VALUE` flags.

Examples:

```bash
# Node templates
NODE_IMAGE=node:22-alpine
# or
NODE_IMAGE=node:24-alpine

# during init
loom init node --image NODE_IMAGE=node:22-alpine

# .NET template
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:8.0
# or
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:10.0

# Rails template base image
RUBY_IMAGE=ruby:3.3
```

## Daily commands you'll actually use

- `loom start` — start your project services
- `loom stop` — stop everything cleanly
- `loom restart` — stop + start
- `loom start --recreate` — remove existing project containers and start fresh
- `loom status` — see runtime and service state
- `loom ps` — list project containers
- `loom logs <service> --no-follow` — quick logs snapshot
- `loom logs <service> -f` — follow live logs
- `loom exec <service> -- <command>` — run commands inside a service container
- `loom backup <service>` — backup supported database service
- `loom backup --all` — backup all supported database services

Tip: run `loom <command> --help` for options.

## Production readiness baseline

- CI validates lint, typecheck, and tests on Node 22 and Node 24 for pushes and pull requests.
- Coverage artifacts are generated in CI on Node 24.
- Release workflows reuse the same verification gates before building distributable assets.

Local equivalents:

```bash
pnpm verify
pnpm verify:coverage
```

## Popular templates

- **Starter apps**: `node`, `python`, `php`, `node-bun`
- **Full stacks**: `node-mern`, `node-mean`, `node-t3`, `spring-react`, `django-react`
- **Framework apps**: `python-django`, `python-flask`, `python-fastapi`, `php-wordpress`, `php-drupal`, `php-symfony`, `rails7`, `rails7-hotwire`, `dotnet`, `jamstack`, `serverless`
- **Databases**: `db-postgres`, `db-mysql`, `db-mongodb`, `db-redis`, `db-sqlite`, `db-sqlserver`, `db-mariadb`, `db-elasticsearch`, `db-all`

Examples matrix with domains, ports, and usage: [docs/examples-matrix.md](docs/examples-matrix.md)

## What happens on `loom start`

- Loom checks Podman availability.
- Loom starts services in dependency order.
- Loom validates readiness (healthcheck or port reachability).
- Loom prepares local route proxy + HTTPS certs when routes are configured.

If existing project containers drift from the current config or you want a clean rebuild of the stack, run `loom start --recreate`.

This means fewer "it started but not really" moments.

## Supported DB backup types

`mysql`, `mariadb`, `postgres`, `mongodb`, `redis`, `sqlite`, `sqlserver`

## Repository structure

Loom is organized as a small monorepo with a thin CLI layer on top of focused packages.

- `apps/cli`: command-line entrypoint and user-facing command wiring.
- `packages/core`: high-level orchestration facade used by the CLI.
- `packages/runtime-podman`: Podman-specific runtime adapter for lifecycle, readiness, exec, logs, and backups.
- `packages/network`: project network and local route proxy management.
- `packages/https`: local certificate management for HTTPS routes.
- `packages/config`: `loom.yaml` loading and validation.
- `packages/tasks`: task execution helpers layered on top of orchestration.

## Internal module boundaries

The main orchestration and runtime packages are split into smaller internal helpers while keeping public package APIs stable.

- `@loom/core` keeps `LoomOrchestrator` as the public facade, with internal helpers for runtime readiness, per-service startup, route publishing, backup flows, status assembly, formatting, and stop lifecycle logic.
- `@loom/runtime-podman` keeps package-root exports stable, with internal helpers for Podman command execution, container metadata, lifecycle flows, readiness checks, backup streaming, and machine detection.

Related documentation:

- [docs/architecture.md](docs/architecture.md) for the high-level flow.
- [packages/core/README.md](packages/core/README.md) for core module ownership.
- [packages/runtime-podman/README.md](packages/runtime-podman/README.md) for Podman runtime module ownership.

## Learn more

- Installation: [docs/installation.md](docs/installation.md)
- Beginner architecture explanation: [docs/architecture.md](docs/architecture.md)
- Template and stack command matrix: [docs/examples-matrix.md](docs/examples-matrix.md)
- Product direction for users: [docs/roadmap.md](docs/roadmap.md)
