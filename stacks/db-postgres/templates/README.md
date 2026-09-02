# PostgreSQL Template

This template gives you a standalone PostgreSQL database environment.

## Quickstart

```bash
loom init db-postgres --dir my-postgres
cd my-postgres
loom start
loom status
```

## Service

- `db`
  - Runtime: `${POSTGRES_IMAGE:-docker.io/library/postgres:16.15-alpine3.24}`
  - Port: `5432`

## Route

- None

## Image overrides

- `POSTGRES_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./backup.sql
```
