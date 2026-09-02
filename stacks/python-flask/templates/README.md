# Flask Template

This template gives you a minimal Flask application running from local source files.

## Quickstart

```bash
loom init python-flask --dir my-flask
cd my-flask
loom start
loom status
```

## Services

- `app`
  - Runtime: `${PYTHON_IMAGE:-ghcr.io/loom-development/loom-python-3.12@sha256:dfc56d79d2e1ec7552b172f58bab8468929cf80dca40a33078654bc5fb8d9a94}`
  - Port: `8002`
  - Purpose: Flask development server

## Route

- App: `https://flask.loom.local`

## Image overrides

- `PYTHON_IMAGE`
