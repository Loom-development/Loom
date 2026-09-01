export declare const dbRedisStack: {
    readonly id: "db-redis";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-redis/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "REDIS_IMAGE";
        readonly reference: "docker.io/library/redis:7.4.5-alpine";
    }];
    readonly install: readonly [];
    readonly start: readonly ["redis-server --appendonly yes"];
    readonly readiness: {
        readonly kind: "command";
        readonly value: "redis-cli ping | grep PONG";
        readonly timeoutSeconds: 92;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["redis-cli", "ping"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
