# Loom Examples Matrix (User Guide)

Use this page to pick a template quickly and run it with the installed `loom` command.

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
- `dotnet` (alias: `stack-dotnet`)
- `rails7` (alias: `stack-rails7`)
- `jamstack` (alias: `stack-jamstack`)
- `serverless` (alias: `stack-serverless`)
- `spring-react` (alias: `stack-spring-react`)

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
