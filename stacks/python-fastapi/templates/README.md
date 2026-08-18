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
  - Runtime: `${PYTHON_IMAGE:-docker.io/library/python:3.12-slim}`
  - Port: `8003`
  - Purpose: FastAPI development server

## Route

- App: `https://fastapi.loom.local`

## Image overrides

- `PYTHON_IMAGE`