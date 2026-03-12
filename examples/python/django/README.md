# Django Template

This template gives you a minimal Django project running from local source files.

## Quickstart

```bash
loom init python-django --dir my-django
cd my-django
loom start
loom status
```

## Services

- `app`
  - Runtime: `${PYTHON_IMAGE:-python:3.12-slim}`
  - Port: `8001`
  - Purpose: Django development server

## Route

- App: `https://django.loom.local`

## Image overrides

- `PYTHON_IMAGE`