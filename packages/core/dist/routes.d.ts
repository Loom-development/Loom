import type { LoomConfig } from "@loom/config";
import type { RouteBinding } from "@loom/network";
import type { OrchestratorDependencies } from "./dependencies.js";
import type { OrchestratorOutput } from "./output.js";
type RouteStartupDependencies = Pick<OrchestratorDependencies, "ensureLocalCertificates" | "ensureRouteHosts" | "ensureRouteProxy">;
type RouteStartupOutput = Pick<OrchestratorOutput, "writeOut" | "writeErr">;
export declare function publishConfiguredRoutes(config: LoomConfig, routeBindings: RouteBinding[], networkName: string, dependencies: RouteStartupDependencies, output: RouteStartupOutput): Promise<void>;
export type { RouteBinding };
