# Symfony Template

This template gives you a Symfony application served by Apache with PHP from local project files.

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
  - Runtime: `${PHP_IMAGE:-docker.io/serversideup/php:8.4-fpm-apache@sha256:f21734838459f3c8c9e751e9d2cf20e5ee40fddf2153d16806fe1fcd6ebd49c5}`
  - Port: `8092`
  - Purpose: Apache + PHP application server serving Symfony from `/app/public`

## Route

- App: `https://symfony.loom.local`

## Image overrides

- `PHP_IMAGE`
