import type { StackDefinition } from "./definition.js";
export * from "./definition.js";
export * from "./pins.js";
export declare const stackDefinitions: readonly StackDefinition[];
export declare function findStackDefinition(stackId: string): StackDefinition | undefined;
export declare function listStackIds(): string[];
