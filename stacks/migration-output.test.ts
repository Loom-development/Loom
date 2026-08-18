import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { findStackDefinition } from "./index.js";

const root = dirname(fileURLToPath(import.meta.url));
const ids = [
  "node-mean", "node-mern", "node-t3", "bun", "jamstack", "serverless", "astro",
  "python", "python-django", "python-flask", "python-fastapi", "php", "dotnet", "spring-react", "spring-boot",
  "django-react"
] as const;
const languageIds = [
  "python", "python-django", "python-flask", "python-fastapi", "php", "dotnet", "spring-react", "spring-boot",
  "django-react"
] as const;

function normalizeImageDefaults(yaml: string): string {
  return yaml.replace(
    /(^\s*image:\s*)\$\{([A-Z][A-Z0-9_]*):-.*?\}/gm,
    (_match, prefix: string, env: string) => `${prefix}\${${env}:-<IMAGE>}`
  );
}

function normalizeEnvironmentImageDefaults(envFile: string, imageEnvs: readonly string[]): string {
  const declared = new Set(imageEnvs);
  return envFile.replace(/^([A-Z][A-Z0-9_]*_IMAGE)=.*$/gm, (line, env: string) => declared.has(env) ? `${env}=<IMAGE>` : line);
}

async function filesBelow(directory: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else result.push(relative(directory, path).split(sep).join("/"));
    }
  }
  await visit(directory);
  return result.sort();
}

test("copy stack migration preserves every non-image template byte", async () => {
  for (const id of ids) {
    const stackRoot = resolve(root, "..", id);
    const templateRoot = resolve(stackRoot, "templates");
    const definition = findStackDefinition(id)!;
    const fixture = JSON.parse(await readFile(resolve(stackRoot, "fixtures/migration.json"), "utf8")) as { fileCount: number; sourceDigest: string; loomDigest: string };
    const files = (await filesBelow(templateRoot)).filter((path) => path !== "loom.yaml");
    const digest = createHash("sha256");
    for (const path of files) {
      let bytes = await readFile(resolve(templateRoot, path));
      if (path === ".env.example" && languageIds.includes(id as typeof languageIds[number])) {
        bytes = Buffer.from(normalizeEnvironmentImageDefaults(bytes.toString("utf8"), definition.runtimeImages.map(({ env }) => env)));
      }
      digest.update(path).update("\0").update(bytes);
    }
    assert.equal(files.length, fixture.fileCount, `${id} inventory`);
    assert.equal(digest.digest("hex"), fixture.sourceDigest, `${id} source bytes`);
    const yaml = await readFile(resolve(templateRoot, "loom.yaml"), "utf8");
    const normalizedYaml = normalizeImageDefaults(yaml);
    assert.equal(createHash("sha256").update(normalizedYaml).digest("hex"), fixture.loomDigest, `${id} Loom configuration`);
  }
});

test("migration normalization preserves non-image environment defaults", async () => {
  const yaml = await readFile(resolve(root, "..", "node-mean/templates/loom.yaml"), "utf8");
  const changed = yaml.replace("${HOST_UID:-1000}", "${HOST_UID:-1001}");
  assert.notEqual(changed, yaml, "fixture must contain a non-image default");
  assert.notEqual(
    createHash("sha256").update(normalizeImageDefaults(changed)).digest("hex"),
    createHash("sha256").update(normalizeImageDefaults(yaml)).digest("hex")
  );
});

test("environment migration normalization permits declared image pins only", async () => {
  const definition = findStackDefinition("php")!;
  const env = await readFile(resolve(root, "..", "php/templates/.env.example"), "utf8");
  const imageEnvs = definition.runtimeImages.map(({ env: name }) => name);
  const normalized = normalizeEnvironmentImageDefaults(env, imageEnvs);
  const phpImage = definition.runtimeImages.find(({ env: name }) => name === "PHP_IMAGE")!.reference;
  assert.equal(
    normalizeEnvironmentImageDefaults(env.replace(phpImage, "docker.io/library/php:8.4.99-apache"), imageEnvs),
    normalized
  );
  assert.notEqual(normalizeEnvironmentImageDefaults(env.replace("HOST_UID=1000", "HOST_UID=1001"), imageEnvs), normalized);
});

test("runtime write metadata matches dependency-free Bun and Serverless templates", () => {
  for (const id of ["bun", "serverless"] as const) {
    const definition = findStackDefinition(id)!;
    assert.deepEqual(definition.hostWrites, [], `${id} host writes`);
    assert.deepEqual(definition.generatedPaths, [], `${id} generated paths`);
  }
});

test("copy stack template image defaults exactly match their definitions", async () => {
  for (const id of ids) {
    const definition = findStackDefinition(id)!;
    const yaml = await readFile(resolve(root, "..", definition.assetPath, "loom.yaml"), "utf8");
    const defaults = [...yaml.matchAll(/image:\s*\$\{([A-Z][A-Z0-9_]*)[:-]-(.+?)\}/g)].map((match) => ({ env: match[1]!, reference: match[2]! }));
    const imagesByEnv = new Map(definition.runtimeImages.map((image) => [image.env, image.reference]));
    assert.deepEqual([...new Set(defaults.map(({ env }) => env))].sort(), [...imagesByEnv.keys()].sort(), `${id} image environments`);
    for (const image of defaults) assert.equal(image.reference, imagesByEnv.get(image.env), `${id} ${image.env}`);
  }
});

test("language stack environment image defaults exactly match their definitions", async () => {
  for (const id of languageIds) {
    const definition = findStackDefinition(id)!;
    const env = await readFile(resolve(root, "..", definition.assetPath, ".env.example"), "utf8");
    const defaults = [...env.matchAll(/^([A-Z][A-Z0-9_]*_IMAGE)=(.+)$/gm)].map((match) => ({ env: match[1]!, reference: match[2]! }));
    assert.deepEqual(defaults.sort((a, b) => a.env.localeCompare(b.env)), definition.runtimeImages, id);
  }
});

test("copy stack template packages exclude generated state", async () => {
  const forbidden = /(?:^|\/)(?:\.loom|node_modules|vendor|\.venv|dist|build|target|bin|obj|data|\.next|\.angular|__pycache__)(?:\/|$)|\.pyc$|\.tsbuildinfo$/;
  for (const id of ids) {
    const files = await filesBelow(resolve(root, "..", id, "templates"));
    assert.deepEqual(files.filter((path) => forbidden.test(path)), [], id);
  }
});
