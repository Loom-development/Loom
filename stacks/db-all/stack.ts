import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

const sqliteStart = "sh -c \"apk add --no-cache sqlite && sqlite3 /data/loom.db 'select 1;' && tail -f /dev/null\"";

export const dbAllStack = defineStack({
  id: "db-all", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "db-all/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [
    { env: "ELASTICSEARCH_IMAGE", reference: runtimeImagePins.elasticsearch817 },
    { env: "MARIADB_IMAGE", reference: runtimeImagePins.mariadb118 },
    { env: "MONGO_IMAGE", reference: runtimeImagePins.mongo70 },
    { env: "MSSQL_IMAGE", reference: runtimeImagePins.mssql2022 },
    { env: "MYSQL_IMAGE", reference: runtimeImagePins.mysql84 },
    { env: "POSTGRES_IMAGE", reference: runtimeImagePins.postgres16Alpine },
    { env: "REDIS_IMAGE", reference: runtimeImagePins.redis74Alpine },
    { env: "SQLITE_IMAGE", reference: runtimeImagePins.alpine320 }
  ],
  install: [], start: ["redis-server --appendonly yes", sqliteStart],
  readiness: { kind: "http", value: "http://127.0.0.1:9200/_cluster/health", timeoutSeconds: 300 },
  hostWrites: [], verification: ["loom", "status"], loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [], protectedPaths: [], compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
