# Astro Template

This template gives you an Astro site running on Node.js, served from local project files.

## Quickstart

```bash
loom init astro --dir my-site
cd my-site
loom start
loom status
```

## Services

- `app`
  - Runtime: `${NODE_IMAGE:-docker.io/library/node:24.20.0-alpine}`
  - Port: `4321`
  - Purpose: Astro dev server with HMR

## Route

- App: `https://astro.loom.local`

## Image overrides

- `NODE_IMAGE`

## File permissions

The container runs directly as the host UID:GID with `userns: keep-id` so `npm install` and Astro's generated files keep host-aligned ownership on Linux rootless Podman.
