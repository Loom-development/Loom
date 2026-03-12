# Loom Examples Matrix (User Guide)

Use this page to pick a template quickly and run it with the installed `loom` command.

Templates that expose runtime image tags do so through `.env.example` files. After `loom init`, edit the generated `.env` to switch to a different LTS or runtime image tag without changing `loom.yaml`.

In interactive terminals, `loom init` also prompts for the primary runtime image on supported templates. For non-interactive use, pass `--image KEY=VALUE`.

Quick examples:

```bash
# Node templates
NODE_IMAGE=node:22-alpine

# .NET template
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:8.0

# Rails template
RUBY_IMAGE=ruby:3.3

# PHP templates
PHP_IMAGE=dunglas/frankenphp:1-php8.3
```

## One command pattern for all templates

```bash
loom init <template> --dir my-app
cd my-app
loom start
loom status
loom stop
```

## Recommended templates by goal

| Goal | Template | Why choose it |
|---|---|---|
| Learn Loom in 5 minutes | `node` | Smallest starter stack |
| Full-stack JavaScript | `node-mern` or `node-t3` | API + web + database workflows |
| Static-first site with API | `jamstack` | JavaScript, APIs, and Markup in a modern local workflow |
| Full-stack Python + React | `django-react` | Django API with React frontend workflow |
| Python APIs | `python-fastapi` | Modern async API setup |
| CMS with PHP | `php-wordpress` | Fast WordPress local setup |
| Databases only | `db-postgres` / `db-mysql` / `db-all` | Instant local DB environments |

## Template catalog

### App templates

- `node`
- `node-mean`
- `node-mern`
- `node-t3`
- `node-bun` (alias: `bunjs`)
- `python`
- `python-django`
- `python-flask`
- `python-fastapi`
- `php`
- `php-wordpress`
- `php-drupal`
- `php-symfony`
- `dotnet`
- `rails7`
- `rails7-hotwire`
- `jamstack`
- `serverless`
- `spring-react`
- `django-react`

### Database templates

- `db-mysql`
- `db-sqlserver`
- `db-postgres`
- `db-mongodb`
- `db-redis`
- `db-elasticsearch`
- `db-sqlite`
- `db-mariadb`
- `db-all`

## Practical examples

### Start a MERN project

```bash
loom init node-mern --dir mern-demo
cd mern-demo
loom start
loom logs api -f
```

This stack includes MongoDB, an Express.js API, a React frontend, and the Node.js runtime for both app services.

### Start a Django + React project

```bash
loom init django-react --dir django-react-demo
cd django-react-demo
loom start
loom logs backend -f
```

### Start a modern JAMstack project

```bash
loom init jamstack --dir jamstack-demo
cd jamstack-demo
loom start
loom logs api -f
```

This template is updated around the modern JAMstack idea: JavaScript in the browser, API-driven content, and markup-first pages served through a fast frontend dev server.

### Start a modern serverless project

```bash
loom init serverless --dir serverless-demo
cd serverless-demo
loom start
loom logs app -f
```

This template now models a serverless app without the `serverless` npm package: a static SPA frontend talks to a local FaaS-style backend over `/api`, with health, feed, and webhook endpoints.

### Start a Rails 7 + Hotwire project

```bash
loom init rails7-hotwire --dir rails-hotwire-demo
cd rails-hotwire-demo
loom start
loom logs app -f
```

### Start a FastAPI project

```bash
loom init python-fastapi --dir fastapi-demo
cd fastapi-demo
loom start
loom status
```

### Start only PostgreSQL

```bash
loom init db-postgres --dir pg-demo
cd pg-demo
loom start
loom backup db
```

## Common beginner commands

- `loom status` — quick health summary
- `loom ps` — containers for current project
- `loom logs <service> --no-follow` — short log snapshot
- `loom exec <service> -- sh` — run shell in container
- `loom stop` — clean shutdown

## Troubleshooting

- `loom: command not found` → reinstall Loom and reopen terminal.
- Stack fails to start → run `loom status`, then `loom logs <service> --no-follow`.
- Podman issues → verify with `podman version`.
