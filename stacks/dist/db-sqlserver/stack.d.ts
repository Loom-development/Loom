export declare const dbSqlserverStack: {
    readonly id: "db-sqlserver";
    readonly definitionVersion: 2;
    readonly legacyScaffoldVersions: readonly ["1", "2"];
    readonly assetPath: "db-sqlserver/templates";
    readonly scaffoldVersion: "2";
    readonly generator: {
        readonly kind: "none";
    };
    readonly runtimeImages: readonly [{
        readonly env: "MSSQL_IMAGE";
        readonly reference: "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04";
    }];
    readonly install: readonly [];
    readonly start: readonly [];
    readonly readiness: {
        readonly kind: "port";
        readonly value: "127.0.0.1:1433";
        readonly timeoutSeconds: 300;
    };
    readonly hostWrites: readonly [];
    readonly verification: readonly [{
        readonly service: "db";
        readonly command: readonly ["/opt/mssql-tools18/bin/sqlcmd", "-S", "127.0.0.1", "-U", "sa", "-P", "LoomDev!Passw0rd", "-C", "-Q", "SELECT 1"];
    }];
    readonly loomOwnedFiles: readonly [".env.example", "loom.yaml"];
    readonly generatedPaths: readonly [];
    readonly protectedPaths: readonly [];
    readonly compatibility: {
        readonly architectures: readonly ["x64"];
        readonly runtime: "podman-rootless";
    };
};
