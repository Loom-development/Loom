import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadCatalog } from "./catalog.mjs";

const execFileAsync = promisify(execFile);
const digestPattern = /^sha256:[a-f0-9]{64}$/;
const defaultCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../images/catalog.json"
);

export function applyCatalogUpdates(catalog, updates) {
  const updatesByName = new Map();
  for (const update of updates) {
    if (!catalog.images.some((image) => image.name === update.name)) {
      throw new Error(`Update references unknown image "${update.name}"`);
    }
    if (updatesByName.has(update.name)) {
      throw new Error(`Duplicate update for image "${update.name}"`);
    }
    if (!digestPattern.test(update.digest ?? "")) {
      throw new Error(`Update for "${update.name}" has an invalid digest`);
    }
    updatesByName.set(update.name, update);
  }

  const nextCatalog = structuredClone(catalog);
  for (const image of nextCatalog.images) {
    const update = updatesByName.get(image.name);
    if (!update) continue;
    const source = update.source ?? image.source.slice(0, image.source.lastIndexOf("@"));
    image.source = `${source.replace(/@sha256:[a-f0-9]{64}$/, "")}@${update.digest}`;
    if (update.version) image.version = update.version;
  }

  return {
    changed: JSON.stringify(nextCatalog) !== JSON.stringify(catalog),
    catalog: nextCatalog
  };
}

export async function checkCatalogUpdates(catalog, resolveMetadata) {
  const updates = [];
  for (const image of catalog.images) {
    try {
      updates.push({ name: image.name, ...await resolveMetadata(image) });
    } catch (error) {
      throw new Error(`Failed to check ${image.name}: ${error.message}`);
    }
  }
  return applyCatalogUpdates(catalog, updates);
}

async function inspectPinnedTag(image) {
  const reference = image.source.slice(0, image.source.lastIndexOf("@"));
  const { stdout } = await execFileAsync(
    "skopeo",
    ["inspect", "--format", "{{.Digest}}", `docker://${reference}`],
    { encoding: "utf8" }
  );
  const digest = stdout.trim();
  if (!digestPattern.test(digest)) {
    throw new Error(`registry returned invalid digest "${digest}"`);
  }
  return { digest };
}

export async function main(args, dependencies = {}) {
  const [catalogArgument, ...rest] = args;
  if (rest.length > 0) throw new Error("Usage: check-updates.mjs [catalog-path]");
  const catalogPath = path.resolve(catalogArgument ?? defaultCatalogPath);
  const catalog = await (dependencies.load ?? loadCatalog)(catalogPath);
  const result = await checkCatalogUpdates(
    catalog,
    dependencies.resolveMetadata ?? inspectPinnedTag
  );

  if (!result.changed) {
    process.stdout.write("Image catalog is current.\n");
    return;
  }

  const temporaryPath = `${catalogPath}.tmp-${process.pid}`;
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(result.catalog, null, 2)}\n`);
    await fs.rename(temporaryPath, catalogPath);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }
  process.stdout.write("Image catalog metadata updated.\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
