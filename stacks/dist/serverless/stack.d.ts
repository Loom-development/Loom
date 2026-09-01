export declare const serverlessStack: {
    readonly id: "serverless";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "serverless/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:22.17.1-alpine";
    }];
    readonly install: readonly [];
    readonly start: readonly ["npm run dev:api", "npm run dev:web"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:3008";
        readonly timeoutSeconds: 326;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "api";
        readonly command: readonly ["npm", "run", "invoke:health"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly ["dev-server.js", "handler.js", "web", "web-server.js"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
