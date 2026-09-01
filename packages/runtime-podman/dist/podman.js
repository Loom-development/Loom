import { spawn } from "node:child_process";
function runCommand(command, args) {
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
export async function runPodman(args) {
    return runCommand("podman", args);
}
function runCommandInherit(command, args) {
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
export async function runPodmanInherit(args) {
    return runCommandInherit("podman", args);
}
//# sourceMappingURL=podman.js.map