#!/usr/bin/env node
import { cac } from "cac";
import { existsSync } from "node:fs";
import { access, copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json" with { type: "json" };
import { loadLoomProject } from "@loom/config";
import { LoomOrchestrator } from "@loom/core";
import { runNamedTask } from "@loom/tasks";
import { detectInitTemplateSuggestion } from "./init-detect.js";
import {
  chooseInitImageOverrides,
  chooseInitTemplate,
  describeInitTemplate,
  initImageChoicesByTemplate
} from "./init-prompt.js";
import { prepareInitTarget } from "./init-template.js";

const cli = cac("loom");

function resolveTemplatesRoot(): string {
  const candidates = [
    resolve(fileURLToPath(new URL("./examples", import.meta.url))),
    resolve(fileURLToPath(new URL("../../../examples", import.meta.url)))
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

const templatesRoot = resolveTemplatesRoot();

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
  dotnet: "dotnet",
  rails7: "rails7",
  "rails7-hotwire": "rails7-hotwire",
  jamstack: "jamstack",
  serverless: "serverless",
  "spring-react": "spring-react",
  "django-react": "django-react"
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

  if (template === "php-symfony") {
    return phpDocroot ?? "public";
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

async function copyTemplateEntries(
  sourceDir: string,
  targetDir: string,
  entries: string[],
  force: boolean
): Promise<void> {
  for (const entry of entries) {
    await cp(resolve(sourceDir, entry), resolve(targetDir, entry), {
      recursive: true,
      force
    });
  }
}

async function copyTemplateEntriesIfMissing(
  sourceDir: string,
  targetDir: string,
  entries: string[]
): Promise<void> {
  for (const entry of entries) {
    const targetPath = resolve(targetDir, entry);
    try {
      await access(targetPath);
      continue;
    } catch {
      await cp(resolve(sourceDir, entry), targetPath, {
        recursive: true,
        force: false
      });
    }
  }
}

function normalizeProjectToken(raw: string): string {
  const normalized = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || "project";
}

function deriveProjectName(targetDir: string): string {
  const targetName = basename(targetDir) === "db" ? basename(resolve(targetDir, "..")) : basename(targetDir);
  return `loom-${normalizeProjectToken(targetName)}`;
}

async function applyProjectName(targetDir: string): Promise<void> {
  const loomPath = resolve(targetDir, "loom.yaml");
  const projectName = deriveProjectName(targetDir);
  const loomYaml = await readFile(loomPath, "utf8");
  const updatedLoomYaml = loomYaml.replace(/^(name:\s*).+$/m, `$1${projectName}`);

  if (updatedLoomYaml !== loomYaml) {
    await writeFile(loomPath, updatedLoomYaml, "utf8");
  }
}

function replaceEnvVariable(content: string, key: string, value: string): string {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(content) ? content.replace(pattern, `${key}=${value}`) : content;
}

function parseEnvAssignments(optionValue: string | string[] | undefined): Record<string, string> {
  if (!optionValue) {
    return {};
  }

  const values = Array.isArray(optionValue) ? optionValue : [optionValue];
  const assignments: Record<string, string> = {};

  for (const value of values) {
    const separatorIndex = value.indexOf("=");
    if (separatorIndex <= 0) {
      throw new Error(`Invalid --image value '${value}'. Use KEY=VALUE.`);
    }

    const key = value.slice(0, separatorIndex).trim();
    const assignedValue = value.slice(separatorIndex + 1).trim();
    if (!key || !assignedValue) {
      throw new Error(`Invalid --image value '${value}'. Use KEY=VALUE.`);
    }

    assignments[key] = assignedValue;
  }

  return assignments;
}

function parseEnvFile(content: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    values[trimmed.slice(0, separatorIndex).trim()] = trimmed.slice(separatorIndex + 1).trim();
  }

  return values;
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
    "      set -eu",
    '      target_uid="${HOST_UID:-1000}"',
    '      target_gid="${HOST_GID:-1000}"',
    '      home_dir="/tmp/loom-home"',
    '      if ! php -r "exit(extension_loaded(\'mysqli\') && extension_loaded(\'pdo_mysql\') && extension_loaded(\'pdo_pgsql\') && extension_loaded(\'pgsql\') && extension_loaded(\'pdo_sqlite\') && extension_loaded(\'intl\') && extension_loaded(\'zip\') && extension_loaded(\'exif\') && extension_loaded(\'imagick\') && extension_loaded(\'memcached\') ? 0 : 1);"; then',
    '        if command -v apt-get >/dev/null 2>&1; then',
    '          export DEBIAN_FRONTEND=noninteractive',
    '          apt-get update',
    '          apt-get install -y --no-install-recommends imagemagick libicu-dev libmagickwand-dev libmemcached-dev libsasl2-dev libzip-dev libpq-dev libsqlite3-dev libmariadb-dev pkg-config util-linux zlib1g-dev',
    '        elif command -v apk >/dev/null 2>&1; then',
    '          apk add --no-cache cyrus-sasl-dev imagemagick imagemagick-dev icu-dev libmemcached-dev libzip-dev postgresql-dev sqlite-dev mariadb-connector-c-dev pkgconf util-linux zlib-dev',
    '        fi',
    '        docker-php-ext-install -j"$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || echo 1)" mysqli pdo_mysql pdo_pgsql pgsql pdo_sqlite intl zip exif',
    "        printf '\\n' | pecl install imagick",
    "        printf '\\n' | pecl install memcached",
    '        docker-php-ext-enable imagick',
    '        docker-php-ext-enable memcached',
    '      fi',
    '      mkdir -p "$home_dir"',
    '      chmod 0777 "$home_dir"',
    `      exec setpriv --reuid "$target_uid" --regid "$target_gid" --clear-groups env HOME="$home_dir" sh -lc 'if [ ! -f ${containerDocroot}/index.php ]; then printf "%s\\n" "<?php echo \\"Loom PHP example is running.\\";" > ${containerDocroot}/index.php; fi; frankenphp php-server --listen :80 --root ${containerDocroot}'`,
    "    dependsOn:",
    "      - cache",
    "    env:",
    "      MEMCACHED_HOST: cache",
    '      MEMCACHED_PORT: "11211"',
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
    const containerDocroot = phpDocroot === "." ? "/app" : `/app/${phpDocroot}`;
    loomYaml = loomYaml.replace(/command:\s*\|[\s\S]*?\n\s*ports:/m, buildPhpBaseCommand(containerDocroot));
  } else {
    const templateDocroot = phpDocroot === "." ? "." : phpDocroot;
    loomYaml = loomYaml.replace(/(frankenphp\s+php-server\s+--listen\s+:[0-9]+\s+--root\s+)([^\s"']+)/, `$1${templateDocroot}`);
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

async function applyRuntimeImageSelections(
  targetDir: string,
  template: string,
  imageAssignments: Record<string, string>
): Promise<void> {
  const envPath = resolve(targetDir, ".env");

  let envContent: string;
  try {
    envContent = await readFile(envPath, "utf8");
  } catch {
    return;
  }

  const currentValues = parseEnvFile(envContent);
  const chosenImages = { ...imageAssignments };

  const hasInteractiveChoices = (initImageChoicesByTemplate[template] ?? []).length > 0;
  if (hasInteractiveChoices && process.stdin.isTTY) {
    const prompted = await chooseInitImageOverrides(
      template,
      { ...currentValues, ...chosenImages },
      Object.keys(chosenImages)
    );
    Object.assign(chosenImages, prompted);
  }

  if (Object.keys(chosenImages).length === 0) {
    return;
  }

  for (const [key, value] of Object.entries(chosenImages)) {
    envContent = replaceEnvVariable(envContent, key, value);
  }

  await writeFile(envPath, envContent, "utf8");
  process.stdout.write(`Configured runtime image selections in ${envPath}\n`);
}

cli
  .command("init [template]", "Initialize a sample project in a target directory")
  .option("--dir <path>", "Target directory", { default: "." })
  .option("--force", "Allow writing into non-empty target directory", { default: false })
  .option("--php-docroot <path>", "PHP docroot path inside project (php/php-symfony templates)")
  .option("--image <key=value>", "Override a template image variable during init (repeatable)")
  .action(
    withErrorHandling(async (template: string | undefined, options: { dir?: string; force?: boolean; phpDocroot?: string; image?: string | string[] }) => {
      const selectedTemplate = template ?? (await chooseInitTemplate(
        await detectInitTemplateSuggestion(process.cwd())
      ));
      const relativeTemplate = templateMap[selectedTemplate];
      if (!relativeTemplate) {
        const available = Object.keys(templateMap).sort().join(", ");
        throw new Error(`Unknown template '${selectedTemplate}'. Available templates: ${available}`);
      }

      process.stdout.write(`Initializing '${selectedTemplate}': ${describeInitTemplate(selectedTemplate)}\n`);

      validateInitOptions(selectedTemplate, options.phpDocroot);
      const effectivePhpDocroot = resolvePhpDocrootOption(selectedTemplate, options.phpDocroot);

      const sourceDir = resolve(templatesRoot, relativeTemplate);
      const targetDir = resolveInitTargetDir(selectedTemplate, options.dir);

      await mkdir(targetDir, { recursive: true });

      const initPreparation = await prepareInitTarget(selectedTemplate, targetDir, options.force ?? false);

      if (initPreparation.templateEntriesToUpdate) {
        await copyTemplateEntries(
          sourceDir,
          targetDir,
          initPreparation.templateEntriesToUpdate,
          (options.force ?? false) || initPreparation.overwriteTemplateFiles
        );
      } else {
        await copyTemplate(sourceDir, targetDir, (options.force ?? false) || initPreparation.overwriteTemplateFiles);
      }

      if (initPreparation.templateEntriesToCreateIfMissing) {
        await copyTemplateEntriesIfMissing(
          sourceDir,
          targetDir,
          initPreparation.templateEntriesToCreateIfMissing
        );
      }

      await applyProjectName(targetDir);
      await applyPhpDocroot(targetDir, selectedTemplate, effectivePhpDocroot);

      await ensureEnvFileFromExample(targetDir);
      await applyRuntimeImageSelections(targetDir, selectedTemplate, parseEnvAssignments(options.image));
      if (selectedTemplate.startsWith("db-")) {
        await customizeDbTemplateCredentials(targetDir);
      }
      process.stdout.write(`Initialized '${selectedTemplate}' in ${targetDir}\n`);
      process.stdout.write(`Next: cd ${targetDir} && loom start\n`);
    })
  );

cli
  .command("start", "Start Loom project services")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .option("--recreate", "Remove existing project containers before starting", { default: false })
  .action(
    withErrorHandling(async (options: { config?: string; recreate?: boolean }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.start({ recreate: options.recreate ?? false });
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
  .option("--recreate", "Remove existing project containers before starting again", { default: false })
  .action(
    withErrorHandling(async (options: { config?: string; recreate?: boolean }) => {
      const orchestrator = await bootstrapProject(options.config);
      await orchestrator.restart({ recreate: options.recreate ?? false });
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

cli
  .command("restore <service> <input>", "Restore a backup file into a supported database service")
  .option("--config <path>", "Path to loom config", { default: "loom.yaml" })
  .action(
    withErrorHandling(async (service: string, input: string, options: { config?: string }) => {
      const orchestrator = await bootstrapProject(options.config);
      const restoredFrom = await orchestrator.restore(service, input);
      process.stdout.write(`Restore completed [${service}]: ${restoredFrom}\n`);
    })
  );

cli.help();
cli.version(packageJson.version);

cli.parse();
