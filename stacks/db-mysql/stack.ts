import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

export const dbMysqlStack = defineStack({
  id: "db-mysql", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "db-mysql/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [{ env: "MYSQL_IMAGE", reference: runtimeImagePins.mysql84 }],
  install: [], start: [],
  readiness: { kind: "command", value: "mysqladmin ping -h 127.0.0.1 -uroot -ploomroot", timeoutSeconds: 100 },
  hostWrites: [], verification: ["mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-ploomroot"],
  loomOwnedFiles: [".env.example", "loom.yaml"], generatedPaths: [], protectedPaths: [],
  compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
