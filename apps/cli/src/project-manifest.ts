import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import type { StackDefinition } from "./stacks.js";

export interface LoomProjectManifestV1 {
  version: 1;
  loomVersion: string;
  stack: { id: string; scaffoldVersion: string };
  ownedFiles: Record<string, { sha256: string }>;
}

export interface ProjectRenderInputs {
  projectName: string;
  phpDocroot?: string;
  databases: string[];
  adopted: boolean;
}

export interface LoomProjectManifestV2 {
  version: 2;
  loomVersion: string;
  stack: { id: string; scaffoldVersion: string };
  ownedFiles: Record<string, { sha256: string; baselinePath: string }>;
  renderInputs: ProjectRenderInputs;
}

export type LoomProjectManifest = LoomProjectManifestV2;
export type LoadedProjectManifest =
  | { kind: "ready"; manifest: LoomProjectManifestV2 }
  | { kind: "migration-required"; manifest: LoomProjectManifestV1 }
  | { kind: "missing" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertSafeRelativePath(path: string, label: string): void {
  const segments = path.split(/[\\/]/);
  if (!path || isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || segments.some((segment) => !segment || segment === ".." || segment === ".")) {
    throw new Error(`Unsafe ${label} '${path}' in Loom project manifest`);
  }
}

function assertCommonManifest(value: Record<string, unknown>): void {
  if (typeof value.loomVersion !== "string" || !isRecord(value.stack) ||
      typeof value.stack.id !== "string" || typeof value.stack.scaffoldVersion !== "string" ||
      !isRecord(value.ownedFiles)) throw new Error("Invalid Loom project manifest");
}

function parseV1(value: Record<string, unknown>): LoomProjectManifestV1 {
  assertCommonManifest(value);
  for (const [path, entry] of Object.entries(value.ownedFiles as Record<string, unknown>)) {
    assertSafeRelativePath(path, "owned file path");
    if (!isRecord(entry) || typeof entry.sha256 !== "string") throw new Error("Invalid Loom project manifest owned file entry");
  }
  return value as unknown as LoomProjectManifestV1;
}

function parseV2(value: Record<string, unknown>): LoomProjectManifestV2 {
  assertCommonManifest(value);
  for (const [path, entry] of Object.entries(value.ownedFiles as Record<string, unknown>)) {
    assertSafeRelativePath(path, "owned file path");
    if (!isRecord(entry) || typeof entry.sha256 !== "string" || typeof entry.baselinePath !== "string") {
      throw new Error("Invalid Loom project manifest owned file entry");
    }
    assertSafeRelativePath(entry.baselinePath, "baseline path");
  }
  if (!isRecord(value.renderInputs) || typeof value.renderInputs.projectName !== "string" ||
      typeof value.renderInputs.adopted !== "boolean" || !Array.isArray(value.renderInputs.databases) ||
      !value.renderInputs.databases.every((database) => typeof database === "string") ||
      (value.renderInputs.phpDocroot !== undefined && typeof value.renderInputs.phpDocroot !== "string")) {
    throw new Error("Invalid Loom project manifest render inputs");
  }
  return value as unknown as LoomProjectManifestV2;
}

async function sha256File(path: string): Promise<string | undefined> {
  try {
    const contents = await readFile(path);
    return createHash("sha256").update(contents).digest("hex");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function getBaselinePath(relativePath: string): string {
  return `.loom/baselines/${encodeURIComponent(relativePath)}`;
}

export async function buildProjectManifest(
  targetDir: string,
  loomVersion: string,
  stack: StackDefinition,
  ownedFilePaths: readonly string[],
  renderInputs: ProjectRenderInputs
): Promise<LoomProjectManifestV2> {
  const ownedFiles: LoomProjectManifestV2["ownedFiles"] = {};
  for (const relativePath of ownedFilePaths) {
    assertSafeRelativePath(relativePath, "owned file path");
    const sha256 = await sha256File(resolve(targetDir, relativePath));
    if (sha256) ownedFiles[relativePath] = { sha256, baselinePath: getBaselinePath(relativePath) };
  }
  return {
    version: 2,
    loomVersion,
    stack: { id: stack.id, scaffoldVersion: stack.scaffoldVersion },
    ownedFiles,
    renderInputs: {
      projectName: renderInputs.projectName,
      ...(renderInputs.phpDocroot === undefined ? {} : { phpDocroot: renderInputs.phpDocroot }),
      databases: [...renderInputs.databases].sort(),
      adopted: renderInputs.adopted
    }
  };
}

export async function loadProjectManifest(targetDir: string): Promise<LoadedProjectManifest> {
  let contents: string;
  try {
    contents = await readFile(resolve(targetDir, ".loom", "manifest.json"), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { kind: "missing" };
    throw error;
  }
  const value: unknown = JSON.parse(contents);
  if (!isRecord(value) || typeof value.version !== "number") throw new Error("Invalid Loom project manifest");
  if (value.version === 1) return { kind: "migration-required", manifest: parseV1(value) };
  if (value.version === 2) return { kind: "ready", manifest: parseV2(value) };
  throw new Error(`Unsupported manifest version '${value.version}'`);
}

export async function writeProjectManifest(
  targetDir: string,
  loomVersion: string,
  stack: StackDefinition,
  ownedFilePaths: readonly string[],
  renderInputs: ProjectRenderInputs
): Promise<string> {
  const manifest = await buildProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs);
  const loomDir = resolve(targetDir, ".loom");
  const manifestPath = resolve(loomDir, "manifest.json");
  const temporaryPath = resolve(loomDir, `manifest.json.tmp-${process.pid}`);
  await mkdir(resolve(loomDir, "baselines"), { recursive: true });
  for (const [relativePath, entry] of Object.entries(manifest.ownedFiles)) {
    const destination = resolve(targetDir, entry.baselinePath);
    const temporaryBaseline = `${destination}.tmp-${process.pid}`;
    try {
      await writeFile(temporaryBaseline, await readFile(resolve(targetDir, relativePath)));
      await rename(temporaryBaseline, destination);
    } finally {
      await rm(temporaryBaseline, { force: true });
    }
  }
  try {
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await rename(temporaryPath, manifestPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
  return manifestPath;
}
