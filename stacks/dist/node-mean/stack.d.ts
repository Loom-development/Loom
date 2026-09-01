export declare const nodeMeanStack: {
    readonly id: "node-mean";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "node-mean/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:24.4.1-alpine";
    }];
    readonly install: readonly ["cd api && npm install", "cd web && npm install"];
    readonly start: readonly ["cd api && npm start", "cd web && npm start"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:4200";
        readonly timeoutSeconds: 325;
    };
    readonly hostWrites: readonly ["api/node_modules", "web/node_modules"];
    readonly verification: readonly [{
        readonly service: "web";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:4200').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "api/dist";
        readonly category: "build";
    }, {
        readonly path: "api/node_modules";
        readonly category: "dependency";
    }, {
        readonly path: "web/dist";
        readonly category: "build";
    }, {
        readonly path: "web/node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["api/src", "web/src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
