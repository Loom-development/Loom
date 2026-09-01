import { defaultOrchestratorDependencies } from "./dependencies.js";
import { backupAllConfiguredServices, backupConfiguredService } from "./backup.js";
import { restoreConfiguredService } from "./restore.js";
import { defaultOrchestratorOutput } from "./output.js";
export { stopProjectResources } from "./lifecycle.js";
import { stopProjectResources } from "./lifecycle.js";
import { requireConfiguredService } from "./services.js";
import { buildLoomStatus } from "./status.js";
import { formatStartupNotice, formatStartHeader } from "./startup.js";
export { formatStartupNotice } from "./startup.js";
import { publishConfiguredRoutes } from "./routes.js";
import { ensureRuntimeReady } from "./runtime.js";
import { startConfiguredService } from "./service-start.js";
import { requireConfiguredTask } from "./tasks.js";
import { dependencyOrder } from "./utils.js";
export class LoomOrchestrator {
    config;
    projectRoot;
    dependencies;
    output;
    constructor(config, projectRoot = process.cwd(), dependencies = defaultOrchestratorDependencies, output = defaultOrchestratorOutput) {
        this.config = config;
        this.projectRoot = projectRoot;
        this.dependencies = dependencies;
        this.output = output;
    }
    async recreateExistingProjectContainers() {
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
    async start(options = {}) {
        await ensureRuntimeReady(this.config, this.dependencies);
        if (options.recreate) {
            await this.recreateExistingProjectContainers();
        }
        const networkName = await this.dependencies.ensureServiceNetwork(this.config);
        const routeBindings = this.dependencies.resolveRouteBindings(this.config);
        const order = dependencyOrder(this.config);
        this.output.writeOut(formatStartupNotice());
        this.output.writeOut(formatStartHeader(this.config.name, order.length, networkName));
        for (const serviceName of order) {
            await startConfiguredService(this.config, serviceName, networkName, this.dependencies, this.output);
        }
        await publishConfiguredRoutes(this.config, routeBindings, networkName, this.dependencies, this.output);
    }
    async stop() {
        const order = dependencyOrder(this.config).reverse();
        this.output.writeOut(`Stopping ${order.length} service(s) for ${this.config.name}...\n`);
        await stopProjectResources(this.config.name, order, {
            stopServiceByName: this.dependencies.stopService,
            stopRouteHostsByProject: this.dependencies.stopRouteHosts,
            stopRouteProxyByProject: this.dependencies.stopRouteProxy,
            writeOut: this.output.writeOut,
            writeErr: this.output.writeErr
        });
    }
    async restart(options = {}) {
        await this.stop();
        await this.start(options);
    }
    async status() {
        return buildLoomStatus(this.config, this.dependencies);
    }
    async ps() {
        return this.dependencies.listProjectContainers(this.config.name);
    }
    async runTask(taskName) {
        const task = requireConfiguredTask(this.config, taskName);
        const service = await requireConfiguredService(this.config, task.service, this.dependencies.listProjectContainers);
        this.output.writeOut(`Running task '${taskName}' in service '${task.service}': ${task.command}\n`);
        await this.dependencies.execServiceCommand(this.config.name, task.service, ["sh", "-c", task.command], service.execUser, service.workdir);
    }
    async logs(serviceName, follow = true) {
        await requireConfiguredService(this.config, serviceName, this.dependencies.listProjectContainers);
        await this.dependencies.tailServiceLogs(this.config.name, serviceName, follow);
    }
    async exec(serviceName, command) {
        const service = await requireConfiguredService(this.config, serviceName, this.dependencies.listProjectContainers);
        await this.dependencies.execServiceCommand(this.config.name, serviceName, command, service.execUser, service.workdir);
    }
    async backup(serviceName, outputPath) {
        return backupConfiguredService(this.config, this.projectRoot, serviceName, this.dependencies, outputPath);
    }
    async backupAll() {
        return backupAllConfiguredServices(this.config, this.projectRoot, this.dependencies);
    }
    async restore(serviceName, inputPath) {
        return restoreConfiguredService(this.config, this.projectRoot, serviceName, inputPath, this.dependencies);
    }
}
//# sourceMappingURL=index.js.map