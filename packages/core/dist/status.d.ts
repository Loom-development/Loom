import type { LoomConfig } from "@loom/config";
import type { OrchestratorDependencies } from "./dependencies.js";
export interface LoomStatus {
    project: string;
    podman: {
        available: boolean;
        version?: string;
        rootless: boolean;
        machineRunning: boolean;
    };
    services: Array<{
        name: string;
        image: string;
        container: string;
        running: boolean;
        state?: string;
        health?: string;
    }>;
    routes: Array<{
        host: string;
        target: string;
        https: boolean;
    }>;
    https?: {
        certPath: string;
        keyPath: string;
    };
    proxy?: {
        httpPort: number;
        httpsPort: number;
    };
}
export declare function buildLoomStatus(config: LoomConfig, dependencies: Pick<OrchestratorDependencies, "containerName" | "detectPodmanCapabilities" | "ensureLocalCertificates" | "inspectContainer" | "isContainerRunning" | "resolveRouteBindings">): Promise<LoomStatus>;
