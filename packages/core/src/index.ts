import type { LoomConfig } from "@loom/config";
import {
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

export class LoomOrchestrator {
  constructor(
    private readonly config: LoomConfig,
    private readonly projectRoot = process.cwd()
  ) {
    void this.projectRoot;
  }

  async start(): Promise<void> {
    await ensureMachineRunning(this.config.runtime.machine?.managed ?? true);
    const capabilities = await detectPodmanCapabilities();

    if (!capabilities.available) {
      throw new Error("Podman is unavailable. Install Podman and retry `loom start`.");
    }

    if (this.config.runtime.rootless && !capabilities.rootless) {
      throw new Error("Loom config requires rootless Podman, but Podman is running rootful.");
    }

    const networkName = await ensureServiceNetwork(this.config);
    const routeBindings = resolveRouteBindings(this.config);

    let httpsInfo: { certPath: string; keyPath: string } | undefined;
    if (routeBindings.some((binding) => binding.https)) {
      const hosts = routeBindings.filter((binding) => binding.https).map((binding) => binding.host);
      httpsInfo = await ensureLocalCertificates(this.config.name, hosts);
    }

    const order = dependencyOrder(this.config);
    process.stdout.write(`Starting ${order.length} service(s) for ${this.config.name} on network ${networkName}...\n`);

    for (const serviceName of order) {
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

    if (routeBindings.length > 0) {
      const proxy = await ensureRouteProxy(this.config, routeBindings, httpsInfo ?? (await ensureLocalCertificates(this.config.name, routeBindings.map((route) => route.host))), networkName);

      process.stdout.write("Route bindings:\n");
      for (const binding of routeBindings) {
        const protocol = binding.https ? "https" : "http";
        process.stdout.write(`- ${protocol}://${binding.host} -> ${binding.service}:${binding.targetPort} (host:${binding.externalPort})\n`);
      }

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

    for (const serviceName of order) {
      await stopService(this.config.name, serviceName);
      process.stdout.write(`- stopped ${serviceName}\n`);
    }

    await stopRouteProxy(this.config.name);
    process.stdout.write("- stopped route proxy\n");
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

  async logs(serviceName: string, follow = true): Promise<void> {
    if (!this.config.services[serviceName]) {
      throw new Error(`Service '${serviceName}' is not defined in loom.yaml.`);
    }

    await tailServiceLogs(this.config.name, serviceName, follow);
  }

  async exec(serviceName: string, command: string[]): Promise<void> {
    if (!this.config.services[serviceName]) {
      throw new Error(`Service '${serviceName}' is not defined in loom.yaml.`);
    }

    await execServiceCommand(this.config.name, serviceName, command);
  }
}
