<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

function loomWordPressEnv(string $key, string $default = ''): string {
  $value = getenv($key);
  return ($value !== false && $value !== '') ? $value : $default;
}

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME',     loomWordPressEnv('WORDPRESS_DB_NAME',     'wordpress'));

/** Database username */
define('DB_USER',     loomWordPressEnv('WORDPRESS_DB_USER',     'wordpress'));

/** Database password */
define('DB_PASSWORD', loomWordPressEnv('WORDPRESS_DB_PASSWORD', 'wordpress'));

/** Database hostname */
define('DB_HOST',     loomWordPressEnv('WORDPRESS_DB_HOST',     'db:3306'));

/** Database charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The database collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         loomWordPressEnv('WORDPRESS_AUTH_KEY',         'put your unique phrase here'));
define('SECURE_AUTH_KEY',  loomWordPressEnv('WORDPRESS_SECURE_AUTH_KEY',  'put your unique phrase here'));
define('LOGGED_IN_KEY',    loomWordPressEnv('WORDPRESS_LOGGED_IN_KEY',    'put your unique phrase here'));
define('NONCE_KEY',        loomWordPressEnv('WORDPRESS_NONCE_KEY',        'put your unique phrase here'));
define('AUTH_SALT',        loomWordPressEnv('WORDPRESS_AUTH_SALT',        'put your unique phrase here'));
define('SECURE_AUTH_SALT', loomWordPressEnv('WORDPRESS_SECURE_AUTH_SALT', 'put your unique phrase here'));
define('LOGGED_IN_SALT',   loomWordPressEnv('WORDPRESS_LOGGED_IN_SALT',   'put your unique phrase here'));
define('NONCE_SALT',       loomWordPressEnv('WORDPRESS_NONCE_SALT',       'put your unique phrase here'));

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = loomWordPressEnv('WORDPRESS_TABLE_PREFIX', 'wp_');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define('WP_DEBUG', (bool) loomWordPressEnv('WORDPRESS_DEBUG', ''));

/* Add any custom values between this line and the "stop editing" line. */

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
  define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
