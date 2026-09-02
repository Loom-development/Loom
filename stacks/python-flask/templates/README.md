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
  - Runtime: `${PYTHON_IMAGE:-ghcr.io/loom-development/loom-python-3.12@sha256:e31bbfb5c603a8609e6903a9f103c8386a363c5d60fe7690f6a4474e7e847055}`
  - Port: `8002`
  - Purpose: Flask development server

## Route

- App: `https://flask.loom.local`

## Image overrides

- `PYTHON_IMAGE`
