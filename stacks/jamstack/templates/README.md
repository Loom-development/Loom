# JAMstack Template

This template models the modern JAMstack idea directly: JavaScript in the frontend, API-driven content, and markup-first pages delivered from a static-first web app.

## Quickstart

```bash
loom init jamstack --dir my-jamstack
cd my-jamstack
loom start
loom status
```

## Services

- `api`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `3006`
  - Purpose: JSON API for frontend content
- `web`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `5174`
  - Purpose: static-first frontend served by Vite

## Route

- Frontend: `https://jamstack.loom.local`
- API proxy: `/api/content`

## Image overrides

- `NODE_IMAGE`

After init, edit `.env` or pass `--image NODE_IMAGE=ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09` during `loom init`.
