# Loom

> One command. Full stack. No Docker Desktop.

Loom is a local development CLI that gives you a ready-to-run app stack in minutes. Pick a template — `loom start` — and you're building. Works on Linux, macOS, and Windows. Powered by Podman.


## Why Loom

- **Templates that work**: 30+ starter templates — Node, Python, PHP, Ruby, Java, .NET, Astro, and more. Framework setups for Django, Rails, Symfony, Spring Boot, Next.js. Every template is tested in CI.
- **Databases without the pain**: `--db postgres` adds a database, generates credentials, wires the connection, and waits for it to be ready.
- **Automatic HTTPS**: every project gets a local TLS cert and a hostname like `https://myapp.loom.local`.
- **Health-checked startup**: Loom waits for dependencies to actually be ready, not just "container started."
- **Host-aligned permissions**: files written inside containers are owned by you, not root.
- **Free and open**: Podman handles the runtime — no Docker Desktop license required.

## Install Loom

See the full install guide: [docs/installation.md](docs/installation.md)

Quickest path:

```bash
# Linux/macOS
curl -fsSL https://raw.githubusercontent.com/Loom-development/Loom/main/scripts/install.sh | sh

# then verify
loom --help
```

## How it works

### 1. Pick a template

```bash
loom init node --dir my-app
```

No `Dockerfile`, no `docker-compose.yml`. Loom generates a working project. Run it interactively to pick your template, runtime, and database.

### 2. Start the stack

```bash
cd my-app && loom start
```

Loom pulls the image, installs your dependencies, starts your database, waits for everything to be healthy, generates HTTPS certs, and maps a local domain. All automatic.

### 3. Open your browser

```
https://my-app.loom.local
```

No `localhost:3000`. No port numbers. No cert warnings. Just your app.

When you're done: `loom stop`.

## Everyday commands

```bash
loom start              # start the project
loom stop               # stop everything
loom status             # see what's running
loom logs app           # tail logs for the 'app' service
loom exec app -- sh     # open a shell inside the container
loom restart            # stop + start
loom restart --recreate # clean rebuild (wipes caches, re-installs)
```

## Start a project with a database

No template includes a database by default. Add databases during init with the `--db` flag or via the interactive prompt.

```bash
# Node app + PostgreSQL
loom init node --dir my-app --db postgres
cd my-app
loom start

# Drupal + MySQL
loom init php-drupal --dir my-drupal --db mysql
cd my-drupal
loom start

# Python app + MongoDB + Redis
loom init python --dir my-python --db mongodb --db redis
cd my-python
loom start
```

When running `loom init` without a `--db` flag in an interactive terminal, Loom prompts you to optionally add a database.

Supported database types: `postgres`, `mysql`, `mariadb`, `mongodb`, `redis`

Loom adds the database service to `loom.yaml`, wires `dependsOn` so the app waits for the database to be ready, and adds the connection variables (`DATABASE_URL`, `REDIS_URL`, etc.) to `.env`.

**Adding a database to an existing project:**

```bash
cd my-existing-app
loom init node --db postgres   # or whichever template matches
loom start --recreate
```

This only writes the database service into `loom.yaml` — your source files are not touched.

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
- `loom exec <service> -- <command>` — run commands inside a service container (use `--` before the command to avoid flag parsing conflicts)
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

- **Starter apps**: `node`, `python`, `php`, `bun`
- **Full stacks**: `node-mern`, `node-mean`, `node-t3`, `spring-react`, `django-react`
- **Framework apps**: `python-django`, `python-flask`, `python-fastapi`, `php-wordpress`, `php-drupal`, `php-symfony`, `rails7`, `rails7-hotwire`, `spring-boot`, `astro`, `dotnet`, `jamstack`, `serverless`
- **Databases**: `db-postgres`, `db-mysql`, `db-mongodb`, `db-redis`, `db-sqlite`, `db-sqlserver`, `db-mariadb`, `db-elasticsearch`, `db-all`

Examples matrix with domains, ports, and usage: [docs/examples-matrix.md](docs/examples-matrix.md)

## What happens on `loom init` for bootstrap-heavy templates

Templates like `php-drupal`, `php-symfony`, `rails7`, and `rails7-hotwire` bootstrap their project structure during `loom init` by running the upstream tool in a temporary container. For example:

- `php-symfony` runs `composer create-project symfony/skeleton` in a `composer:2` container.
- `php-drupal` runs `composer create-project drupal/recommended-project` in a `composer:2` container.
- `rails7` and `rails7-hotwire` run `rails new` in the configured Ruby image.
- `php-wordpress` copies WordPress from the official WordPress image.

This means the project files you get are generated fresh from the upstream release — just like running `composer create-project` or `rails new` yourself.

Loom project files (`loom.yaml`, `.env.example`, `README.md`) are layered on top. The only project file Loom modifies after bootstrap is `wp-config.php` for WordPress (to inject DB credentials from environment variables), or when a connection URL needs adjustment.

## What happens on `loom start`

- Loom checks Podman availability.
- Loom starts services in dependency order.
- Each service container installs project dependencies using the configured dependency manager (`npm install`, `composer install`, `pip install`, `bundle install`, etc.) before starting the application.
- Loom validates readiness (healthcheck or port reachability).
- Loom prepares local route proxy + HTTPS certs when routes are configured.

Dependencies are installed at container startup, not pre-bundled in templates. This keeps templates lightweight and ensures every `loom start` uses the latest compatible versions from your lock files.

> **Note:** The first `loom start` after `loom init` may take a few minutes while the container installs all project dependencies from scratch (`npm install`, `pip install`, `bundle install`, `composer install`, etc.). Subsequent starts are fast — the dependency cache lives inside the container and persists across restarts unless you use `loom start --recreate`.

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

## Cleaning up Podman disk space

Podman caches images, containers, and volumes over time. To free disk space:

```bash
podman system prune --all --volumes --force
```

This removes all stopped containers, unused images, and dangling volumes.

**Before running this command:**
- Backup any project databases with `loom backup <service> <output-file>` first.
- The command deletes ALL unused volumes — including any database data stored in anonymous or named Docker volumes you may be using outside Loom projects.
- If a Loom project is currently running, its volumes are protected (in use). Still, stop running projects first to be safe.

To inspect what would be deleted without actually removing anything:

```bash
podman system prune --all --volumes --dry-run
```

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

## How Loom compares

| | Loom | Docker Compose | Laravel Sail | Laragon |
|---|---|---|---|---|
| One-command start | Yes | No | No | No |
| Free / no license | Yes | Yes* | Yes | Yes |
| Cross-platform | Yes | Yes | Yes | Windows only |
| Built-in HTTPS | Yes | Manual | Manual | Manual |
| DB backup/restore | Yes | Manual | Manual | Manual |
| Health-based startup | Yes | depends_on | No | No |
| Host file ownership | Yes | Manual | Manual | N/A |
| Requires Docker Desktop | No | Yes | Yes | N/A |

*Docker Desktop requires a paid license for commercial use in organizations with 250+ employees or \$10M+ revenue.

## Who Loom is for

**Beginners** — you finished a tutorial and want to build something real. You don't want to learn Docker. `loom init` gives you a working project. `loom start` makes it go.

**Experienced devs** — you know Docker but you're tired of writing the same Compose file for the 40th time. Loom handles health checks, permissions, and backups so you don't have to.

**Teams** — new members clone the repo and run `loom start`. No 20-page setup guide. No port conflict issues. Just start building.

## Learn more

- Installation: [docs/installation.md](docs/installation.md)
- Beginner architecture explanation: [docs/architecture.md](docs/architecture.md)
- Template and stack command matrix: [docs/examples-matrix.md](docs/examples-matrix.md)
- Product direction for users: [docs/roadmap.md](docs/roadmap.md)
