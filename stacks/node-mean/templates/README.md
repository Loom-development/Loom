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
  - Runtime: `${NODE_IMAGE:-docker.io/library/node:24.20.0-alpine}`
  - Port: `3001`
  - Purpose: Express.js API
- `web`
  - Runtime: `${NODE_IMAGE:-docker.io/library/node:24.20.0-alpine}`
  - Port: `4200`
  - Purpose: Angular frontend served by Angular CLI with `/api` proxying to the backend

## Route

- Frontend: `https://mean.loom.local`

## Image overrides

- `NODE_IMAGE`
