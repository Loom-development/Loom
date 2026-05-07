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
NODE_IMAGE=docker.io/library/node:22-alpine
# or
NODE_IMAGE=docker.io/library/node:24-alpine

# during init
loom init node --image NODE_IMAGE=docker.io/library/node:22-alpine

# .NET template
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:8.0
# or
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:10.0

# Rails template base image
RUBY_IMAGE=docker.io/library/ruby:3.3
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
- `loom restore <service> <input>` — restore a supported database service from a local backup file

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

## Service user mapping

When a service needs to write into a bind-mounted project directory with host-aligned ownership, Loom now supports per-service `user` and `userns` settings in `loom.yaml`.

Example:

```yaml
services:
	app:
		type: node
		image: ${NODE_IMAGE:-docker.io/library/node:24-alpine}
		userns: keep-id
		user: ${HOST_UID:-1000}:${HOST_GID:-1000}
		volumes:
			- ./:/workspace
```

Use `userns: keep-id` for rootless Podman when you want the container process to map cleanly to the host user. Add `user` when the service should run as a specific UID:GID inside the container.

`userns: keep-id` gives the strongest host-aligned ownership behavior on Linux with rootless Podman. On macOS and Windows, Loom still runs through Podman machine and `execUser` still applies to `loom exec` and task runs, but filesystem ownership and performance can differ from native Linux because the project directory is accessed through the Podman VM.

For root-bootstrap templates that must start as `root` and then drop privileges inside the container, Loom also supports `execUser` for `loom exec` and task runs:

```yaml
services:
	app:
		type: node
		image: ${NODE_IMAGE:-docker.io/library/node:24-alpine}
		user: root
		userns: keep-id
		execUser: ${HOST_UID:-1000}:${HOST_GID:-1000}
```

That keeps startup flexible while making `loom exec app -- sh` and configured tasks enter the container as the same host-aligned user your long-running app process uses.

## Supported DB backup types

`mysql`, `mariadb`, `postgres`, `mongodb`, `redis`, `sqlite`, `sqlserver`

## Supported DB restore types

`mysql`, `mariadb`, `postgres`, `mongodb`, `redis`, `sqlite`

Redis restore stops the service, replaces `dump.rdb`, and starts the service again.

SQL Server restore is not yet supported by `loom restore`; the current backup format is a live `.bak` of `master`, which needs a different restore path than the running-container workflow Loom uses today.

## Database backup and restore

Typical workflow:

```bash
loom start
loom backup db
loom restore db ./.loom/backups/my-project-db-2026-03-15T12-00-00.000Z.sql
```

Notes:

- Use the service name from `loom.yaml`, such as `db`, `postgres`, `mysql`, or `redis`.
- `loom backup --all` creates backups for every backup-supported database service in the current project.
- MySQL, MariaDB, and PostgreSQL restore accept plain SQL dumps and gzip-compressed SQL dumps.
- Redis restore replaces `dump.rdb` and restarts the Redis service automatically.
- SQLite restore replaces the mounted database file directly.
- SQL Server backup is supported, but restore is not yet implemented.

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
