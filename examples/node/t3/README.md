# T3 Template

This template gives you a T3-style full-stack setup with Next.js, TypeScript, and PostgreSQL.

## Quickstart

```bash
loom init node-t3 --dir my-t3
cd my-t3
loom start
loom status
```

## Services

- `db`
  - Runtime: `${POSTGRES_IMAGE:-postgres:16-alpine}`
  - Port: `5434`
- `app`
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Port: `3003`
  - Purpose: Next.js app server

## Route

- App: `https://t3.loom.local`

## Image overrides

- `NODE_IMAGE`
- `POSTGRES_IMAGE`