export declare const dbSqliteStack: {
    readonly id: "db-sqlite";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-sqlite/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "SQLITE_IMAGE";
        readonly reference: "docker.io/keinos/sqlite3:3.46.1";
    }];
    readonly install: readonly [];
    readonly start: readonly ["sh -c \"sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\""];
    readonly readiness: {
        readonly kind: "command";
        readonly value: "sqlite3 /data/loom.db 'select 1;'";
        readonly timeoutSeconds: 60;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["sqlite3", "/data/loom.db", "select 1;"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
