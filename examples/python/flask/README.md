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
  - Runtime: `${PYTHON_IMAGE:-python:3.12-slim}`
  - Port: `8002`
  - Purpose: Flask development server

## Route

- App: `https://flask.loom.local`

## Image overrides

- `PYTHON_IMAGE`