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
  - Runtime: `${REDIS_IMAGE:-redis:7-alpine}`
  - Port: `6379`

## Route

- None

## Image overrides

- `REDIS_IMAGE`