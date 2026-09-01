import type { LoomConfig } from "@loom/config";
export declare function closestServiceName(target: string, candidates: string[]): string | undefined;
export declare function dependencyOrder(config: LoomConfig): string[];
