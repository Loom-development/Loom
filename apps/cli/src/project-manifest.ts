import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { StackDefinition } from "./stacks.js";

export interface LoomProjectManifest {
  version: 1;
  loomVersion: string;
  stack: {
    id: string;
    scaffoldVersion: string;
  };
  ownedFiles: Record<string, { sha256: string }>;
}

async function sha256File(path: string): Promise<string | undefined> {
  try {
    const contents = await readFile(path);
    return createHash("sha256").update(contents).digest("hex");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

export async function buildProjectManifest(
  targetDir: string,
  loomVersion: string,
  stack: StackDefinition
): Promise<LoomProjectManifest> {
  const ownedFiles: Record<string, { sha256: string }> = {};

  for (const relativePath of stack.loomOwnedFiles) {
    const sha256 = await sha256File(resolve(targetDir, relativePath));
    if (sha256) {
      ownedFiles[relativePath] = { sha256 };
    }
  }

  return {
    version: 1,
    loomVersion,
    stack: {
      id: stack.id,
      scaffoldVersion: stack.scaffoldVersion
    },
    ownedFiles
  };
}

export async function writeProjectManifest(
  targetDir: string,
  loomVersion: string,
  stack: StackDefinition
): Promise<string> {
  const manifest = await buildProjectManifest(targetDir, loomVersion, stack);
  const loomDir = resolve(targetDir, ".loom");
  const manifestPath = resolve(loomDir, "manifest.json");
  const temporaryPath = resolve(loomDir, `manifest.json.tmp-${process.pid}`);

  await mkdir(loomDir, { recursive: true });
  try {
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await rename(temporaryPath, manifestPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }

  return manifestPath;
}
