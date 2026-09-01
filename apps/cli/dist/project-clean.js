import { lstat as nodeLstat, readdir as nodeReaddir, realpath as nodeRealpath, rm as nodeRm } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
const defaultDependencies = {
    lstat: nodeLstat,
    readdir: (path, options) => nodeReaddir(path, options),
    realpath: nodeRealpath,
    rm: nodeRm
};
const fixedProtectedPaths = [".env", "loom.yaml"];
const dependencyManifestNames = new Set([
    "Cargo.toml", "Gemfile", "Pipfile", "composer.json", "package.json", "pom.xml",
    "pyproject.toml", "requirements.txt", "build.gradle", "build.gradle.kts",
    "settings.gradle", "settings.gradle.kts"
]);
const lockfileNames = new Set([
    "Cargo.lock", "Gemfile.lock", "Pipfile.lock", "bun.lock", "bun.lockb", "composer.lock",
    "gradle.lockfile", "package-lock.json", "packages.lock.json", "pnpm-lock.yaml", "poetry.lock",
    "uv.lock", "yarn.lock"
]);
function dependencies(overrides) {
    return { ...defaultDependencies, ...overrides };
}
function isKnownProtectedFile(path) {
    const name = path.split("/").at(-1);
    return name === ".env" || name === "loom.yaml" || dependencyManifestNames.has(name) || lockfileNames.has(name) ||
        name.endsWith(".csproj") || name.endsWith(".sln") || /^requirements(?:-[^/]+)?\.txt$/.test(name);
}
function assertSafeRelativePath(path) {
    const parts = path.split("/");
    if (!path || path === "." || isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || path.includes("\\") ||
        parts.some((part) => !part || part === "." || part === "..") || path === ".loom" || path.startsWith(".loom/")) {
        throw new Error(`Unsafe generated path '${path}'`);
    }
}
function containsPath(container, protectedPath) {
    return container === protectedPath || protectedPath.startsWith(`${container}/`);
}
function assertNotProtected(path, protectedPaths) {
    if (isKnownProtectedFile(path) || protectedPaths.some((protectedPath) => containsPath(path, protectedPath))) {
        throw new Error(`Generated path '${path}' contains a protected path`);
    }
}
function containedTarget(projectRoot, path) {
    const target = resolve(projectRoot, path);
    const fromRoot = relative(projectRoot, target);
    if (!fromRoot || fromRoot === ".." || fromRoot.startsWith("../") || isAbsolute(fromRoot)) {
        throw new Error(`Unsafe generated path '${path}' escapes the project root`);
    }
    return target;
}
async function optionalLstat(path, fs) {
    try {
        return await fs.lstat(path);
    }
    catch (error) {
        if (error.code === "ENOENT")
            return undefined;
        throw error;
    }
}
async function validatePathChain(projectRoot, path, fs) {
    let current = projectRoot;
    for (const part of path.split("/")) {
        current = resolve(current, part);
        const stats = await optionalLstat(current, fs);
        if (!stats)
            return undefined;
        if (stats.isSymbolicLink())
            throw new Error(`Generated path '${path}' traverses a symlink at '${current}'`);
    }
    return optionalLstat(containedTarget(projectRoot, path), fs);
}
async function inspectTree(absolutePath, relativePath, initialStats, fs) {
    // Package managers routinely create links inside generated dependency trees
    // (for example node_modules/.bin). Do not follow or count them. Safety for
    // the declared target and each of its parents is enforced by validatePathChain.
    if (initialStats.isSymbolicLink())
        return 0;
    if (initialStats.isFile())
        return initialStats.size;
    if (!initialStats.isDirectory())
        return 0;
    let bytes = 0;
    const entries = (await fs.readdir(absolutePath, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
        const childRelative = `${relativePath}/${entry.name}`;
        const childAbsolute = resolve(absolutePath, entry.name);
        const stats = await fs.lstat(childAbsolute);
        bytes += await inspectTree(childAbsolute, childRelative, stats, fs);
    }
    return bytes;
}
async function discoverProjectManifests(projectRoot, generatedPaths, fs) {
    const found = [];
    async function walk(directory, directoryRelative) {
        const entries = (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
        for (const entry of entries) {
            const childRelative = directoryRelative ? `${directoryRelative}/${entry.name}` : entry.name;
            if (childRelative === ".loom" || childRelative.startsWith(".loom/") || childRelative === ".git" ||
                generatedPaths.some((generatedPath) => childRelative === generatedPath || childRelative.startsWith(`${generatedPath}/`))) {
                continue;
            }
            const childAbsolute = resolve(directory, entry.name);
            const stats = await fs.lstat(childAbsolute);
            // Project discovery never follows symlinks. Generated-path validation separately rejects
            // a symlink in any target or target parent.
            if (stats.isSymbolicLink())
                continue;
            if (stats.isDirectory())
                await walk(childAbsolute, childRelative);
            else if (stats.isFile() && isKnownProtectedFile(childRelative))
                found.push(childRelative);
        }
    }
    await walk(projectRoot, "");
    return found;
}
async function getProtectedPaths(projectRoot, stack, manifest, fs) {
    const discovered = await discoverProjectManifests(projectRoot, stack.generatedPaths.map(({ path }) => path), fs);
    return [...new Set([
            ...fixedProtectedPaths,
            ...stack.protectedPaths,
            ...Object.keys(manifest.ownedFiles),
            ...discovered
        ])].sort();
}
function validateAllDeclarations(items, protectedPaths) {
    const seen = new Set();
    for (const item of items) {
        assertSafeRelativePath(item.path);
        assertNotProtected(item.path, protectedPaths);
        if (!["dependency", "cache", "build"].includes(item.category)) {
            throw new Error(`Unsafe generated path category for '${item.path}'`);
        }
        if (seen.has(item.path))
            throw new Error(`Unsafe duplicate generated path '${item.path}'`);
        seen.add(item.path);
    }
}
export async function planProjectClean(options) {
    const fs = dependencies(options.dependencies);
    const projectRoot = await fs.realpath(options.projectRoot);
    const declarations = options.stack.generatedPaths.map(({ path, category }) => ({ path, category }));
    // Reject intrinsically unsafe declarations before walking any filesystem content.
    const initialProtectedPaths = [...fixedProtectedPaths, ...options.stack.protectedPaths, ...Object.keys(options.manifest.ownedFiles)].sort();
    validateAllDeclarations(declarations, initialProtectedPaths);
    const protectedPaths = await getProtectedPaths(projectRoot, options.stack, options.manifest, fs);
    validateAllDeclarations(declarations, protectedPaths);
    const items = [];
    for (const declaration of [...declarations].sort((a, b) => a.path.localeCompare(b.path))) {
        const target = containedTarget(projectRoot, declaration.path);
        const stats = await validatePathChain(projectRoot, declaration.path, fs);
        const bytes = stats ? await inspectTree(target, declaration.path, stats, fs) : 0;
        items.push({ ...declaration, exists: stats !== undefined, bytes });
    }
    return { projectRoot, items, totalBytes: items.reduce((total, item) => total + item.bytes, 0), protectedPaths };
}
export async function applyProjectClean(plan, dependencyOverrides) {
    const fs = dependencies(dependencyOverrides);
    const projectRoot = await fs.realpath(plan.projectRoot);
    if (projectRoot !== plan.projectRoot)
        throw new Error("Unsafe cleanup plan project root changed after planning");
    validateAllDeclarations(plan.items, plan.protectedPaths);
    const removed = [];
    const missing = [];
    for (const item of [...plan.items].sort((a, b) => a.path.localeCompare(b.path))) {
        const target = containedTarget(projectRoot, item.path);
        const stats = await validatePathChain(projectRoot, item.path, fs);
        if (!stats) {
            missing.push(item.path);
            continue;
        }
        if (!item.exists)
            throw new Error(`Generated path '${item.path}' appeared after cleanup planning`);
        // Rewalk immediately before removal. Nested links are never followed;
        // validatePathChain above rejects links in the target path itself.
        await inspectTree(target, item.path, stats, fs);
        await fs.rm(target, { recursive: true, force: false });
        removed.push(item.path);
    }
    return { removed, missing };
}
//# sourceMappingURL=project-clean.js.map