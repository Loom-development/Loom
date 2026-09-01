import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadCatalog } from "./catalog.mjs";
import { run } from "./process.mjs";

const execFileAsync = promisify(execFile);
const digestPattern = /^sha256:[a-f0-9]{64}$/;
const defaultCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../images/catalog.json"
);

function skopeoDigestReference(source) {
  const atIndex = source.lastIndexOf("@sha256:");
  const taggedName = source.slice(0, atIndex);
  const digest = source.slice(atIndex);
  const slashIndex = taggedName.lastIndexOf("/");
  const tagIndex = taggedName.lastIndexOf(":");
  const repository = tagIndex > slashIndex ? taggedName.slice(0, tagIndex) : taggedName;
  return `${repository}${digest}`;
}

export function createMirrorCopy(image, registry) {
  if (!image?.source?.match(/@sha256:[a-f0-9]{64}$/)) {
    throw new Error(`Mirror "${image?.name ?? "unknown"}" requires a digest-pinned source`);
  }
  if (image.context) {
    throw new Error(`Mirror "${image.name}" must not have a build context`);
  }

  const source = skopeoDigestReference(image.source);
  const destination = `${registry}/${image.name}:${image.version}`;
  return {
    command: "skopeo",
    args: ["copy", "--all", `docker://${source}`, `docker://${destination}`],
    source,
    destination
  };
}

async function inspectDigest(reference) {
  const { stdout } = await execFileAsync(
    "skopeo",
    ["inspect", "--format", "{{.Digest}}", `docker://${reference}`],
    { encoding: "utf8" }
  );
  const digest = stdout.trim();
  if (!digestPattern.test(digest)) {
    throw new Error(`Registry returned invalid digest "${digest}" for ${reference}`);
  }
  return digest;
}

export async function mirrorImage(name, options = {}) {
  const catalog = options.catalog ?? await loadCatalog(options.catalogPath ?? defaultCatalogPath);
  const image = catalog.images.find((candidate) => candidate.name === name);
  if (!image) throw new Error(`Unknown image "${name}"`);
  if (image.kind !== "mirror") throw new Error(`Image "${name}" is not a mirror`);

  const copy = createMirrorCopy(image, catalog.registry);
  const execute = options.execute ?? run;
  const inspect = options.inspect ?? inspectDigest;
  await execute(copy.command, copy.args);

  const sourceDigest = await inspect(copy.source);
  const expectedDigest = copy.source.slice(copy.source.lastIndexOf("@") + 1);
  if (sourceDigest !== expectedDigest) {
    throw new Error(
      `Upstream digest mismatch for ${name}: expected ${expectedDigest}, received ${sourceDigest}`
    );
  }

  const destinationDigest = await inspect(copy.destination);
  if (destinationDigest !== sourceDigest) {
    throw new Error(
      `Mirror digest mismatch for ${name}: source ${sourceDigest}, destination ${destinationDigest}`
    );
  }

  return { ...copy, digest: destinationDigest };
}

export async function main(args, dependencies = {}) {
  const [name, ...rest] = args;
  if (!name || rest.length > 0) throw new Error("Usage: mirror.mjs <catalog-name>");
  const mirror = dependencies.mirror ?? mirrorImage;
  const result = await mirror(name, dependencies.options);
  process.stdout.write(`${result.destination}@${result.digest}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
