# PHP starter

This project was generated from Loom's versioned `php` stack package. It runs
Apache with PHP, includes Memcached at `cache:11211`, and serves the selected
document root from the host project.

```bash
loom start
loom status
loom exec app -- php -v
loom stop
```

Pass `--php-docroot <path>` to `loom init php` when the application entrypoint
is not the project root. The generated `.env` exposes the exact default PHP and
Memcached image tags and may be edited for an explicit runtime override:

- `${PHP_IMAGE:-docker.io/library/php:8.4.10-apache}`
- `${MEMCACHED_IMAGE:-docker.io/library/memcached:1.6.39-alpine}`
