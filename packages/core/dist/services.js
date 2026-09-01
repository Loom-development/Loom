import { closestServiceName } from "./utils.js";
export function getConfiguredService(config, serviceName) {
    return config.services[serviceName];
}
export async function buildServiceNotFoundError(config, serviceName, listProjectContainersByProject) {
    const availableServices = Object.keys(config.services).sort();
    const containers = await listProjectContainersByProject(config.name);
    const runningServices = containers
        .filter((container) => container.running)
        .map((container) => container.name.replace(new RegExp(`^${config.name}-`), ""))
        .filter((name) => config.services[name])
        .sort();
    const availableMessage = availableServices.length > 0 ? availableServices.join(", ") : "none";
    const runningMessage = runningServices.length > 0 ? runningServices.join(", ") : "none";
    const closestMatch = closestServiceName(serviceName, availableServices);
    const suggestion = closestMatch ? ` Did you mean '${closestMatch}'?` : "";
    return new Error(`Service '${serviceName}' is not defined in loom.yaml.${suggestion} Available services: ${availableMessage}. Running services: ${runningMessage}.`);
}
export async function requireConfiguredService(config, serviceName, listProjectContainersByProject) {
    const service = getConfiguredService(config, serviceName);
    if (service) {
        return service;
    }
    throw await buildServiceNotFoundError(config, serviceName, listProjectContainersByProject);
}
//# sourceMappingURL=services.js.map