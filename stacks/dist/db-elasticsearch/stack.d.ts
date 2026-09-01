export declare const dbElasticsearchStack: {
    readonly id: "db-elasticsearch";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-elasticsearch/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "ELASTICSEARCH_IMAGE";
        readonly reference: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:9200/_cluster/health";
        readonly timeoutSeconds: 300;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["curl", "--fail", "http://127.0.0.1:9200/_cluster/health"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["arm64", "x64"];
        readonly runtime: "podman-rootless";
    };
};
