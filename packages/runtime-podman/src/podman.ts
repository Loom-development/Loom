import { spawn } from "node:child_process";
import type { CommandResult } from "./types.js";

function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({ ok: false, stdout: "", stderr: `Failed to run ${command}: ${err.message}`, code: 1 });
    });

    child.on("close", (code) => {
      resolve({ ok: code === 0, stdout: stdout.trim(), stderr: stderr.trim(), code: code ?? 1 });
    });
  });
}

export async function runPodman(args: string[]): Promise<CommandResult> {
  return runCommand("podman", args);
}

function runCommandInherit(command: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("error", () => {
      resolve(1);
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });
}

export async function runPodmanInherit(args: string[]): Promise<number> {
  return runCommandInherit("podman", args);
}