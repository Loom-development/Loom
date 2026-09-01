# Drupal Template

This template gives you a local Drupal setup served by Apache with PHP from project files. Add a database during init with `--db mysql`.

## Quickstart

```bash
loom init php-drupal --dir my-drupal --db mysql
cd my-drupal
loom start
loom status
```

## Services

- `app`
  - Runtime: `${PHP_IMAGE:-docker.io/library/php:8.4.10-apache}`
  - Port: `8091`
  - Purpose: Apache + PHP application server serving Drupal from `/app/web`

## Route

- App: `https://drupal.loom.local`

## Image overrides

- `PHP_IMAGE`

## File permissions

The container starts as `root` and remaps Apache's `www-data` user to `HOST_UID` and `HOST_GID` before startup. That keeps writes under the bind-mounted project directory and `sites/default/files` aligned with the host user on Linux rootless Podman.

`loom exec app -- ...` uses the same host-aligned UID:GID by default.
