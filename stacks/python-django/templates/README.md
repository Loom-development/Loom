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
  - Runtime: `${PYTHON_IMAGE:-ghcr.io/loom-development/loom-python-3.12@sha256:e31bbfb5c603a8609e6903a9f103c8386a363c5d60fe7690f6a4474e7e847055}`
  - Port: `8001`
  - Purpose: Django development server

## Route

- App: `https://django.loom.local`

## Image overrides

- `PYTHON_IMAGE`
