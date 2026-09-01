import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadCatalog } from "./catalog.mjs";
import { run } from "./process.mjs";

const defaultCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../images/catalog.json"
);

export async function buildImage(name, options = {}) {
  const catalogPath = options.catalogPath ?? defaultCatalogPath;
  const catalog = await loadCatalog(catalogPath);
  const image = catalog.images.find((candidate) => candidate.name === name);
  if (!image) {
    throw new Error(`Unknown image "${name}"`);
  }
  if (image.kind !== "custom") {
    throw new Error(`Image "${name}" is a mirror and cannot be built`);
  }

  const platform = options.platform ?? "linux/amd64";
  if (!image.platforms.includes(platform)) {
    throw new Error(`Image "${name}" does not support ${platform}`);
  }

  const repositoryRoot = path.resolve(path.dirname(catalogPath), "..");
  const context = path.resolve(repositoryRoot, image.context);
  const reference = `localhost/${image.name}:${image.version}`;
  const execute = options.execute ?? run;
  await execute(
    "podman",
    [
      "build",
      "--platform",
      platform,
      "--build-arg",
      `LOOM_BASE_IMAGE=${image.source}`,
      "--file",
      path.join(context, "Containerfile"),
      "--tag",
      reference,
      context
    ],
    { cwd: repositoryRoot }
  );
  return reference;
}

export async function main(args, dependencies = {}) {
  const [name, ...flags] = args;
  if (!name) {
    throw new Error("Usage: build.mjs <catalog-name> [--platform <platform>]");
  }

  let platform = "linux/amd64";
  for (let index = 0; index < flags.length; index += 1) {
    if (flags[index] !== "--platform" || !flags[index + 1]) {
      throw new Error(`Unknown or incomplete argument "${flags[index]}"`);
    }
    platform = flags[index + 1];
    index += 1;
  }

  const build = dependencies.build ?? buildImage;
  await build(name, { platform });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
