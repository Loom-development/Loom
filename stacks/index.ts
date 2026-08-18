import type { GeneratedPathCategory, StackDefinition, StackGeneratedPath, StackId } from "./definition.js";
import { defineStack, stackIds, validateStackDefinition } from "./definition.js";
import { nodeStack } from "./node/stack.js";

export * from "./definition.js";
export * from "./pins.js";

const compatibility = { architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless" } as const;
const generated = (path: string, category: GeneratedPathCategory): StackGeneratedPath => ({ path, category });
const nodeGenerated = [generated("dist", "build"), generated("node_modules", "dependency")];
const phpGenerated = [generated("vendor", "dependency")];
const pythonGenerated = [generated(".pytest_cache", "cache"), generated(".venv", "dependency"), generated("__pycache__", "cache")];
const railsGenerated = [generated("log", "cache"), generated("tmp", "cache"), generated("vendor/bundle", "dependency")];
const springGenerated = [generated("target", "build")];
function nestedNodeGenerated(...roots: readonly string[]): StackGeneratedPath[] {
  return roots.flatMap((root) => [generated(`${root}/dist`, "build"), generated(`${root}/node_modules`, "dependency")]).sort((a, b) => a.path.localeCompare(b.path));
}
const generatedPathsByStack: Record<StackId, readonly StackGeneratedPath[]> = {
  node: nodeGenerated, "node-mean": nestedNodeGenerated("api", "web"), "node-mern": nestedNodeGenerated("api", "web"),
  "node-t3": [generated(".next", "build"), generated("node_modules", "dependency")], bun: nodeGenerated,
  python: pythonGenerated, "python-django": pythonGenerated, "python-flask": pythonGenerated, "python-fastapi": pythonGenerated,
  php: phpGenerated, "php-wordpress": [], "php-drupal": phpGenerated, "php-symfony": [generated("var/cache", "cache"), generated("vendor", "dependency")],
  "db-mysql": [], "db-sqlserver": [], "db-postgres": [], "db-mongodb": [], "db-redis": [], "db-elasticsearch": [], "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: [generated("src/bin", "build"), generated("src/obj", "build")], rails7: railsGenerated, "rails7-hotwire": railsGenerated,
  jamstack: nestedNodeGenerated("api", "web"), serverless: [generated("node_modules", "dependency"), generated("web/dist", "build"), generated("web/node_modules", "dependency")],
  "spring-react": [generated("backend/target", "build"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")],
  "spring-boot": springGenerated, astro: nodeGenerated,
  "django-react": [generated("backend/.pytest_cache", "cache"), generated("backend/.venv", "dependency"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")]
};
const protectedPathsByStack: Record<StackId, readonly string[]> = {
  node: ["src"], "node-mean": ["api/src", "web/src"], "node-mern": ["api/src", "web/src"], "node-t3": ["apps", "packages"], bun: ["src"],
  python: ["app.py"], "python-django": ["project"], "python-flask": ["app.py", "templates"], "python-fastapi": ["app"], php: ["public", "src"],
  "php-wordpress": ["wp-content"], "php-drupal": ["modules", "themes", "web"], "php-symfony": ["config", "public", "src", "templates"],
  "db-mysql": [], "db-sqlserver": [], "db-postgres": [], "db-mongodb": [], "db-redis": [], "db-elasticsearch": [], "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: ["src"], rails7: ["app", "config", "db", "lib"], "rails7-hotwire": ["app", "config", "db", "lib"], jamstack: ["api/src", "web/src"],
  serverless: ["src", "web/src"], "spring-react": ["backend/src", "frontend/src"], "spring-boot": ["src"], astro: ["public", "src"],
  "django-react": ["backend/project", "frontend/src"]
};
const scaffoldVersions: Partial<Record<StackId, string>> = {
  "php-wordpress": "wordpress-6-php8.3-apache", "php-drupal": "unversioned", "php-symfony": "unversioned", rails7: "rails-7.1.5", "rails7-hotwire": "rails-7.1.5-hotwire"
};
function compatibilityDefinition(id: Exclude<StackId, "node">): StackDefinition {
  const scaffoldVersion = scaffoldVersions[id] ?? "1";
  return defineStack({ id, definitionVersion: 1, legacyScaffoldVersions: [], assetPath: `${id}/templates`, scaffoldVersion,
    generator: { kind: "none" }, runtimeImages: [], install: [], start: [], readiness: { kind: "command", value: "true", timeoutSeconds: 1 },
    hostWrites: [], verification: [], loomOwnedFiles: [".env.example", "loom.yaml"], generatedPaths: generatedPathsByStack[id],
    protectedPaths: protectedPathsByStack[id], compatibility });
}
export const stackDefinitions = stackIds.map((id) => id === "node" ? nodeStack : compatibilityDefinition(id)) as readonly StackDefinition[];
const stackDefinitionsById = new Map<StackId, StackDefinition>(stackDefinitions.map((definition) => [definition.id, definition]));
export function findStackDefinition(stackId: string): StackDefinition | undefined { return stackDefinitionsById.get(stackId as StackId); }
export function listStackIds(): string[] { return stackDefinitions.map(({ id }) => id).sort(); }
for (const definition of stackDefinitions) validateStackDefinition(definition);
