# PHP framework examples

Tip: `--php-docroot` is optional for `php*` templates during init; if omitted, Loom uses `.`. Use `loom init php --php-docroot <path>` or `loom init php-symfony --php-docroot <path>` to override. For `php-wordpress` and `php-drupal`, this option is ignored.

## WordPress

- Config: `examples/php/wordpress/loom.yaml`
- Run: `pnpm --filter @loom/cli dev start --config examples/php/wordpress/loom.yaml`
- Persistent data: `./data/mysql` (DB) and `./data/wp-content` (uploads/themes/plugins)

## Drupal

- Config: `examples/php/drupal/loom.yaml`
- Run: `pnpm --filter @loom/cli dev start --config examples/php/drupal/loom.yaml`
- Persistent data: `./data/mysql` (DB) and `./data/files` (public file uploads)

## Symfony

- Config: `examples/php/symfony/loom.yaml`
- Run: `pnpm --filter @loom/cli dev start --config examples/php/symfony/loom.yaml`
