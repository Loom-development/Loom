import { defaultOrchestratorDependencies } from "./dependencies.js";

export interface StopProjectResourcesOptions {
  stopServiceByName?: (projectName: string, serviceName: string) => Promise<void>;
  stopRouteProxyByProject?: (projectName: string) => Promise<void>;
  stopRouteHostsByProject?: (projectName: string) => Promise<void>;
  writeOut?: (message: string) => unknown;
  writeErr?: (message: string) => unknown;
}

export async function stopProjectResources(
  projectName: string,
  order: string[],
  options: StopProjectResourcesOptions = {}
): Promise<void> {
  const stopServiceByName = options.stopServiceByName ?? defaultOrchestratorDependencies.stopService;
  const stopRouteProxyByProject =
    options.stopRouteProxyByProject ?? defaultOrchestratorDependencies.stopRouteProxy;
  const stopRouteHostsByProject =
    options.stopRouteHostsByProject ?? defaultOrchestratorDependencies.stopRouteHosts;
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

  try {
    await stopRouteHostsByProject(projectName);
    writeOut("- cleaned route hosts\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`route hosts: ${message}`);
    writeErr(`- failed cleaning route hosts: ${message}\n`);
  }

  if (errors.length > 0) {
    throw new Error(`One or more resources failed to stop: ${errors.join(" | ")}`);
  }
}