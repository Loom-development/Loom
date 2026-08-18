# SQL Server Template

This template gives you a standalone SQL Server database environment for local development.

## Quickstart

```bash
loom init db-sqlserver --dir my-sqlserver
cd my-sqlserver
loom start
loom status
```

## Service

- `db`
  - Runtime: `${MSSQL_IMAGE:-mcr.microsoft.com/mssql/server:2022-latest}`
  - Port: `1433`

## Route

- None

## Image overrides

- `MSSQL_IMAGE`

## Backup and restore

```bash
loom backup db
```

SQL Server backup is supported. `loom restore` is not yet available for SQL Server because the current backup format is a live `.bak` of `master`, which needs a different restore flow.