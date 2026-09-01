export function formatStartupNotice() {
    return "Note: Startup may take a few minutes while Loom downloads images and installs dependencies. Starts using cached resources are usually faster.\n";
}
export function formatStartHeader(projectName, serviceCount, networkName) {
    return `Starting ${serviceCount} service(s) for ${projectName} on network ${networkName}...\n`;
}
export function formatStartedService(serviceName) {
    return `- started ${serviceName}\n`;
}
export function formatWaitingService(serviceName, detail, elapsedSeconds) {
    return `- waiting for ${serviceName} readiness (${detail}, ${elapsedSeconds}s elapsed)\n`;
}
export function formatRouteBindings(routeBindings, proxyPorts) {
    if (routeBindings.length === 0) {
        return [];
    }
    return [
        "Route bindings:\n",
        ...routeBindings.map((binding) => {
            const protocol = binding.https ? "https" : "http";
            const proxyPort = proxyPorts ? (binding.https ? proxyPorts.https : proxyPorts.http) : undefined;
            const hostUrl = proxyPort ? `${protocol}://${binding.host}:${proxyPort}` : `${protocol}://${binding.host}`;
            const directProtocol = binding.targetPort === 443 ? "https" : "http";
            return `- ${hostUrl} -> ${binding.service}:${binding.targetPort} (direct: ${directProtocol}://localhost:${binding.externalPort}/)\n`;
        })
    ];
}
export function formatProxyPorts(httpPort, httpsPort) {
    return `Route proxy listener ports: http://localhost:${httpPort} https://localhost:${httpsPort} (use with configured route hostnames)\n`;
}
export function formatHttpsInfo(httpsInfo) {
    if (!httpsInfo) {
        return [];
    }
    return [
        `HTTPS cert: ${httpsInfo.certPath}\n`,
        `HTTPS key: ${httpsInfo.keyPath}\n`
    ];
}
export function formatBrowserUrl(routeBindings, proxyPorts) {
    if (routeBindings.length === 0) {
        return [];
    }
    return routeBindings.map((binding) => {
        const protocol = binding.https ? "https" : "http";
        const proxyPort = proxyPorts ? (binding.https ? proxyPorts.https : proxyPorts.http) : undefined;
        const url = proxyPort ? `${protocol}://${binding.host}:${proxyPort}` : `${protocol}://${binding.host}`;
        return `\n\u2192 Open ${url} in your browser\n`;
    });
}
//# sourceMappingURL=startup.js.map