import type { LoomConfig } from "@loom/config";
import { resolve } from "node:path";
import {
  backupExtensionForServiceType,
  backupServiceToFile,
  SUPPORTED_BACKUP_SERVICE_TYPES,
  containerName,
  detectPodmanCapabilities,
  ensureComposerAvailable,
  ensureMachineRunning,
  ensureServiceStarted,
  execServiceCommand,
  inspectContainer,
  isContainerRunning,
  listProjectContainers,
  stopService,
  tailServiceLogs,
  waitForServiceReady
} from "@loom/runtime-podman";
import {
  ensureRouteProxy,
  ensureServiceNetwork,
  resolveRouteBindings,
  stopRouteProxy
} from "@loom/network";
import { ensureLocalCertificates } from "@loom/https";

export interface LoomStatus {
  project: string;
  podman: {
    available: boolean;
    version?: string;
    rootless: boolean;
    machineRunning: boolean;
  };
  services: Array<{
    name: string;
    image: string;
    container: string;
    running: boolean;
    state?: string;
    health?: string;
  }>;
  routes: Array<{
    host: string;
    target: string;
    https: boolean;
  }>;
  https?: {
    certPath: string;
    keyPath: string;
  };
  proxy?: {
    httpPort: number;
    httpsPort: number;
  };
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let index = 0; index <= a.length; index += 1) {
    matrix[index][0] = index;
  }

  for (let index = 0; index <= b.length; index += 1) {
    matrix[0][index] = index;
  }

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return matrix[a.length][b.length];
}

function closestServiceName(target: string, candidates: string[]): string | undefined {
  if (candidates.length === 0) {
    return undefined;
  }

  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: levenshteinDistance(target.toLowerCase(), candidate.toLowerCase())
    }))
    .sort((left, right) => left.score - right.score);

  const best = scored[0];
  const threshold = Math.max(2, Math.ceil(target.length * 0.4));
  return best.score <= threshold ? best.candidate : undefined;
}

function dependencyOrder(config: LoomConfig): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const ordered: string[] = [];

  const visit = (serviceName: string) => {
    if (visited.has(serviceName)) {
      return;
    }

    if (temp.has(serviceName)) {
      throw new Error(`Circular dependency detected at service '${serviceName}'.`);
    }

    const service = config.services[serviceName];
    if (!service) {
      throw new Error(`Unknown service '${serviceName}' in dependency graph.`);
    }

    temp.add(serviceName);
    for (const dependency of service.dependsOn ?? []) {
      visit(dependency);
    }
    temp.delete(serviceName);

    visited.add(serviceName);
    ordered.push(serviceName);
  };

  for (const serviceName of Object.keys(config.services)) {
    visit(serviceName);
  }

  return ordered;
}

interface StopProjectResourcesOptions {
  stopServiceByName?: (projectName: string, serviceName: string) => Promise<void>;
  stopRouteProxyByProject?: (projectName: string) => Promise<void>;
  writeOut?: (message: string) => unknown;
  writeErr?: (message: string) => unknown;
}

export async function stopProjectResources(
  projectName: string,
  order: string[],
  options: StopProjectResourcesOptions = {}
): Promise<void> {
  const stopServiceByName = options.stopServiceByName ?? stopService;
  const stopRouteProxyByProject = options.stopRouteProxyByProject ?? stopRouteProxy;
  const writeOut = options.writeOut ?? process.stdout.write.bind(process.stdout);
  const writeErr = options.writeErr ?? process.stderr.write.bind(process.stderr);
  const errors: string[] = [];

  for (const serviceName of order) {
    try {
      await stopServiceByName(projectName, serviceName);
      writeOut(`- stopped ${serviceName}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`service '${serviceName}': ${message}`);
      writeErr(`- failed stopping ${serviceName}: ${message}\n`);
    }
  }

  try {
    await stopRouteProxyByProject(projectName);
    writeOut("- stopped route proxy\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`route proxy: ${message}`);
    writeErr(`- failed stopping route proxy: ${message}\n`);
  }

  if (errors.length > 0) {
    throw new Error(`One or more resources failed to stop: ${errors.join(" | ")}`);
  }
}

export class LoomOrchestrator {
  constructor(
    private readonly config: LoomConfig,
    private readonly projectRoot = process.cwd()
  ) {
    void this.projectRoot;
  }

  private async ensureRuntimeReady(): Promise<void> {
    await ensureMachineRunning(this.config.runtime.machine?.managed ?? true);
    const capabilities = await detectPodmanCapabilities();

    if (!capabilities.available) {
      throw new Error("Podman is unavailable. Install Podman and retry `loom start`.");
    }

    if (this.config.runtime.rootless && !capabilities.rootless) {
      throw new Error("Loom config requires rootless Podman, but Podman is running rootful.");
    }
  }

  private async resolveHttpsInfo(): Promise<{ certPath: string; keyPath: string } | undefined> {
    const routeBindings = resolveRouteBindings(this.config);
    if (!routeBindings.some((binding) => binding.https)) {
      return undefined;
    }

    const hosts = routeBindings.filter((binding) => binding.https).map((binding) => binding.host);
    return ensureLocalCertificates(this.config.name, hosts);
  }

  private async startServiceByName(serviceName: string, networkName: string): Promise<void> {
    const service = this.config.services[serviceName];
    await ensureServiceStarted(this.config.name, serviceName, service, networkName);

    if (service.type.toLowerCase() === "php") {
      await ensureComposerAvailable(this.config.name, serviceName);
    }

    await waitForServiceReady(this.config.name, serviceName, {
      ...service.healthcheck,
      ports: service.ports
    });
    process.stdout.write(`- started ${serviceName}\n`);
  }

  private printRouteBindings(): void {
    const routeBindings = resolveRouteBindings(this.config);
    if (routeBindings.length === 0) {
      return;
    }

    process.stdout.write("Route bindings:\n");
    for (const binding of routeBindings) {
      const protocol = binding.https ? "https" : "http";
      process.stdout.write(
        `- ${protocol}://${binding.host} -> ${binding.service}:${binding.targetPort} (host:${binding.externalPort})\n`
      );
    }
  }

  private getService(serviceName: string) {
    return this.config.services[serviceName];
  }

  private async requireService(serviceName: string) {
    const service = this.getService(serviceName);
    if (!service) {
      throw await this.serviceNotFoundError(serviceName);
    }

    return service;
  }

  private listBackupSupportedServices(): Array<[string, LoomConfig["services"][string]]> {
    return Object.entries(this.config.services).filter(([, service]) =>
      Boolean(backupExtensionForServiceType(service.type))
    );
  }

  async start(): Promise<void> {
    await this.ensureRuntimeReady();

    const networkName = await ensureServiceNetwork(this.config);
    const routeBindings = resolveRouteBindings(this.config);
    const httpsInfo = await this.resolveHttpsInfo();

    const order = dependencyOrder(this.config);
    process.stdout.write(`Starting ${order.length} service(s) for ${this.config.name} on network ${networkName}...\n`);

    for (const serviceName of order) {
      await this.startServiceByName(serviceName, networkName);
    }

    if (routeBindings.length > 0) {
      const certificateInfo = httpsInfo ?? (await ensureLocalCertificates(this.config.name, routeBindings.map((route) => route.host)));
      const proxy = await ensureRouteProxy(this.config, routeBindings, certificateInfo, networkName);

      this.printRouteBindings();

      process.stdout.write(`Proxy ports: http://localhost:${proxy.httpPort} https://localhost:${proxy.httpsPort}\n`);
    }

    if (httpsInfo) {
      process.stdout.write(`HTTPS cert: ${httpsInfo.certPath}\n`);
      process.stdout.write(`HTTPS key: ${httpsInfo.keyPath}\n`);
    }
  }

  async stop(): Promise<void> {
    const order = dependencyOrder(this.config).reverse();
    process.stdout.write(`Stopping ${order.length} service(s) for ${this.config.name}...\n`);
    await stopProjectResources(this.config.name, order);
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  async status(): Promise<LoomStatus> {
    const capabilities = await detectPodmanCapabilities();

    const routes = resolveRouteBindings(this.config);
    const httpsHosts = routes.filter((route) => route.https).map((route) => route.host);
    const https =
      httpsHosts.length > 0
        ? await ensureLocalCertificates(this.config.name, httpsHosts)
        : undefined;

    return {
      project: this.config.name,
      podman: {
        available: capabilities.available,
        version: capabilities.version,
        rootless: capabilities.rootless,
        machineRunning: capabilities.machine.running
      },
      services: await Promise.all(
        Object.entries(this.config.services).map(async ([name, service]) => {
          const container = containerName(this.config.name, name);
          const inspected = await inspectContainer(container);

          return {
            name,
            image: service.image,
            container,
            running: await isContainerRunning(container),
            state: inspected?.state,
            health: inspected?.health
          };
        })
      ),
      routes: routes.map((route) => ({
        host: route.host,
        target: `${route.service}:${route.targetPort}`,
        https: route.https
      })),
      https,
      proxy: routes.length > 0 ? { httpPort: 8080, httpsPort: 8443 } : undefined
    };
  }

  async ps(): Promise<Array<{ name: string; state: string; running: boolean; health?: string; image: string }>> {
    return listProjectContainers(this.config.name);
  }

  async runTask(taskName: string): Promise<void> {
    const task = this.config.tasks?.[taskName];
    if (!task) {
      throw new Error(`Task '${taskName}' is not defined in loom.yaml.`);
    }

    process.stdout.write(`Running task '${taskName}' in service '${task.service}': ${task.command}\n`);
    await execServiceCommand(this.config.name, task.service, ["sh", "-lc", task.command]);
  }

  private async serviceNotFoundError(serviceName: string): Promise<Error> {
    const availableServices = Object.keys(this.config.services).sort();
    const containers = await listProjectContainers(this.config.name);
    const runningServices = containers
      .filter((container) => container.running)
      .map((container) => container.name.replace(new RegExp(`^${this.config.name}-`), ""))
      .filter((name) => this.config.services[name])
      .sort();

    const availableMessage =
      availableServices.length > 0 ? availableServices.join(", ") : "none";
    const runningMessage =
      runningServices.length > 0 ? runningServices.join(", ") : "none";
    const closestMatch = closestServiceName(serviceName, availableServices);
    const suggestion = closestMatch ? ` Did you mean '${closestMatch}'?` : "";

    return new Error(
      `Service '${serviceName}' is not defined in loom.yaml.${suggestion} Available services: ${availableMessage}. Running services: ${runningMessage}.`
    );
  }

  async logs(serviceName: string, follow = true): Promise<void> {
    await this.requireService(serviceName);

    await tailServiceLogs(this.config.name, serviceName, follow);
  }

  async exec(serviceName: string, command: string[]): Promise<void> {
    await this.requireService(serviceName);

    await execServiceCommand(this.config.name, serviceName, command);
  }

  async backup(serviceName: string, outputPath?: string): Promise<string> {
    const service = await this.requireService(serviceName);

    const extension = backupExtensionForServiceType(service.type);
    if (!extension) {
      throw new Error(
        `Service '${serviceName}' has type '${service.type}', which is not currently supported by 'loom backup'. Supported types: ${SUPPORTED_BACKUP_SERVICE_TYPES.join(", ")}.`
      );
    }

    const timestamp = new Date().toISOString().replace(/[:]/g, "-");
    const defaultPath = resolve(
      this.projectRoot,
      ".loom",
      "backups",
      `${this.config.name}-${serviceName}-${timestamp}.${extension}`
    );

    const finalPath = outputPath ? resolve(this.projectRoot, outputPath) : defaultPath;
    await backupServiceToFile(this.config.name, serviceName, service, finalPath);
    return finalPath;
  }

  async backupAll(): Promise<Array<{ service: string; path: string }>> {
    const results: Array<{ service: string; path: string }> = [];
    const supported = this.listBackupSupportedServices();

    if (supported.length === 0) {
      throw new Error(
        `No backup-supported services found in loom.yaml. Supported types: ${SUPPORTED_BACKUP_SERVICE_TYPES.join(", ")}.`
      );
    }

    for (const [serviceName] of supported) {
      const path = await this.backup(serviceName);
      results.push({ service: serviceName, path });
    }

    return results;
  }
}
