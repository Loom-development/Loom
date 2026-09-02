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
  - Runtime: `${BUN_IMAGE:-ghcr.io/loom-development/loom-bun-1@sha256:1325194e28cff684e0d7a9ee26085516df897f18f363f4c05dbf4b3bd6b56b6d}`
  - Port: `3004`
  - Purpose: Bun development server

## Route

- App: `https://bun.loom.local`

## Image overrides

- `BUN_IMAGE`
