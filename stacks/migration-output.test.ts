import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { findStackDefinition } from "./index.js";

const root = dirname(fileURLToPath(import.meta.url));
const ids = ["node-mean", "node-mern", "node-t3", "bun", "jamstack", "serverless", "astro"] as const;

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

test("JavaScript stack migration preserves every non-image template byte", async () => {
  for (const id of ids) {
    const stackRoot = resolve(root, "..", id);
    const templateRoot = resolve(stackRoot, "templates");
    const fixture = JSON.parse(await readFile(resolve(stackRoot, "fixtures/migration.json"), "utf8")) as { fileCount: number; sourceDigest: string; loomDigest: string };
    const files = (await filesBelow(templateRoot)).filter((path) => path !== "loom.yaml");
    const digest = createHash("sha256");
    for (const path of files) digest.update(path).update("\0").update(await readFile(resolve(templateRoot, path)));
    assert.equal(files.length, fixture.fileCount, `${id} inventory`);
    assert.equal(digest.digest("hex"), fixture.sourceDigest, `${id} source bytes`);
    const yaml = await readFile(resolve(templateRoot, "loom.yaml"), "utf8");
    const normalizedYaml = yaml.replace(/\$\{([A-Z][A-Z0-9_]*):-.*?\}/g, (_match, env: string) => `\${${env}:-<IMAGE>}`);
    assert.equal(createHash("sha256").update(normalizedYaml).digest("hex"), fixture.loomDigest, `${id} Loom configuration`);
  }
});

test("JavaScript template image defaults exactly match their definitions", async () => {
  for (const id of ids) {
    const definition = findStackDefinition(id)!;
    const yaml = await readFile(resolve(root, "..", definition.assetPath, "loom.yaml"), "utf8");
    const defaults = [...yaml.matchAll(/image:\s*\$\{([A-Z][A-Z0-9_]*)[:-]-(.+?)\}/g)].map((match) => ({ env: match[1]!, reference: match[2]! }));
    const imagesByEnv = new Map(definition.runtimeImages.map((image) => [image.env, image.reference]));
    assert.deepEqual([...new Set(defaults.map(({ env }) => env))].sort(), [...imagesByEnv.keys()].sort(), `${id} image environments`);
    for (const image of defaults) assert.equal(image.reference, imagesByEnv.get(image.env), `${id} ${image.env}`);
  }
});

test("JavaScript template packages exclude generated state", async () => {
  const forbidden = /(?:^|\/)(?:\.loom|node_modules|vendor|\.venv|dist|build|target|bin|obj|data|\.next|\.angular|__pycache__)(?:\/|$)|\.pyc$|\.tsbuildinfo$/;
  for (const id of ids) {
    const files = await filesBelow(resolve(root, "..", id, "templates"));
    assert.deepEqual(files.filter((path) => forbidden.test(path)), [], id);
  }
});
