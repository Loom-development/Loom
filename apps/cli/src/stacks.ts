import { isAbsolute, posix } from "node:path";

export const stackIds = [
  "node", "node-mean", "node-mern", "node-t3", "bun", "python", "python-django", "python-flask",
  "python-fastapi", "php", "php-wordpress", "php-drupal", "php-symfony", "db-mysql", "db-sqlserver",
  "db-postgres", "db-mongodb", "db-redis", "db-elasticsearch", "db-sqlite", "db-mariadb", "db-all",
  "dotnet", "rails7", "rails7-hotwire", "jamstack", "serverless", "spring-react", "spring-boot", "astro",
  "django-react"
] as const;
export type StackId = typeof stackIds[number];
export type GeneratedPathCategory = "dependency" | "cache" | "build";
export interface StackGeneratedPath { path: string; category: GeneratedPathCategory }
export interface StackCompatibility {
  architectures: readonly NodeJS.Architecture[];
  runtime: "podman-rootless";
}
export interface StackDefinition {
  id: StackId;
  assetPath: string;
  scaffoldVersion: string;
  loomOwnedFiles: readonly string[];
  generatedPaths: readonly StackGeneratedPath[];
  protectedPaths: readonly string[];
  compatibility: StackCompatibility;
}

const initialOwnedFiles = ["loom.yaml", ".env.example"] as const;
const compatibility = {
  architectures: ["arm", "arm64", "x64"], runtime: "podman-rootless"
} as const satisfies StackCompatibility;
const generated = (path: string, category: GeneratedPathCategory): StackGeneratedPath => ({ path, category });
const nodeGenerated = [generated("dist", "build"), generated("node_modules", "dependency")];
const phpGenerated = [generated("vendor", "dependency")];
const pythonGenerated = [generated(".pytest_cache", "cache"), generated(".venv", "dependency"), generated("__pycache__", "cache")];
const railsGenerated = [generated("log", "cache"), generated("tmp", "cache"), generated("vendor/bundle", "dependency")];
const springGenerated = [generated("target", "build")];
function nestedNodeGenerated(...roots: readonly string[]): StackGeneratedPath[] {
  return roots.flatMap((root) => [generated(`${root}/dist`, "build"), generated(`${root}/node_modules`, "dependency")])
    .sort((a, b) => a.path.localeCompare(b.path));
}

const generatedPathsByStack: Record<StackId, readonly StackGeneratedPath[]> = {
  node: nodeGenerated, "node-mean": nestedNodeGenerated("api", "web"), "node-mern": nestedNodeGenerated("api", "web"),
  "node-t3": [generated(".next", "build"), generated("node_modules", "dependency")], bun: nodeGenerated,
  python: pythonGenerated, "python-django": pythonGenerated, "python-flask": pythonGenerated, "python-fastapi": pythonGenerated,
  php: phpGenerated, "php-wordpress": [], "php-drupal": phpGenerated,
  "php-symfony": [generated("var/cache", "cache"), generated("vendor", "dependency")],
  "db-mysql": [], "db-sqlserver": [], "db-postgres": [], "db-mongodb": [], "db-redis": [], "db-elasticsearch": [],
  "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: [generated("src/bin", "build"), generated("src/obj", "build")], rails7: railsGenerated,
  "rails7-hotwire": railsGenerated, jamstack: nestedNodeGenerated("api", "web"),
  serverless: [generated("node_modules", "dependency"), generated("web/dist", "build"), generated("web/node_modules", "dependency")],
  "spring-react": [generated("backend/target", "build"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")],
  "spring-boot": springGenerated, astro: nodeGenerated,
  "django-react": [generated("backend/.pytest_cache", "cache"), generated("backend/.venv", "dependency"), generated("frontend/dist", "build"), generated("frontend/node_modules", "dependency")]
};

const protectedPathsByStack: Record<StackId, readonly string[]> = {
  node: ["src"], "node-mean": ["api/src", "web/src"], "node-mern": ["api/src", "web/src"],
  "node-t3": ["apps", "packages"], bun: ["src"], python: ["app.py"], "python-django": ["project"],
  "python-flask": ["app.py", "templates"], "python-fastapi": ["app"], php: ["public", "src"],
  "php-wordpress": ["wp-content"], "php-drupal": ["modules", "themes", "web"],
  "php-symfony": ["config", "public", "src", "templates"], "db-mysql": [], "db-sqlserver": [], "db-postgres": [],
  "db-mongodb": [], "db-redis": [], "db-elasticsearch": [], "db-sqlite": [], "db-mariadb": [], "db-all": [],
  dotnet: ["src"], rails7: ["app", "config", "db", "lib"], "rails7-hotwire": ["app", "config", "db", "lib"],
  jamstack: ["api/src", "web/src"], serverless: ["src", "web/src"],
  "spring-react": ["backend/src", "frontend/src"], "spring-boot": ["src"], astro: ["public", "src"],
  "django-react": ["backend/project", "frontend/src"]
};

function safeRelative(path: string): boolean {
  if (!path || path === "." || isAbsolute(path) || path.includes("\\")) return false;
  return path.split("/").every((part) => part !== "" && part !== "." && part !== "..") && posix.normalize(path) === path;
}
function assertSortedUnique(paths: readonly string[], kind: string): void {
  if (new Set(paths).size !== paths.length) throw new Error(`Duplicate ${kind} path`);
  if (paths.some((path, index) => index > 0 && paths[index - 1]! > path)) throw new Error(`${kind} paths must be sorted`);
}
export function validateStackDefinition(definition: StackDefinition): void {
  const generatedPaths = definition.generatedPaths.map(({ path }) => path);
  const protectedPaths = [...definition.protectedPaths];
  for (const path of generatedPaths) {
    if (!safeRelative(path) || path === ".loom" || path.startsWith(".loom/")) throw new Error(`Unsafe generated path: ${path}`);
  }
  for (const path of protectedPaths) {
    if (!safeRelative(path) || path === ".loom" || path.startsWith(".loom/")) throw new Error(`Unsafe protected path: ${path}`);
  }
  assertSortedUnique(generatedPaths, "generated");
  assertSortedUnique(protectedPaths, "protected");
  for (const generatedPath of generatedPaths) {
    if (protectedPaths.some((path) => generatedPath === path || path.startsWith(`${generatedPath}/`))) {
      throw new Error(`Generated path contains protected path: ${generatedPath}`);
    }
  }
}

function defineStack(id: StackId, assetPath: string, scaffoldVersion = "1"): StackDefinition {
  const definition: StackDefinition = { id, assetPath, scaffoldVersion, loomOwnedFiles: initialOwnedFiles,
    generatedPaths: generatedPathsByStack[id], protectedPaths: protectedPathsByStack[id], compatibility };
  validateStackDefinition(definition);
  return definition;
}
export const stackDefinitions = [
  defineStack("node", "node"), defineStack("node-mean", "node/mean"), defineStack("node-mern", "node/mern"),
  defineStack("node-t3", "node/t3"), defineStack("bun", "bun"), defineStack("python", "python"),
  defineStack("python-django", "python/django"), defineStack("python-flask", "python/flask"),
  defineStack("python-fastapi", "python/fastapi"), defineStack("php", "php"),
  defineStack("php-wordpress", "php/wordpress", "wordpress-6-php8.3-apache"),
  defineStack("php-drupal", "php/drupal", "unversioned"), defineStack("php-symfony", "php/symfony", "unversioned"),
  defineStack("db-mysql", "databases/mysql"), defineStack("db-sqlserver", "databases/sqlserver"),
  defineStack("db-postgres", "databases/postgres"), defineStack("db-mongodb", "databases/mongodb"),
  defineStack("db-redis", "databases/redis"), defineStack("db-elasticsearch", "databases/elasticsearch"),
  defineStack("db-sqlite", "databases/sqlite"), defineStack("db-mariadb", "databases/mariadb"),
  defineStack("db-all", "databases/all"), defineStack("dotnet", "dotnet"), defineStack("rails7", "rails7", "rails-7.1.5"),
  defineStack("rails7-hotwire", "rails7-hotwire", "rails-7.1.5-hotwire"), defineStack("jamstack", "jamstack"),
  defineStack("serverless", "serverless"), defineStack("spring-react", "spring-react"),
  defineStack("spring-boot", "spring-boot"), defineStack("astro", "astro"), defineStack("django-react", "django-react")
] as const satisfies readonly StackDefinition[];
const stackDefinitionsById = new Map<StackId, StackDefinition>(stackDefinitions.map((definition) => [definition.id, definition]));
export function findStackDefinition(stackId: string): StackDefinition | undefined {
  return stackDefinitionsById.get(stackId as StackId);
}
export function listStackIds(): string[] {
  return stackDefinitions.map(({ id }) => id).sort();
}
