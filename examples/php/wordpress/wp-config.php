<?php
declare(strict_types=1);

function loomWordPressEnv(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

define('DB_NAME', loomWordPressEnv('WORDPRESS_DB_NAME', 'wordpress'));
define('DB_USER', loomWordPressEnv('WORDPRESS_DB_USER', 'wordpress'));
define('DB_PASSWORD', loomWordPressEnv('WORDPRESS_DB_PASSWORD', 'wordpress'));
define('DB_HOST', loomWordPressEnv('WORDPRESS_DB_HOST', 'db:3306'));
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');

define('AUTH_KEY', loomWordPressEnv('WORDPRESS_AUTH_KEY', 'loom-auth-key'));
define('SECURE_AUTH_KEY', loomWordPressEnv('WORDPRESS_SECURE_AUTH_KEY', 'loom-secure-auth-key'));
define('LOGGED_IN_KEY', loomWordPressEnv('WORDPRESS_LOGGED_IN_KEY', 'loom-logged-in-key'));
define('NONCE_KEY', loomWordPressEnv('WORDPRESS_NONCE_KEY', 'loom-nonce-key'));
define('AUTH_SALT', loomWordPressEnv('WORDPRESS_AUTH_SALT', 'loom-auth-salt'));
define('SECURE_AUTH_SALT', loomWordPressEnv('WORDPRESS_SECURE_AUTH_SALT', 'loom-secure-auth-salt'));
define('LOGGED_IN_SALT', loomWordPressEnv('WORDPRESS_LOGGED_IN_SALT', 'loom-logged-in-salt'));
define('NONCE_SALT', loomWordPressEnv('WORDPRESS_NONCE_SALT', 'loom-nonce-salt'));

$table_prefix = loomWordPressEnv('WORDPRESS_TABLE_PREFIX', 'wp_');

define('WP_DEBUG', loomWordPressEnv('WORDPRESS_DEBUG', '') !== '');
define('FS_METHOD', loomWordPressEnv('WORDPRESS_FS_METHOD', 'direct'));

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';