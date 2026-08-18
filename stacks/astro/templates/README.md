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
  - Runtime: `${NODE_IMAGE:-docker.io/library/node:24-alpine}`
  - Port: `4321`
  - Purpose: Astro dev server with HMR

## Route

- App: `https://astro.loom.local`

## Image overrides

- `NODE_IMAGE`

## File permissions

The container runs with `userns: keep-id` and `execUser` set to the host UID:GID so `npm install` and Astro's generated files write with host-aligned ownership on Linux rootless Podman.
