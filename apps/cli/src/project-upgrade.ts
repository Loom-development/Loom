import { createHash } from "node:crypto";
import { access, copyFile, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import packageJson from "../package.json" with { type: "json" };
import type { DbType } from "./init-prompt.js";
import type { LoomProjectManifestV2 } from "./project-manifest.js";
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
  templatesRoot: string;
  assetRoot?: string;
  manifest: LoomProjectManifestV2;
  stack: StackDefinition;
}

export interface ApplyProjectUpgradeOptions {
  forceModified: boolean;
}

function assertSafeRelativePath(path: string, label: string): void {
  const segments = path.split(/[\\/]/);
  if (!path || isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Unsafe ${label} '${path}'`);
  }
}

function resolveContained(root: string, path: string, label: string): string {
  assertSafeRelativePath(path, label);
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, path);
  const fromRoot = relative(resolvedRoot, resolvedPath);
  if (!fromRoot || fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Unsafe ${label} '${path}'`);
  return resolvedPath;
}

async function sha256File(path: string): Promise<string | undefined> {
  try {
    return createHash("sha256").update(await readFile(path)).digest("hex");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function assertNoSymlinkPath(root: string, relativePath: string, label: string): Promise<string> {
  assertSafeRelativePath(relativePath, label);
  const resolvedRoot = await realpath(root);
  const destination = resolve(resolvedRoot, relativePath);
  const fromRealRoot = relative(resolvedRoot, destination);
  if (!fromRealRoot || fromRealRoot.startsWith("..") || isAbsolute(fromRealRoot)) throw new Error(`Unsafe ${label} '${relativePath}'`);
  let current = resolvedRoot;
  for (const segment of relativePath.split(/[\\/]/)) {
    current = resolve(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlinked ${label} '${relativePath}'`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") break;
      throw error;
    }
  }
  return destination;
}

function baselinePath(path: string, sha256: string): string {
  return `.loom/baselines/${sha256}-${encodeURIComponent(path)}`;
}

export function renderProjectName(loomYaml: string, projectName: string): string {
  return loomYaml.replace(/^(name:\s*).+$/m, `$1${projectName}`);
}

function normalizeDocrootPath(raw: string): string {
  const normalized = raw.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return !normalized || normalized === "." ? "." : normalized;
}

function buildPhpBaseCommand(containerDocroot: string): string {
  return [
    "command: |", "      set -eu", '      target_uid="${HOST_UID:-1000}"', '      target_gid="${HOST_GID:-1000}"',
    '      if ! php -r "exit(extension_loaded(\'mysqli\') && extension_loaded(\'pdo_mysql\') && extension_loaded(\'pdo_pgsql\') && extension_loaded(\'pgsql\') && extension_loaded(\'pdo_sqlite\') && extension_loaded(\'intl\') && extension_loaded(\'zip\') && extension_loaded(\'exif\') && extension_loaded(\'imagick\') && extension_loaded(\'memcached\') ? 0 : 1);"; then',
    '        export DEBIAN_FRONTEND=noninteractive', '        apt-get update',
    '        apt-get install -y --no-install-recommends imagemagick libicu-dev libmagickwand-dev libmemcached-dev libsasl2-dev libzip-dev libpq-dev libsqlite3-dev libmariadb-dev pkg-config util-linux zlib1g-dev',
    '        docker-php-ext-install -j"$(getconf _NPROCESSORS_ONLN 2>/dev/null || nproc 2>/dev/null || echo 1)" mysqli pdo_mysql pdo_pgsql pgsql pdo_sqlite intl zip exif',
    "        printf '\\n' | pecl install imagick", "        printf '\\n' | pecl install memcached", '        docker-php-ext-enable imagick', '        docker-php-ext-enable memcached', '      fi',
    '      current_gid="$(getent group www-data | cut -d: -f3)"', '      if [ "$current_gid" != "$target_gid" ]; then', '        if getent group "$target_gid" >/dev/null 2>&1; then', '          existing_group="$(getent group "$target_gid" | cut -d: -f1)"', '          usermod -g "$existing_group" www-data', '        else', '          groupmod -o -g "$target_gid" www-data', '        fi', '      fi',
    '      current_uid="$(id -u www-data)"', '      if [ "$current_uid" != "$target_uid" ]; then', '        if getent passwd "$target_uid" >/dev/null 2>&1; then', '          existing_user="$(getent passwd "$target_uid" | cut -d: -f1)"', '          usermod -l loom-www-data -m -d /var/www -s /usr/sbin/nologin "$existing_user" >/dev/null 2>&1 || true', '        fi', '        usermod -o -u "$target_uid" www-data', '      fi',
    "      cat > /etc/apache2/sites-available/000-default.conf << 'APACHE_CONF'", '      <VirtualHost *:80>', `          DocumentRoot ${containerDocroot}`, `          <Directory ${containerDocroot}>`, '              Options FollowSymLinks', '              AllowOverride All', '              Require all granted', '              FallbackResource /index.php', '          </Directory>', '          ErrorLog /dev/stderr', '          CustomLog /dev/stdout combined', '      </VirtualHost>', '      APACHE_CONF', '      a2enmod rewrite >/dev/null', `      if [ ! -f ${containerDocroot}/index.php ]; then`, `        printf '%s\\n' '<?php echo "Loom PHP example is running.";' > ${containerDocroot}/index.php`, '      fi', '      exec apache2-foreground', "    dependsOn:", "      - cache", "    env:", "      MEMCACHED_HOST: cache", '      MEMCACHED_PORT: "11211"', "    volumes:"
  ].join("\n");
}

export function renderPhpDocroot(loomYaml: string, template: string, phpDocrootRaw?: string): string {
  if (!phpDocrootRaw || ["php-wordpress", "php-drupal"].includes(template)) return loomYaml;
  if (!template.startsWith("php")) throw new Error("--php-docroot can only be used with PHP templates.");
  const phpDocroot = normalizeDocrootPath(phpDocrootRaw);
  if (template === "php") {
    const containerDocroot = phpDocroot === "." ? "/app" : `/app/${phpDocroot}`;
    return loomYaml.replace(/command:\s*\|[\s\S]*?\n\s*volumes:/m, buildPhpBaseCommand(containerDocroot));
  }
  return loomYaml
    .replace(/(\s+DocumentRoot\s+)\/app\/[^\s]+/, `$1/app/${phpDocroot}`)
    .replace(/(\s+<Directory\s+)\/app\/[^\s>]+(>)/, `$1/app/${phpDocroot}$2`);
}

function dbServiceBlock(db: DbType): { serviceName: string; serviceYaml: string } {
  const definitions: Record<DbType, { serviceName: string; serviceYaml: string }> = {
    postgres: { serviceName: "postgres", serviceYaml: "  postgres:\n    type: postgres\n    image: ${POSTGRES_IMAGE:-docker.io/library/postgres:16-alpine}\n    env:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: app\n      POSTGRES_DB: app\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - ./data/postgres:/var/lib/postgresql/data\n    healthcheck:\n      command: pg_isready -U app\n      intervalSeconds: 3\n      timeoutSeconds: 3\n      retries: 30\n      startPeriodSeconds: 5" },
    mysql: { serviceName: "mysql", serviceYaml: "  mysql:\n    type: mysql\n    image: ${MYSQL_IMAGE:-docker.io/library/mysql:8.4}\n    env:\n      MYSQL_ROOT_PASSWORD: root\n      MYSQL_DATABASE: app\n      MYSQL_USER: app\n      MYSQL_PASSWORD: app\n    ports:\n      - \"3306:3306\"\n    volumes:\n      - ./data/mysql:/var/lib/mysql\n    healthcheck:\n      command: mysqladmin ping -h 127.0.0.1 -proot\n      intervalSeconds: 3\n      timeoutSeconds: 3\n      retries: 30\n      startPeriodSeconds: 10" },
    mariadb: { serviceName: "mariadb", serviceYaml: "  mariadb:\n    type: mariadb\n    image: ${MARIADB_IMAGE:-docker.io/library/mariadb:11}\n    env:\n      MARIADB_ROOT_PASSWORD: root\n      MARIADB_DATABASE: app\n      MARIADB_USER: app\n      MARIADB_PASSWORD: app\n    ports:\n      - \"3307:3306\"\n    volumes:\n      - ./data/mariadb:/var/lib/mysql\n    healthcheck:\n      command: mariadb-admin ping -h 127.0.0.1 -uroot -proot\n      intervalSeconds: 3\n      timeoutSeconds: 3\n      retries: 30\n      startPeriodSeconds: 10" },
    mongodb: { serviceName: "mongodb", serviceYaml: "  mongodb:\n    type: mongodb\n    image: ${MONGO_IMAGE:-docker.io/library/mongo:7}\n    env:\n      MONGO_INITDB_ROOT_USERNAME: app\n      MONGO_INITDB_ROOT_PASSWORD: app\n      MONGO_INITDB_DATABASE: app\n    ports:\n      - \"27017:27017\"\n    volumes:\n      - ./data/mongodb:/data/db" },
    redis: { serviceName: "redis", serviceYaml: "  redis:\n    type: redis\n    image: ${REDIS_IMAGE:-docker.io/library/redis:7-alpine}\n    command: redis-server --appendonly yes\n    ports:\n      - \"6379:6379\"\n    volumes:\n      - ./data/redis:/data\n    healthcheck:\n      command: redis-cli ping | grep PONG\n      intervalSeconds: 3\n      timeoutSeconds: 3\n      retries: 30\n      startPeriodSeconds: 2" }
  };
  return definitions[db];
}

export function renderDatabaseService(loomYaml: string, db: DbType): string {
  const { serviceName, serviceYaml } = dbServiceBlock(db);
  if (new RegExp(`^ {2}${serviceName}:`, "m").test(loomYaml)) return loomYaml;
  const insertion = /^(routes:|tasks:)/m.test(loomYaml)
    ? loomYaml.replace(/^(routes:|tasks:)/m, `${serviceYaml}\n$1`)
    : `${loomYaml.trimEnd()}\n${serviceYaml}\n`;
  if (/^ {4}dependsOn:/m.test(insertion)) {
    return insertion.replace(/^( {4}dependsOn:(?:\n {6}- [^\n]+)*)/m, `$1\n      - ${serviceName}`);
  }
  const portsIndex = insertion.indexOf("\n    ports:");
  return portsIndex === -1 ? insertion : `${insertion.slice(0, portsIndex)}\n    dependsOn:\n      - ${serviceName}${insertion.slice(portsIndex)}`;
}

async function renderCandidates(options: PlanProjectUpgradeOptions, candidateRoot: string): Promise<void> {
  const assetRoot = options.assetRoot ?? resolve(options.templatesRoot, options.stack.assetPath);
  for (const path of options.stack.loomOwnedFiles) {
    const source = resolveContained(assetRoot, path, "Loom-owned asset path");
    try { await access(source); } catch { throw new Error(`Missing Loom-owned asset '${path}' for stack '${options.stack.id}'`); }
    const destination = resolveContained(candidateRoot, path, "candidate path");
    await mkdir(resolve(destination, ".."), { recursive: true });
    await copyFile(source, destination);
  }
  if (options.stack.loomOwnedFiles.includes("loom.yaml")) {
    const path = resolve(candidateRoot, "loom.yaml");
    let content = await readFile(path, "utf8");
    content = renderProjectName(content, options.manifest.renderInputs.projectName);
    content = renderPhpDocroot(content, options.stack.id, options.manifest.renderInputs.phpDocroot);
    for (const database of options.manifest.renderInputs.databases) {
      if (!["postgres", "mysql", "mariadb", "mongodb", "redis"].includes(database)) throw new Error(`Unknown stored database type '${database}'`);
      content = renderDatabaseService(content, database as DbType);
    }
    await writeFile(path, content, "utf8");
  }
}

export async function planProjectUpgrade(options: PlanProjectUpgradeOptions): Promise<ProjectUpgradePlan> {
  await mkdir(resolve(options.projectRoot, ".loom"), { recursive: true });
  const candidateRoot = await mkdtemp(resolve(options.projectRoot, ".loom", "upgrade-candidate-"));
  try {
    for (const path of Object.keys(options.manifest.ownedFiles)) assertSafeRelativePath(path, "owned file path");
    for (const path of options.stack.loomOwnedFiles) assertSafeRelativePath(path, "Loom-owned asset path");
    await renderCandidates(options, candidateRoot);
    const files: ProjectUpgradeFilePlan[] = [];
    for (const path of Object.keys(options.manifest.ownedFiles).sort()) {
      if (!options.stack.loomOwnedFiles.includes(path)) throw new Error(`Stack '${options.stack.id}' does not declare owned asset '${path}'`);
      const currentSha256 = await sha256File(resolveContained(options.projectRoot, path, "owned file path"));
      const candidatePath = resolveContained(candidateRoot, path, "candidate path");
      const candidateSha256 = await sha256File(candidatePath);
      if (!candidateSha256) throw new Error(`Missing Loom-owned asset '${path}' for stack '${options.stack.id}'`);
      const baselineSha256 = options.manifest.ownedFiles[path].sha256;
      files.push({ path, state: currentSha256 === undefined ? "missing" : currentSha256 === baselineSha256 ? "unchanged" : "modified", ...(currentSha256 ? { currentSha256 } : {}), baselineSha256, candidateSha256, candidatePath });
    }
    return { projectRoot: resolve(options.projectRoot), candidateRoot, manifest: options.manifest, stack: options.stack, files };
  } catch (error) {
    await rm(candidateRoot, { recursive: true, force: true });
    throw error;
  }
}

export async function applyProjectUpgrade(
  plan: ProjectUpgradePlan,
  options: ApplyProjectUpgradeOptions
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated = plan.files.filter((file) => file.state !== "modified" || options.forceModified).map((file) => file.path);
  const skipped = plan.files.filter((file) => file.state === "modified" && !options.forceModified).map((file) => file.path);
  const loomDir = await assertNoSymlinkPath(plan.projectRoot, ".loom", "Loom metadata path");
  const stageRoot = await mkdtemp(resolve(loomDir, "upgrade-stage-"));
  try {
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const staged = resolveContained(stageRoot, file.path, "staged owned file path");
      await mkdir(dirname(staged), { recursive: true });
      await copyFile(file.candidatePath, staged);
      if (await sha256File(staged) !== file.candidateSha256) throw new Error(`Candidate hash changed for '${file.path}'`);
      const target = await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
      await mkdir(dirname(target), { recursive: true });
      await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
    }

    const nextManifest: LoomProjectManifestV2 = {
      ...plan.manifest,
      loomVersion: packageJson.version,
      stack: { id: plan.stack.id, scaffoldVersion: plan.stack.scaffoldVersion },
      ownedFiles: { ...plan.manifest.ownedFiles }
    };
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const nextBaselinePath = baselinePath(file.path, file.candidateSha256);
      const stagedBaseline = resolveContained(stageRoot, nextBaselinePath, "staged baseline path");
      await mkdir(dirname(stagedBaseline), { recursive: true });
      await copyFile(file.candidatePath, stagedBaseline);
      nextManifest.ownedFiles[file.path] = { sha256: file.candidateSha256, baselinePath: nextBaselinePath };
    }
    const stagedManifest = resolve(stageRoot, ".loom", "manifest.json");
    await mkdir(dirname(stagedManifest), { recursive: true });
    await writeFile(stagedManifest, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");

    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const target = await assertNoSymlinkPath(plan.projectRoot, file.path, "owned file path");
      await rename(resolveContained(stageRoot, file.path, "staged owned file path"), target);
    }
    for (const file of plan.files.filter((entry) => updated.includes(entry.path))) {
      const path = nextManifest.ownedFiles[file.path].baselinePath;
      const target = await assertNoSymlinkPath(plan.projectRoot, path, "baseline path");
      await mkdir(dirname(target), { recursive: true });
      await rename(resolveContained(stageRoot, path, "staged baseline path"), target);
    }
    const manifestTarget = await assertNoSymlinkPath(plan.projectRoot, ".loom/manifest.json", "manifest path");
    await rename(stagedManifest, manifestTarget);
    return { updated, skipped };
  } finally {
    await Promise.all([
      rm(stageRoot, { recursive: true, force: true }),
      rm(plan.candidateRoot, { recursive: true, force: true })
    ]);
  }
}
