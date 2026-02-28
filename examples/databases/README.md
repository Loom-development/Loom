# Loom Database Templates

Use these with `loom init <template>`:

- `db-mysql`
- `db-sqlserver`
- `db-postgres`
- `db-mongodb`
- `db-redis`
- `db-elasticsearch`
- `db-sqlite`
- `db-mariadb`
- `db-all` (all supported databases in one stack)

Example:

```bash
loom init db-postgres --dir my-postgres
cd my-postgres
loom start
```

Credential handling:

- Database templates include `.env.example` with local-development credentials and connection URLs.
- `loom init <template>` auto-creates `.env` from `.env.example` when `.env` is missing.
- Running `loom init db-*` in a project root creates/uses `./db` by default (unless `--dir` is provided).
- `loom init db-*` also generates unique per-project DB credentials (user/password/db name) and matching connection URLs in `.env`, and updates `loom.yaml` to match.
- Database data is persisted under project-local `./data/*` directories (for `db-all`: `./data/mysql`, `./data/postgres`, `./data/mongodb`, etc.).
- `.env` is git-ignored by default; commit only `.env.example`.
