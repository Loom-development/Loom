import { type StackDefinition } from "./stacks.js";
interface InitPreparationDependencies {
    directoryHasFiles?: (path: string) => Promise<boolean>;
    fileExists?: (path: string) => Promise<boolean>;
    readTextFile?: (path: string) => Promise<string>;
    runDrupalCreateProject?: (targetDir: string) => Promise<void>;
    runWordPressCreateProject?: (targetDir: string) => Promise<void>;
    runRailsCreateProject?: (targetDir: string) => Promise<void>;
    runRailsHotwireCreateProject?: (targetDir: string) => Promise<void>;
    runSymfonyCreateProject?: (targetDir: string) => Promise<void>;
    clearDirectory?: (path: string) => Promise<void>;
}
interface InitPreparationResult {
    overwriteTemplateFiles: boolean;
    templateEntriesToUpdate?: string[];
    templateEntriesToCreateIfMissing?: string[];
}
interface CreateProjectDependencies {
    runCommand?: (command: string, args: string[], cwd: string) => Promise<void>;
}
type DrupalCreateProjectDependencies = CreateProjectDependencies;
type WordPressCreateProjectDependencies = CreateProjectDependencies;
type RailsCreateProjectDependencies = CreateProjectDependencies;
type SymfonyCreateProjectDependencies = CreateProjectDependencies;
export declare function runStackGeneratorWithDependencies(definition: StackDefinition, targetDir: string, dependencies?: CreateProjectDependencies): Promise<void>;
export declare function runDrupalCreateProjectWithDependencies(targetDir: string, dependencies?: DrupalCreateProjectDependencies): Promise<void>;
export declare function runDrupalCreateProject(targetDir: string): Promise<void>;
export declare function runWordPressCreateProjectWithDependencies(targetDir: string, dependencies?: WordPressCreateProjectDependencies): Promise<void>;
export declare function runWordPressCreateProject(targetDir: string): Promise<void>;
export declare function runRailsCreateProjectWithDependencies(targetDir: string, dependencies?: RailsCreateProjectDependencies): Promise<void>;
export declare function runRailsCreateProject(targetDir: string): Promise<void>;
export declare function runRailsHotwireCreateProjectWithDependencies(targetDir: string, dependencies?: RailsCreateProjectDependencies): Promise<void>;
export declare function runRailsHotwireCreateProject(targetDir: string): Promise<void>;
export declare function runSymfonyCreateProjectWithDependencies(targetDir: string, dependencies?: SymfonyCreateProjectDependencies): Promise<void>;
export declare function runSymfonyCreateProject(targetDir: string): Promise<void>;
export declare function prepareInitTarget(definition: StackDefinition, targetDir: string, blankTemplate: boolean, dependencies?: InitPreparationDependencies): Promise<InitPreparationResult>;
export {};
