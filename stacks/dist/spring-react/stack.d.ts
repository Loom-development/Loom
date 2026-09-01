export declare const springReactStack: {
    readonly id: "spring-react";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "spring-react/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "JAVA_IMAGE";
        readonly reference: "docker.io/library/maven:3.9.11-eclipse-temurin-21";
    }, {
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:22.17.1-alpine";
    }];
    readonly install: readonly ["cd frontend && npm install"];
    readonly start: readonly ["cd backend && mvn spring-boot:run -Dspring-boot.run.jvmArguments=\"-Dserver.address=0.0.0.0 -Dserver.port=8080\"", "cd frontend && npm run build", "cd frontend && npm run serve"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:5175";
        readonly timeoutSeconds: 410;
    };
    readonly hostWrites: readonly ["backend/target", "frontend/dist", "frontend/node_modules"];
    readonly verification: readonly [{
        readonly service: "web";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:5175').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "backend/target";
        readonly category: "build";
    }, {
        readonly path: "frontend/dist";
        readonly category: "build";
    }, {
        readonly path: "frontend/node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["backend/src", "frontend/src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
