# Drupal Template

This template gives you a local Drupal setup with PHP and MySQL, served from project files.

## Quickstart

```bash
loom init php-drupal --dir my-drupal
cd my-drupal
loom start
loom status
```

## Services

- `db`
  - Runtime: `${MYSQL_IMAGE:-docker.io/library/mysql:8.4}`
  - Port: `3308`
- `cache`
  - Runtime: `${MEMCACHED_IMAGE:-docker.io/library/memcached:1.6-alpine}`
  - Port: `11212`
- `app`
  - Runtime: `${PHP_IMAGE:-docker.io/dunglas/frankenphp:1-php8.3}`
  - Port: `8091`
  - Purpose: Drupal app server

## Route

- App: `https://drupal.loom.local`

## Image overrides

- `PHP_IMAGE`
- `MEMCACHED_IMAGE`
- `MYSQL_IMAGE`

## File permissions

The container starts as `root` long enough to install any missing PHP extension dependencies, then drops to a host-aligned UID:GID before serving Drupal. That keeps writes under the bind-mounted project directory and `sites/default/files` aligned with the host user on Linux rootless Podman.

The app container exposes `MEMCACHED_HOST=cache` and `MEMCACHED_PORT=11211`, and it installs the PHP `memcached` extension so Drupal modules can use the bundled Memcached service for persistent caching.

`loom exec app -- ...` uses the same host-aligned UID:GID by default.