# Drupal Template

This template gives you a local Drupal setup with nginx and PHP-FPM, served from project files. Add a database during init with `--db mysql`.

## Quickstart

```bash
loom init php-drupal --dir my-drupal --db mysql
cd my-drupal
loom start
loom status
```

## Services

- `cache`
  - Runtime: `${MEMCACHED_IMAGE:-docker.io/library/memcached:1.6-alpine}`
  - Internal address: `cache:11211`
- `app`
  - Runtime: `${PHP_IMAGE:-docker.io/library/php:8.3-fpm-alpine}`
  - Purpose: PHP-FPM application server
- `web`
  - Runtime: `${NGINX_IMAGE:-docker.io/library/nginx:alpine}`
  - Port: `8091`
  - Purpose: Nginx web server

## Route

- App: `https://drupal.loom.local`

## Image overrides

- `PHP_IMAGE`
- `NGINX_IMAGE`
- `MEMCACHED_IMAGE`

## File permissions

The PHP-FPM container runs as the host-aligned UID:GID configured in php-fpm's www pool. That keeps writes under the bind-mounted project directory and `sites/default/files` aligned with the host user on Linux rootless Podman.

The app container exposes `MEMCACHED_HOST=cache` and `MEMCACHED_PORT=11211`, and it installs the PHP `memcached` extension so Drupal modules can use the bundled Memcached service for persistent caching.

`loom exec app -- ...` uses the same host-aligned UID:GID by default.
