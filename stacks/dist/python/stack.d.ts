export declare const pythonStack: {
    readonly id: "python";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "python/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "PYTHON_IMAGE";
        readonly reference: "docker.io/library/python:3.12.11-slim";
    }];
    readonly install: readonly [];
    readonly start: readonly ["python -m http.server 8000"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:8000/";
        readonly timeoutSeconds: 366;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/', timeout=2)"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: ".pytest_cache";
        readonly category: "cache";
    }, {
        readonly path: ".venv";
        readonly category: "dependency";
    }, {
        readonly path: "__pycache__";
        readonly category: "cache";
    }];
    readonly protectedPaths: readonly ["index.html"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
