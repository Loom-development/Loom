import { defineStack } from "../definition.js";
import { runtimeImagePins } from "../pins.js";

export const serverlessStack = defineStack({
  id: "serverless", definitionVersion: 2, legacyScaffoldVersions: ["1"], assetPath: "serverless/templates", scaffoldVersion: "2",
  generator: { kind: "none" }, runtimeImages: [{ env: "NODE_IMAGE", reference: runtimeImagePins.node22Alpine }],
  install: [], start: ["npm run dev:api", "npm run dev:web"],
  readiness: { kind: "http", value: "http://127.0.0.1:3008", timeoutSeconds: 326 }, hostWrites: ["node_modules", "web/node_modules"],
  verification: ["npm", "run", "invoke:health"], loomOwnedFiles: [".env.example", "loom.yaml"],
  generatedPaths: [{ path: "node_modules", category: "dependency" }, { path: "web/dist", category: "build" }, { path: "web/node_modules", category: "dependency" }],
  protectedPaths: ["src", "web/src"], compatibility: { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" }
});
