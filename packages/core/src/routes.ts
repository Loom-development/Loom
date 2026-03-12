import type { LoomConfig } from "@loom/config";
import type { RouteBinding } from "@loom/network";
import type { OrchestratorDependencies } from "./dependencies.js";
import type { OrchestratorOutput } from "./output.js";
import { resolveHttpsInfo, resolveProxyCertificateInfo } from "./https.js";
import { formatHttpsInfo, formatProxyPorts, formatRouteBindings } from "./startup.js";

type RouteStartupDependencies = Pick<
  OrchestratorDependencies,
  "ensureLocalCertificates" | "ensureRouteProxy"
>;

type RouteStartupOutput = Pick<OrchestratorOutput, "writeOut">;

export async function publishConfiguredRoutes(
  config: LoomConfig,
  routeBindings: RouteBinding[],
  networkName: string,
  dependencies: RouteStartupDependencies,
  output: RouteStartupOutput
): Promise<void> {
  const httpsInfo = await resolveHttpsInfo(
    config.name,
    routeBindings,
    dependencies.ensureLocalCertificates
  );

  if (routeBindings.length > 0) {
    const certificateInfo = await resolveProxyCertificateInfo(
      config.name,
      routeBindings,
      dependencies.ensureLocalCertificates,
      httpsInfo
    );
    const proxy = await dependencies.ensureRouteProxy(
      config,
      routeBindings,
      certificateInfo,
      networkName
    );

    for (const line of formatRouteBindings(routeBindings)) {
      output.writeOut(line);
    }

    output.writeOut(formatProxyPorts(proxy.httpPort, proxy.httpsPort));
  }

  for (const line of formatHttpsInfo(httpsInfo)) {
    output.writeOut(line);
  }
}

export type { RouteBinding };