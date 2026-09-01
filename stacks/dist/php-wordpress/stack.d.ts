export declare const phpWordpressStack: {
    readonly id: "php-wordpress";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["2", "wordpress-6-php8.3-apache"];
    readonly assetPath: "php-wordpress/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "command";
        readonly image: "docker.io/library/wordpress:6.8.2-php8.3-apache";
        readonly package: "wordpress";
        readonly version: "6.8.2";
        readonly command: readonly ["sh", "-c", "cp -a /usr/src/wordpress/. /app/"];
        readonly execution: {
            readonly kind: "container";
            readonly context: "WordPress project with Podman";
            readonly mountTarget: "/app";
            readonly environment: readonly [];
        };
    };
    readonly runtimeImages: readonly [{
        readonly env: "WORDPRESS_IMAGE";
        readonly reference: "docker.io/library/wordpress:6.8.2-php8.3-apache";
    }];
    readonly install: readonly [];
    readonly start: readonly ["docker-entrypoint.sh apache2-foreground"];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:80";
        readonly timeoutSeconds: 90;
    };
    readonly hostWrites: readonly ["wp-content"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["php", "-r", "exit((int)!@fsockopen('127.0.0.1', 80));"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml", "wp-config.php"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly ["wp-content"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
