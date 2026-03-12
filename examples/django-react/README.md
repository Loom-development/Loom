# Django + React Template

This template gives you a small full-stack project with:

- Django backend service
- React frontend served by Vite
- Local source mounts for both services
- HTTPS route at `https://django-react.loom.local`

## Services

- `backend`
  - Runtime: `${PYTHON_IMAGE:-python:3.12-slim}`
  - Working directory: `/workspace/backend`
  - Port: `8001`
  - Starts Django with `python manage.py runserver 0.0.0.0:8001`

- `web`
  - Runtime: `${NODE_IMAGE:-node:24-alpine}`
  - Working directory: `/workspace/frontend`
  - Port: `5176`
  - Starts Vite with `npm run dev -- --host 0.0.0.0 --port 5176`

## Route

- Frontend: `https://django-react.loom.local`
- Backend health: `http://127.0.0.1:8001/health`
- Backend API through frontend proxy: `/api/health`, `/api/todos`

## Project layout

- `backend/` — Django app and settings
- `frontend/` — React app with Vite dev server
- `loom.yaml` — Loom service and route definition
- `.env.example` — runtime image defaults

## Quickstart

```bash
loom init django-react --dir my-django-react
cd my-django-react
loom start
loom status
```

## Image overrides

`loom init` copies `.env.example` to `.env`, so you can switch runtime versions without editing `loom.yaml`.

```bash
# Python runtime
PYTHON_IMAGE=python:3.12-slim

# Node runtime
NODE_IMAGE=node:24-alpine
```

You can also choose these during init interactively or pass them directly:

```bash
loom init django-react --image PYTHON_IMAGE=python:3.13-slim --image NODE_IMAGE=node:22-alpine
```