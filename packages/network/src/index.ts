import type { LoomConfig } from "@loom/config";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { CertificatePaths } from "@loom/https";
import { ensurePodmanNetwork, runPodman } from "@loom/runtime-podman";

export interface RouteBinding {
  host: string;
  service: string;
  targetPort: number;
  externalPort: number;
  https: boolean;
}

export interface ProxyRuntime {
  containerName: string;
  httpPort: number;
  httpsPort: number;
}

export function projectNetworkName(projectName: string): string {
  return `loom-${projectName}`;
}

function assertSafeRouteHost(host: string): void {
  const valid = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/.test(host);
  if (!valid) {
    throw new Error(`Route host '${host}' is invalid.`);
  }
}

function assertSafeServiceName(serviceName: string): void {
  const valid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(serviceName);
  if (!valid) {
    throw new Error(`Service name '${serviceName}' is invalid for routing.`);
  }
}

function parsePublishedPort(portMapping: string): { host: number; container: number } | null {
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

export function resolveRouteBindings(config: LoomConfig): RouteBinding[] {
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

export async function ensureServiceNetwork(config: LoomConfig): Promise<string> {
  const network = projectNetworkName(config.name);
  await ensurePodmanNetwork(network);
  return network;
}

function proxyContainerName(projectName: string): string {
  return `${projectName}-proxy`;
}

function buildCaddyfile(bindings: RouteBinding[], certPath: string, keyPath: string): string {
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

export async function ensureRouteProxy(
  config: LoomConfig,
  bindings: RouteBinding[],
  certPaths: CertificatePaths,
  networkName: string,
  hostHttpPort = 8080,
  hostHttpsPort = 8443
): Promise<ProxyRuntime> {
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

export async function stopRouteProxy(projectName: string): Promise<void> {
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
