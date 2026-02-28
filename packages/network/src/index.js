import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ensurePodmanNetwork, runPodman } from "@loom/runtime-podman";
export function projectNetworkName(projectName) {
    return `loom-${projectName}`;
}
export function resolveRouteBindings(config) {
    return (config.routes ?? []).map((route) => {
        const service = config.services[route.service];
        if (!service) {
            throw new Error(`Route references unknown service '${route.service}'.`);
        }
        const mappedPort = (service.ports ?? [])
            .map((port) => port.split(":"))
            .find(([, container]) => Number(container) === route.port);
        const externalPort = mappedPort ? Number(mappedPort[0]) : route.port;
        return {
            host: route.host,
            service: route.service,
            targetPort: route.port,
            externalPort,
            https: route.https ?? true
        };
    });
}
export async function ensureServiceNetwork(config) {
    const network = projectNetworkName(config.name);
    await ensurePodmanNetwork(network);
    return network;
}
function proxyContainerName(projectName) {
    return `${projectName}-proxy`;
}
function buildCaddyfile(bindings, certPath, keyPath) {
    const sections = bindings.map((binding) => {
        const scheme = binding.https ? "https" : "http";
        const tlsConfig = binding.https ? `\n  tls ${certPath} ${keyPath}` : "";
        return `${scheme}://${binding.host} {\n  reverse_proxy ${binding.service}:${binding.targetPort}${tlsConfig}\n}`;
    });
    return `{
  auto_https off
}

${sections.join("\n\n")}
`;
}
export async function ensureRouteProxy(config, bindings, certPaths, networkName, hostHttpPort = 8080, hostHttpsPort = 8443) {
    const runDir = resolve(process.cwd(), ".loom", "network");
    await mkdir(runDir, { recursive: true });
    const caddyfilePath = resolve(runDir, `${config.name}.Caddyfile`);
    const mountedCertPath = "/certs/tls.crt";
    const mountedKeyPath = "/certs/tls.key";
    const caddyfile = buildCaddyfile(bindings, mountedCertPath, mountedKeyPath);
    await writeFile(caddyfilePath, caddyfile, "utf-8");
    const container = proxyContainerName(config.name);
    const exists = await runPodman(["container", "exists", container]);
    if (exists.ok) {
        const remove = await runPodman(["rm", "-f", container]);
        if (!remove.ok) {
            throw new Error(`Failed to replace proxy container '${container}': ${remove.stderr || "unknown error"}`);
        }
    }
    const start = await runPodman([
        "run",
        "-d",
        "--name",
        container,
        "--network",
        networkName,
        "-p",
        `${hostHttpPort}:80`,
        "-p",
        `${hostHttpsPort}:443`,
        "-v",
        `${caddyfilePath}:/etc/caddy/Caddyfile:ro`,
        "-v",
        `${certPaths.certPath}:${mountedCertPath}:ro`,
        "-v",
        `${certPaths.keyPath}:${mountedKeyPath}:ro`,
        "docker.io/library/caddy:2-alpine",
        "caddy",
        "run",
        "--config",
        "/etc/caddy/Caddyfile",
        "--adapter",
        "caddyfile"
    ]);
    if (!start.ok) {
        throw new Error(`Failed to start route proxy container '${container}': ${start.stderr || "unknown error"}`);
    }
    return {
        containerName: container,
        httpPort: hostHttpPort,
        httpsPort: hostHttpsPort
    };
}
export async function stopRouteProxy(projectName) {
    const container = proxyContainerName(projectName);
    const exists = await runPodman(["container", "exists", container]);
    if (!exists.ok) {
        return;
    }
    const remove = await runPodman(["rm", "-f", container]);
    if (!remove.ok) {
        throw new Error(`Failed to stop proxy container '${container}': ${remove.stderr || "unknown error"}`);
    }
}
//# sourceMappingURL=index.js.map