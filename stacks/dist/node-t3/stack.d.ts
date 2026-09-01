export declare const nodeT3Stack: {
    readonly id: "node-t3";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "node-t3/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:24.4.1-alpine";
    }];
    readonly install: readonly ["corepack enable && pnpm install"];
    readonly start: readonly ["pnpm dev"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:3003";
        readonly timeoutSeconds: 486;
    };
    readonly hostWrites: readonly ["node_modules"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:3003').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: ".next";
        readonly category: "build";
    }, {
        readonly path: "node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["apps", "packages"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
