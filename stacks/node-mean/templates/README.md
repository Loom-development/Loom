# MEAN Template

This template includes MongoDB, an Express.js API, a modern Angular frontend, and the Node.js runtime.

## Quickstart

```bash
loom init node-mean --dir my-mean
cd my-mean
loom start
loom status
```

## Services

- `mongo`
  - Port: `27021`
- `api`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `3001`
  - Purpose: Express.js API
- `web`
  - Runtime: `${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:091606f63d156c9409ef965dad329283070768baa0033c88bcb776c0bc4cba09}`
  - Port: `4200`
  - Purpose: Angular frontend served by Angular CLI with `/api` proxying to the backend

## Route

- Frontend: `https://mean.loom.local`

## Image overrides

- `NODE_IMAGE`
