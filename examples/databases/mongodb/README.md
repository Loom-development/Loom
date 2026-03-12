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
  - Runtime: `${MONGO_IMAGE:-mongo:7}`
  - Port: `27017`

## Route

- None

## Image overrides

- `MONGO_IMAGE`