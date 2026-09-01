export declare const dotnetStack: {
    readonly id: "dotnet";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "dotnet/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "DOTNET_IMAGE";
        readonly reference: "mcr.microsoft.com/dotnet/sdk:8.0.412";
    }];
    readonly install: readonly ["dotnet restore"];
    readonly start: readonly ["dotnet run --urls http://0.0.0.0:5000"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:5000/";
        readonly timeoutSeconds: 330;
    };
    readonly hostWrites: readonly ["src/bin", "src/obj"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["wget", "-qO", "/dev/null", "http://127.0.0.1:5000/"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "src/bin";
        readonly category: "build";
    }, {
        readonly path: "src/obj";
        readonly category: "build";
    }];
    readonly protectedPaths: readonly ["src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
