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
  - Runtime: `${MARIADB_IMAGE:-ghcr.io/loom-development/mariadb-11.8@sha256:2439dcd7d14010ecd1ff7a4e1c5abe8e208c34fe35290744deeeaac3569043c3}`
  - Port: `3307`

## Route

- None

## Image overrides

- `MARIADB_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./backup.sql
```
