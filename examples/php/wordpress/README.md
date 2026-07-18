# WordPress Template

This template gives you a local WordPress setup with PHP, served from project files. Add a database during init with `--db mysql`.

## Quickstart

```bash
loom init php-wordpress --dir my-wordpress --db mysql
cd my-wordpress
loom start
loom status
```

## Services

- `cache`
  - Runtime: `${MEMCACHED_IMAGE:-docker.io/library/memcached:1.6-alpine}`
  - Internal address: `cache:11211`
- `app`
  - Runtime: `${WORDPRESS_IMAGE:-docker.io/library/wordpress:6-php8.3-apache}`
  - Port: `8090`
  - Purpose: WordPress app server

## Route

- App: `https://wordpress.loom.local`

## Project structure

```
my-wordpress/
├── .env              # environment variables (DB settings, HOST_UID/GID)
├── loom.yaml         # Loom service configuration
├── wp-config.php     # reads DB settings from environment variables
└── wp-content/       # persisted WordPress content
    ├── plugins/      # your custom plugins
    ├── themes/       # your custom themes
    └── uploads/      # media uploads
```

WordPress core files live inside the container image. Only `wp-content/` is bind-mounted from your project directory so plugins, themes, and uploads persist across restarts.

## Database

Pass `--db mysql` during init to add a MySQL database service. Loom generates connection credentials and writes them to `.env`. `wp-config.php` reads those values at runtime via the `loomWordPressEnv()` helper.

```bash
loom init php-wordpress --dir my-site --db mysql
```

## Image overrides

- `WORDPRESS_IMAGE`
- `MEMCACHED_IMAGE`

## File permissions

The container starts as `root`, installs any missing PHP build dependencies, and remaps Apache's `www-data` user to `HOST_UID` and `HOST_GID` before startup so WordPress can write to the bind-mounted project files during updates.

The first `loom start` can take a few minutes because the container may need to compile PHP extensions such as `imagick`, `intl`, and `exif` before Apache becomes healthy.

The Apache process also listens on `8090` and the default virtual host is extended to serve that port inside the container, so WordPress loopback and Site Health REST API checks still work when the site is accessed through `http://localhost:8090`.

The template also starts a Memcached service at `cache:11211` and installs the PHP `memcached` extension. To clear WordPress Site Health's persistent object-cache warning, you still need a WordPress object-cache plugin or drop-in that uses Memcached.

- `HOST_UID` defaults to `1000`
- `HOST_GID` defaults to `1000`

If your Linux user uses different IDs, update those values in `.env` after `loom init`.

`loom exec app -- ...` uses the mapped host-aligned UID:GID by default so ad-hoc commands do not create root-owned files in the project directory.

## WordPress updates

This template configures WordPress with `FS_METHOD=direct` by default, so plugin, theme, and core updates use direct filesystem writes instead of prompting for FTP credentials.

Loom also skips the Composer-on-start check for this template because WordPress does not need Composer to boot.
