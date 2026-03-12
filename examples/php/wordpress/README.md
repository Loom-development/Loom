# WordPress Template

This template gives you a local WordPress setup with PHP and MySQL, served from project files.

## Quickstart

```bash
loom init php-wordpress --dir my-wordpress
cd my-wordpress
loom start
loom status
```

## Services

- `db`
  - Runtime: `${MYSQL_IMAGE:-mysql:8.4}`
  - Port: `3307`
- `app`
  - Runtime: `${PHP_IMAGE:-php:8.3-apache}`
  - Port: `8090`
  - Purpose: WordPress app server

## Route

- App: `https://wordpress.loom.local`

## Image overrides

- `PHP_IMAGE`
- `MYSQL_IMAGE`