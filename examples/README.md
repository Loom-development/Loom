# Examples

Use these with `loom init <template>`.

Most templates include a `.env.example` file with `*_IMAGE` defaults. After `loom init`, Loom copies that file to `.env` when one is not already present, so you can switch to a different LTS or runtime image tag without editing `loom.yaml` directly.

If `loom init` is running in an interactive terminal, supported templates prompt for the primary runtime image during init. In scripts or CI, use `--image KEY=VALUE`.

## Init behaviour with existing projects

`loom init` adapts based on what is already in the target directory:

- **Empty directory** — copies the full template, including the default `index.php` or equivalent starter file.
- **Non-empty directory** — only writes `loom.yaml` and creates `.env.example` if it is missing. Your existing source files are left untouched. This is the safe default for adopting an existing project.
- **`--blank-template`** — prints a warning, deletes all existing files in the target directory, then copies the full template. Use this when you want a completely clean slate.

Examples:

```bash
# Adopt an existing project (only adds Loom config files)
loom init php --dir my-existing-php-app

# Start a clean new project, removing everything first
loom init php --dir my-existing-php-app --blank-template
```

Templates that bootstrap their own project scaffolding (`php-wordpress`, `php-drupal`, `php-symfony`, `rails7`, `rails7-hotwire`) have their own adopt logic and do not use `--blank-template`.

Common overrides:

```bash
# Node-based templates: node, node-mean, node-mern, node-t3, jamstack, serverless, spring-react frontend
NODE_IMAGE=docker.io/library/node:22-alpine

# PHP templates
PHP_IMAGE=docker.io/dunglas/frankenphp:1-php8.3

# WordPress app image
PHP_IMAGE=docker.io/library/php:8.3-apache

# Rails
RUBY_IMAGE=docker.io/library/ruby:3.3

# .NET
DOTNET_IMAGE=mcr.microsoft.com/dotnet/sdk:8.0
```

Example:

```bash
loom init jamstack --dir my-jamstack --image NODE_IMAGE=docker.io/library/node:22-alpine
```

Templates with extra services expose extra image variables too, such as `POSTGRES_IMAGE`, `MYSQL_IMAGE`, `MONGO_IMAGE`, `REDIS_IMAGE`, `JAVA_IMAGE`, or `BUN_IMAGE`.

## Database workflows

Database templates and app templates with database services can use the built-in backup and restore commands.

```bash
loom backup db
loom restore db ./path/to/backup.sql
```

Current restore support:

- `postgres`, `mysql`, `mariadb`, `mongodb`, `redis`, `sqlite`
- Redis restore replaces `dump.rdb` and restarts the service automatically.
- SQL Server backup is supported, but restore is not yet available.

## App templates

- `node`
- `node-mean`
- `node-mern`
- `node-t3`
- `node-bun`
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

## Quickstart: .NET

```bash
loom init dotnet --dir my-dotnet
cd my-dotnet
loom start
loom status
loom stop
```

## Quickstart: Rails 7

```bash
loom init rails7 --dir my-rails7
cd my-rails7
loom start
loom status
loom stop
```

`loom init rails7` bootstraps the Rails app into an empty target directory with a one-shot Podman Ruby container. The long-running service also uses a Ruby base image, while Rails 7 itself comes from the bootstrapped project files and Gemfile.

If the target directory already contains an existing Rails project, Loom skips bootstrap and only adds or updates the Loom files.

## Quickstart: Rails 7 + Hotwire

```bash
loom init rails7-hotwire --dir my-rails-hotwire
cd my-rails-hotwire
loom start
loom status
loom stop
```

`loom init rails7-hotwire` bootstraps Rails 7 with the default Hotwire setup intact instead of skipping JavaScript. Like `rails7`, the running container uses a Ruby base image and serves the bootstrapped local Rails app.

## Quickstart: Serverless

```bash
loom init serverless --dir my-serverless
cd my-serverless
loom start
loom status
loom stop
```

`loom init serverless` now gives you a serverless-style local workflow without the `serverless` npm package: a static frontend, backend functions over `/api`, and local invoke scripts for the function handlers.

## Quickstart: JAMstack

```bash
loom init jamstack --dir my-jamstack
cd my-jamstack
loom start
loom status
loom stop
```

This template now follows the modern JAMstack meaning directly: JavaScript in the frontend, API endpoints in a separate service, and markup-first pages served from the web app.

## Quickstart: Serverless

```bash
loom init serverless --dir my-serverless
cd my-serverless
loom start
loom status
loom stop
```

## Quickstart: Spring + React

```bash
loom init spring-react --dir my-spring-react
cd my-spring-react
loom start
loom status
loom stop
```

## Quickstart: Django + React

```bash
loom init django-react --dir my-django-react
cd my-django-react
loom start
loom status
loom stop
```

Template details: [examples/django-react/README.md](examples/django-react/README.md)

Smoke test these templates:

```bash
pnpm smoke:examples
```
