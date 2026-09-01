import { resolve } from "node:path";
import { requireConfiguredService } from "./services.js";
export function resolveRestoreInputPath(projectRoot, inputPath) {
    return resolve(projectRoot, inputPath);
}
export function requireRestoreSupport(serviceName, serviceType, supportedRestoreServiceTypes) {
    const normalizedType = serviceType.toLowerCase();
    if (normalizedType === "sqlserver" || normalizedType === "mssql") {
        throw new Error(`Service '${serviceName}' has type '${serviceType}', but SQL Server restore is not yet supported by 'loom restore'. The current SQL Server backup format is a live .bak of 'master', which is not safely restorable through the running container flow Loom uses today.`);
    }
    if (supportedRestoreServiceTypes.includes(normalizedType)) {
        return;
    }
    throw new Error(`Service '${serviceName}' has type '${serviceType}', which is not currently supported by 'loom restore'. Supported types: ${supportedRestoreServiceTypes.join(", ")}.`);
}
export async function restoreConfiguredService(config, projectRoot, serviceName, inputPath, dependencies) {
    const service = await requireConfiguredService(config, serviceName, dependencies.listProjectContainers);
    requireRestoreSupport(serviceName, service.type, dependencies.supportedRestoreServiceTypes);
    const finalInputPath = resolveRestoreInputPath(projectRoot, inputPath);
    if (service.type.toLowerCase() === "redis") {
        await dependencies.stopService(config.name, serviceName);
        await dependencies.restoreServiceFromFile(config.name, serviceName, service, finalInputPath);
        const networkName = await dependencies.ensureServiceNetwork(config);
        await dependencies.ensureServiceStarted(config.name, serviceName, service, networkName);
        await dependencies.waitForServiceReady(config.name, serviceName, {
            ...service.healthcheck,
            ports: service.ports,
            progressIntervalSeconds: 15
        });
        return finalInputPath;
    }
    await dependencies.restoreServiceFromFile(config.name, serviceName, service, finalInputPath);
    return finalInputPath;
}
//# sourceMappingURL=restore.js.map