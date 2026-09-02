# FastAPI Template

This template gives you a minimal FastAPI application running from local source files.

## Quickstart

```bash
loom init python-fastapi --dir my-fastapi
cd my-fastapi
loom start
loom status
```

## Services

- `app`
  - Runtime: `${PYTHON_IMAGE:-ghcr.io/loom-development/loom-python-3.12@sha256:e31bbfb5c603a8609e6903a9f103c8386a363c5d60fe7690f6a4474e7e847055}`
  - Port: `8003`
  - Purpose: FastAPI development server

## Route

- App: `https://fastapi.loom.local`

## Image overrides

- `PYTHON_IMAGE`
