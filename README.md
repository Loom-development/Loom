# Loom

Loom is an open-source, cross-platform local development tool powered by Podman.

Loom runs on your machine and manages your local app stack containers with simple commands.

## CI

- [![Release](https://github.com/Loom-development/Loom/actions/workflows/release.yml/badge.svg)](https://github.com/Loom-development/Loom/actions/workflows/release.yml)
- [![Release Dry Run](https://github.com/Loom-development/Loom/actions/workflows/release-dry-run.yml/badge.svg)](https://github.com/Loom-development/Loom/actions/workflows/release-dry-run.yml)

## What you can do

Loom command flow:

- `loom start`
- `loom stop`
- `loom restart`
- `loom status`
- `loom ps`
- `loom test`
- `loom logs <service>`
- `loom exec <service> -- <command>`

During `loom start`, Loom enforces readiness in dependency order:

- Uses configured `healthcheck` when present.
- Falls back to host-port reachability when ports are published.
- Fails fast if a container exits before becoming ready.

For PHP services, Loom ensures `composer` is available inside the running container at startup.

## CLI help

Show all available commands:

```bash
loom -h
```

Current command list:

- `init <template>` — initialize a sample project in a target directory
- `start` — start Loom project services
- `stop` — stop Loom project services
- `restart` — restart Loom project services
- `status` — show project and runtime status
- `ps` — list project containers
- `test` — run test task from loom config
- `logs <service>` — show service logs
- `exec <service> [...cmd]` — exec command in service container
- `backup <service>` — create a backup file for a database service

For command-specific options:

```bash
loom <command> --help
```

If you pass an unknown service to `loom logs` or `loom exec`, Loom prints a closest-match suggestion (when available), plus configured and currently running services to help you recover quickly.

`loom backup <service>` supports service types: `mysql`, `mariadb`, `postgres`, `mongodb`, `redis`, `sqlite`, `sqlserver`.
Use `loom backup --all` to back up all supported database services in a project.

## Networking + HTTPS (MVP)

- Loom creates a project Podman network: `loom-<project-name>`.
- Loom provisions a route proxy container (`caddy`) for configured routes.
- HTTPS certificates are generated automatically under `.loom/certs`.
- Rootless-compatible host proxy ports are used by default:
	- HTTP: `localhost:8080`
	- HTTPS: `localhost:8443`

## Quick start

1) Install Loom: see `docs/installation.md`

2) Choose a template:

- Node:
	- `node` (basic)
	- `node-mean`
	- `node-mern`
	- `node-t3`
- Bun:
	- `node-bun` (alias: `bunjs`)
- Additional stacks:
	- `dotnet` (alias: `stack-dotnet`)
	- `rails7` (alias: `stack-rails7`)
	- `jamstack` (alias: `stack-jamstack`)
	- `serverless` (alias: `stack-serverless`)
	- `spring-react` (alias: `stack-spring-react`)
- Python:
	- `python` (basic)
	- `python-django`
	- `python-flask`
	- `python-fastapi`
- PHP:
	- `php` (basic)
	- `php-wordpress`
	- `php-drupal`
	- `php-symfony`
- Databases:
	- `db-mysql`
	- `db-sqlserver`
	- `db-postgres`
	- `db-mongodb`
	- `db-redis`
	- `db-elasticsearch`
	- `db-sqlite`
	- `db-mariadb`
	- `db-all`

How to choose:

- Start with `node`, `bunjs`, `python`, or `php` if you want a minimal baseline.
- Pick a framework, runtime, or database template when you already know your stack.
- Use `db-all` when you need a local integration environment with every supported database.
- Running `loom init db-*` in a project root creates files under `./db` by default.
- Run `loom init --help` to see init options (`--dir`, `--force`, `--php-docroot`).
- `--php-docroot <path>` is optional for `php*` templates; when omitted, docroot defaults to `.` during `loom init`.
- For `php-wordpress` and `php-drupal`, `--php-docroot` is ignored because docroot is managed by the image layout.

Template output types:

| Type | What you get | Example templates |
|---|---|---|
| Starter files included | Template copies app/source files and config immediately after `loom init` | `node-bun`, `jamstack`, `serverless`, `spring-react`, `dotnet` |
| Bootstrap on first start | Template includes config and generates the app on first `loom start` | `rails7` |
| Config/service-only | Template focuses on service containers and runtime config | `db-*` templates |

For templates that ship `.env.example`, `loom init` will create a local `.env` automatically if one does not already exist.

Template quick explainers:

- `node`: single Node.js app service with local source mount. Recommended for: quick API/web prototypes.
- `node-mean`: MongoDB + Express API + AngularJS-style web service layout. Recommended for: legacy MEAN-style apps.
- `node-mern`: MongoDB + Express API + React web service layout. Recommended for: modern JS full-stack apps.
- `node-t3`: TypeScript/T3-style Node app with Postgres service. Recommended for: strongly typed full-stack development.
- `node-bun` / `bunjs`: Bun runtime app service with Bun dev server. Recommended for: fast JavaScript runtime workflows.
- `dotnet`: ASP.NET 8 minimal API starter (`Program.cs`) on .NET SDK image. Recommended for: .NET API services.
- `rails7`: Ruby container that bootstraps and runs a Rails 7 app on first start. Recommended for: Rails monolith/API projects.
- `jamstack`: Vite-based static front-end template. Recommended for: static sites and headless CMS front-ends.
- `serverless`: Serverless Framework + Offline plugin template (`serverless.yml`, `handler.js`). Recommended for: function-first local API simulation.
- `spring-react`: Spring Boot API backend + React (Vite) frontend with dependency ordering. Recommended for: Java + React full-stack teams.
- `python`: basic Python app with Redis sidecar. Recommended for: lightweight Python services.
- `python-django`: Django app service template. Recommended for: batteries-included Python web apps.
- `python-flask`: Flask app service template. Recommended for: minimal Python API projects.
- `python-fastapi`: FastAPI app service template. Recommended for: async Python APIs and OpenAPI-first workflows.
- `php`: basic PHP app template with Postgres service. Recommended for: custom PHP service baselines.
- `php-wordpress`: WordPress app + MySQL service. Recommended for: CMS sites and plugin/theme development.
- `php-drupal`: Drupal app + MySQL service. Recommended for: Drupal module/site development.
- `php-symfony`: Symfony-style PHP runtime template. Recommended for: Symfony applications and APIs.
- `db-mysql`: standalone MySQL service template. Recommended for: MySQL-backed app development.
- `db-sqlserver`: standalone SQL Server service template. Recommended for: MSSQL-backed apps.
- `db-postgres`: standalone PostgreSQL service template. Recommended for: Postgres-first application stacks.
- `db-mongodb`: standalone MongoDB service template. Recommended for: document-database development.
- `db-redis`: standalone Redis service template. Recommended for: caching and queue/pubsub local testing.
- `db-elasticsearch`: standalone Elasticsearch single-node template. Recommended for: local search/indexing development.
- `db-sqlite`: SQLite utility container with persistent volume. Recommended for: embedded/local single-file DB testing.
- `db-mariadb`: standalone MariaDB service template. Recommended for: MariaDB-compatible MySQL workflows.
- `db-all`: all supported database services in one stack for integration testing. Recommended for: multi-database validation labs.

3) Initialize a project from the chosen template:

```bash
loom init node-mern --dir my-app
cd my-app
```

4) Start and inspect services:

```bash
loom start
loom status
loom ps
loom logs <service> --no-follow
loom stop
```

Installation guide: `docs/installation.md`

## Typical daily workflow

```bash
loom start
loom status
loom logs <service> -f
loom exec <service> -- sh
loom backup <service>
loom stop
```

## Framework examples

- Node: MEAN, MERN in `examples/node`
- Bun: Bun runtime example in `examples/node/bun`
- Python: Django, Flask, FastAPI in `examples/python`
- PHP: WordPress, Drupal, Symfony in `examples/php`
- Databases: MySQL, SQL Server, Postgres, MongoDB, Redis, Elasticsearch, SQLite, MariaDB in `examples/databases`
- Additional stacks: .NET, Rails 7, JAMstack, Serverless, Spring Boot + React in `examples/stacks`
- Full examples matrix (ports/domains/config paths): `docs/examples-matrix.md`

Architecture flow diagram: see `docs/architecture.md` (Runtime Flow Diagram section).

## For contributors

If you want to work on Loom itself (not just use it), start with `docs/releasing.md` and the package layout under `apps/` and `packages/`.
