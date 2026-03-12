# MariaDB Template

This template gives you a standalone MariaDB database environment.

## Quickstart

```bash
loom init db-mariadb --dir my-mariadb
cd my-mariadb
loom start
loom status
```

## Service

- `db`
  - Runtime: `${MARIADB_IMAGE:-mariadb:11}`
  - Port: `3307`

## Route

- None

## Image overrides

- `MARIADB_IMAGE`