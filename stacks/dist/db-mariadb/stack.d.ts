export declare const dbMariadbStack: {
    readonly id: "db-mariadb";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-mariadb/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "MARIADB_IMAGE";
        readonly reference: "docker.io/library/mariadb:11.8.2";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "command";
        readonly value: "mariadb-admin ping -h 127.0.0.1 -uroot -ploomroot";
        readonly timeoutSeconds: 100;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["mariadb", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
