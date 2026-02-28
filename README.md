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

## Daily commands you'll actually use

- `loom start` — start your project services
- `loom stop` — stop everything cleanly
- `loom restart` — stop + start
- `loom status` — see runtime and service state
- `loom ps` — list project containers
- `loom logs <service> --no-follow` — quick logs snapshot
- `loom logs <service> -f` — follow live logs
- `loom exec <service> -- <command>` — run commands inside a service container
- `loom backup <service>` — backup supported database service
- `loom backup --all` — backup all supported database services

Tip: run `loom <command> --help` for options.

## Popular templates

- **Starter apps**: `node`, `python`, `php`, `node-bun`
- **Full stacks**: `node-mern`, `node-mean`, `node-t3`, `spring-react`
- **Framework apps**: `python-django`, `python-flask`, `python-fastapi`, `php-wordpress`, `php-drupal`, `php-symfony`, `rails7`, `dotnet`, `jamstack`, `serverless`
- **Databases**: `db-postgres`, `db-mysql`, `db-mongodb`, `db-redis`, `db-sqlite`, `db-sqlserver`, `db-mariadb`, `db-elasticsearch`, `db-all`

Examples matrix with domains, ports, and usage: [docs/examples-matrix.md](docs/examples-matrix.md)

## What happens on `loom start`

- Loom checks Podman availability.
- Loom starts services in dependency order.
- Loom validates readiness (healthcheck or port reachability).
- Loom prepares local route proxy + HTTPS certs when routes are configured.

This means fewer "it started but not really" moments.

## Supported DB backup types

`mysql`, `mariadb`, `postgres`, `mongodb`, `redis`, `sqlite`, `sqlserver`

## Learn more

- Installation: [docs/installation.md](docs/installation.md)
- Beginner architecture explanation: [docs/architecture.md](docs/architecture.md)
- Template and stack command matrix: [docs/examples-matrix.md](docs/examples-matrix.md)
- Product direction for users: [docs/roadmap.md](docs/roadmap.md)
