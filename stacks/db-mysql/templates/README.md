# MySQL Template

This template gives you a standalone MySQL database environment.

## Quickstart

```bash
loom init db-mysql --dir my-mysql
cd my-mysql
loom start
loom status
```

## Service

- `db`
  - Runtime: `${MYSQL_IMAGE:-ghcr.io/loom-development/mysql-8.4@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb}`
  - Port: `3306`

## Route

- None

## Image overrides

- `MYSQL_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./backup.sql
```
