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
  - Runtime: `${MYSQL_IMAGE:-mysql:8.4}`
  - Port: `3308`
- `app`
  - Runtime: `${PHP_IMAGE:-dunglas/frankenphp:1-php8.3}`
  - Port: `8091`
  - Purpose: Drupal app server

## Route

- App: `https://drupal.loom.local`

## Image overrides

- `PHP_IMAGE`
- `MYSQL_IMAGE`