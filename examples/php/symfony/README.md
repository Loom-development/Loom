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

- `app`
  - Runtime: `${PHP_IMAGE:-dunglas/frankenphp:1-php8.3}`
  - Port: `8092`
  - Purpose: Symfony app server

## Route

- App: `https://symfony.loom.local`

## Image overrides

- `PHP_IMAGE`