# Python starter

This project was generated from Loom's versioned `python` stack package. Its
source remains in the host project and is bind-mounted into the runtime.

```bash
loom start
loom status
loom exec app -- python --version
loom stop
```

The exact default runtime is
`${PYTHON_IMAGE:-docker.io/library/python:3.12.14-slim}`. Change `PYTHON_IMAGE`
in `.env` to make an explicit runtime override without editing `loom.yaml`. Use
`python-django`, `python-flask`, or `python-fastapi` when starting one of those
frameworks.
