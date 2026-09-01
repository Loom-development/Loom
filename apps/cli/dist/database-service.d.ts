import type { DbType } from "./init-prompt.js";
export interface DatabaseServiceBlock {
    serviceName: string;
    serviceYaml: string;
    envVars: Record<string, string>;
}
export declare function buildDatabaseServiceBlock(db: DbType): DatabaseServiceBlock;
