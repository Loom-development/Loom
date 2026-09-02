# PHP starter

This project was generated from Loom's versioned `php` stack package. It runs
Apache with PHP and serves the selected document root from the host project.

```bash
loom start
loom status
loom exec app -- php -v
loom stop
```

Pass `--php-docroot <path>` to `loom init php` when the application entrypoint
is not the project root. The generated `.env` exposes the exact default PHP
image tag and may be edited for an explicit runtime override:

- `${PHP_IMAGE:-ghcr.io/loom-development/loom-php@sha256:3c439f1e5f3e06d35059b2331f5fd79a1e21544fd1e512c9a74c2442272ae0ba}`
