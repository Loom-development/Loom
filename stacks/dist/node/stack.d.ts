export declare const nodeStack: {
    readonly id: "node";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "node/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:24.4.1-alpine";
    }];
    readonly install: readonly ["npm install"];
    readonly start: readonly ["npm start"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:3000/health";
        readonly timeoutSeconds: 496;
    };
    readonly hostWrites: readonly ["node_modules"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "dist";
        readonly category: "build";
    }, {
        readonly path: "node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
