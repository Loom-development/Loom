export declare const astroStack: {
    readonly id: "astro";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "astro/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:24.4.1-alpine";
    }];
    readonly install: readonly ["npm install"];
    readonly start: readonly ["npx astro dev --host 0.0.0.0 --port 4321"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:4321";
        readonly timeoutSeconds: 495;
    };
    readonly hostWrites: readonly ["node_modules"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:4321').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "dist";
        readonly category: "build";
    }, {
        readonly path: "node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["public", "src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
