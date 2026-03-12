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
  - Runtime: `${MONGO_IMAGE:-mongo:7}`
  - Port: `27022`
- `api`
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Port: `3002`
  - Purpose: Express.js API
- `web`
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Port: `5173`
  - Purpose: React frontend

## Route

- Frontend: `https://mern.loom.local`

## Image overrides

- `NODE_IMAGE`
- `MONGO_IMAGE`