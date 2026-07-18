# Bun Template

This template gives you a Bun-based application workflow as a Node.js alternative, with Bun's built-in server handling both HTML and JSON endpoints.

## Quickstart

```bash
loom init bun --dir my-bun
cd my-bun
loom start
loom status
```

## Services

- `app`
  - Runtime: `${BUN_IMAGE:-docker.io/oven/bun:1.2}`
  - Port: `3004`
  - Purpose: Bun development server

## Route

- App: `https://bun.loom.local`

## Image overrides

- `BUN_IMAGE`