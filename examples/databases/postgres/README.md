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
  - Runtime: `${POSTGRES_IMAGE:-postgres:16-alpine}`
  - Port: `5432`

## Route

- None

## Image overrides

- `POSTGRES_IMAGE`