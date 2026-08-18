#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { copyPublishableStackAssets } from "./copy-publishable-stack-assets.mjs";

const repoDir = fileURLToPath(new URL("..", import.meta.url));
const cliDir = resolve(repoDir, "apps", "cli");
const distDir = resolve(cliDir, "dist");
const distExamplesDir = resolve(distDir, "examples");
const distStacksDir = resolve(distDir, "stacks");
const sourceStacksDir = resolve(repoDir, "stacks");
const workspacePackageAliases = {
  "@loom/config": resolve(repoDir, "packages", "config", "src", "index.ts"),
  "@loom/core": resolve(repoDir, "packages", "core", "src", "index.ts"),
  "@loom/https": resolve(repoDir, "packages", "https", "src", "index.ts"),
  "@loom/network": resolve(repoDir, "packages", "network", "src", "index.ts"),
  "@loom/runtime-podman": resolve(repoDir, "packages", "runtime-podman", "src", "index.ts"),
  "@loom/tasks": resolve(repoDir, "packages", "tasks", "src", "index.ts")
};
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

await copyPublishableStackAssets(sourceStacksDir, distStacksDir);
