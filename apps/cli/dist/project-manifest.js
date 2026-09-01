import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertSafeRelativePath(path, label) {
    const segments = path.split(/[\\/]/);
    if (!path || isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || segments.some((segment) => !segment || segment === ".." || segment === ".")) {
        throw new Error(`Unsafe ${label} '${path}' in Loom project manifest`);
    }
}
function assertCommonManifest(value) {
    if (typeof value.loomVersion !== "string" || !isRecord(value.stack) ||
        typeof value.stack.id !== "string" || typeof value.stack.scaffoldVersion !== "string" ||
        !isRecord(value.ownedFiles))
        throw new Error("Invalid Loom project manifest");
}
function parseV1(value) {
    assertCommonManifest(value);
    for (const [path, entry] of Object.entries(value.ownedFiles)) {
        assertSafeRelativePath(path, "owned file path");
        if (!isRecord(entry) || typeof entry.sha256 !== "string")
            throw new Error("Invalid Loom project manifest owned file entry");
    }
    return value;
}
function parseV2(value) {
    assertCommonManifest(value);
    const definitionVersion = value.stack.definitionVersion;
    if (definitionVersion !== undefined && (!Number.isInteger(definitionVersion) || definitionVersion <= 0)) {
        throw new Error("Invalid Loom project manifest stack definition version");
    }
    for (const [path, entry] of Object.entries(value.ownedFiles)) {
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
    return value;
}
export function classifyProjectManifestStack(manifest, stack) {
    if (manifest.stack.id !== stack.id) {
        return { kind: "incompatible", reason: `Manifest stack '${manifest.stack.id}' does not match '${stack.id}'` };
    }
    const definitionVersion = "definitionVersion" in manifest.stack ? manifest.stack.definitionVersion : undefined;
    if (definitionVersion === stack.definitionVersion && manifest.stack.scaffoldVersion === stack.scaffoldVersion) {
        return { kind: "current" };
    }
    if ((definitionVersion === undefined || definitionVersion < stack.definitionVersion) &&
        stack.legacyScaffoldVersions.includes(manifest.stack.scaffoldVersion)) {
        return { kind: "legacy-compatible" };
    }
    if (definitionVersion !== undefined && definitionVersion > stack.definitionVersion) {
        return {
            kind: "incompatible",
            reason: `Manifest definition version ${definitionVersion} is newer than supported version ${stack.definitionVersion}`
        };
    }
    return {
        kind: "incompatible",
        reason: `Scaffold version '${manifest.stack.scaffoldVersion}' is not a declared legacy scaffold version for '${stack.id}'`
    };
}
async function sha256File(path) {
    try {
        const contents = await readFile(path);
        return createHash("sha256").update(contents).digest("hex");
    }
    catch (error) {
        if (error.code === "ENOENT")
            return undefined;
        throw error;
    }
}
function getBaselinePath(relativePath, sha256) {
    return `.loom/baselines/${sha256}-${encodeURIComponent(relativePath)}`;
}
export async function buildProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs) {
    const ownedFiles = {};
    for (const relativePath of ownedFilePaths) {
        assertSafeRelativePath(relativePath, "owned file path");
        const sha256 = await sha256File(resolve(targetDir, relativePath));
        if (sha256)
            ownedFiles[relativePath] = { sha256, baselinePath: getBaselinePath(relativePath, sha256) };
    }
    return {
        version: 2,
        loomVersion,
        stack: { id: stack.id, scaffoldVersion: stack.scaffoldVersion, definitionVersion: stack.definitionVersion },
        ownedFiles,
        renderInputs: {
            projectName: renderInputs.projectName,
            ...(renderInputs.phpDocroot === undefined ? {} : { phpDocroot: renderInputs.phpDocroot }),
            databases: [...renderInputs.databases].sort(),
            adopted: renderInputs.adopted
        }
    };
}
export async function loadProjectManifest(targetDir) {
    let contents;
    try {
        contents = await readFile(resolve(targetDir, ".loom", "manifest.json"), "utf8");
    }
    catch (error) {
        if (error.code === "ENOENT")
            return { kind: "missing" };
        throw error;
    }
    const value = JSON.parse(contents);
    if (!isRecord(value) || typeof value.version !== "number")
        throw new Error("Invalid Loom project manifest");
    if (value.version === 1)
        return { kind: "migration-required", manifest: parseV1(value) };
    if (value.version === 2)
        return { kind: "ready", manifest: parseV2(value) };
    throw new Error(`Unsupported manifest version '${value.version}'`);
}
export async function writeProjectManifest(targetDir, loomVersion, stack, ownedFilePaths, renderInputs) {
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
        }
        finally {
            await rm(temporaryBaseline, { force: true });
        }
    }
    try {
        await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
        await rename(temporaryPath, manifestPath);
    }
    finally {
        await rm(temporaryPath, { force: true });
    }
    return manifestPath;
}
//# sourceMappingURL=project-manifest.js.map