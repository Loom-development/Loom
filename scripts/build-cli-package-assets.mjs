#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const repoDir = fileURLToPath(new URL("..", import.meta.url));
const cliDir = resolve(repoDir, "apps", "cli");
const distDir = resolve(cliDir, "dist");
const distExamplesDir = resolve(distDir, "examples");
const sourceExamplesDir = resolve(repoDir, "examples");
const workspacePackageAliases = {
  "@loom/config": resolve(repoDir, "packages", "config", "src", "index.ts"),
  "@loom/core": resolve(repoDir, "packages", "core", "src", "index.ts"),
  "@loom/https": resolve(repoDir, "packages", "https", "src", "index.ts"),
  "@loom/network": resolve(repoDir, "packages", "network", "src", "index.ts"),
  "@loom/runtime-podman": resolve(repoDir, "packages", "runtime-podman", "src", "index.ts"),
  "@loom/tasks": resolve(repoDir, "packages", "tasks", "src", "index.ts")
};
const ignoredExampleEntries = new Set([
  "node_modules",
  ".pnpm-store",
  ".turbo",
  ".loom",
  "data",
  "dist",
  ".next",
  ".angular",
  "target",
  "build",
  "vendor",
  "__pycache__",
  ".venv",
  ".pytest_cache",
  "obj",
  "bin"
]);
const ignoredExampleFileNames = new Set(["db.sqlite3", ".DS_Store"]);
const ignoredExampleFileSuffixes = [".pyc", ".tsbuildinfo"];

function shouldCopyExamplePath(sourcePath) {
  const segments = sourcePath.split(/[\\/]+/);
  const entryName = segments.at(-1) ?? "";
  if (segments.some((segment) => ignoredExampleEntries.has(segment))) {
    return false;
  }

  if (ignoredExampleFileNames.has(entryName)) {
    return false;
  }

  return !ignoredExampleFileSuffixes.some((suffix) => entryName.endsWith(suffix));
}

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

await rm(distExamplesDir, { recursive: true, force: true });

run(
  "pnpm",
  [
    "exec",
    "esbuild",
    "src/index.ts",
    "--bundle",
    "--platform=node",
    "--format=esm",
    "--sourcemap",
    "--outfile=dist/index.js",
    "--banner:js=import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    ...Object.entries(workspacePackageAliases).map(([packageName, entryPoint]) => `--alias:${packageName}=${entryPoint}`)
  ],
  cliDir
);

await cp(sourceExamplesDir, distExamplesDir, {
  recursive: true,
  filter: shouldCopyExamplePath
});