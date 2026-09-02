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
`${PYTHON_IMAGE:-ghcr.io/loom-development/loom-python-3.12@sha256:e31bbfb5c603a8609e6903a9f103c8386a363c5d60fe7690f6a4474e7e847055}`. Change `PYTHON_IMAGE`
in `.env` to make an explicit runtime override without editing `loom.yaml`. Use
`python-django`, `python-flask`, or `python-fastapi` when starting one of those
frameworks.
