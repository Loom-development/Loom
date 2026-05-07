# Redis Template

This template gives you a standalone Redis environment with persistence enabled.

## Quickstart

```bash
loom init db-redis --dir my-redis
cd my-redis
loom start
loom status
```

## Service

- `db`
  - Runtime: `${REDIS_IMAGE:-docker.io/library/redis:7-alpine}`
  - Port: `6379`

## Route

- None

## Image overrides

- `REDIS_IMAGE`

## Backup and restore

```bash
loom backup db
loom restore db ./dump.rdb
```

`loom restore` stops Redis, replaces `dump.rdb`, and starts the service again automatically.