export declare const dbMongodbStack: {
    readonly id: "db-mongodb";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-mongodb/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "MONGO_IMAGE";
        readonly reference: "docker.io/library/mongo:7.0.21";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:27017";
        readonly timeoutSeconds: 120;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["mongosh", "--quiet", "--host", "127.0.0.1", "--username", "loom", "--password", "loom", "--authenticationDatabase", "admin", "--eval", "quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
