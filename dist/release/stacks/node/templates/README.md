# Node starter

This project was generated from Loom's versioned `node` stack package. Its
application source and lockfile belong to you; Loom owns only the paths listed
in `.loom/manifest.json`.

```bash
loom start
loom status
loom test
loom stop
```

The app serves its health endpoint at `/health`. Its exact default runtime is
`${NODE_IMAGE:-docker.io/library/node:24.4.1-alpine}`. Change `NODE_IMAGE` in
`.env` to make an explicit runtime override without editing `loom.yaml`.
