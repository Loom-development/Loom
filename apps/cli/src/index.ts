#!/usr/bin/env node
import { cac } from "cac";
import { access, copyFile, cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLoomProject } from "@loom/config";
import { LoomOrchestrator } from "@loom/core";
import { runNamedTask } from "@loom/tasks";

const cli = cac("loom");

const templatesRoot = resolve(fileURLToPath(new URL("../../../examples", import.meta.url)));

const templateMap: Record<string, string> = {
  node: "node",
  "node-mean": "node/mean",
  "node-mern": "node/mern",
  "node-t3": "node/t3",
  "node-bun": "node/bun",
  bunjs: "node/bun",
  python: "python",
  "python-django": "python/django",
  "python-flask": "python/flask",
  "python-fastapi": "python/fastapi",
  php: "php",
  "php-wordpress": "php/wordpress",
  "php-drupal": "php/drupal",
  "php-symfony": "php/symfony",
  "db-mysql": "databases/mysql",
  "db-sqlserver": "databases/sqlserver",
  "db-postgres": "databases/postgres",
  "db-mongodb": "databases/mongodb",
  "db-redis": "databases/redis",
  "db-elasticsearch": "databases/elasticsearch",
  "db-sqlite": "databases/sqlite",
  "db-mariadb": "databases/mariadb",
  "db-all": "databases/all",
  dotnet: "stacks/dotnet",
  "stack-dotnet": "stacks/dotnet",
  rails7: "stacks/rails7",
  "stack-rails7": "stacks/rails7",
  jamstack: "stacks/jamstack",
  "stack-jamstack": "stacks/jamstack",
  serverless: "stacks/serverless",
  "stack-serverless": "stacks/serverless",
  "spring-react": "stacks/spring-react",
  "stack-spring-react": "stacks/spring-react"
};

const ignoredTemplateEntries = new Set([
  "node_modules",
  ".pnpm-store",
  ".turbo",
  ".loom",
  "data",
  "dist",
  ".next"
]);

const phpDocrootIgnoredTemplates = new Set(["php-wordpress", "php-drupal"]);

function withErrorHandling<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<void>) {
  return (...args: TArgs) => {
    fn(...args).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
  };
}

async function bootstrapProject(configPath?: string): Promise<LoomOrchestrator> {
  const project = await loadLoomProject(configPath);
  process.chdir(project.projectRoot);
  return new LoomOrchestrator(project.config, project.projectRoot);
}

async function directoryHasFiles(path: string): Promise<boolean> {
  try {
    const entries = await readdir(path);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function ensureEnvFileFromExample(targetDir: string): Promise<void> {
  const envExamplePath = resolve(targetDir, ".env.example");
  const envPath = resolve(targetDir, ".env");

  try {
    await access(envExamplePath);
  } catch {
    return;
  }

  try {
    await access(envPath);
    return;
  } catch {
    await copyFile(envExamplePath, envPath);
    process.stdout.write(`Created ${envPath} from .env.example\n`);
  }
}

function isPhpTemplate(template: string): boolean {
  return template.startsWith("php");
}

function resolveInitTargetDir(template: string, requestedDir?: string): string {
  const dir = requestedDir ?? ".";
  if (template.startsWith("db-") && (dir === "." || dir === "./")) {
    return resolve(process.cwd(), "db");
  }

  return resolve(process.cwd(), dir);
}

function validateInitOptions(template: string, phpDocroot?: string): void {
  if (!phpDocroot) {
    return;
  }

  if (!isPhpTemplate(template)) {
    throw new Error("--php-docroot can only be used with PHP templates.");
  }
}

function resolvePhpDocrootOption(template: string, phpDocroot?: string): string | undefined {
  if (!isPhpTemplate(template)) {
    return phpDocroot;
  }

  return phpDocroot ?? ".";
}

async function copyTemplate(sourceDir: string, targetDir: string, force: boolean): Promise<void> {
  await cp(sourceDir, targetDir, {
    recursive: true,
    force,
    filter: (sourcePath) => {
      const entryName = sourcePath.split("/").pop() ?? "";
      return !ignoredTemplateEntries.has(entryName);
    }
  });
}

function normalizeProjectToken(raw: string): string {
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || "project";
}

function replaceEnvVariable(content: string, key: string, value: string): string {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(content) ? content.replace(pattern, `${key}=${value}`) : content;
}

function hasEnvVariable(content: string, key: string): boolean {
  const pattern = new RegExp(`^${key}=`, "m");
  return pattern.test(content);
}

function normalizeDocrootPath(raw: string): string {
  const normalized = raw.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized === ".") {
    return ".";
  }

  return normalized;
}

function buildPhpBaseCommand(containerDocroot: string): string {
  return [
    "command: |",
    `      mkdir -p ${containerDocroot}`,
    `      if [ ! -f ${containerDocroot}/index.php ]; then`,
    `        printf '%s\\n' '<?php echo \"Loom PHP example is running.\";' > ${containerDocroot}/index.php`,
    "      fi",
    `      php -S 0.0.0.0:80 -t ${containerDocroot}`,
    "    ports:"
  ].join("\n");
}

async function applyPhpDocroot(targetDir: string, template: string, phpDocrootRaw?: string): Promise<void> {
  if (!phpDocrootRaw) {
    return;
  }

  if (!isPhpTemplate(template)) {
    throw new Error("--php-docroot can only be used with PHP templates.");
  }

  if (phpDocrootIgnoredTemplates.has(template)) {
    process.stdout.write(
      `Ignoring --php-docroot for '${template}' (template manages docroot internally).\n`
    );
    return;
  }

  const phpDocroot = normalizeDocrootPath(phpDocrootRaw);
  const loomPath = resolve(targetDir, "loom.yaml");
  let loomYaml = await readFile(loomPath, "utf8");

  if (template === "php") {
    const containerDocroot = phpDocroot === "." ? "/var/www/html" : `/var/www/html/${phpDocroot}`;
    loomYaml = loomYaml.replace(/command:\s*\|[\s\S]*?\n\s*ports:/m, buildPhpBaseCommand(containerDocroot));
  } else {
    const templateDocroot = phpDocroot === "." ? "." : phpDocroot;
    loomYaml = loomYaml.replace(/(php\s+-S\s+[^\n]*?\s+-t\s+)([^\s"']+)/, `$1${templateDocroot}`);
  }

  await writeFile(loomPath, loomYaml, "utf8");
  process.stdout.write(`Set PHP docroot to '${phpDocroot}' in ${loomPath}\n`);
}

function replaceYamlEnvVariable(content: string, key: string, value: string): string {
  const pattern = new RegExp(`(^\\s*${key}:\\s*).*$`, "m");
  return pattern.test(content) ? content.replace(pattern, `$1${value}`) : content;
}

async function customizeDbTemplateCredentials(targetDir: string): Promise<void> {
  const envPath = resolve(targetDir, ".env");
  const loomConfigPath = resolve(targetDir, "loom.yaml");

  let envContent: string;
  let loomYamlContent: string;

  try {
    envContent = await readFile(envPath, "utf8");
    loomYamlContent = await readFile(loomConfigPath, "utf8");
  } catch {
    return;
  }

  const targetName = basename(targetDir) === "db" ? basename(resolve(targetDir, "..")) : basename(targetDir);
  const token = normalizeProjectToken(targetName);
  const suffix = randomBytes(3).toString("hex");

  const appUser = `loom_${token}_${suffix}`.slice(0, 30);
  const appDb = `loom_${token}`.slice(0, 30);
  const appPassword = `Loom!${suffix}9aA`;
  const rootPassword = `Root!${suffix}9aA`;
  const mssqlPassword = `Loom${suffix}!9aA`;

  const replacements: Record<string, string> = {
    MYSQL_ROOT_PASSWORD: rootPassword,
    MYSQL_DATABASE: appDb,
    MYSQL_USER: appUser,
    MYSQL_PASSWORD: appPassword,
    MARIADB_ROOT_PASSWORD: rootPassword,
    MARIADB_DATABASE: appDb,
    MARIADB_USER: appUser,
    MARIADB_PASSWORD: appPassword,
    POSTGRES_USER: appUser,
    POSTGRES_PASSWORD: appPassword,
    POSTGRES_DB: appDb,
    MONGO_INITDB_ROOT_USERNAME: appUser,
    MONGO_INITDB_ROOT_PASSWORD: appPassword,
    MONGO_INITDB_DATABASE: appDb,
    MSSQL_SA_PASSWORD: mssqlPassword
  };

  for (const [key, value] of Object.entries(replacements)) {
    envContent = replaceEnvVariable(envContent, key, value);
    loomYamlContent = replaceYamlEnvVariable(loomYamlContent, key, value);
  }

  const mysqlUrl = `mysql://${appUser}:${appPassword}@localhost:3306/${appDb}`;
  const mariadbUrl = `mysql://${appUser}:${appPassword}@localhost:3307/${appDb}`;
  const postgresUrl = `postgresql://${appUser}:${appPassword}@localhost:5432/${appDb}`;
  const mongoUrl = `mongodb://${appUser}:${appPassword}@localhost:27017/${appDb}?authSource=admin`;
  const mssqlUrl = `sqlserver://sa:${mssqlPassword}@localhost:1433;encrypt=false`;

  if (hasEnvVariable(envContent, "DATABASE_URL")) {
    if (hasEnvVariable(envContent, "POSTGRES_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", postgresUrl);
    } else if (hasEnvVariable(envContent, "MYSQL_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mysqlUrl);
    } else if (hasEnvVariable(envContent, "MARIADB_USER")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mariadbUrl);
    } else if (hasEnvVariable(envContent, "MONGO_INITDB_ROOT_USERNAME")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mongoUrl);
    } else if (hasEnvVariable(envContent, "MSSQL_SA_PASSWORD")) {
      envContent = replaceEnvVariable(envContent, "DATABASE_URL", mssqlUrl);
    }
  }

  envContent = replaceEnvVariable(envContent, "MYSQL_URL", mysqlUrl);
  envContent = replaceEnvVariable(envContent, "MARIADB_URL", mariadbUrl);
  envContent = replaceEnvVariable(envContent, "POSTGRES_URL", postgresUrl);
  envContent = replaceEnvVariable(envContent, "MONGODB_URL", mongoUrl);
  envContent = replaceEnvVariable(envContent, "MSSQL_URL", mssqlUrl);

  await writeFile(envPath, envContent, "utf8");
  await writeFile(loomConfigPath, loomYamlContent, "utf8");
  process.stdout.write(`Generated project-specific DB credentials in ${envPath}\n`);
}

cli
  .command("init <template>", "Initialize a sample project in a target directory")
  .option("--dir <path>", "Target directory", { default: "." })
  .option("--force", "Allow writing into non-empty target directory", { default: false })
  .option("--php-docroot <path>", "PHP docroot path inside project (php/php-symfony templates)")
  .action(
    withErrorHandling(async (template: string, options: { dir?: string; force?: boolean; phpDocroot?: string }) => {
      const relativeTemplate = templateMap[template];
      if (!relativeTemplate) {
        const available = Object.keys(templateMap).sort().join(", ");
        throw new Error(`Unknown template '${template}'. Available templates: ${available}`);
      }

      validateInitOptions(template, options.phpDocroot);
      const effectivePhpDocroot = resolvePhpDocrootOption(template, options.phpDocroot);

      const sourceDir = resolve(templatesRoot, relativeTemplate);
      const targetDir = resolveInitTargetDir(template, options.dir);

      await mkdir(targetDir, { recursive: true });

      if (!options.force && (await directoryHasFiles(targetDir))) {
        throw new Error(`Target directory '${targetDir}' is not empty. Use --force to continue.`);
      }

      await copyTemplate(sourceDir, targetDir, options.force ?? false);

      await applyPhpDocroot(targetDir, template, effectivePhpDocroot);

      await ensureEnvFileFromExample(targetDir);
      if (template.startsWith("db-")) {
        await customizeDbTemplateCredentials(targetDir);
      }
      process.stdout.write(`Initialized '${template}' in ${targetDir}\n`);
      process.stdout.write(`Next: cd ${targetDir} && loom start\n`);
    })
  );

cli
  .command("start", "Start Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.start();
    })
  );

cli
  .command("stop", "Stop Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.stop();
    })
  );

cli
  .command("restart", "Restart Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.restart();
    })
  );

cli
  .command("status", "Show project and runtime status")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const status = await orchestrator.status();
      process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    })
  );

cli
  .command("ps", "List project containers")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const containers = await orchestrator.ps();
      process.stdout.write(`${JSON.stringify(containers, null, 2)}\n`);
    })
  );

cli
  .command("test", "Run test task from loom config")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--task <name>", "Task name", { default: "test" })
  .action(
    withErrorHandling(async (options: { config?: string; task?: string }) => {
      const taskName = options.task ?? "test";
      const orchestrator = await bootstrapProject(options.config);
      await runNamedTask(orchestrator, taskName);
    })
  );

cli
  .command("logs <service>", "Show service logs")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--follow", "Follow logs", { default: true })
  .action(
    withErrorHandling(async (service: string, options: { config?: string; follow?: boolean }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.logs(service, options.follow ?? true);
    })
  );

cli
  .command("exec <service> [...cmd]", "Exec command in service container")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (service: string, cmd: string[], options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const passthroughIndex = process.argv.indexOf("--");
      const passthrough = passthroughIndex >= 0 ? process.argv.slice(passthroughIndex + 1) : [];
      await orchestrator.exec(service, cmd.length > 0 ? cmd : passthrough);
    })
  );

cli
  .command("backup [service]", "Create backup file(s) for database services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--all", "Backup all supported database services in loom.yaml", { default: false })
  .option("--output <path>", "Output file path (defaults to .loom/backups/<project>-<service>-<timestamp>.*)")
  .action(
    withErrorHandling(async (service: string | undefined, options: { config?: string; output?: string; all?: boolean }) => {
      const orchestrator = await bootstrapProject(options.config);
      if (options.all) {
        const backups = await orchestrator.backupAll();
        for (const backup of backups) {
          process.stdout.write(`Backup created [${backup.service}]: ${backup.path}\n`);
        }
        return;
      }

      if (!service) {
        throw new Error("Service name is required unless --all is provided.");
      }

      const output = await orchestrator.backup(service, options.output);
      process.stdout.write(`Backup created: ${output}\n`);
    })
  );

cli.help();
cli.version("0.1.0");

cli.parse();
