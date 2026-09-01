import { resolve } from "node:path";
import { requireConfiguredService } from "./services.js";
export function listBackupSupportedServices(config, backupExtensionForServiceType) {
    return Object.entries(config.services).filter(([, service]) => Boolean(backupExtensionForServiceType(service.type)));
}
export function requireBackupExtension(serviceName, serviceType, supportedBackupServiceTypes, backupExtensionForServiceType) {
    const extension = backupExtensionForServiceType(serviceType);
    if (!extension) {
        throw new Error(`Service '${serviceName}' has type '${serviceType}', which is not currently supported by 'loom backup'. Supported types: ${supportedBackupServiceTypes.join(", ")}.`);
    }
    return extension;
}
export function resolveBackupOutputPath(projectRoot, projectName, serviceName, extension, outputPath, now = new Date()) {
    if (outputPath) {
        return resolve(projectRoot, outputPath);
    }
    const timestamp = now.toISOString().replace(/[:]/g, "-");
    return resolve(projectRoot, ".loom", "backups", `${projectName}-${serviceName}-${timestamp}.${extension}`);
}
export async function backupConfiguredService(config, projectRoot, serviceName, dependencies, outputPath) {
    const service = await requireConfiguredService(config, serviceName, dependencies.listProjectContainers);
    const extension = requireBackupExtension(serviceName, service.type, dependencies.supportedBackupServiceTypes, dependencies.backupExtensionForServiceType);
    const finalPath = resolveBackupOutputPath(projectRoot, config.name, serviceName, extension, outputPath);
    await dependencies.backupServiceToFile(config.name, serviceName, service, finalPath);
    return finalPath;
}
export async function backupAllConfiguredServices(config, projectRoot, dependencies) {
    const supported = listBackupSupportedServices(config, dependencies.backupExtensionForServiceType);
    if (supported.length === 0) {
        throw new Error(`No backup-supported services found in loom.yaml. Supported types: ${dependencies.supportedBackupServiceTypes.join(", ")}.`);
    }
    const results = [];
    for (const [serviceName] of supported) {
        const path = await backupConfiguredService(config, projectRoot, serviceName, dependencies);
        results.push({ service: serviceName, path });
    }
    return results;
}
//# sourceMappingURL=backup.js.map