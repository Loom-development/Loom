import { spawn } from "node:child_process";
import { Socket } from "node:net";
import type { LoomService } from "@loom/config";

export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number;
}

export interface PodmanCapabilities {
  available: boolean;
  version?: string;
  rootless: boolean;
  machine: {
    supported: boolean;
    running: boolean;
  };
}

export interface ContainerSummary {
  name: string;
  state: string;
  running: boolean;
  health?: string;
  image: string;
}

function run(command: string, args: string[]): Promise<CommandResult> {
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

    child.on("error", () => {
      resolve({ ok: false, stdout: "", stderr: `Failed to run ${command}`, code: 1 });
    });

    child.on("close", (code) => {
      resolve({ ok: code === 0, stdout: stdout.trim(), stderr: stderr.trim(), code: code ?? 1 });
    });
  });
}

export async function runPodman(args: string[]): Promise<CommandResult> {
  return run("podman", args);
}

function runInherit(command: string, args: string[]): Promise<number> {
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

function normalizeImage(image: string): string {
  const hasRegistry = image.includes("/") || image.includes("localhost/");
  return hasRegistry ? image : `docker.io/library/${image}`;
}

export function containerName(projectName: string, serviceName: string): string {
  return `${projectName}-${serviceName}`;
}

export async function ensurePodmanNetwork(networkName: string): Promise<void> {
  const inspect = await run("podman", ["network", "exists", networkName]);
  if (inspect.ok) {
    return;
  }

  const create = await run("podman", ["network", "create", networkName]);
  if (!create.ok) {
    throw new Error(`Failed to create network '${networkName}': ${create.stderr || "unknown error"}`);
  }
}

export async function isContainerRunning(name: string): Promise<boolean> {
  const inspect = await run("podman", ["inspect", "--format", "{{.State.Running}}", name]);
  return inspect.ok && inspect.stdout.toLowerCase() === "true";
}

export async function inspectContainer(name: string): Promise<ContainerSummary | null> {
  const inspect = await run("podman", [
    "inspect",
    "--format",
    "{{.Name}}|{{.State.Status}}|{{.State.Running}}|{{if .State.Healthcheck}}{{.State.Healthcheck.Status}}{{end}}|{{.ImageName}}",
    name
  ]);

  if (!inspect.ok) {
    return null;
  }

  const [containerNameRaw, state, runningRaw, healthRaw, image] = inspect.stdout.split("|");

  return {
    name: containerNameRaw.replace(/^\//, ""),
    state,
    running: runningRaw.toLowerCase() === "true",
    health: healthRaw || undefined,
    image
  };
}

export async function listProjectContainers(projectName: string): Promise<ContainerSummary[]> {
  const list = await run("podman", [
    "ps",
    "-a",
    "--filter",
    `name=^${projectName}-`,
    "--format",
    "{{.Names}}"
  ]);

  if (!list.ok || !list.stdout) {
    return [];
  }

  const names = list.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const inspected = await Promise.all(names.map((name) => inspectContainer(name)));
  return inspected.filter((entry): entry is ContainerSummary => entry !== null);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseHostPorts(portMappings: string[] = []): number[] {
  return portMappings
    .map((mapping) => {
      const parts = mapping.split(":").map((part) => part.trim());
      if (parts.length < 2) {
        return Number.NaN;
      }

      const hostPart = parts[parts.length - 2];
      return Number(hostPart);
    })
    .filter((value) => Number.isFinite(value) && value > 0);
}

async function isPortOpen(port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, "127.0.0.1");
  });
}

async function arePortsReachable(ports: number[], timeoutMs: number): Promise<boolean> {
  if (ports.length === 0) {
    return false;
  }

  const results = await Promise.all(ports.map((port) => isPortOpen(port, timeoutMs)));
  return results.every(Boolean);
}

export async function waitForServiceReady(
  projectName: string,
  serviceName: string,
  options?: {
    ports?: string[];
    intervalSeconds?: number;
    timeoutSeconds?: number;
    retries?: number;
    startPeriodSeconds?: number;
  }
): Promise<void> {
  const name = containerName(projectName, serviceName);
  const startPeriodMs = (options?.startPeriodSeconds ?? 0) * 1000;
  if (startPeriodMs > 0) {
    await sleep(startPeriodMs);
  }

  const intervalMs = (options?.intervalSeconds ?? 2) * 1000;
  const retries = options?.retries ?? 30;
  const timeoutMs = Math.max(retries * intervalMs, 60_000);
  const probeTimeoutMs = (options?.timeoutSeconds ?? 2) * 1000;
  const hostPorts = parseHostPorts(options?.ports);

  let attempts = 0;
  const startedAt = Date.now();

  while (attempts < retries && Date.now() - startedAt <= timeoutMs) {
    attempts += 1;
    const info = await inspectContainer(name);
    if (!info) {
      throw new Error(`Container '${name}' not found while waiting for readiness.`);
    }

    if (!info.running) {
      throw new Error(`Container '${name}' exited before becoming ready.`);
    }

    if (info.health) {
      if (info.health.toLowerCase() === "healthy") {
        return;
      }

      if (info.health.toLowerCase() === "unhealthy") {
        throw new Error(`Container '${name}' reported unhealthy status.`);
      }

      await sleep(intervalMs);
      continue;
    }

    if (hostPorts.length > 0) {
      const reachable = await arePortsReachable(hostPorts, probeTimeoutMs);
      if (reachable) {
        return;
      }

      await sleep(intervalMs);
      continue;
    }

    return;
  }

  throw new Error(`Timed out waiting for service '${serviceName}' to become ready.`);
}

export async function ensureServiceStarted(
  projectName: string,
  serviceName: string,
  service: LoomService,
  networkName: string
): Promise<void> {
  const name = containerName(projectName, serviceName);
  const expectedImage = normalizeImage(service.image);

  const running = await isContainerRunning(name);
  if (running) {
    return;
  }

  const exists = await run("podman", ["container", "exists", name]);
  if (exists.ok) {
    const imageInspect = await run("podman", ["inspect", "--format", "{{.ImageName}}", name]);
    const currentImage = imageInspect.ok ? imageInspect.stdout.trim() : "";

    if (currentImage && currentImage !== expectedImage) {
      const remove = await run("podman", ["rm", "-f", name]);
      if (!remove.ok) {
        throw new Error(`Failed to recreate container '${name}': ${remove.stderr || "unknown error"}`);
      }
    } else {
      const start = await run("podman", ["start", name]);
      if (!start.ok) {
        throw new Error(`Failed to start existing container '${name}': ${start.stderr || "unknown error"}`);
      }
      return;
    }
  }

  const args: string[] = [
    "run",
    "-d",
    "--name",
    name,
    "--network",
    networkName,
    "--network-alias",
    serviceName
  ];

  if (service.workdir) {
    args.push("-w", service.workdir);
  }

  if (service.entrypoint !== undefined) {
    args.push("--entrypoint", service.entrypoint);
  }

  for (const port of service.ports ?? []) {
    args.push("-p", port);
  }

  for (const volume of service.volumes ?? []) {
    args.push("-v", volume);
  }

  for (const [key, value] of Object.entries(service.env ?? {})) {
    args.push("-e", `${key}=${value}`);
  }

  if (service.healthcheck?.command) {
    args.push("--health-cmd", service.healthcheck.command);
    args.push("--health-interval", `${service.healthcheck.intervalSeconds ?? 10}s`);
    args.push("--health-timeout", `${service.healthcheck.timeoutSeconds ?? 3}s`);
    args.push("--health-retries", String(service.healthcheck.retries ?? 5));
    args.push("--health-start-period", `${service.healthcheck.startPeriodSeconds ?? 0}s`);
  }

  args.push(expectedImage);
  if (service.command) {
    args.push("sh", "-lc", service.command);
  }

  const runResult = await run("podman", args);
  if (!runResult.ok) {
    throw new Error(`Failed to run container '${name}': ${runResult.stderr || "unknown error"}`);
  }
}

export async function stopService(projectName: string, serviceName: string): Promise<void> {
  const name = containerName(projectName, serviceName);
  const exists = await run("podman", ["container", "exists", name]);
  if (!exists.ok) {
    return;
  }

  const stop = await run("podman", ["stop", name]);
  if (!stop.ok) {
    throw new Error(`Failed to stop container '${name}': ${stop.stderr || "unknown error"}`);
  }
}

export async function tailServiceLogs(projectName: string, serviceName: string, follow: boolean): Promise<void> {
  const name = containerName(projectName, serviceName);
  const args = ["logs", ...(follow ? ["-f"] : []), name];
  const code = await runInherit("podman", args);
  if (code !== 0) {
    throw new Error(`Failed to fetch logs for '${name}'.`);
  }
}

export async function execServiceCommand(projectName: string, serviceName: string, command: string[]): Promise<void> {
  const name = containerName(projectName, serviceName);
  if (command.length === 0) {
    throw new Error("Command required for loom exec.");
  }

  const args = ["exec", "-it", name, ...command];
  const code = await runInherit("podman", args);
  if (code !== 0) {
    throw new Error(`Failed to exec in '${name}'.`);
  }
}

export async function ensureComposerAvailable(projectName: string, serviceName: string): Promise<void> {
  const name = containerName(projectName, serviceName);
  const result = await run("podman", [
    "exec",
    name,
    "sh",
    "-lc",
    "command -v composer >/dev/null 2>&1 || (php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\" && php composer-setup.php --install-dir=/usr/local/bin --filename=composer && rm -f composer-setup.php)"
  ]);

  if (!result.ok) {
    throw new Error(`Failed to ensure Composer in '${name}': ${result.stderr || "unknown error"}`);
  }
}

export async function detectPodmanCapabilities(): Promise<PodmanCapabilities> {
  const versionResult = await run("podman", ["version", "--format", "{{.Version}}"]);
  if (!versionResult.ok) {
    return {
      available: false,
      rootless: false,
      machine: {
        supported: process.platform !== "linux",
        running: false
      }
    };
  }

  const rootlessResult = await run("podman", ["info", "--format", "{{.Host.Security.Rootless}}"]);
  const rootless = rootlessResult.ok ? rootlessResult.stdout.toLowerCase() === "true" : false;

  const machineSupported = process.platform !== "linux";
  let machineRunning = false;

  if (machineSupported) {
    const machineResult = await run("podman", ["machine", "inspect", "--format", "{{.State}}"]);
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
  if (process.platform === "linux") {
    return;
  }

  const capabilities = await detectPodmanCapabilities();
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

  const startResult = await run("podman", ["machine", "start"]);
  if (!startResult.ok) {
    const initResult = await run("podman", ["machine", "init"]);
    if (!initResult.ok) {
      throw new Error(`Unable to initialize Podman Machine: ${initResult.stderr || "unknown error"}`);
    }

    const retryStart = await run("podman", ["machine", "start"]);
    if (!retryStart.ok) {
      throw new Error(`Unable to start Podman Machine: ${retryStart.stderr || "unknown error"}`);
    }
  }
}
