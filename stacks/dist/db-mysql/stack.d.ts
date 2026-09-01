export declare const dbMysqlStack: {
    readonly id: "db-mysql";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-mysql/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "MYSQL_IMAGE";
        readonly reference: "docker.io/library/mysql:8.4.6";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "command";
        readonly value: "mysqladmin ping -h 127.0.0.1 -uroot -ploomroot";
        readonly timeoutSeconds: 100;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["mysql", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
