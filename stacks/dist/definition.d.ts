export declare const stackIds: readonly ["node", "node-mean", "node-mern", "node-t3", "bun", "python", "python-django", "python-flask", "python-fastapi", "php", "php-wordpress", "php-drupal", "php-symfony", "db-mysql", "db-sqlserver", "db-postgres", "db-mongodb", "db-redis", "db-elasticsearch", "db-sqlite", "db-mariadb", "db-all", "dotnet", "rails7", "rails7-hotwire", "jamstack", "serverless", "spring-react", "spring-boot", "astro", "django-react"];
export type StackId = typeof stackIds[number];
export type GeneratedPathCategory = "dependency" | "cache" | "build";
export interface StackGeneratedPath {
    path: string;
    category: GeneratedPathCategory;
}
export interface StackCompatibility {
    architectures: readonly NodeJS.Architecture[];
    runtime: "podman-rootless";
}
export interface StackGeneratorExecution {
    kind: "container";
    context: string;
    mountTarget: string;
    workdir?: string;
    environment: readonly {
        name: string;
        value: string;
    }[];
}
export type StackGenerator = {
    kind: "none";
} | {
    kind: "command";
    image: string;
    package: string;
    version: string;
    command: readonly string[];
    execution: StackGeneratorExecution;
};
export interface StackRuntimeImage {
    env: string;
    reference: string;
}
export interface StackVerificationCheck {
    service?: string;
    command: readonly string[];
}
export interface StackDefinition {
    id: StackId;
    definitionVersion: number;
    legacyScaffoldVersions: readonly string[];
    assetPath: string;
    /** Compatibility field consumed by v1/v2 project manifests. */
    scaffoldVersion: string;
    generator: StackGenerator;
    runtimeImages: readonly StackRuntimeImage[];
    install: readonly string[];
    start: readonly string[];
    readiness: {
        kind: "command" | "http" | "port";
        value: string;
        timeoutSeconds: number;
    };
    hostWrites: readonly string[];
    verification: readonly StackVerificationCheck[];
    loomOwnedFiles: readonly string[];
    generatedPaths: readonly StackGeneratedPath[];
    protectedPaths: readonly string[];
    compatibility: StackCompatibility;
}
export declare function validateGeneratorVersion(version: string): void;
export declare function validateRuntimeImage(image: StackRuntimeImage): void;
export declare function validateStackDefinition(definition: StackDefinition): void;
export declare function defineStack<const T extends StackDefinition>(definition: T): T;
