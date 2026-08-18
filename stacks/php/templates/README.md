# PHP framework examples

Run examples directly with the installed `loom` command.

Tip: `--php-docroot` is optional for `php*` templates during init; if omitted, Loom uses `.`. Use `loom init php --php-docroot <path>` or `loom init php-symfony --php-docroot <path>` to override. For `php-wordpress` and `php-drupal`, this option is ignored.

The default app server for the generic PHP, Drupal, and Symfony templates is Apache with PHP (`php:8.4-apache`).

All PHP templates now include a local Memcached service at `cache:11211` and install the PHP `memcached` extension so frameworks or plugins can opt into persistent object caching without extra container wiring.

## WordPress

- Config: `examples/php/wordpress/loom.yaml`
- `loom init php-wordpress` bootstraps WordPress core into an empty target directory with a one-shot Podman container, then copies the Loom config and `wp-config.php` template.
- If the target directory already contains an existing WordPress project, Loom skips bootstrapping, updates the Loom files, and only adds `wp-config.php` when it is missing.
- The app service uses `php:8.3-apache` and serves WordPress directly from the local project directory mounted at `/var/www/html`.
- The template also includes a Memcached service at `cache:11211`; WordPress still needs a persistent object-cache plugin or drop-in to use it.
- Run: `loom init php-wordpress --dir my-wordpress && cd my-wordpress && loom start`
- Persistent data: `./data/mysql` (DB) and the local project tree for WordPress code, themes, plugins, and uploads

## Drupal

- Config: `examples/php/drupal/loom.yaml`
- `loom init php-drupal` creates a Drupal project in an empty target directory with a Podman Composer container running `composer create-project drupal/recommended-project .`.
- If the target directory already contains an existing Drupal project, Loom skips bootstrapping and only adds or updates the Loom files.
- The Drupal template runs a single `app` service on `php:8.4-apache`, serving Drupal from `/app/web` with Apache's `www-data` user remapped to the host UID:GID.
- The template includes a Memcached service at `cache:11211` and exposes `MEMCACHED_HOST` and `MEMCACHED_PORT` to the app container.
- Run: `loom start --config examples/php/drupal/loom.yaml`
- Persistent data: `./data/mysql` (DB) and `./data/files` (public file uploads)

## Generic PHP

- Config: `examples/php/loom.yaml`
- The generic PHP template runs a single `app` service on `php:8.4-apache`, serving files from the project root with Apache's `www-data` user remapped to the host UID:GID.
- The `app` service installs any missing PHP extension dependencies before starting Apache.
- The template includes a Memcached service at `cache:11211` and exposes `MEMCACHED_HOST` and `MEMCACHED_PORT` to the app container.
- Run: `loom init php --dir my-php && cd my-php && loom start`
- **Adopting an existing project**: run `loom init php --dir <existing-dir>` in a non-empty directory and Loom will only write `loom.yaml` and `.env.example`. Your existing source files are not touched.
- **Switching from another template** (e.g. `php-wordpress` to `php`): run `loom init php --dir <dir>` — Loom adds the plain PHP config without removing your WordPress files. Use `--blank-template` only if you want to wipe the directory and start fresh.

## Symfony

- Config: `examples/php/symfony/loom.yaml`
- The Symfony template runs a single `app` service on `php:8.4-apache`, serving Symfony from `/app/public`.
- The template includes a Memcached service at `cache:11211` and exposes `MEMCACHED_HOST` and `MEMCACHED_PORT` to the app container.
- Run: `loom start --config examples/php/symfony/loom.yaml`
