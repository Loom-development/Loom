import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ensurePodmanNetwork, runPodman } from "@loom/runtime-podman";
export function projectNetworkName(projectName) {
    return `loom-${projectName}`;
}
function windowsHostsFilePath() {
    const systemRoot = process.env.SystemRoot ?? "C:\\Windows";
    return process.env.LOOM_WINDOWS_HOSTS_FILE ?? resolve(systemRoot, "System32", "drivers", "etc", "hosts");
}
function managedHostsStartMarker(projectName) {
    return `# >>> loom:${projectName}`;
}
function managedHostsEndMarker(projectName) {
    return `# <<< loom:${projectName}`;
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function removeManagedHostsBlock(content, projectName) {
    const start = escapeRegExp(managedHostsStartMarker(projectName));
    const end = escapeRegExp(managedHostsEndMarker(projectName));
    const blockPattern = new RegExp(`(?:^|\\n)${start}\\n[\\s\\S]*?\\n${end}(?=\\n|$)`, "g");
    return content.replace(blockPattern, "").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n");
}
function renderManagedHostsBlock(projectName, hosts) {
    return [
        managedHostsStartMarker(projectName),
        ...hosts.map((host) => `127.0.0.1 ${host}`),
        managedHostsEndMarker(projectName)
    ].join("\n");
}
export function applyManagedHostsEntries(content, projectName, hosts) {
    const withoutExistingBlock = removeManagedHostsBlock(content, projectName).trimEnd();
    if (hosts.length === 0) {
        return withoutExistingBlock ? `${withoutExistingBlock}\n` : "";
    }
    const nextBlock = renderManagedHostsBlock(projectName, hosts);
    return withoutExistingBlock ? `${withoutExistingBlock}\n\n${nextBlock}\n` : `${nextBlock}\n`;
}
function uniqueRouteHosts(bindings) {
    const managedHosts = [...new Set(bindings.map((binding) => binding.host).filter((host) => !host.startsWith("*.")))].sort();
    const skippedHosts = [...new Set(bindings.map((binding) => binding.host).filter((host) => host.startsWith("*.")))].sort();
    return { managedHosts, skippedHosts };
}
function assertSafeRouteHost(host) {
    const valid = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/.test(host);
    if (!valid) {
        throw new Error(`Route host '${host}' is invalid.`);
    }
}
function assertSafeServiceName(serviceName) {
    const valid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(serviceName);
    if (!valid) {
        throw new Error(`Service name '${serviceName}' is invalid for routing.`);
    }
}
function parsePublishedPort(portMapping) {
    const withoutProtocol = portMapping.split("/")[0]?.trim();
    if (!withoutProtocol) {
        return null;
    }
    const segments = withoutProtocol.split(":").map((segment) => segment.trim());
    if (segments.length < 2) {
        return null;
    }
    const host = Number(segments[segments.length - 2]);
    const container = Number(segments[segments.length - 1]);
    if (!Number.isFinite(host) || !Number.isFinite(container) || host <= 0 || container <= 0) {
        return null;
    }
    return { host, container };
}
export function resolveRouteBindings(config) {
    return (config.routes ?? []).map((route) => {
        assertSafeRouteHost(route.host);
        assertSafeServiceName(route.service);
        const service = config.services[route.service];
        if (!service) {
            throw new Error(`Route references unknown service '${route.service}'.`);
        }
        const mappedPort = (service.ports ?? [])
            .map((port) => parsePublishedPort(port))
            .find((mapping) => mapping?.container === route.port);
        const externalPort = mappedPort ? mappedPort.host : route.port;
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
const SHARED_PROXY = "loom-proxy";
const PROXY_SITES_DIR = "/etc/caddy/sites";
function proxyContainerName() {
    return SHARED_PROXY;
}
function buildProjectCaddyfile(bindings, certPath, keyPath) {
    return bindings.map((binding) => {
        const scheme = binding.https ? "https" : "http";
        const tlsConfig = binding.https ? `\n  tls ${certPath} ${keyPath}` : "";
        return `${scheme}://${binding.host} {\n  reverse_proxy ${binding.service}:${binding.targetPort}${tlsConfig}\n}`;
    }).join("\n\n");
}
function buildMainCaddyfile() {
    return `{
  auto_https off
}
import ${PROXY_SITES_DIR}/*
`;
}
async function writeSharedProxyConfig(projectName, bindings, certPath, keyPath, networkDir) {
    await mkdir(networkDir, { recursive: true });
    const projectFile = resolve(networkDir, `${projectName}.Caddyfile`);
    const mainFile = resolve(networkDir, "Caddyfile");
    if (bindings.length > 0) {
        await writeFile(projectFile, buildProjectCaddyfile(bindings, certPath, keyPath), "utf-8");
    }
    else {
        try {
            await rm(projectFile, { force: true });
        }
        catch { /* ignore */ }
    }
    await writeFile(mainFile, buildMainCaddyfile(), "utf-8");
}
export async function ensureRouteProxy(config, bindings, certPaths, networkName, hostHttpPort = 8080, hostHttpsPort = 8443) {
    const runDir = resolve(process.cwd(), ".loom", "network");
    const mountedCertPath = "/certs/tls.crt";
    const mountedKeyPath = "/certs/tls.key";
    const container = proxyContainerName();
    await writeSharedProxyConfig(config.name, bindings, mountedCertPath, mountedKeyPath, runDir);
    const exists = await runPodman(["container", "exists", container]);
    if (!exists.ok) {
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
            `${runDir}:/etc/caddy/sites:ro`,
            "-v",
            `${certPaths.certPath}:${mountedCertPath}:ro`,
            "-v",
            `${certPaths.keyPath}:${mountedKeyPath}:ro`,
            "docker.io/library/caddy:2-alpine",
            "caddy",
            "run",
            "--config",
            "/etc/caddy/sites/Caddyfile",
            "--adapter",
            "caddyfile"
        ]);
        if (!start.ok) {
            throw new Error(`Failed to start route proxy container '${container}': ${start.stderr || "unknown error"}`);
        }
    }
    return {
        containerName: container,
        httpPort: hostHttpPort,
        httpsPort: hostHttpsPort
    };
}
export async function ensureRouteHosts(projectName, bindings) {
    const result = uniqueRouteHosts(bindings);
    const hostsPath = process.platform === "win32" ? windowsHostsFilePath() : "/etc/hosts";
    try {
        const currentContent = await readFile(hostsPath, "utf-8");
        const nextContent = applyManagedHostsEntries(currentContent, projectName, result.managedHosts);
        if (nextContent !== currentContent) {
            await writeFile(hostsPath, nextContent, "utf-8");
        }
        return result;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`Warning: Failed to write hosts file (${message})\n`);
        return { managedHosts: [], skippedHosts: result.skippedHosts, pendingHosts: result.managedHosts };
    }
}
export async function stopRouteProxy(projectName) {
    const runDir = resolve(process.cwd(), ".loom", "network");
    const projectFile = resolve(runDir, `${projectName}.Caddyfile`);
    try {
        await rm(projectFile, { force: true });
    }
    catch { /* ignore */ }
    const mainFile = resolve(runDir, "Caddyfile");
    try {
        await writeFile(mainFile, buildMainCaddyfile(), "utf-8");
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}
export async function stopRouteHosts(projectName) {
    const hostsPath = process.platform === "win32" ? windowsHostsFilePath() : "/etc/hosts";
    try {
        const currentContent = await readFile(hostsPath, "utf-8");
        const nextContent = removeManagedHostsBlock(currentContent, projectName);
        if (nextContent !== currentContent) {
            await writeFile(hostsPath, nextContent, "utf-8");
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        process.stderr.write(`Warning: Failed to clean hosts file (${message})\n`);
    }
}
//# sourceMappingURL=index.js.map