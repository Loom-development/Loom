export declare const pythonFlaskStack: {
    readonly id: "python-flask";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "python-flask/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "PYTHON_IMAGE";
        readonly reference: "docker.io/library/python:3.12.11-slim";
    }];
    readonly install: readonly ["pip install --user -r requirements.txt"];
    readonly start: readonly ["flask --app app run --host 0.0.0.0 --port 8002"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:8002/health";
        readonly timeoutSeconds: 488;
    };
    readonly hostWrites: readonly ["__pycache__"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8002/health', timeout=2)"];
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
    readonly protectedPaths: readonly ["app.py", "requirements.txt"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
