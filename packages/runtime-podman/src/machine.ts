import { runPodman } from "./podman.js";
import type { CommandResult, PodmanCapabilities } from "./types.js";

interface MachineDependencies {
  platform?: NodeJS.Platform;
  runPodmanCommand?: (args: string[]) => Promise<CommandResult>;
  detectCapabilities?: () => Promise<PodmanCapabilities>;
}

export async function detectPodmanCapabilities(): Promise<PodmanCapabilities> {
  return detectPodmanCapabilitiesWithDependencies();
}

export async function detectPodmanCapabilitiesWithDependencies(
  dependencies: MachineDependencies = {}
): Promise<PodmanCapabilities> {
  const platform = dependencies.platform ?? process.platform;
  const runPodmanCommand = dependencies.runPodmanCommand ?? runPodman;
  const versionResult = await runPodmanCommand(["version", "--format", "{{.Version}}"]); 
  if (!versionResult.ok) {
    return {
      available: false,
      rootless: false,
      machine: {
        supported: platform !== "linux",
        running: false
      }
    };
  }

  const rootlessResult = await runPodmanCommand(["info", "--format", "{{.Host.Security.Rootless}}"]); 
  const rootless = rootlessResult.ok ? rootlessResult.stdout.toLowerCase() === "true" : false;

  const machineSupported = platform !== "linux";
  let machineRunning = false;

  if (machineSupported) {
    const machineResult = await runPodmanCommand(["machine", "inspect", "--format", "{{.State}}"]); 
    machineRunning = machineResult.ok && machineResult.stdout.toLowerCase().includes("running");
  }

  return {
    available: true,
    version: versionResult.stdout,
    rootless,
    machine: {
      supported: machineSupported,
      running: machineRunning
    }
  };
}

export async function ensureMachineRunning(managed: boolean): Promise<void> {
  return ensureMachineRunningWithDependencies(managed);
}

export async function ensureMachineRunningWithDependencies(
  managed: boolean,
  dependencies: MachineDependencies = {}
): Promise<void> {
  const platform = dependencies.platform ?? process.platform;
  const runPodmanCommand = dependencies.runPodmanCommand ?? runPodman;
  const detectCapabilities =
    dependencies.detectCapabilities ??
    (() => detectPodmanCapabilitiesWithDependencies({ platform, runPodmanCommand }));

  if (platform === "linux") {
    return;
  }

  const capabilities = await detectCapabilities();
  if (!capabilities.available) {
    throw new Error("Podman is not available on PATH. Install Podman first.");
  }

  if (!capabilities.machine.supported) {
    return;
  }

  if (capabilities.machine.running) {
    return;
  }

  if (!managed) {
    throw new Error("Podman Machine is not running. Start it or set runtime.machine.managed=true.");
  }

  const startResult = await runPodmanCommand(["machine", "start"]);
  if (!startResult.ok) {
    const initResult = await runPodmanCommand(["machine", "init"]);
    if (!initResult.ok) {
      throw new Error(`Unable to initialize Podman Machine: ${initResult.stderr || "unknown error"}`);
    }

    const retryStart = await runPodmanCommand(["machine", "start"]);
    if (!retryStart.ok) {
      throw new Error(`Unable to start Podman Machine: ${retryStart.stderr || "unknown error"}`);
    }
  }
}