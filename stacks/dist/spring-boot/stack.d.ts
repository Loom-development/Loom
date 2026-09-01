export declare const springBootStack: {
    readonly id: "spring-boot";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "spring-boot/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "JAVA_IMAGE";
        readonly reference: "docker.io/library/maven:3.9.11-eclipse-temurin-21";
    }];
    readonly install: readonly [];
    readonly start: readonly ["mvn spring-boot:run -Dspring-boot.run.jvmArguments=\"-Dserver.address=0.0.0.0 -Dserver.port=8080\""];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:8080/api/health";
        readonly timeoutSeconds: 630;
    };
    readonly hostWrites: readonly ["target"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["wget", "-q", "-O-", "http://127.0.0.1:8080/api/health"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "target";
        readonly category: "build";
    }];
    readonly protectedPaths: readonly ["src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
