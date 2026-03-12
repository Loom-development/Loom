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

- `MYSQL_IMAGE`
- `POSTGRES_IMAGE`
- `MONGO_IMAGE`
- `REDIS_IMAGE`
- `SQLITE_IMAGE`
- `MSSQL_IMAGE`
- `MARIADB_IMAGE`
- `ELASTICSEARCH_IMAGE`