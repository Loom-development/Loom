# @loomdev/cli

Command-line interface for Loom — a beginner-friendly local development CLI powered by Podman.

Spin up a full app stack with one command. No Docker Desktop required.

## Install Globally

Install globally so the `loom` command is available in your shell PATH.

```bash
npm install -g @loomdev/cli
```

If you install without `-g`, use `npx loom` instead of `loom`.

## Quick Start

```bash
# create a project from a template
loom init node --dir my-app
cd my-app

# start all services
loom start

# check status
loom status

# stop everything
loom stop
```

## Start a project with a database

Pass `--db` to add a database alongside your app in one step. Repeat it for multiple databases.

```bash
# Node + PostgreSQL
loom init node --dir my-app --db postgres

# Python + MongoDB + Redis
loom init python --dir my-app --db mongodb --db redis

# PHP + MySQL
loom init php --dir my-app --db mysql
```

Supported database types: `postgres`, `mysql`, `mariadb`, `mongodb`, `redis`

Loom adds the service to `loom.yaml`, wires `dependsOn` so the app waits for the database, and adds connection variables to `.env`.

## Add a database to an existing project

```bash
cd my-existing-app
loom init node --db postgres
loom start --recreate
```

Only `loom.yaml` and `.env` are updated — your source files are not touched.

## Available templates

**Apps:** `node`, `node-bun`, `node-mern`, `node-mean`, `node-t3`, `python`, `python-django`, `python-flask`, `python-fastapi`, `php`, `php-wordpress`, `php-drupal`, `php-symfony`, `rails7`, `rails7-hotwire`, `dotnet`, `jamstack`, `serverless`, `spring-react`, `django-react`

**Databases (standalone):** `db-postgres`, `db-mysql`, `db-mariadb`, `db-mongodb`, `db-redis`, `db-sqlite`, `db-sqlserver`, `db-elasticsearch`, `db-all`

`loom init` without a template prompts interactively and suggests a default when it recognizes common root files (`package.json`, `composer.json`, `pyproject.toml`, `Gemfile`).

## Daily commands

| Command | What it does |
|---|---|
| `loom start` | Start all project services |
| `loom start --recreate` | Remove containers and start fresh |
| `loom stop` | Stop everything cleanly |
| `loom restart` | Stop then start |
| `loom status` | Show runtime and service state |
| `loom ps` | List project containers |
| `loom logs <service> -f` | Follow live logs |
| `loom exec <service> -- <cmd>` | Run a command inside a service |
| `loom backup <service>` | Backup a database service |
| `loom backup --all` | Backup all database services |
| `loom restore <service> <file>` | Restore a database from a backup |

## Requirements

- Node.js 24+
- Podman

## Help

```bash
loom --help
loom init --help
loom start --help
```
