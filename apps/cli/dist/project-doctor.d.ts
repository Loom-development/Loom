import type { LoomConfig } from "@loom/config";
import { type PodmanCapabilities } from "@loom/runtime-podman";
import { type LoadedProjectManifest } from "./project-manifest.js";
import { type StackDefinition } from "./stacks.js";
export type DoctorStatus = "pass" | "warning" | "failure";
export interface DoctorResult {
    id: string;
    status: DoctorStatus;
    summary: string;
    detail?: string;
}
export interface DoctorProbes {
    podman(): Promise<PodmanCapabilities>;
    architecture(): NodeJS.Architecture;
    pathState(path: string): Promise<{
        exists: boolean;
        uid?: number;
        writable: boolean;
    }>;
    portAvailable(port: number): Promise<boolean>;
    runningContainers(projectName: string): Promise<readonly string[]>;
    hostsWritable(): Promise<boolean>;
}
export interface RunProjectDoctorOptions {
    projectRoot: string;
    config: LoomConfig;
    manifest: LoadedProjectManifest;
    stack?: StackDefinition;
    probes?: DoctorProbes;
}
export declare function defaultDoctorProbes(): DoctorProbes;
export declare function runProjectDoctor(options: RunProjectDoctorOptions): Promise<DoctorResult[]>;
