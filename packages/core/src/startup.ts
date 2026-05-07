interface RouteBindingLike {
  host: string;
  service: string;
  targetPort: number;
  externalPort: number;
  https: boolean;
}

interface HttpsInfoLike {
  certPath: string;
  keyPath: string;
}

export function formatStartHeader(projectName: string, serviceCount: number, networkName: string): string {
  return `Starting ${serviceCount} service(s) for ${projectName} on network ${networkName}...\n`;
}

export function formatStartedService(serviceName: string): string {
  return `- started ${serviceName}\n`;
}

export function formatWaitingService(serviceName: string, detail: string, elapsedSeconds: number): string {
  return `- waiting for ${serviceName} readiness (${detail}, ${elapsedSeconds}s elapsed)\n`;
}

export function formatRouteBindings(routeBindings: RouteBindingLike[]): string[] {
  if (routeBindings.length === 0) {
    return [];
  }

  return [
    "Route bindings:\n",
    ...routeBindings.map((binding) => {
      const protocol = binding.https ? "https" : "http";
      const directProtocol = binding.targetPort === 443 ? "https" : "http";
      return `- ${protocol}://${binding.host} -> ${binding.service}:${binding.targetPort} (direct: ${directProtocol}://localhost:${binding.externalPort}/)\n`;
    })
  ];
}

export function formatProxyPorts(httpPort: number, httpsPort: number): string {
  return `Route proxy listener ports: http://localhost:${httpPort} https://localhost:${httpsPort} (use with configured route hostnames)\n`;
}

export function formatHttpsInfo(httpsInfo?: HttpsInfoLike): string[] {
  if (!httpsInfo) {
    return [];
  }

  return [
    `HTTPS cert: ${httpsInfo.certPath}\n`,
    `HTTPS key: ${httpsInfo.keyPath}\n`
  ];
}