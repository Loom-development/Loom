import type { StackDefinition } from "./stacks.js";
export interface LoomProjectManifestV1 {
    version: 1;
    loomVersion: string;
    stack: {
        id: string;
        scaffoldVersion: string;
    };
    ownedFiles: Record<string, {
        sha256: string;
    }>;
}
export interface ProjectRenderInputs {
    projectName: string;
    phpDocroot?: string;
    databases: string[];
    adopted: boolean;
}
export interface LoomProjectManifestV2 {
    version: 2;
    loomVersion: string;
    stack: {
        id: string;
        scaffoldVersion: string;
        definitionVersion?: number;
    };
    ownedFiles: Record<string, {
        sha256: string;
        baselinePath: string;
    }>;
    renderInputs: ProjectRenderInputs;
}
export type LoomProjectManifest = Omit<LoomProjectManifestV2, "stack"> & {
    stack: {
        id: string;
        scaffoldVersion: string;
        definitionVersion: number;
    };
};
export type LoadedProjectManifest = {
    kind: "ready";
    manifest: LoomProjectManifestV2;
} | {
    kind: "migration-required";
    manifest: LoomProjectManifestV1;
} | {
    kind: "missing";
};
export type ProjectManifestStackCompatibility = {
    kind: "current";
} | {
    kind: "legacy-compatible";
} | {
    kind: "incompatible";
    reason: string;
};
export declare function classifyProjectManifestStack(manifest: LoomProjectManifestV1 | LoomProjectManifestV2, stack: StackDefinition): ProjectManifestStackCompatibility;
export declare function buildProjectManifest(targetDir: string, loomVersion: string, stack: StackDefinition, ownedFilePaths: readonly string[], renderInputs: ProjectRenderInputs): Promise<LoomProjectManifest>;
export declare function loadProjectManifest(targetDir: string): Promise<LoadedProjectManifest>;
export declare function writeProjectManifest(targetDir: string, loomVersion: string, stack: StackDefinition, ownedFilePaths: readonly string[], renderInputs: ProjectRenderInputs): Promise<string>;
