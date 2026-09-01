import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadCatalog } from "./catalog.mjs";
import { run } from "./process.mjs";

const defaultCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../images/catalog.json"
);

export async function testImage(name, reference, options = {}) {
  const catalogPath = options.catalogPath ?? defaultCatalogPath;
  const catalog = await loadCatalog(catalogPath);
  const image = catalog.images.find((candidate) => candidate.name === name);
  if (!image) {
    throw new Error(`Unknown image "${name}"`);
  }
  if (image.kind !== "custom") {
    throw new Error(`Image "${name}" is a mirror and has no custom contract`);
  }
  if (!reference) {
    throw new Error("An image reference is required");
  }

  const repositoryRoot = path.resolve(path.dirname(catalogPath), "..");
  const contract = path.resolve(repositoryRoot, image.context, "contract.sh");
  const checkFile = options.checkFile ?? access;
  try {
    await checkFile(contract);
  } catch {
    throw new Error(`Image "${name}" is missing contract ${contract}`);
  }

  const execute = options.execute ?? run;
  await execute("bash", [contract, reference], { cwd: repositoryRoot });
}

export async function main(args, dependencies = {}) {
  const [name, reference, ...rest] = args;
  if (!name || !reference || rest.length > 0) {
    throw new Error("Usage: test-image.mjs <catalog-name> <image-reference>");
  }
  const test = dependencies.test ?? testImage;
  await test(name, reference);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
