<?php
/**
 * WordPress configuration for Loom.
 *
 * Reads settings from environment variables set in loom.yaml / .env.
 * The loomWordPressEnv() helper returns the env var value when set and
 * non-empty, otherwise falls back to the provided default.
 */

function loomWordPressEnv(string $key, string $default = ''): string {
  $value = getenv($key);
  return ($value !== false && $value !== '') ? $value : $default;
}

// ** Database settings ** //
define('DB_NAME',     loomWordPressEnv('WORDPRESS_DB_NAME',     'wordpress'));
define('DB_USER',     loomWordPressEnv('WORDPRESS_DB_USER',     'wordpress'));
define('DB_PASSWORD', loomWordPressEnv('WORDPRESS_DB_PASSWORD', 'wordpress'));
define('DB_HOST',     loomWordPressEnv('WORDPRESS_DB_HOST',     'db:3306'));
define('DB_CHARSET',  'utf8mb4');
define('DB_COLLATE',  '');

// ** Authentication keys and salts ** //
// Generate your own at: https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         loomWordPressEnv('WORDPRESS_AUTH_KEY',         'put your unique phrase here'));
define('SECURE_AUTH_KEY',  loomWordPressEnv('WORDPRESS_SECURE_AUTH_KEY',  'put your unique phrase here'));
define('LOGGED_IN_KEY',    loomWordPressEnv('WORDPRESS_LOGGED_IN_KEY',    'put your unique phrase here'));
define('NONCE_KEY',        loomWordPressEnv('WORDPRESS_NONCE_KEY',        'put your unique phrase here'));
define('AUTH_SALT',        loomWordPressEnv('WORDPRESS_AUTH_SALT',        'put your unique phrase here'));
define('SECURE_AUTH_SALT', loomWordPressEnv('WORDPRESS_SECURE_AUTH_SALT', 'put your unique phrase here'));
define('LOGGED_IN_SALT',   loomWordPressEnv('WORDPRESS_LOGGED_IN_SALT',   'put your unique phrase here'));
define('NONCE_SALT',       loomWordPressEnv('WORDPRESS_NONCE_SALT',       'put your unique phrase here'));

// ** Table prefix ** //
$table_prefix = loomWordPressEnv('WORDPRESS_TABLE_PREFIX', 'wp_');

// ** Debug ** //
define('WP_DEBUG', (bool) loomWordPressEnv('WORDPRESS_DEBUG', ''));

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
  define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
