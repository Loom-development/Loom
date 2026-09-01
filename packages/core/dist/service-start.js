import { formatStartedService, formatWaitingService } from "./startup.js";
export async function startConfiguredService(config, serviceName, networkName, dependencies, output) {
    const service = config.services[serviceName];
    await dependencies.ensureServiceStarted(config.name, serviceName, service, networkName);
    if (service.type.toLowerCase() === "php" && service.composer !== false) {
        await dependencies.ensureComposerAvailable(config.name, serviceName);
    }
    await dependencies.waitForServiceReady(config.name, serviceName, {
        ...service.healthcheck,
        ports: service.ports,
        progressIntervalSeconds: 15,
        onProgress(progress) {
            output.writeOut(formatWaitingService(serviceName, progress.detail, progress.elapsedSeconds));
        }
    });
    output.writeOut(formatStartedService(serviceName));
}
//# sourceMappingURL=service-start.js.map