import type { CommandResult } from "./types.js";
export declare function runPodman(args: string[]): Promise<CommandResult>;
export declare function runPodmanInherit(args: string[]): Promise<number>;
