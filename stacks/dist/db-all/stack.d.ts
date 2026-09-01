export declare const dbAllStack: {
    readonly id: "db-all";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-all/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "ELASTICSEARCH_IMAGE";
        readonly reference: "docker.elastic.co/elasticsearch/elasticsearch:8.17.10";
    }, {
        readonly env: "MARIADB_IMAGE";
        readonly reference: "docker.io/library/mariadb:11.8.2";
    }, {
        readonly env: "MONGO_IMAGE";
        readonly reference: "docker.io/library/mongo:7.0.21";
    }, {
        readonly env: "MSSQL_IMAGE";
        readonly reference: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04";
    }, {
        readonly env: "MYSQL_IMAGE";
        readonly reference: "docker.io/library/mysql:8.4.6";
    }, {
        readonly env: "POSTGRES_IMAGE";
        readonly reference: "docker.io/library/postgres:16.9-alpine";
    }, {
        readonly env: "REDIS_IMAGE";
        readonly reference: "docker.io/library/redis:7.4.5-alpine";
    }, {
        readonly env: "SQLITE_IMAGE";
        readonly reference: "docker.io/keinos/sqlite3:3.46.1";
    }];
    readonly install: readonly [];
    readonly start: readonly ["redis-server --appendonly yes", "sh -c \"sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\""];
    readonly readiness: {
        readonly kind: "http";
        readonly value: "http://127.0.0.1:9200/_cluster/health";
        readonly timeoutSeconds: 300;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "mysql";
        readonly command: readonly ["mysql", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"];
    }, {
        readonly service: "sqlserver";
        readonly command: readonly ["/opt/mssql-tools18/bin/sqlcmd", "-S", "127.0.0.1", "-U", "sa", "-P", "LoomDev!Passw0rd", "-C", "-Q", "SELECT 1"];
    }, {
        readonly service: "postgres";
        readonly command: readonly ["psql", "-U", "loom", "-d", "loom", "-c", "SELECT 1"];
    }, {
        readonly service: "mongodb";
        readonly command: readonly ["mongosh", "--quiet", "--host", "127.0.0.1", "--username", "loom", "--password", "loom", "--authenticationDatabase", "admin", "--eval", "quit(db.adminCommand({ ping: 1 }).ok ? 0 : 1)"];
    }, {
        readonly service: "redis";
        readonly command: readonly ["redis-cli", "ping"];
    }, {
        readonly service: "elasticsearch";
        readonly command: readonly ["curl", "--fail", "http://127.0.0.1:9200/_cluster/health"];
    }, {
        readonly service: "sqlite";
        readonly command: readonly ["sqlite3", "/data/loom.db", "select 1;"];
    }, {
        readonly service: "mariadb";
        readonly command: readonly ["mariadb", "-h", "127.0.0.1", "-uloom", "-ploom", "loom", "-e", "SELECT 1"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["x64"];
        readonly runtime: "podman-rootless";
    };
};
