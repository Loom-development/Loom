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