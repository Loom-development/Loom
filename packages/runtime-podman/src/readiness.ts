import { Socket } from "node:net";
import { containerName, inspectContainer, parseHostPorts } from "./containers.js";
import type { ContainerSummary } from "./types.js";

export interface ServiceReadinessOptions {
  command?: string;
  ports?: string[];
  intervalSeconds?: number;
  timeoutSeconds?: number;
  retries?: number;
  startPeriodSeconds?: number;
}

interface WaitForServiceReadyDependencies {
  inspectContainerByName?: (name: string) => Promise<ContainerSummary | null>;
  sleep?: (ms: number) => Promise<void>;
  arePortsReachable?: (ports: number[], timeoutMs: number) => Promise<boolean>;
  now?: () => number;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isPortOpen(port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    let settled = false;

    const finish = (result: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, "127.0.0.1");
  });
}

export async function arePortsReachable(ports: number[], timeoutMs: number): Promise<boolean> {
  if (ports.length === 0) {
    return false;
  }

  const results = await Promise.all(ports.map((port) => isPortOpen(port, timeoutMs)));
  return results.every(Boolean);
}

export async function waitForServiceReady(
  projectName: string,
  serviceName: string,
  options?: ServiceReadinessOptions
): Promise<void> {
  return waitForServiceReadyWithDependencies(projectName, serviceName, options);
}

export async function waitForServiceReadyWithDependencies(
  projectName: string,
  serviceName: string,
  options: ServiceReadinessOptions | undefined,
  dependencies: WaitForServiceReadyDependencies = {}
): Promise<void> {
  const inspectContainerByName = dependencies.inspectContainerByName ?? inspectContainer;
  const delay = dependencies.sleep ?? sleep;
  const portsReachable = dependencies.arePortsReachable ?? arePortsReachable;
  const now = dependencies.now ?? Date.now;
  const name = containerName(projectName, serviceName);
  const startPeriodMs = (options?.startPeriodSeconds ?? 0) * 1000;

  if (startPeriodMs > 0) {
    await delay(startPeriodMs);
  }

  const intervalMs = (options?.intervalSeconds ?? 2) * 1000;
  const retries = options?.retries ?? 30;
  const timeoutMs = Math.max(retries * intervalMs, 60_000);
  const probeTimeoutMs = (options?.timeoutSeconds ?? 2) * 1000;
  const hostPorts = parseHostPorts(options?.ports);
  const hasExplicitReadinessProbe = Boolean(options?.command) || hostPorts.length > 0;
  const stableRunningChecksRequired = hasExplicitReadinessProbe ? 1 : 2;
  let stableRunningChecks = 0;

  let attempts = 0;
  const startedAt = now();

  while (attempts < retries && now() - startedAt <= timeoutMs) {
    attempts += 1;
    const info = await inspectContainerByName(name);
    if (!info) {
      throw new Error(`Container '${name}' not found while waiting for readiness.`);
    }

    if (!info.running) {
      throw new Error(`Container '${name}' exited before becoming ready.`);
    }

    stableRunningChecks += 1;

    if (info.health) {
      if (info.health.toLowerCase() === "healthy") {
        return;
      }

      if (info.health.toLowerCase() === "unhealthy") {
        throw new Error(`Container '${name}' reported unhealthy status.`);
      }

      await delay(intervalMs);
      continue;
    }

    if (hostPorts.length > 0) {
      const reachable = await portsReachable(hostPorts, probeTimeoutMs);
      if (reachable) {
        return;
      }

      await delay(intervalMs);
      continue;
    }

    if (stableRunningChecks >= stableRunningChecksRequired) {
      return;
    }

    await delay(intervalMs);
  }

  throw new Error(`Timed out waiting for service '${serviceName}' to become ready.`);
}