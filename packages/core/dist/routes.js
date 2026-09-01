import { resolveHttpsInfo, resolveProxyCertificateInfo } from "./https.js";
import { formatBrowserUrl, formatHttpsInfo, formatProxyPorts, formatRouteBindings } from "./startup.js";
export async function publishConfiguredRoutes(config, routeBindings, networkName, dependencies, output) {
    const httpsInfo = await resolveHttpsInfo(config.name, routeBindings, dependencies.ensureLocalCertificates);
    if (routeBindings.length > 0) {
        const certificateInfo = await resolveProxyCertificateInfo(config.name, routeBindings, dependencies.ensureLocalCertificates, httpsInfo);
        const proxy = await dependencies.ensureRouteProxy(config, routeBindings, certificateInfo, networkName);
        for (const line of formatRouteBindings(routeBindings, { http: proxy.httpPort, https: proxy.httpsPort })) {
            output.writeOut(line);
        }
        output.writeOut(formatProxyPorts(proxy.httpPort, proxy.httpsPort));
        try {
            const routeHosts = await dependencies.ensureRouteHosts(config.name, routeBindings);
            if (routeHosts.managedHosts.length > 0) {
                output.writeOut(`Hosts entries added: ${routeHosts.managedHosts.join(", ")} -> 127.0.0.1\n`);
            }
            if (routeHosts.skippedHosts.length > 0) {
                output.writeErr(`Skipped wildcard hosts: ${routeHosts.skippedHosts.join(", ")}\n`);
            }
            if (routeHosts.pendingHosts && routeHosts.pendingHosts.length > 0) {
                output.writeOut(`To enable route hostnames, add to /etc/hosts:\n${routeHosts.pendingHosts.map((h) => `  127.0.0.1 ${h}`).join("\n")}\n`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            output.writeErr(`Warning: failed to manage Windows hosts entries automatically: ${message}\n`);
        }
        for (const line of formatBrowserUrl(routeBindings, { http: proxy.httpPort, https: proxy.httpsPort })) {
            output.writeOut(line);
        }
    }
    for (const line of formatHttpsInfo(httpsInfo)) {
        output.writeOut(line);
    }
}
//# sourceMappingURL=routes.js.map