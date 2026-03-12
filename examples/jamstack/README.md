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
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Port: `3006`
  - Purpose: JSON API for frontend content
- `web`
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Port: `5174`
  - Purpose: static-first frontend served by Vite

## Route

- Frontend: `https://jamstack.loom.local`
- API proxy: `/api/content`

## Image overrides

- `NODE_IMAGE`

After init, edit `.env` or pass `--image NODE_IMAGE=node:22-alpine` during `loom init`.