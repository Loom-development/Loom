# PHP framework examples

Run examples directly with the installed `loom` command.

Tip: `--php-docroot` is optional for `php*` templates during init; if omitted, Loom uses `.`. Use `loom init php --php-docroot <path>` or `loom init php-symfony --php-docroot <path>` to override. For `php-wordpress` and `php-drupal`, this option is ignored.

The default app server for the generic PHP, Drupal, and Symfony templates is FrankenPHP.

## WordPress

- Config: `examples/php/wordpress/loom.yaml`
- `loom init php-wordpress` bootstraps WordPress core into an empty target directory with a one-shot Podman container, then copies the Loom config and `wp-config.php` template.
- If the target directory already contains an existing WordPress project, Loom skips bootstrapping, updates the Loom files, and only adds `wp-config.php` when it is missing.
- The app service uses `php:8.3-apache` and serves WordPress directly from the local project directory mounted at `/var/www/html`.
- Run: `loom init php-wordpress --dir my-wordpress && cd my-wordpress && loom start`
- Persistent data: `./data/mysql` (DB) and the local project tree for WordPress code, themes, plugins, and uploads

## Drupal

- Config: `examples/php/drupal/loom.yaml`
- `loom init php-drupal` creates a Drupal project in an empty target directory with a Podman Composer container running `composer create-project drupal/recommended-project .`.
- If the target directory already contains an existing Drupal project, Loom skips bootstrapping and only adds or updates the Loom files.
- Run: `loom start --config examples/php/drupal/loom.yaml`
- Persistent data: `./data/mysql` (DB) and `./data/files` (public file uploads)

## Symfony

- Config: `examples/php/symfony/loom.yaml`
- Run: `loom start --config examples/php/symfony/loom.yaml`
