import type { LoomConfig } from "@loom/config";
import {
  defaultOrchestratorDependencies,
  type OrchestratorDependencies
} from "./dependencies.js";
import {
  backupAllConfiguredServices,
  backupConfiguredService
} from "./backup.js";
import {
  defaultOrchestratorOutput,
  type OrchestratorOutput
} from "./output.js";
export { stopProjectResources } from "./lifecycle.js";
import { stopProjectResources } from "./lifecycle.js";
import { requireConfiguredService } from "./services.js";
import { buildLoomStatus, type LoomStatus } from "./status.js";
import {
  formatStartHeader
} from "./startup.js";
import { publishConfiguredRoutes } from "./routes.js";
import { ensureRuntimeReady } from "./runtime.js";
import { startConfiguredService } from "./service-start.js";
import { requireConfiguredTask } from "./tasks.js";
import { dependencyOrder } from "./utils.js";

export class LoomOrchestrator {
  constructor(
    private readonly config: LoomConfig,
    private readonly projectRoot = process.cwd(),
    private readonly dependencies: OrchestratorDependencies = defaultOrchestratorDependencies,
    private readonly output: OrchestratorOutput = defaultOrchestratorOutput
  ) {
    void this.projectRoot;
  }

  private async recreateExistingProjectContainers(): Promise<void> {
    const containers = await this.dependencies.listProjectContainers(this.config.name);
    if (containers.length === 0) {
      return;
    }

    this.output.writeOut(`Recreating ${containers.length} existing container(s) for ${this.config.name}...\n`);

    for (const container of containers) {
      await this.dependencies.removeContainer(container.name);
      this.output.writeOut(`- removed ${container.name}\n`);
    }
  }

  async start(options: { recreate?: boolean } = {}): Promise<void> {
    await ensureRuntimeReady(this.config, this.dependencies);

    if (options.recreate) {
      await this.recreateExistingProjectContainers();
    }

    const networkName = await this.dependencies.ensureServiceNetwork(this.config);
    const routeBindings = this.dependencies.resolveRouteBindings(this.config);
    const order = dependencyOrder(this.config);
    this.output.writeOut(formatStartHeader(this.config.name, order.length, networkName));

    for (const serviceName of order) {
      await startConfiguredService(this.config, serviceName, networkName, this.dependencies, this.output);
    }

    await publishConfiguredRoutes(this.config, routeBindings, networkName, this.dependencies, this.output);
  }

  async stop(): Promise<void> {
    const order = dependencyOrder(this.config).reverse();
    this.output.writeOut(`Stopping ${order.length} service(s) for ${this.config.name}...\n`);
    await stopProjectResources(this.config.name, order, {
      stopServiceByName: this.dependencies.stopService,
      stopRouteProxyByProject: this.dependencies.stopRouteProxy,
      writeOut: this.output.writeOut,
      writeErr: this.output.writeErr
    });
  }

  async restart(options: { recreate?: boolean } = {}): Promise<void> {
    await this.stop();
    await this.start(options);
  }

  async status(): Promise<LoomStatus> {
    return buildLoomStatus(this.config, this.dependencies);
  }

  async ps(): Promise<Array<{ name: string; state: string; running: boolean; health?: string; image: string }>> {
    return this.dependencies.listProjectContainers(this.config.name);
  }

  async runTask(taskName: string): Promise<void> {
    const task = requireConfiguredTask(this.config, taskName);

    this.output.writeOut(`Running task '${taskName}' in service '${task.service}': ${task.command}\n`);
    await this.dependencies.execServiceCommand(this.config.name, task.service, ["sh", "-lc", task.command]);
  }

  async logs(serviceName: string, follow = true): Promise<void> {
    await requireConfiguredService(
      this.config,
      serviceName,
      this.dependencies.listProjectContainers
    );

    await this.dependencies.tailServiceLogs(this.config.name, serviceName, follow);
  }

  async exec(serviceName: string, command: string[]): Promise<void> {
    await requireConfiguredService(
      this.config,
      serviceName,
      this.dependencies.listProjectContainers
    );

    await this.dependencies.execServiceCommand(this.config.name, serviceName, command);
  }

  async backup(serviceName: string, outputPath?: string): Promise<string> {
    return backupConfiguredService(
      this.config,
      this.projectRoot,
      serviceName,
      this.dependencies,
      outputPath
    );
  }

  async backupAll(): Promise<Array<{ service: string; path: string }>> {
    return backupAllConfiguredServices(this.config, this.projectRoot, this.dependencies);
  }
}
