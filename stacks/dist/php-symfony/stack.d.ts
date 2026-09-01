export declare const phpSymfonyStack: {
    readonly id: "php-symfony";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["2", "unversioned"];
    readonly assetPath: "php-symfony/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "command";
        readonly image: "docker.io/library/composer:2.8.10";
        readonly package: "symfony/skeleton";
        readonly version: "7.3.99";
        readonly command: readonly ["sh", "-c", "composer create-project {package}:{version} . && composer require symfony/webapp-pack:1.3.0"];
        readonly execution: {
            readonly kind: "container";
            readonly context: "Symfony project with Podman Composer";
            readonly mountTarget: "/app";
            readonly workdir: "/app";
            readonly environment: readonly [{
                readonly name: "HOME";
                readonly value: "/tmp";
            }];
        };
    };
    readonly runtimeImages: readonly [{
        readonly env: "PHP_IMAGE";
        readonly reference: "docker.io/serversideup/php:8.4-fpm-apache@sha256:f21734838459f3c8c9e751e9d2cf20e5ee40fddf2153d16806fe1fcd6ebd49c5";
    }];
    readonly install: readonly [];
    readonly start: readonly ["apache2-foreground"];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:80";
        readonly timeoutSeconds: 90;
    };
    readonly hostWrites: readonly ["var/cache"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["php", "bin/console", "about"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "var/cache";
        readonly category: "cache";
    }, {
        readonly path: "vendor";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["config", "public", "src", "templates"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
