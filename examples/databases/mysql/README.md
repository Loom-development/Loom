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
  - Runtime: `${MYSQL_IMAGE:-mysql:8.4}`
  - Port: `3306`

## Route

- None

## Image overrides

- `MYSQL_IMAGE`