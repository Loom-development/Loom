import type { DbType } from "./init-prompt.js";
import { type LoomProjectManifestV2 } from "./project-manifest.js";
import type { StackDefinition } from "./stacks.js";
export type ProjectUpgradeFileState = "unchanged" | "modified" | "missing";
export interface ProjectUpgradeFilePlan {
    path: string;
    state: ProjectUpgradeFileState;
    currentSha256?: string;
    baselineSha256: string;
    candidateSha256: string;
    candidatePath: string;
}
export interface ProjectUpgradePlan {
    projectRoot: string;
    candidateRoot: string;
    manifest: LoomProjectManifestV2;
    stack: StackDefinition;
    files: ProjectUpgradeFilePlan[];
}
export interface PlanProjectUpgradeOptions {
    projectRoot: string;
    stacksRoot: string;
    manifest: LoomProjectManifestV2;
    stack: StackDefinition;
}
export interface ApplyProjectUpgradeOptions {
    forceModified: boolean;
}
export declare function renderProjectName(loomYaml: string, projectName: string): string;
export declare function renderPhpDocroot(loomYaml: string, template: string, phpDocrootRaw?: string): string;
export declare function renderDatabaseService(loomYaml: string, db: DbType): string;
export declare function planProjectUpgrade(options: PlanProjectUpgradeOptions): Promise<ProjectUpgradePlan>;
export declare function applyProjectUpgrade(plan: ProjectUpgradePlan, options: ApplyProjectUpgradeOptions): Promise<{
    updated: string[];
    skipped: string[];
}>;
