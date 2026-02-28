import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { Socket } from "node:net";
import { dirname, resolve } from "node:path";
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

interface BackupStrategy {
  extension: string;
  command: string[];
}

export const SUPPORTED_BACKUP_SERVICE_TYPES = [
  "mysql",
  "mariadb",
  "postgres",
  "mongodb",
  "redis",
  "sqlite",
  "sqlserver"
] as const;

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

function parseVolumeSource(volume: string): string | null {
  const source = volume.split(":")[0]?.trim();
  if (!source) {
    return null;
  }

  return source;
}

function isBindMountSource(source: string): boolean {
  return source.startsWith(".") || source.startsWith("/") || source.includes("/");
}

async function ensureBindMountParentDirs(volumes: string[] = []): Promise<void> {
  for (const volume of volumes) {
    const source = parseVolumeSource(volume);
    if (!source || !isBindMountSource(source)) {
      continue;
    }

    const absoluteSource = source.startsWith("/") ? source : resolve(process.cwd(), source);
    await mkdir(absoluteSource, { recursive: true });
  }
}

async function containerExists(name: string): Promise<boolean> {
  const exists = await run("podman", ["container", "exists", name]);
  return exists.ok;
}

async function inspectContainerImage(name: string): Promise<string> {
  const imageInspect = await run("podman", ["inspect", "--format", "{{.ImageName}}", name]);
  return imageInspect.ok ? imageInspect.stdout.trim() : "";
}

async function inspectContainerLabel(name: string, label: string): Promise<string> {
  const labelInspect = await run("podman", [
    "inspect",
    "--format",
    `{{ index .Config.Labels "${label}" }}`,
    name
  ]);

  return labelInspect.ok ? labelInspect.stdout.trim() : "";
}

function serviceConfigHash(service: LoomService): string {
  const signature = {
    type: service.type,
    image: normalizeImage(service.image),
    entrypoint: service.entrypoint ?? null,
    command: service.command ?? null,
    workdir: service.workdir ?? null,
    ports: [...(service.ports ?? [])],
    volumes: [...(service.volumes ?? [])],
    env: Object.entries(service.env ?? {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
    dependsOn: [...(service.dependsOn ?? [])],
    healthcheck: service.healthcheck
      ? {
          command: service.healthcheck.command,
          intervalSeconds: service.healthcheck.intervalSeconds ?? null,
          timeoutSeconds: service.healthcheck.timeoutSeconds ?? null,
          retries: service.healthcheck.retries ?? null,
          startPeriodSeconds: service.healthcheck.startPeriodSeconds ?? null
        }
      : null
  };

  return createHash("sha256").update(JSON.stringify(signature)).digest("hex");
}

async function removeContainer(name: string): Promise<void> {
  const remove = await run("podman", ["rm", "-f", name]);
  if (!remove.ok) {
    throw new Error(`Failed to recreate container '${name}': ${remove.stderr || "unknown error"}`);
  }
}

async function startContainer(name: string): Promise<void> {
  const start = await run("podman", ["start", name]);
  if (!start.ok) {
    throw new Error(`Failed to start existing container '${name}': ${start.stderr || "unknown error"}`);
  }
}

function appendHealthcheckArgs(args: string[], service: LoomService): void {
  if (!service.healthcheck?.command) {
    return;
  }

  args.push("--health-cmd", service.healthcheck.command);
  args.push("--health-interval", `${service.healthcheck.intervalSeconds ?? 10}s`);
  args.push("--health-timeout", `${service.healthcheck.timeoutSeconds ?? 3}s`);
  args.push("--health-retries", String(service.healthcheck.retries ?? 5));
  args.push("--health-start-period", `${service.healthcheck.startPeriodSeconds ?? 0}s`);
}

async function buildPodmanRunArgs(
  serviceName: string,
  containerNameValue: string,
  service: LoomService,
  networkName: string,
  expectedImage: string,
  expectedServiceHash: string
): Promise<string[]> {
  const args: string[] = [
    "run",
    "-d",
    "--name",
    containerNameValue,
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

  await ensureBindMountParentDirs(service.volumes ?? []);

  for (const volume of service.volumes ?? []) {
    args.push("-v", volume);
  }

  for (const [key, value] of Object.entries(service.env ?? {})) {
    args.push("-e", `${key}=${value}`);
  }

  appendHealthcheckArgs(args, service);
  args.push("--label", `loom.service-hash=${expectedServiceHash}`);
  args.push(expectedImage);

  if (service.command) {
    args.push("sh", "-lc", service.command);
  }

  return args;
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

function isInteractiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export function buildExecArgs(
  containerNameValue: string,
  command: string[],
  interactiveTerminal: boolean
): string[] {
  if (command.length === 0) {
    throw new Error("Command required for loom exec.");
  }

  const ttyArgs = interactiveTerminal ? ["-it"] : [];
  return ["exec", ...ttyArgs, containerNameValue, ...command];
}

export async function waitForServiceReady(
  projectName: string,
  serviceName: string,
  options?: {
    command?: string;
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
  const hasExplicitReadinessProbe = Boolean(options?.command) || hostPorts.length > 0;
  const stableRunningChecksRequired = hasExplicitReadinessProbe ? 1 : 2;
  let stableRunningChecks = 0;

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

    stableRunningChecks += 1;

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

    if (stableRunningChecks >= stableRunningChecksRequired) {
      return;
    }

    await sleep(intervalMs);
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
  const expectedServiceHash = serviceConfigHash(service);

  const running = await isContainerRunning(name);
  if (running) {
    return;
  }

  if (await containerExists(name)) {
    const currentImage = await inspectContainerImage(name);
    const currentServiceHash = await inspectContainerLabel(name, "loom.service-hash");

    if (
      (currentImage && currentImage !== expectedImage) ||
      !currentServiceHash ||
      currentServiceHash !== expectedServiceHash
    ) {
      await removeContainer(name);
    } else {
      await startContainer(name);
      return;
    }
  }

  const args = await buildPodmanRunArgs(
    serviceName,
    name,
    service,
    networkName,
    expectedImage,
    expectedServiceHash
  );

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
  const args = buildExecArgs(name, command, isInteractiveTerminal());
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
    "command -v composer >/dev/null 2>&1 || (EXPECTED_SIGNATURE=$(php -r \"copy('https://composer.github.io/installer.sig', 'php://stdout');\") && php -r \"copy('https://getcomposer.org/installer', 'composer-setup.php');\" && ACTUAL_SIGNATURE=$(php -r \"echo hash_file('sha384', 'composer-setup.php');\") && [ \"$EXPECTED_SIGNATURE\" = \"$ACTUAL_SIGNATURE\" ] && php composer-setup.php --install-dir=/usr/local/bin --filename=composer && rm -f composer-setup.php)"
  ]);

  if (!result.ok) {
    throw new Error(`Failed to ensure Composer in '${name}': ${result.stderr || "unknown error"}`);
  }
}

function databaseBackupStrategy(serviceType: string): BackupStrategy | null {
  const normalized = serviceType.toLowerCase();

  if (normalized === "mysql") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-lc",
        "mysqldump -h 127.0.0.1 -uroot -p\"$MYSQL_ROOT_PASSWORD\" \"${MYSQL_DATABASE:-loom}\""
      ]
    };
  }

  if (normalized === "mariadb") {
    return {
      extension: "sql",
      command: [
        "sh",
        "-lc",
        "mariadb-dump -h 127.0.0.1 -uroot -p\"$MARIADB_ROOT_PASSWORD\" \"${MARIADB_DATABASE:-loom}\""
      ]
    };
  }

  if (normalized === "postgres") {
    return {
      extension: "sql",
      command: ["sh", "-lc", "pg_dump -U \"${POSTGRES_USER:-postgres}\" \"${POSTGRES_DB:-postgres}\""]
    };
  }

  if (normalized === "mongodb") {
    return {
      extension: "archive.gz",
      command: [
        "sh",
        "-lc",
        "mongodump --archive --gzip --authenticationDatabase admin --username \"${MONGO_INITDB_ROOT_USERNAME:-root}\" --password \"${MONGO_INITDB_ROOT_PASSWORD:-example}\" --db \"${MONGO_INITDB_DATABASE:-admin}\""
      ]
    };
  }

  if (normalized === "redis") {
    return {
      extension: "rdb",
      command: ["sh", "-lc", "redis-cli SAVE >/dev/null && cat /data/dump.rdb"]
    };
  }

  if (normalized === "sqlite") {
    return {
      extension: "db",
      command: ["sh", "-lc", "cat /data/loom.db"]
    };
  }

  if (normalized === "sqlserver" || normalized === "mssql") {
    return {
      extension: "bak",
      command: [
        "sh",
        "-lc",
        "mkdir -p /var/opt/mssql/backup && /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" -Q \"BACKUP DATABASE [master] TO DISK='/var/opt/mssql/backup/loom.bak' WITH INIT\" >/dev/null && cat /var/opt/mssql/backup/loom.bak"
      ]
    };
  }

  return null;
}

export function backupExtensionForServiceType(serviceType: string): string | null {
  return databaseBackupStrategy(serviceType)?.extension ?? null;
}

export async function backupServiceToFile(
  projectName: string,
  serviceName: string,
  service: LoomService,
  outputPath: string
): Promise<void> {
  const strategy = databaseBackupStrategy(service.type);
  if (!strategy) {
    throw new Error(
      `Service type '${service.type}' does not currently support 'loom backup'. Supported types: mysql, mariadb, postgres, mongodb, redis, sqlite, sqlserver.`
    );
  }

  const name = containerName(projectName, serviceName);
  const running = await isContainerRunning(name);
  if (!running) {
    throw new Error(`Service '${serviceName}' is not running. Start it before creating a backup.`);
  }

  await mkdir(dirname(outputPath), { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const child = spawn("podman", ["exec", "-i", name, ...strategy.command], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    const target = createWriteStream(outputPath);
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => {
      target.destroy();
      reject(new Error(`Failed to run backup command for '${serviceName}'.`));
    });

    target.on("error", () => {
      child.kill();
      reject(new Error(`Failed to write backup file '${outputPath}'.`));
    });

    child.stdout.pipe(target);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Backup failed for service '${serviceName}': ${stderr.trim() || "unknown error"}`
        )
      );
    });
  });
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
