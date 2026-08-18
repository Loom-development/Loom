import { constants } from "node:fs";
import { access, lstat, readdir } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve } from "node:path";
import type { LoomConfig } from "@loom/config";
import { detectPodmanCapabilities, type PodmanCapabilities } from "@loom/runtime-podman";
import type { LoadedProjectManifest } from "./project-manifest.js";
import type { StackDefinition } from "./stacks.js";

export type DoctorStatus = "pass" | "warning" | "failure";
export interface DoctorResult { id: string; status: DoctorStatus; summary: string; detail?: string }
export interface DoctorProbes {
  podman(): Promise<PodmanCapabilities>;
  architecture(): NodeJS.Architecture;
  pathState(path: string): Promise<{ exists: boolean; uid?: number; writable: boolean }>;
  portAvailable(port: number): Promise<boolean>;
  hostsWritable(): Promise<boolean>;
}

export interface RunProjectDoctorOptions {
  projectRoot: string;
  config: LoomConfig;
  manifest: LoadedProjectManifest;
  stack?: StackDefinition;
  probes?: DoctorProbes;
}

const dependencyManifests = new Set(["package.json", "composer.json", "pyproject.toml", "requirements.txt", "Gemfile", "pom.xml", "build.gradle", "build.gradle.kts"]);
const lockfileFamilies = [
  { manifest: "package.json", locks: ["bun.lock", "bun.lockb", "npm-shrinkwrap.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"] },
  { manifest: "composer.json", locks: ["composer.lock"] },
  { manifest: "pyproject.toml", locks: ["Pipfile.lock", "poetry.lock", "uv.lock"] },
  { manifest: "Gemfile", locks: ["Gemfile.lock"] },
  { manifest: "pom.xml", locks: ["gradle.lockfile"] }
] as const;

function result(id: string, status: DoctorStatus, summary: string, detail?: string): DoctorResult {
  return { id, status, summary, ...(detail ? { detail } : {}) };
}

async function fileNames(projectRoot: string, excluded: readonly string[]): Promise<Set<string>> {
  const found = new Set<string>();
  const excludedPaths = new Set([".loom", ...excluded]);
  async function walk(directory: string, relativeDirectory: string, depth: number): Promise<void> {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      if (entry.isFile() && (dependencyManifests.has(entry.name) || lockfileFamilies.some(({ locks }) => locks.includes(entry.name as never)))) found.add(entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (entry.isDirectory() && depth < 4 && !excludedPaths.has(relativePath)) await walk(resolve(directory, entry.name), relativePath, depth + 1);
    }
  }
  await walk(projectRoot, "", 0);
  return found;
}

interface PortMapping { hostPort?: number; containerPort: number }
function parsePortMapping(mapping: string): PortMapping | undefined {
  const protocolParts = mapping.split("/");
  if (protocolParts.length > 2 || (protocolParts[1] !== undefined && protocolParts[1] !== "tcp")) return undefined;
  const parts = protocolParts[0]!.split(":");
  if (parts.length < 1 || parts.length > 3) return undefined;
  const numbers = parts.length === 3 ? parts.slice(1) : parts;
  if (parts.length === 3 && !parts[0]) return undefined;
  if (!numbers.every((value) => /^\d+$/.test(value))) return undefined;
  const parsed = numbers.map(Number);
  if (parsed.some((port) => port < 1 || port > 65_535)) return undefined;
  return parsed.length === 1 ? { containerPort: parsed[0]! } : { hostPort: parsed[0]!, containerPort: parsed[1]! };
}

async function manifestCheck(options: RunProjectDoctorOptions): Promise<DoctorResult> {
  if (options.manifest.kind === "missing") return result("manifest", "failure", "Project manifest is missing");
  if (options.manifest.kind === "migration-required") return result("manifest", "warning", "Project manifest requires migration", "Run loom upgrade --initialize-baseline.");
  if (!options.stack || options.stack.id !== options.manifest.manifest.stack.id) return result("manifest", "failure", "Manifest selects an unknown stack", options.manifest.manifest.stack.id);
  if (options.manifest.manifest.stack.scaffoldVersion !== options.stack.scaffoldVersion) return result("manifest", "warning", "Project scaffold differs from this Loom release", `${options.manifest.manifest.stack.scaffoldVersion} -> ${options.stack.scaffoldVersion}`);
  return result("manifest", "pass", "Project manifest is current");
}

async function podmanCheck(config: LoomConfig, probes: DoctorProbes): Promise<DoctorResult> {
  if (!config.runtime.rootless) return result("podman", "failure", "Project configuration does not enable rootless Podman");
  const capabilities = await probes.podman();
  if (!capabilities.available) return result("podman", "failure", "Podman is unavailable");
  if (!capabilities.rootless) return result("podman", "failure", "Podman is not running rootless");
  return result("podman", "pass", "Rootless Podman is available", capabilities.version);
}

function architectureCheck(stack: StackDefinition | undefined, probes: DoctorProbes): DoctorResult {
  const architecture = probes.architecture();
  if (!stack) return result("architecture", "failure", "Stack compatibility is unknown");
  return stack.compatibility.architectures.includes(architecture)
    ? result("architecture", "pass", `Host architecture ${architecture} is supported`)
    : result("architecture", "failure", `Host architecture ${architecture} is unsupported`);
}

async function lockfilesCheck(projectRoot: string, stack: StackDefinition | undefined): Promise<DoctorResult> {
  const names = await fileNames(projectRoot, stack?.generatedPaths.map(({ path }) => path) ?? []);
  const problems: string[] = [];
  for (const family of lockfileFamilies) {
    if (!names.has(family.manifest)) continue;
    const present = family.locks.filter((lock) => names.has(lock));
    if (present.length === 0) problems.push(`${family.manifest}: missing lockfile`);
    else if (present.length > 1) problems.push(`${family.manifest}: conflicting lockfiles (${present.join(", ")})`);
  }
  if (!problems.length) return result("lockfiles", "pass", "Dependency lockfiles are consistent");
  const conflicts = problems.filter((problem) => problem.includes("conflicting"));
  return result("lockfiles", conflicts.length ? "failure" : "warning", conflicts.length ? "Dependency lockfiles conflict" : "Dependency lockfiles are missing", problems.join("; "));
}

async function dependenciesCheck(projectRoot: string, stack: StackDefinition | undefined, probes: DoctorProbes): Promise<DoctorResult> {
  if (!stack) return result("dependencies", "failure", "Dependency paths cannot be checked for an unknown stack");
  const failures: string[] = [];
  const currentUid = process.getuid?.();
  for (const item of stack.generatedPaths.filter(({ category }) => category === "dependency")) {
    const state = await probes.pathState(resolve(projectRoot, item.path));
    if (!state.exists) continue;
    if (!state.writable) failures.push(`${item.path} is not writable`);
    if (currentUid !== undefined && state.uid !== undefined && state.uid !== currentUid) failures.push(`${item.path} is owned by uid ${state.uid}`);
  }
  return failures.length
    ? result("dependencies", "failure", "Dependency paths have ownership or permission problems", failures.join("; "))
    : result("dependencies", "pass", "Dependency paths are writable");
}

function parsedServicePorts(config: LoomConfig): { mappings: Map<string, PortMapping[]>; errors: string[] } {
  const mappings = new Map<string, PortMapping[]>();
  const errors: string[] = [];
  for (const [serviceName, service] of Object.entries(config.services).sort(([a], [b]) => a.localeCompare(b))) {
    const parsed: PortMapping[] = [];
    for (const mapping of service.ports ?? []) {
      const value = parsePortMapping(mapping);
      if (value) parsed.push(value); else errors.push(`${serviceName}: ${mapping}`);
    }
    mappings.set(serviceName, parsed);
  }
  return { mappings, errors };
}

async function portsCheck(config: LoomConfig, probes: DoctorProbes, parsed: ReturnType<typeof parsedServicePorts>): Promise<DoctorResult> {
  if (parsed.errors.length) return result("ports", "failure", "Service port mappings are invalid", parsed.errors.join("; "));
  const ports = [...new Set([...parsed.mappings.values()].flatMap((items) => items.flatMap(({ hostPort }) => hostPort === undefined ? [] : [hostPort])))].sort((a, b) => a - b);
  const unavailable: number[] = [];
  for (const port of ports) if (!await probes.portAvailable(port)) unavailable.push(port);
  return unavailable.length ? result("ports", "failure", "Configured host ports are unavailable", unavailable.join(", ")) : result("ports", "pass", "Configured host ports are available");
}

function routesCheck(config: LoomConfig, parsed: ReturnType<typeof parsedServicePorts>): DoctorResult {
  const failures: string[] = [];
  for (const route of config.routes ?? []) {
    const servicePorts = parsed.mappings.get(route.service);
    if (!servicePorts) failures.push(`${route.host}: service ${route.service} does not exist`);
    else if (!servicePorts.some(({ containerPort }) => containerPort === route.port)) failures.push(`${route.host}: ${route.service} does not expose container port ${route.port}`);
  }
  return failures.length ? result("routes", "failure", "Routes have invalid targets", failures.join("; ")) : result("routes", "pass", "Routes target exposed service ports");
}

async function hostsCheck(config: LoomConfig, probes: DoctorProbes): Promise<DoctorResult> {
  if (!(config.routes?.length)) return result("hosts", "pass", "No route host integration is required");
  return await probes.hostsWritable()
    ? result("hosts", "pass", "Route host integration is writable")
    : result("hosts", "warning", "Route host integration is unavailable", "Localhost access remains available.");
}

async function defaultPathState(path: string): Promise<{ exists: boolean; uid?: number; writable: boolean }> {
  try {
    const state = await lstat(path);
    try { await access(path, constants.W_OK); return { exists: true, uid: state.uid, writable: true }; }
    catch { return { exists: true, uid: state.uid, writable: false }; }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { exists: false, writable: false };
    throw error;
  }
}

async function defaultPortAvailable(port: number): Promise<boolean> {
  return await new Promise<boolean>((resolveResult, reject) => {
    const server = createServer();
    server.unref();
    server.once("error", (error: NodeJS.ErrnoException) => error.code === "EADDRINUSE" || error.code === "EACCES" ? resolveResult(false) : reject(error));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close((error) => error ? reject(error) : resolveResult(true)));
  });
}

export function defaultDoctorProbes(): DoctorProbes {
  return {
    podman: detectPodmanCapabilities,
    architecture: () => process.arch,
    pathState: defaultPathState,
    portAvailable: defaultPortAvailable,
    hostsWritable: async () => {
      if (process.platform === "win32") return false;
      try { await access("/etc/hosts", constants.W_OK); return true; } catch { return false; }
    }
  };
}

export async function runProjectDoctor(options: RunProjectDoctorOptions): Promise<DoctorResult[]> {
  const probes = options.probes ?? defaultDoctorProbes();
  const parsed = parsedServicePorts(options.config);
  return [
    await manifestCheck(options),
    await podmanCheck(options.config, probes),
    architectureCheck(options.stack, probes),
    await lockfilesCheck(options.projectRoot, options.stack),
    await dependenciesCheck(options.projectRoot, options.stack, probes),
    await portsCheck(options.config, probes, parsed),
    routesCheck(options.config, parsed),
    await hostsCheck(options.config, probes)
  ];
}
