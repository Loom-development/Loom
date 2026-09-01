import { backupExtensionForServiceType, backupServiceToFile, restoreServiceFromFile, SUPPORTED_RESTORE_SERVICE_TYPES, SUPPORTED_BACKUP_SERVICE_TYPES, containerName, detectPodmanCapabilities, ensureComposerAvailable, ensureMachineRunning, ensureServiceStarted, execServiceCommand, inspectContainer, isContainerRunning, listProjectContainers, removeContainer, stopService, tailServiceLogs, waitForServiceReady } from "@loom/runtime-podman";
import { ensureRouteHosts, ensureRouteProxy, ensureServiceNetwork, resolveRouteBindings, stopRouteHosts, stopRouteProxy } from "@loom/network";
import { ensureLocalCertificates } from "@loom/https";
export const defaultOrchestratorDependencies = {
    backupExtensionForServiceType,
    backupServiceToFile,
    restoreServiceFromFile,
    supportedBackupServiceTypes: SUPPORTED_BACKUP_SERVICE_TYPES,
    supportedRestoreServiceTypes: SUPPORTED_RESTORE_SERVICE_TYPES,
    containerName,
    detectPodmanCapabilities,
    ensureComposerAvailable,
    ensureLocalCertificates,
    ensureMachineRunning,
    ensureRouteHosts,
    ensureRouteProxy,
    ensureServiceNetwork,
    ensureServiceStarted,
    execServiceCommand,
    inspectContainer,
    isContainerRunning,
    listProjectContainers,
    removeContainer,
    resolveRouteBindings,
    stopRouteHosts,
    stopRouteProxy,
    stopService,
    tailServiceLogs,
    waitForServiceReady
};
//# sourceMappingURL=dependencies.js.map