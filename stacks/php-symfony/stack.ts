import { defineStack } from "../definition.js";
import { generatorPins, runtimeImagePins } from "../pins.js";

export const phpSymfonyStack = defineStack({
  id: "php-symfony", definitionVersion: 2, legacyScaffoldVersions: ["unversioned"], assetPath: "php-symfony/templates", scaffoldVersion: "2",
  generator: {
    kind: "command", image: generatorPins.composerImage, package: "symfony/skeleton", version: generatorPins.symfonySkeleton,
    command: ["sh", "-c", `composer create-project {package}:{version} . && composer require symfony/webapp-pack:${generatorPins.symfonyWebappPack}`]
  },
  runtimeImages: [
    { env: "MEMCACHED_IMAGE", reference: runtimeImagePins.memcached16Alpine },
    { env: "PHP_IMAGE", reference: runtimeImagePins.php84Apache }
  ],
  install: [
    "apt-get update",
    "apt-get install -y --no-install-recommends imagemagick libicu-dev libmagickwand-dev libmemcached-dev libsasl2-dev libzip-dev libpq-dev libsqlite3-dev libmariadb-dev pkg-config util-linux zlib1g-dev",
    "docker-php-ext-install -j\"$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || echo 1)\" mysqli pdo_mysql pdo_pgsql pgsql pdo_sqlite intl zip exif",
    "printf '\\n' | pecl install imagick", "printf '\\n' | pecl install memcached",
    "docker-php-ext-enable imagick", "docker-php-ext-enable memcached"
  ],
  start: ["apache2-foreground"], readiness: { kind: "port", value: "127.0.0.1:80", timeoutSeconds: 360 },
  hostWrites: ["var/cache"], verification: [{ service: "app", command: ["php", "bin/console", "about"] }],
  loomOwnedFiles: [".env.example", "loom.yaml"], generatedPaths: [{ path: "var/cache", category: "cache" }, { path: "vendor", category: "dependency" }],
  protectedPaths: ["config", "public", "src", "templates"], compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
