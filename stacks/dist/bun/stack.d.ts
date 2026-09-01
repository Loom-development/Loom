export declare const bunStack: {
    readonly id: "bun";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "bun/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "BUN_IMAGE";
        readonly reference: "docker.io/oven/bun:1.2.18";
    }];
    readonly install: readonly [];
    readonly start: readonly ["bun run dev"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:3004/";
        readonly timeoutSeconds: 250;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["bun", "-e", "fetch('http://127.0.0.1:3004/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly ["index.ts"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
