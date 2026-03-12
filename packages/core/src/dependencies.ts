import {
  backupExtensionForServiceType,
  backupServiceToFile,
  SUPPORTED_BACKUP_SERVICE_TYPES,
  containerName,
  detectPodmanCapabilities,
  ensureComposerAvailable,
  ensureMachineRunning,
  ensureServiceStarted,
  execServiceCommand,
  inspectContainer,
  isContainerRunning,
  listProjectContainers,
  removeContainer,
  stopService,
  tailServiceLogs,
  waitForServiceReady
} from "@loom/runtime-podman";
import {
  ensureRouteProxy,
  ensureServiceNetwork,
  resolveRouteBindings,
  stopRouteProxy
} from "@loom/network";
import { ensureLocalCertificates } from "@loom/https";

export interface OrchestratorDependencies {
  backupExtensionForServiceType: typeof backupExtensionForServiceType;
  backupServiceToFile: typeof backupServiceToFile;
  supportedBackupServiceTypes: typeof SUPPORTED_BACKUP_SERVICE_TYPES;
  containerName: typeof containerName;
  detectPodmanCapabilities: typeof detectPodmanCapabilities;
  ensureComposerAvailable: typeof ensureComposerAvailable;
  ensureLocalCertificates: typeof ensureLocalCertificates;
  ensureMachineRunning: typeof ensureMachineRunning;
  ensureRouteProxy: typeof ensureRouteProxy;
  ensureServiceNetwork: typeof ensureServiceNetwork;
  ensureServiceStarted: typeof ensureServiceStarted;
  execServiceCommand: typeof execServiceCommand;
  inspectContainer: typeof inspectContainer;
  isContainerRunning: typeof isContainerRunning;
  listProjectContainers: typeof listProjectContainers;
  removeContainer: typeof removeContainer;
  resolveRouteBindings: typeof resolveRouteBindings;
  stopRouteProxy: typeof stopRouteProxy;
  stopService: typeof stopService;
  tailServiceLogs: typeof tailServiceLogs;
  waitForServiceReady: typeof waitForServiceReady;
}

export const defaultOrchestratorDependencies: OrchestratorDependencies = {
  backupExtensionForServiceType,
  backupServiceToFile,
  supportedBackupServiceTypes: SUPPORTED_BACKUP_SERVICE_TYPES,
  containerName,
  detectPodmanCapabilities,
  ensureComposerAvailable,
  ensureLocalCertificates,
  ensureMachineRunning,
  ensureRouteProxy,
  ensureServiceNetwork,
  ensureServiceStarted,
  execServiceCommand,
  inspectContainer,
  isContainerRunning,
  listProjectContainers,
  removeContainer,
  resolveRouteBindings,
  stopRouteProxy,
  stopService,
  tailServiceLogs,
  waitForServiceReady
};