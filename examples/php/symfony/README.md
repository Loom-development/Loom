# Symfony Template

This template gives you a Symfony application served by FrankenPHP from local project files.

## Quickstart

```bash
loom init php-symfony --dir my-symfony
cd my-symfony
loom start
loom status
```

`loom init php-symfony` now bootstraps a real Symfony project into an empty directory with a one-shot Podman Composer container. If the target already contains an existing Symfony project, Loom skips bootstrap and only adds or updates the Loom files.

## Services

- `cache`
  - Runtime: `${MEMCACHED_IMAGE:-docker.io/library/memcached:1.6-alpine}`
  - Port: `11213`
- `app`
  - Runtime: `${PHP_IMAGE:-docker.io/dunglas/frankenphp:1-php8.3}`
  - Port: `8092`
  - Purpose: Symfony app server

## Route

- App: `https://symfony.loom.local`

## Image overrides

- `PHP_IMAGE`
- `MEMCACHED_IMAGE`

## Cache

The app container exposes `MEMCACHED_HOST=cache` and `MEMCACHED_PORT=11211`, and it installs the PHP `memcached` extension so Symfony apps can opt into the bundled Memcached service.