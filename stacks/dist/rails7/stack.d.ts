export declare const rails7Stack: {
    readonly id: "rails7";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["2", "rails-7.1.5"];
    readonly assetPath: "rails7/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "command";
        readonly image: "docker.io/library/ruby:3.3.8";
        readonly package: "rails";
        readonly version: "7.1.5";
        readonly command: readonly ["sh", "-c", "gem install bundler -v 2.6.9 --no-document && gem install {package} -v {version} --no-document && /usr/local/bundle/bin/rails _{version}_ new . --skip-javascript --skip-test --skip-system-test"];
        readonly execution: {
            readonly kind: "container";
            readonly context: "Rails 7 project with Podman";
            readonly mountTarget: "/workspace";
            readonly workdir: "/workspace";
            readonly environment: readonly [];
        };
    };
    readonly runtimeImages: readonly [{
        readonly env: "RUBY_IMAGE";
        readonly reference: "docker.io/library/ruby:3.3.8";
    }];
    readonly install: readonly ["bundle install"];
    readonly start: readonly ["bin/rails server -b 0.0.0.0 -p 3006"];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:3006";
        readonly timeoutSeconds: 610;
    };
    readonly hostWrites: readonly ["log", "tmp", "vendor/bundle"];
    readonly verification: readonly [{
        readonly service: "app";
        readonly command: readonly ["ruby", "-rsocket", "-e", "TCPSocket.new('127.0.0.1', 3006).close"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [{
        readonly path: "log";
        readonly category: "cache";
    }, {
        readonly path: "tmp";
        readonly category: "cache";
    }, {
        readonly path: "vendor/bundle";
        readonly category: "dependency";
    }];
    readonly protectedPaths: readonly ["app", "config", "db", "lib"];
    readonly compatibility: {
        readonly architectures: readonly ["arm", "arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
