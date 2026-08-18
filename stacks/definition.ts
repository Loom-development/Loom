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
export type StackGenerator =
  | { kind: "none" }
  | { kind: "command"; package: string; version: string; command: readonly string[] };
export interface StackRuntimeImage { env: string; reference: string }
export interface StackVerificationCheck { service?: string; command: readonly string[] }
export interface StackDefinition {
  id: StackId;
  definitionVersion: number;
  legacyScaffoldVersions: readonly string[];
  assetPath: string;
  /** Compatibility field consumed by v1/v2 project manifests. */
  scaffoldVersion: string;
  generator: StackGenerator;
  runtimeImages: readonly StackRuntimeImage[];
  install: readonly string[];
  start: readonly string[];
  readiness: { kind: "command" | "http" | "port"; value: string; timeoutSeconds: number };
  hostWrites: readonly string[];
  verification: readonly StackVerificationCheck[];
  loomOwnedFiles: readonly string[];
  generatedPaths: readonly StackGeneratedPath[];
  protectedPaths: readonly string[];
  compatibility: StackCompatibility;
}

function safeRelative(path: string): boolean {
  if (!path || path === "." || isAbsolute(path) || path.includes("\\")) return false;
  return path.split("/").every((part) => part !== "" && part !== "." && part !== "..") && posix.normalize(path) === path;
}

function assertSortedUnique(values: readonly string[], kind: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${kind}`);
  if (values.some((value, index) => index > 0 && values[index - 1]! > value)) {
    throw new Error(`${kind} must be sorted`);
  }
}

export function validateGeneratorVersion(version: string): void {
  const rejected = /^(?:latest|next|canary|nightly|unversioned)$/i;
  if (!version || rejected.test(version) || /[\s*^~<>=|]/.test(version) || /(?:^|\.)x(?:\.|$)/i.test(version) || !/^\d+(?:\.\d+){1,}(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Expected exact generator version, received '${version}'`);
  }
}

export function validateRuntimeImage(image: StackRuntimeImage): void {
  if (!/^[A-Z][A-Z0-9_]*$/.test(image.env)) throw new Error(`Runtime image environment '${image.env}' must be uppercase`);
  const withoutDigest = image.reference.split("@", 1)[0]!;
  const lastSlash = withoutDigest.lastIndexOf("/");
  const colon = withoutDigest.lastIndexOf(":");
  const tag = colon > lastSlash ? withoutDigest.slice(colon + 1) : "";
  const digest = image.reference.includes("@") ? image.reference.slice(image.reference.indexOf("@") + 1) : undefined;
  const exactTag = /^\d+\.\d+(?:\.\d+)?(?:[-.][0-9A-Za-z][0-9A-Za-z.-]*)?$/.test(tag)
    || /^\d{4}(?:[-.]\d{2}){1,2}(?:[-.][0-9A-Za-z.-]+)?$/.test(tag)
    || /(?:^|-)CU\d+(?:-|$)/i.test(tag);
  if (!tag || tag.toLowerCase() === "latest" || !exactTag || (digest !== undefined && !/^sha256:[a-f0-9]{64}$/.test(digest))) {
    throw new Error(`Runtime image '${image.reference}' must use an exact version tag`);
  }
}

export function validateStackDefinition(definition: StackDefinition): void {
  if (!stackIds.includes(definition.id)) throw new Error(`Unknown stack id: ${definition.id}`);
  if (!Number.isInteger(definition.definitionVersion) || definition.definitionVersion <= 0) throw new Error("Definition version must be a positive integer");
  if (definition.assetPath !== `${definition.id}/templates` || !safeRelative(definition.assetPath)) throw new Error(`Unsafe asset path: ${definition.assetPath}`);
  assertSortedUnique(definition.legacyScaffoldVersions, "legacy scaffold versions");
  if (definition.generator.kind === "command") {
    if (!definition.generator.package.trim() || definition.generator.command.length === 0) throw new Error("Command generator requires a package and command");
    validateGeneratorVersion(definition.generator.version);
  }
  const runtimeEnvs = definition.runtimeImages.map(({ env }) => env);
  assertSortedUnique(runtimeEnvs, "runtime image environments");
  for (const image of definition.runtimeImages) validateRuntimeImage(image);
  for (const check of definition.verification) {
    if (check.service !== undefined && !/^[a-z][a-z0-9-]*$/.test(check.service)) {
      throw new Error(`Verification service '${check.service}' must be a service name`);
    }
    if (check.command.length === 0 || check.command.some((argument) => !argument.trim())) {
      throw new Error("Verification command requires nonempty argv");
    }
  }

  const generatedPaths = definition.generatedPaths.map(({ path }) => path);
  const protectedPaths = [...definition.protectedPaths];
  for (const [kind, paths] of [["generated path", generatedPaths], ["protected path", protectedPaths], ["Loom-owned path", definition.loomOwnedFiles], ["host-write path", definition.hostWrites]] as const) {
    for (const path of paths) if (!safeRelative(path) || path === ".loom" || path.startsWith(".loom/")) throw new Error(`Unsafe ${kind}: ${path}`);
    assertSortedUnique(paths, `${kind}s`);
  }
  for (const generatedPath of generatedPaths) {
    if (protectedPaths.some((path) => generatedPath === path || path.startsWith(`${generatedPath}/`))) throw new Error(`Generated path contains protected path: ${generatedPath}`);
  }
  if (!Number.isInteger(definition.readiness.timeoutSeconds) || definition.readiness.timeoutSeconds <= 0 || !definition.readiness.value.trim()) throw new Error("Readiness requires a value and positive timeout");
  assertSortedUnique(definition.compatibility.architectures, "architectures");
}

export function defineStack<const T extends StackDefinition>(definition: T): T {
  validateStackDefinition(definition);
  return definition;
}
