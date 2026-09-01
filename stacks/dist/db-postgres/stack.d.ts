export declare const dbPostgresStack: {
    readonly id: "db-postgres";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-postgres/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "POSTGRES_IMAGE";
        readonly reference: "docker.io/library/postgres:16.9-alpine";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "command";
        readonly value: "pg_isready -U loom";
        readonly timeoutSeconds: 95;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["psql", "-U", "loom", "-d", "loom", "-c", "SELECT 1"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
