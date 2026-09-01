import type { LoomService } from "@loom/config";
interface EnsureServiceStartedDependencies {
    isContainerRunningByName?: (name: string) => Promise<boolean>;
    containerExistsByName?: (name: string) => Promise<boolean>;
    inspectContainerImageByName?: (name: string) => Promise<string>;
    inspectContainerLabelByName?: (name: string, label: string) => Promise<string>;
    removeContainerByName?: (name: string) => Promise<void>;
    startContainerByName?: (name: string) => Promise<void>;
    buildRunArgs?: (serviceName: string, containerNameValue: string, service: LoomService, networkName: string, expectedImage: string, expectedServiceHash: string) => Promise<string[]>;
    runPodmanCommand?: (args: string[]) => Promise<{
        ok: boolean;
        stderr: string;
    }>;
}
export declare function resolveRegistryHost(image: string): string;
export declare function buildRegistryLoginHint(image: string): string;
export declare function isRegistryAuthError(detail: string): boolean;
export declare function isImageUnavailableError(detail: string): boolean;
export declare function buildExecArgs(containerNameValue: string, command: string[], interactiveTerminal: boolean, execUser?: string, workdir?: string): string[];
export declare function ensureServiceStarted(projectName: string, serviceName: string, service: LoomService, networkName: string): Promise<void>;
export declare function ensureServiceStartedWithDependencies(projectName: string, serviceName: string, service: LoomService, networkName: string, dependencies?: EnsureServiceStartedDependencies): Promise<void>;
export declare function stopService(projectName: string, serviceName: string): Promise<void>;
export declare function tailServiceLogs(projectName: string, serviceName: string, follow: boolean): Promise<void>;
export declare function execServiceCommand(projectName: string, serviceName: string, command: string[], execUser?: string, workdir?: string): Promise<void>;
interface EnsureComposerAvailableDependencies {
    inspectContainerByName?: (name: string) => Promise<{
        running: boolean;
        state: string;
    } | null>;
    runPodmanCommand?: (args: string[]) => Promise<{
        ok: boolean;
        stderr: string;
    }>;
}
export declare function ensureComposerAvailable(projectName: string, serviceName: string): Promise<void>;
export declare function ensureComposerAvailableWithDependencies(projectName: string, serviceName: string, dependencies?: EnsureComposerAvailableDependencies): Promise<void>;
export {};
