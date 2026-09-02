# MERN Template

This template includes MongoDB, an Express.js API, a React frontend, and the Node.js runtime.

## Quickstart

```bash
loom init node-mern --dir my-mern
cd my-mern
loom start
loom status
```

## Services

- `mongo`
  - Port: `27022`
- `api`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `3002`
  - Purpose: Express.js API
- `web`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `5173`
  - Purpose: React frontend

## Route

- Frontend: `https://mern.loom.local`

## Image overrides

- `NODE_IMAGE`
