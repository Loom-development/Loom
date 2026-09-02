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
  - Port: `5434`
- `app`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `3003`
  - Purpose: Next.js app server

## Route

- App: `https://t3.loom.local`

## Image overrides

- `NODE_IMAGE`
