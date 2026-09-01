import type { Dirent, Stats } from "node:fs";
import type { LoomProjectManifestV2 } from "./project-manifest.js";
import type { GeneratedPathCategory, StackDefinition } from "./stacks.js";
export interface ProjectCleanItem {
    path: string;
    category: GeneratedPathCategory;
    exists: boolean;
    bytes: number;
}
export interface ProjectCleanPlan {
    projectRoot: string;
    items: ProjectCleanItem[];
    totalBytes: number;
    /** Safety context retained so execution can repeat every protection check. */
    protectedPaths: string[];
}
export interface PlanProjectCleanOptions {
    projectRoot: string;
    stack: StackDefinition;
    manifest: LoomProjectManifestV2;
    dependencies?: Partial<ProjectCleanDependencies>;
}
export interface ProjectCleanDependencies {
    lstat(path: string): Promise<Stats>;
    readdir(path: string, options: {
        withFileTypes: true;
    }): Promise<Dirent[]>;
    realpath(path: string): Promise<string>;
    rm(path: string, options: {
        recursive: true;
        force: false;
    }): Promise<void>;
}
export declare function planProjectClean(options: PlanProjectCleanOptions): Promise<ProjectCleanPlan>;
export declare function applyProjectClean(plan: ProjectCleanPlan, dependencyOverrides?: Partial<ProjectCleanDependencies>): Promise<{
    removed: string[];
    missing: string[];
}>;
