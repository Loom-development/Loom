# All Databases Template

This template gives you a single local project with multiple database services at once.

## Quickstart

```bash
loom init db-all --dir my-databases
cd my-databases
loom start
loom status
```

## Services

- `mysql` on `3306`
- `postgres` on `5432`
- `mongodb` on `27017`
- `redis` on `6379`
- `sqlite` as a local file-backed service
- `sqlserver` on `1433`
- `mariadb` on `3307`
- `elasticsearch` on `9200` and `9300`

## Route

- None

## Image overrides

- `MYSQL_IMAGE=docker.io/library/mysql:8.4.11`
- `POSTGRES_IMAGE=docker.io/library/postgres:16.15-alpine3.24`
- `MONGO_IMAGE=docker.io/library/mongo:7.0.40-jammy`
- `REDIS_IMAGE=docker.io/library/redis:7.4.11-alpine3.21`
- `SQLITE_IMAGE=docker.io/keinos/sqlite3:3.46.1`
- `MSSQL_IMAGE=mcr.microsoft.com/mssql/server:2022-CU26-ubuntu-22.04`
- `MARIADB_IMAGE=docker.io/library/mariadb:11.8.9`
- `ELASTICSEARCH_IMAGE=docker.elastic.co/elasticsearch/elasticsearch:8.19.20`

## Backup and restore

Use the service name you want to target:

```bash
loom backup postgres
loom backup redis
loom restore postgres ./backup.sql
loom restore redis ./dump.rdb
```

Supported restore services in this stack are `mysql`, `postgres`, `mongodb`, `redis`, `sqlite`, and `mariadb`. `sqlserver` backup is supported, but restore is not yet available.
