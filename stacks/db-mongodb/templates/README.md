# MongoDB Template

This template gives you a standalone MongoDB database environment.

## Quickstart

```bash
loom init db-mongodb --dir my-mongodb
cd my-mongodb
loom start
loom status
```

## Service

- `db`
  - Runtime: `${MONGO_IMAGE:-docker.io/library/mongo:7}`
  - Port: `27017`

## Route

- None

## Image overrides

- `MONGO_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./backup.archive.gz
```