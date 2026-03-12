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

export function formatRouteBindings(routeBindings: RouteBindingLike[]): string[] {
  if (routeBindings.length === 0) {
    return [];
  }

  return [
    "Route bindings:\n",
    ...routeBindings.map((binding) => {
      const protocol = binding.https ? "https" : "http";
      return `- ${protocol}://${binding.host} -> ${binding.service}:${binding.targetPort} (host:${binding.externalPort})\n`;
    })
  ];
}

export function formatProxyPorts(httpPort: number, httpsPort: number): string {
  return `Proxy ports: http://localhost:${httpPort} https://localhost:${httpsPort}\n`;
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