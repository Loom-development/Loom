import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadCatalog } from "./catalog.mjs";

const defaultCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../images/catalog.json"
);

function selectedImages(catalog, kind, names) {
  const imagesByName = new Map(catalog.images.map((image) => [image.name, image]));
  for (const name of names ?? []) {
    if (!imagesByName.has(name)) {
      throw new Error(`Unknown image "${name}"`);
    }
  }

  const requested = names === undefined ? null : new Set(names);
  return catalog.images
    .filter((image) => image.kind === kind && (requested === null || requested.has(image.name)))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function createBuildMatrix(catalog, names) {
  return selectedImages(catalog, "custom", names).flatMap((image) =>
    [...image.platforms].sort().map((platform) => ({
      name: image.name,
      platform,
      context: image.context,
      version: image.version
    }))
  );
}

export function createMirrorMatrix(catalog, names) {
  return selectedImages(catalog, "mirror", names).flatMap((image) =>
    [...image.platforms].sort().map((platform) => ({
      name: image.name,
      platform,
      source: image.source,
      version: image.version
    }))
  );
}

export async function main(args, dependencies = {}) {
  const [kind, ...names] = args;
  if (kind !== "custom" && kind !== "mirror") {
    throw new Error("Usage: matrix.mjs <custom|mirror> [catalog-name ...]");
  }

  const load = dependencies.load ?? loadCatalog;
  const write = dependencies.write ?? ((value) => process.stdout.write(value));
  const catalog = await load(dependencies.catalogPath ?? defaultCatalogPath);
  const matrix = kind === "custom"
    ? createBuildMatrix(catalog, names.length === 0 ? undefined : names)
    : createMirrorMatrix(catalog, names.length === 0 ? undefined : names);
  write(`${JSON.stringify({ include: matrix })}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
