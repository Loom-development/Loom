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
  - Runtime: `${PHP_IMAGE:-ghcr.io/loom-development/loom-php@sha256:d9f67c2ee13bdc0f17cb836c435acb5787062311ac1843aa3ee4cb7ff11c799d}`
  - Port: `8092`
  - Purpose: Apache + PHP application server serving Symfony from `/app/public`

## Route

- App: `https://symfony.loom.local`

## Image overrides

- `PHP_IMAGE`
