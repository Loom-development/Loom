#!/usr/bin/env node
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { copyPublishableStackAssets } from "./copy-publishable-stack-assets.mjs";

const rootDir = process.cwd();
const releaseDir = resolve(rootDir, "dist", "release");
const stageDir = resolve(releaseDir, ".stage");
const unixStageDir = resolve(stageDir, "unix");
const windowsStageDir = resolve(stageDir, "windows");
const bundledCliPath = resolve(releaseDir, "loom.mjs");
const releaseStacksDir = resolve(releaseDir, "stacks");

const unixWrapper = `#!/usr/bin/env sh
set -eu
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node "$SCRIPT_DIR/loom.mjs" "$@"
`;

const windowsWrapper = `@echo off
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%loom.mjs" %*
`;

const unixAssets = [
  "loom-linux-x64.tar.gz",
  "loom-linux-arm64.tar.gz",
  "loom-darwin-x64.tar.gz",
  "loom-darwin-arm64.tar.gz"
];

const windowsAssets = ["loom-windows-x64.zip", "loom-windows-arm64.zip"];

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

await rm(releaseDir, { recursive: true, force: true });
await mkdir(unixStageDir, { recursive: true });
await mkdir(windowsStageDir, { recursive: true });
run("pnpm", ["--filter", "@loom/stacks", "build"]);
await copyPublishableStackAssets(resolve(rootDir, "stacks"), releaseStacksDir);

run("pnpm", [
  "exec",
  "esbuild",
  "apps/cli/src/index.ts",
  "--bundle",
  "--platform=node",
  "--format=esm",
  `--outfile=${bundledCliPath}`,
  "--banner:js=import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
]);

await writeFile(resolve(unixStageDir, "loom"), unixWrapper, "utf8");
await writeFile(resolve(windowsStageDir, "loom.cmd"), windowsWrapper, "utf8");
run("chmod", ["0755", resolve(unixStageDir, "loom")]);

for (const asset of unixAssets) {
  run("tar", [
    "-czf",
    resolve(releaseDir, asset),
    "-C",
    releaseDir,
    "loom.mjs",
    "stacks",
    "-C",
    unixStageDir,
    "loom"
  ]);
}

for (const asset of windowsAssets) {
  run("python3", [
    "-c",
    "import pathlib, sys, zipfile; z=zipfile.ZipFile(sys.argv[1], 'w', compression=zipfile.ZIP_DEFLATED); z.write(sys.argv[2], 'loom.mjs'); z.write(sys.argv[3], 'loom.cmd'); base=pathlib.Path(sys.argv[4]); [z.write(path, path.relative_to(base.parent).as_posix()) for path in sorted(base.rglob('*')) if path.is_file()]; z.close()",
    resolve(releaseDir, asset),
    resolve(releaseDir, "loom.mjs"),
    resolve(windowsStageDir, "loom.cmd"),
    releaseStacksDir
  ]);
}

await rm(stageDir, { recursive: true, force: true });
