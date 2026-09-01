export declare const phpStack: {
    readonly id: "php";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "php/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "PHP_IMAGE";
        readonly reference: "docker.io/library/php:8.4.10-apache";
    }];
    readonly install: readonly [];
    readonly start: readonly ["apache2-foreground"];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:80";
        readonly timeoutSeconds: 90;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["php", "-r", "exit((int)!@fsockopen('127.0.0.1', 80));"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "vendor";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["index.php"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
