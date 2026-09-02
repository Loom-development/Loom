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
  - Runtime: `${PHP_IMAGE:-ghcr.io/loom-development/loom-php@sha256:3c439f1e5f3e06d35059b2331f5fd79a1e21544fd1e512c9a74c2442272ae0ba}`
  - Port: `8091`
  - Purpose: Apache + PHP application server serving Drupal from `/app/web`

## Route

- App: `https://drupal.loom.local`

## Image overrides

- `PHP_IMAGE`

## File permissions

The container starts as `root` and remaps Apache's `www-data` user to `HOST_UID` and `HOST_GID` before startup. That keeps writes under the bind-mounted project directory and `sites/default/files` aligned with the host user on Linux rootless Podman.

`loom exec app -- ...` uses the same host-aligned UID:GID by default.
