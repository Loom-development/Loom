export declare const djangoReactStack: {
    readonly id: "django-react";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "django-react/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "NODE_IMAGE";
        readonly reference: "docker.io/library/node:24.4.1-alpine";
    }, {
        readonly env: "PYTHON_IMAGE";
        readonly reference: "docker.io/library/python:3.12.11-slim";
    }];
    readonly install: readonly ["cd backend && pip install --disable-pip-version-check --user -r requirements.txt", "cd frontend && npm install --no-audit --no-fund"];
    readonly start: readonly ["cd backend && python manage.py migrate --noinput", "cd backend && python manage.py runserver 0.0.0.0:8001", "cd frontend && npm run dev -- --host 0.0.0.0 --port 5176"];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:5176";
        readonly timeoutSeconds: 485;
    };
    readonly hostWrites: readonly ["backend/db.sqlite3", "backend/project/__pycache__", "frontend/node_modules", "frontend/package-lock.json"];
    readonly verification: readonly [{
        readonly service: "web";
        readonly command: readonly ["node", "-e", "fetch('http://127.0.0.1:5176').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "backend/.pytest_cache";
        readonly category: "cache";
    }, {
        readonly path: "backend/.venv";
        readonly category: "dependency";
    }, {
        readonly path: "frontend/dist";
        readonly category: "build";
    }, {
        readonly path: "frontend/node_modules";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["backend/project", "frontend/src"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
