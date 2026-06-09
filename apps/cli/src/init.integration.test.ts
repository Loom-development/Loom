import test from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

function runCli(args: string[], options: { env?: NodeJS.ProcessEnv; input?: string } = {}) {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const cliPath = resolve(currentFileDir, "index.js");

  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    input: options.input,
    env: {
      ...process.env,
      ...options.env
    }
  });
}

test("init php defaults docroot to '.' when not provided", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "php-default");

  const result = runCli(["init", "php", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  assert.match(generatedConfig, /frankenphp php-server --listen :80 --root \/app/);
  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-docker\.io\/dunglas\/frankenphp:1-php8\.3\}/);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /docker-php-ext-install[\s\S]*intl zip exif/);
  assert.match(generatedConfig, /pecl install imagick/);
  assert.match(generatedConfig, /pecl install memcached/);
  assert.match(generatedConfig, /type:\s*memcached/);
  assert.match(generatedConfig, /MEMCACHED_HOST:\s*cache/);
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
  assert.match(generatedEnv, /MEMCACHED_IMAGE=docker\.io\/library\/memcached:1\.6-alpine/);
  assert.match(generatedConfig, /healthcheck:/);
  assert.match(generatedConfig, /fsockopen.*127\.0\.0\.1.*80/);
  assert.doesNotMatch(generatedConfig, /type:\s*postgres/);
  assert.doesNotMatch(generatedConfig, /type:\s*mysql/);
  assert.doesNotMatch(generatedConfig, /type:\s*mariadb/);
  assert.doesNotMatch(generatedEnv, /POSTGRES_IMAGE=/);
});

test("init php with --db adds database service", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "php-with-db");

  const result = runCli(["init", "php", "--dir", targetDir, "--db", "mariadb"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  assert.match(generatedConfig, /type:\s*mariadb/);
  assert.match(generatedConfig, /- mariadb/);
  assert.match(generatedEnv, /MARIADB_IMAGE=/);
  assert.match(generatedEnv, /MARIADB_URL=/);
});

test("init python does not include a database service by default", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "python-default");

  const result = runCli(["init", "python", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  assert.doesNotMatch(generatedConfig, /type:\s*redis/);
  assert.doesNotMatch(generatedConfig, /type:\s*postgres/);
  assert.doesNotMatch(generatedConfig, /type:\s*mysql/);
  assert.doesNotMatch(generatedEnv, /REDIS_IMAGE=/);
});

test("init php-wordpress accepts php-docroot and reports ignore warning", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "wp-docroot");

  const result = runCli(["init", "php-wordpress", "--dir", targetDir, "--php-docroot", "public"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Ignoring --php-docroot for 'php-wordpress'/);
});

test("init applies runtime image overrides from --image", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "node-lts");

  const result = runCli(["init", "node", "--dir", targetDir, "--image", "NODE_IMAGE=docker.io/library/node:22-alpine"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{NODE_IMAGE:-docker\.io\/library\/node:24-alpine\}/);
  assert.match(generatedEnv, /NODE_IMAGE=docker\.io\/library\/node:22-alpine/);
  assert.match(result.stdout, /Configured runtime image selections/);
});

test("init bootstrap-heavy starters include readiness healthchecks", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));

  const cases = [
    {
      template: "node",
      dirName: "node-healthcheck",
      patterns: [
        /healthcheck:/,
        /http:\/\/127\.0\.0\.1:3000\/health/,
        /startPeriodSeconds:\s*8/
      ]
    },
    {
      template: "python",
      dirName: "python-healthcheck",
      patterns: [
        /healthcheck:/,
        /http:\/\/127\.0\.0\.1:8000\//,
        /startPeriodSeconds:\s*6/
      ]
    }
  ];

  for (const testCase of cases) {
    const targetDir = join(tempRoot, testCase.dirName);
    const result = runCli(["init", testCase.template, "--dir", targetDir]);
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
    for (const pattern of testCase.patterns) {
      assert.match(generatedConfig, pattern);
    }
  }
});

test("init php does not prompt when PHP_IMAGE is provided via --image", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "php-no-prompt");

  const result = runCli([
    "init",
    "php",
    "--dir",
    targetDir,
    "--image",
    "PHP_IMAGE=docker.io/dunglas/frankenphp:1-php8.3"
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stdout, /Choose PHP runtime/);

  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
});

test("init explains what a selected stack includes", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "mern-stack");

  const result = runCli(["init", "node-mern", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Initializing 'node-mern': MongoDB, Express\.js API, React frontend, and Node\.js runtime\./);
});

test("init django-react creates backend, frontend, and env files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "django-react-app");

  const result = runCli(["init", "django-react", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  const backendRequirements = await readFile(join(targetDir, "backend", "requirements.txt"), "utf8");
  const frontendPackage = await readFile(join(targetDir, "frontend", "package.json"), "utf8");

  assert.match(result.stdout, /Initializing 'django-react': Django backend and React frontend\./);
  assert.match(generatedConfig, /name:\s*loom-django_react_app/i);
  assert.match(generatedConfig, /image:\s*\$\{PYTHON_IMAGE:-docker\.io\/library\/python:3\.12-slim\}/);
  assert.match(generatedConfig, /image:\s*\$\{NODE_IMAGE:-docker\.io\/library\/node:24-alpine\}/);
  assert.match(generatedConfig, /type:\s*python[\s\S]*user:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}[\s\S]*userns:\s*keep-id[\s\S]*execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /type:\s*node[\s\S]*user:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}[\s\S]*userns:\s*keep-id[\s\S]*execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedEnv, /PYTHON_IMAGE=docker\.io\/library\/python:3\.12-slim/);
  assert.match(generatedEnv, /NODE_IMAGE=docker\.io\/library\/node:24-alpine/);
  assert.match(generatedEnv, /HOST_UID=1000/);
  assert.match(generatedEnv, /HOST_GID=1000/);
  assert.match(backendRequirements, /Django~=5\.2\.0/);
  assert.match(frontendPackage, /loom-django-react-frontend/);
});

test("init dotnet includes host-aligned exec user defaults", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "dotnet-app");

  const result = runCli(["init", "dotnet", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{DOTNET_IMAGE:-mcr\.microsoft\.com\/dotnet\/sdk:8\.0\}/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedEnv, /DOTNET_IMAGE=mcr\.microsoft\.com\/dotnet\/sdk:8\.0/);
  assert.match(generatedEnv, /HOST_UID=1000/);
  assert.match(generatedEnv, /HOST_GID=1000/);
});

test("init spring-react includes host-aligned exec user defaults", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "spring-react-app");

  const result = runCli(["init", "spring-react", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{JAVA_IMAGE:-docker\.io\/library\/maven:3\.9-eclipse-temurin-21\}/);
  assert.match(generatedConfig, /image:\s*\$\{NODE_IMAGE:-docker\.io\/library\/node:22-alpine\}/);
  assert.match(generatedConfig, /type:\s*java[\s\S]*userns:\s*keep-id[\s\S]*execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /type:\s*node[\s\S]*userns:\s*keep-id[\s\S]*execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedEnv, /JAVA_IMAGE=docker\.io\/library\/maven:3\.9-eclipse-temurin-21/);
  assert.match(generatedEnv, /NODE_IMAGE=docker\.io\/library\/node:22-alpine/);
  assert.match(generatedEnv, /HOST_UID=1000/);
  assert.match(generatedEnv, /HOST_GID=1000/);
});

test("init jamstack creates frontend and api files with updated stack explanation", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "jamstack-app");

  const result = runCli(["init", "jamstack", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  const apiPackage = await readFile(join(targetDir, "api", "package.json"), "utf8");
  const webPackage = await readFile(join(targetDir, "web", "package.json"), "utf8");

  assert.match(result.stdout, /Initializing 'jamstack': JavaScript, APIs, Markup with a static-first frontend and Node\.js API\./);
  assert.match(generatedConfig, /service:\s*web/);
  assert.match(generatedConfig, /workdir:\s*\/workspace\/api/);
  assert.match(generatedConfig, /workdir:\s*\/workspace\/web/);
  assert.match(generatedEnv, /NODE_IMAGE=docker\.io\/library\/node:24-alpine/);
  assert.match(apiPackage, /loom-jamstack-api/);
  assert.match(webPackage, /loom-jamstack-web/);
});

test("init mean creates Angular frontend files and stack services", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "mean-app");

  const result = runCli(["init", "node-mean", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const webPackage = await readFile(join(targetDir, "web", "package.json"), "utf8");
  const appComponent = await readFile(join(targetDir, "web", "src", "app", "app.component.ts"), "utf8");
  const proxyConfig = await readFile(join(targetDir, "web", "proxy.conf.json"), "utf8");

  assert.match(result.stdout, /Initializing 'node-mean': MongoDB, Express\.js, Angular, and Node\.js\./);
  assert.match(generatedConfig, /service:\s*web/);
  assert.match(generatedConfig, /4200:4200/);
  assert.match(webPackage, /@angular\/core/);
  assert.match(appComponent, /Loom MEAN template/);
  assert.match(proxyConfig, /"target": "http:\/\/api:3001"/);
});

test("init rails7-hotwire bootstraps a Rails + Hotwire project before copying Loom files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const binDir = join(tempRoot, "bin");
  const targetDir = join(tempRoot, "rails-hotwire-app");
  await mkdir(binDir, { recursive: true });

  const podmanPath = join(binDir, "podman");
  await writeFile(
    podmanPath,
    [
      "#!/bin/sh",
      "set -eu",
      "target=''",
      "while [ \"$#\" -gt 0 ]; do",
      "  case \"$1\" in",
      "    -v)",
      "      mount=\"$2\"",
      "      target=\"${mount%%:*}\"",
      "      shift 2",
      "      ;;",
      "    -w)",
      "      shift 2",
      "      ;;",
      "    --rm|--userns=keep-id)",
      "      shift",
      "      ;;",
      "    docker.io/library/ruby:3.3)",
      "      shift",
      "      break",
      "      ;;",
      "    *)",
      "      shift",
      "      ;;",
      "  esac",
      "done",
      "if [ \"$1\" != \"sh\" ] || [ \"$2\" != \"-lc\" ]; then",
      "  echo 'unexpected podman args' >&2",
      "  exit 23",
      "fi",
      "/bin/mkdir -p \"$target/bin\" \"$target/config\" \"$target/app/views/layouts\"",
      "printf '%s\\n' '#!/usr/bin/env ruby' > \"$target/bin/rails\"",
      "printf '%s\\n' 'Rails.application.routes.draw do end' > \"$target/config/routes.rb\"",
      "printf '%s\\n' 'source \"https://rubygems.org\"' > \"$target/Gemfile\"",
      "printf '%s\\n' '<!DOCTYPE html><html><body>Hotwire</body></html>' > \"$target/app/views/layouts/application.html.erb\""
    ].join("\n"),
    "utf8"
  );
  await chmod(podmanPath, 0o755);

  const result = runCli(["init", "rails7-hotwire", "--dir", targetDir], {
    env: {
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");
  const generatedLayout = await readFile(join(targetDir, "app", "views", "layouts", "application.html.erb"), "utf8");

  assert.match(result.stdout, /Initializing 'rails7-hotwire': Rails 7 with Hotwire bootstrapped into the project and run on a Ruby base image\./);
  assert.match(generatedConfig, /name:\s*loom-rails_hotwire_app/i);
  assert.match(generatedConfig, /3008:3008/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /healthcheck:/);
  assert.match(generatedConfig, /TCPSocket\.new\('127\.0\.0\.1', 3008\)\.close/);
  assert.match(generatedConfig, /startPeriodSeconds:\s*10/);
  assert.match(generatedEnv, /RUBY_IMAGE=docker\.io\/library\/ruby:3\.3/);
  assert.match(generatedLayout, /Hotwire/);
});

test("init php-symfony bootstraps a Symfony project before copying Loom files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const binDir = join(tempRoot, "bin");
  const targetDir = join(tempRoot, "symfony-app");
  await mkdir(binDir, { recursive: true });

  const podmanPath = join(binDir, "podman");
  await writeFile(
    podmanPath,
    [
      "#!/bin/sh",
      "set -eu",
      "target=''",
      "while [ \"$#\" -gt 0 ]; do",
      "  case \"$1\" in",
      "    -v)",
      "      mount=\"$2\"",
      "      target=\"${mount%%:*}\"",
      "      shift 2",
      "      ;;",
      "    -w)",
      "      shift 2",
      "      ;;",
      "    --rm|--userns=keep-id)",
      "      shift",
      "      ;;",
      "    docker.io/library/composer:2)",
      "      shift",
      "      break",
      "      ;;",
      "    *)",
      "      shift",
      "      ;;",
      "  esac",
      "done",
      "if [ \"$1\" != \"sh\" ] || [ \"$2\" != \"-lc\" ]; then",
      "  echo 'unexpected podman args' >&2",
      "  exit 23",
      "fi",
      "/bin/mkdir -p \"$target/bin\" \"$target/config\" \"$target/public\"",
      "printf '%s\\n' '#!/usr/bin/env php' > \"$target/bin/console\"",
      "printf '%s\\n' '<?php return []; ' > \"$target/config/bundles.php\"",
      "printf '%s\\n' '<?php echo \"Symfony stub\";' > \"$target/public/index.php\"",
      "printf '%s\\n' '{\"require\":{\"symfony/framework-bundle\":\"^7.0\"}}' > \"$target/composer.json\""
    ].join("\n"),
    "utf8"
  );
  await chmod(podmanPath, 0o755);

  const result = runCli(["init", "php-symfony", "--dir", targetDir], {
    env: {
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedIndex = await readFile(join(targetDir, "public", "index.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-docker\.io\/dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(generatedConfig, /workdir:\s*\/app/);
  assert.match(generatedConfig, /docker-php-ext-install[\s\S]*intl zip exif/);
  assert.match(generatedConfig, /pecl install imagick/);
  assert.match(generatedConfig, /pecl install memcached/);
  assert.match(generatedConfig, /type:\s*memcached/);
  assert.match(generatedConfig, /MEMCACHED_HOST:\s*cache/);
  assert.match(generatedConfig, /--root public/);
  assert.match(generatedIndex, /Symfony stub/);
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
  assert.match(generatedEnv, /MEMCACHED_IMAGE=docker\.io\/library\/memcached:1\.6-alpine/);
});

test("init php-symfony adopts an existing Symfony project and only adds Loom files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "symfony-existing");
  await mkdir(join(targetDir, "bin"), { recursive: true });
  await mkdir(join(targetDir, "public"), { recursive: true });
  await writeFile(join(targetDir, "composer.json"), JSON.stringify({ require: { "symfony/framework-bundle": "^7.0" } }), "utf8");
  await writeFile(join(targetDir, "bin", "console"), "#!/usr/bin/env php", "utf8");
  await writeFile(join(targetDir, "public", "index.php"), "<?php echo 'existing symfony';", "utf8");

  const result = runCli(["init", "php-symfony", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const existingIndex = await readFile(join(targetDir, "public", "index.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(existingIndex, /existing symfony/);
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
});

test("init db template defaults to ./db and creates .env", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const previousCwd = process.cwd();
  process.chdir(tempRoot);

  try {
    const result = runCli(["init", "db-postgres"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const generatedConfig = await readFile(join(tempRoot, "db", "loom.yaml"), "utf8");
    const generatedEnv = await readFile(join(tempRoot, "db", ".env"), "utf8");
    assert.match(generatedConfig, /name:\s*loom-loom_cli_init_/i);
    assert.match(generatedEnv, /POSTGRES_USER=/);
    assert.match(result.stdout, /Initialized 'db-postgres' in .*\/db/);
  } finally {
    process.chdir(previousCwd);
  }
});

test("init in non-empty directory without --blank-template only writes loom config files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "non-empty");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "keep.txt"), "existing", "utf8");
  await writeFile(join(targetDir, "index.php"), "<?php echo 'my app';", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /name:\s*loom-non_empty/i);

  const keepContent = await readFile(join(targetDir, "keep.txt"), "utf8");
  assert.equal(keepContent, "existing");

  const indexContent = await readFile(join(targetDir, "index.php"), "utf8");
  assert.equal(indexContent, "<?php echo 'my app';");
});

test("init with --blank-template deletes existing files and copies the full template", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "blank-template");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "existing.txt"), "will be removed", "utf8");
  await writeFile(join(targetDir, "index.php"), "<?php echo 'old app';", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir, "--blank-template"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /name:\s*loom-blank_template/i);

  await assert.rejects(
    () => readFile(join(targetDir, "existing.txt"), "utf8"),
    /ENOENT/
  );
});

test("init --db postgres adds postgres service to loom.yaml and .env", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "node-with-postgres");

  const result = runCli(["init", "node", "--dir", targetDir, "--db", "postgres"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const loomYaml = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(loomYaml, /^ {2}postgres:/m);
  assert.match(loomYaml, /type:\s*postgres/);
  assert.match(loomYaml, /POSTGRES_USER:/);
  assert.match(loomYaml, /5432:5432/);
  assert.match(loomYaml, /dependsOn:/);
  assert.match(loomYaml, /- postgres/);

  const env = await readFile(join(targetDir, ".env"), "utf8");
  assert.match(env, /POSTGRES_IMAGE=/);
  assert.match(env, /DATABASE_URL=postgresql:\/\//);
});

test("init --db mysql adds mysql service to loom.yaml", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "node-with-mysql");

  const result = runCli(["init", "node", "--dir", targetDir, "--db", "mysql"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const loomYaml = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(loomYaml, /^ {2}mysql:/m);
  assert.match(loomYaml, /type:\s*mysql/);
  assert.match(loomYaml, /3306:3306/);
  assert.match(loomYaml, /dependsOn:/);
});

test("init --db with multiple types adds both services", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "node-multi-db");

  const result = runCli(["init", "node", "--dir", targetDir, "--db", "postgres", "--db", "redis"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const loomYaml = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(loomYaml, /^ {2}postgres:/m);
  assert.match(loomYaml, /^ {2}redis:/m);
  assert.match(loomYaml, /- postgres/);
  assert.match(loomYaml, /- redis/);

  const env = await readFile(join(targetDir, ".env"), "utf8");
  assert.match(env, /POSTGRES_IMAGE=/);
  assert.match(env, /REDIS_IMAGE=/);
});

test("init --db rejects unknown db type", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "bad-db");

  const result = runCli(["init", "node", "--dir", targetDir, "--db", "oracle"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /unknown database type/i);
});

test("init --db skips adding a service when it already exists", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "already-has-db");

  // First init with db
  let result = runCli(["init", "node", "--dir", targetDir, "--db", "postgres"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  // Second init adding same db type to existing project
  result = runCli(["init", "node", "--dir", targetDir, "--db", "postgres"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /already exists/);

  // Should still only have one postgres block
  const loomYaml = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.equal((loomYaml.match(/^ {2}postgres:/gm) ?? []).length, 1);
});

test("init without template prompts for a selection", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "picked-template");

  const result = runCli(["init", "--dir", targetDir], {
    input: "1\n"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Choose a template to initialize:/);
  assert.match(result.stdout, /Initialized 'node' in/);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /name:\s*loom-picked_template/i);
});

test("init without template suggests a detected template from the target root", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "detected-template");
  const previousCwd = process.cwd();
  await writeFile(join(tempRoot, "package.json"), JSON.stringify({ name: "demo" }), "utf8");

  process.chdir(tempRoot);
  try {
    const result = runCli(["init", "--dir", targetDir], {
      input: "\n"
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Suggested template: node/);
    assert.match(result.stdout, /Initialized 'node' in/);
    const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
    assert.match(generatedConfig, /name:\s*loom-detected_template/i);
  } finally {
    process.chdir(previousCwd);
  }
});

test("init php-drupal bootstraps a Drupal project with Podman Composer before copying loom config", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const binDir = join(tempRoot, "bin");
  const targetDir = join(tempRoot, "drupal-app");
  await mkdir(binDir, { recursive: true });

  const podmanPath = join(binDir, "podman");
  await writeFile(
    podmanPath,
    [
      "#!/bin/sh",
      "set -eu",
      "target=''",
      "while [ \"$#\" -gt 0 ]; do",
      "  case \"$1\" in",
      "    -v)",
      "      mount=\"$2\"",
      "      target=\"${mount%%:*}\"",
      "      shift 2",
      "      ;;",
      "    -w)",
      "      shift 2",
      "      ;;",
      "    --rm|--userns=keep-id)",
      "      shift",
      "      ;;",
      "    docker.io/library/composer:2)",
      "      shift",
      "      break",
      "      ;;",
      "    *)",
      "      shift",
      "      ;;",
      "  esac",
      "done",
      "if [ \"$1\" != \"create-project\" ] || [ \"$2\" != \"drupal/recommended-project\" ] || [ \"$3\" != \".\" ]; then",
      "  echo 'unexpected podman args' >&2",
      "  exit 23",
      "fi",
      "/bin/mkdir -p \"$target/web\" \"$target/sites/default\"",
      "printf '%s\\n' '<?php echo \\\"Drupal stub\\\";' > \"$target/web/index.php\"",
      "printf '%s\\n' '{\\\"name\\\":\\\"drupal/recommended-project\\\"}' > \"$target/composer.json\""
    ].join("\n"),
    "utf8"
  );
  await chmod(podmanPath, 0o755);

  const result = runCli(["init", "php-drupal", "--dir", targetDir], {
    env: {
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedComposer = await readFile(join(targetDir, "composer.json"), "utf8");
  const generatedIndex = await readFile(join(targetDir, "web", "index.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-docker\.io\/dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /docker-php-ext-install[\s\S]*intl zip exif/);
  assert.match(generatedConfig, /pecl install imagick/);
  assert.match(generatedConfig, /pecl install memcached/);
  assert.match(generatedConfig, /type:\s*memcached/);
  assert.match(generatedConfig, /MEMCACHED_HOST:\s*cache/);
  assert.match(generatedConfig, /startPeriodSeconds:\s*300/);
  assert.match(generatedConfig, /\.\/:\/app/);
  assert.match(generatedConfig, /\.\/data\/files:\/app\/web\/sites\/default\/files/);
  assert.match(generatedComposer, /drupal\/recommended-project/);
  assert.match(generatedIndex, /Drupal stub/);
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
  assert.match(generatedEnv, /MEMCACHED_IMAGE=docker\.io\/library\/memcached:1\.6-alpine/);
  assert.match(generatedEnv, /MYSQL_IMAGE=docker\.io\/library\/mysql:8\.4/);
});

test("init php-drupal reports when Podman is unavailable", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "drupal-app-podman");

  const result = runCli(["init", "php-drupal", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Podman is required to initialize 'php-drupal'/i);
});

test("init php-drupal adopts an existing Drupal project and only adds Loom files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "drupal-existing");
  await mkdir(join(targetDir, "web"), { recursive: true });
  await writeFile(join(targetDir, "composer.json"), JSON.stringify({ name: "demo", require: { "drupal/core": "^10" } }), "utf8");
  await writeFile(join(targetDir, "web", "index.php"), "<?php echo 'existing drupal';", "utf8");

  const result = runCli(["init", "php-drupal", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const existingIndex = await readFile(join(targetDir, "web", "index.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-docker\.io\/dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(existingIndex, /existing drupal/);
  assert.match(generatedEnv, /PHP_IMAGE=docker\.io\/dunglas\/frankenphp:1-php8\.3/);
});

test("init php-wordpress bootstraps a local WordPress project before copying loom config", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const binDir = join(tempRoot, "bin");
  const targetDir = join(tempRoot, "wordpress-app");
  await mkdir(binDir, { recursive: true });

  const podmanPath = join(binDir, "podman");
  await writeFile(
    podmanPath,
    [
      "#!/bin/sh",
      "set -eu",
      "target=''",
      "while [ \"$#\" -gt 0 ]; do",
      "  case \"$1\" in",
      "    -v)",
      "      mount=\"$2\"",
      "      target=\"${mount%%:*}\"",
      "      shift 2",
      "      ;;",
      "    --rm|--userns=keep-id)",
      "      shift",
      "      ;;",
      "    docker.io/library/wordpress:6.7-php8.3-apache)",
      "      shift",
      "      break",
      "      ;;",
      "    *)",
      "      shift",
      "      ;;",
      "  esac",
      "done",
      "if [ \"$1\" != \"sh\" ] || [ \"$2\" != \"-lc\" ] || [ \"$3\" != \"cp -a /usr/src/wordpress/. /app/\" ]; then",
      "  echo 'unexpected podman args' >&2",
      "  exit 23",
      "fi",
      "/bin/mkdir -p \"$target/wp-content\"",
      "printf '%s\\n' '<?php echo \"WordPress stub\";' > \"$target/index.php\"",
      "printf '%s\\n' 'RewriteEngine On' > \"$target/.htaccess\""
    ].join("\n"),
    "utf8"
  );
  await chmod(podmanPath, 0o755);

  const result = runCli(["init", "php-wordpress", "--dir", targetDir], {
    env: {
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedIndex = await readFile(join(targetDir, "index.php"), "utf8");
  const generatedWpConfig = await readFile(join(targetDir, "wp-config.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{WORDPRESS_IMAGE:-docker\.io\/library\/wordpress:6-php8\.3-apache\}/i);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /workdir:\s*\/var\/www\/html/);
  assert.match(generatedConfig, /\.\/wp-content:\/var\/www\/html\/wp-content/);
  assert.match(generatedConfig, /pecl install memcached/);
  assert.match(generatedConfig, /type:\s*memcached/);
  assert.match(generatedConfig, /MEMCACHED_HOST:\s*cache/);
  assert.match(generatedConfig, /startPeriodSeconds:\s*300/);
  assert.match(generatedConfig, /WORDPRESS_DB_HOST:\s*db:3306/);
  assert.match(generatedIndex, /WordPress stub/);
  assert.match(generatedWpConfig, /DB_NAME/);
  assert.match(generatedWpConfig, /\$table_prefix\s*=\s*loomWordPressEnv\('WORDPRESS_TABLE_PREFIX', 'wp_'\);/);
  assert.match(generatedEnv, /WORDPRESS_IMAGE=docker\.io\/library\/wordpress:6-php8\.3-apache/);
  assert.match(generatedEnv, /MEMCACHED_IMAGE=docker\.io\/library\/memcached:1\.6-alpine/);
  assert.match(generatedEnv, /MYSQL_IMAGE=docker\.io\/library\/mysql:8\.4/);
});

test("init php-wordpress reports when Podman is unavailable", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "wordpress-app-podman");

  const result = runCli(["init", "php-wordpress", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Podman is required to initialize 'php-wordpress'/i);
});

test("init php-wordpress adopts an existing WordPress project and preserves existing wp-config", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "wordpress-existing");
  await mkdir(join(targetDir, "wp-content"), { recursive: true });
  await writeFile(join(targetDir, "index.php"), "<?php echo 'existing wordpress';", "utf8");
  await writeFile(join(targetDir, "wp-config.php"), "<?php define('DB_NAME', 'existing');", "utf8");

  const result = runCli(["init", "php-wordpress", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const existingWpConfig = await readFile(join(targetDir, "wp-config.php"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{WORDPRESS_IMAGE:-docker\.io\/library\/wordpress:6-php8\.3-apache\}/i);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /workdir:\s*\/var\/www\/html/);
  assert.match(existingWpConfig, /existing/);
  assert.doesNotMatch(existingWpConfig, /loom-auth-key/);
  assert.match(generatedEnv, /WORDPRESS_IMAGE=docker\.io\/library\/wordpress:6-php8\.3-apache/);
});

test("init php-wordpress adopts an existing WordPress project and adds wp-config when missing", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "wordpress-existing-missing-config");
  await mkdir(join(targetDir, "wp-content"), { recursive: true });
  await writeFile(join(targetDir, "index.php"), "<?php echo 'existing wordpress';", "utf8");

  const result = runCli(["init", "php-wordpress", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedWpConfig = await readFile(join(targetDir, "wp-config.php"), "utf8");
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedWpConfig, /DB_NAME/);
  assert.match(generatedWpConfig, /\$table_prefix\s*=\s*loomWordPressEnv\('WORDPRESS_TABLE_PREFIX', 'wp_'\);/);
  assert.match(generatedConfig, /composer:\s*false/);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /workdir:\s*\/var\/www\/html/);
  assert.match(generatedEnv, /WORDPRESS_IMAGE=docker\.io\/library\/wordpress:6-php8\.3-apache/);
});

test("init rails7 bootstraps a local Rails project before copying loom config", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const binDir = join(tempRoot, "bin");
  const targetDir = join(tempRoot, "rails7-app");
  await mkdir(binDir, { recursive: true });

  const podmanPath = join(binDir, "podman");
  await writeFile(
    podmanPath,
    [
      "#!/bin/sh",
      "set -eu",
      "target=''",
      "while [ \"$#\" -gt 0 ]; do",
      "  case \"$1\" in",
      "    -v)",
      "      mount=\"$2\"",
      "      target=\"${mount%%:*}\"",
      "      shift 2",
      "      ;;",
      "    -w)",
      "      shift 2",
      "      ;;",
      "    --rm|--userns=keep-id)",
      "      shift",
      "      ;;",
      "    docker.io/library/ruby:3.3)",
      "      shift",
      "      break",
      "      ;;",
      "    *)",
      "      shift",
      "      ;;",
      "  esac",
      "done",
      "if [ \"$1\" != \"sh\" ] || [ \"$2\" != \"-lc\" ] || [ \"$3\" != \"gem install bundler --no-document && gem install rails -v 7.1.5 --no-document && /usr/local/bundle/bin/rails _7.1.5_ new . --skip-javascript --skip-test --skip-system-test\" ]; then",
      "  echo 'unexpected podman args' >&2",
      "  exit 23",
      "fi",
      "/bin/mkdir -p \"$target/config\" \"$target/bin\"",
      "printf '%s\\n' 'source \"https://rubygems.org\"' > \"$target/Gemfile\"",
      "printf '%s\\n' '#!/usr/bin/env ruby' > \"$target/bin/rails\"",
      "/bin/chmod +x \"$target/bin/rails\""
    ].join("\n"),
    "utf8"
  );
  await chmod(podmanPath, 0o755);

  const result = runCli(["init", "rails7", "--dir", targetDir], {
    env: {
      PATH: binDir
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedGemfile = await readFile(join(targetDir, "Gemfile"), "utf8");
  const generatedRailsBin = await readFile(join(targetDir, "bin", "rails"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{RUBY_IMAGE:-docker\.io\/library\/ruby:3\.3\}/i);
  assert.match(generatedConfig, /user:\s*root/);
  assert.match(generatedConfig, /userns:\s*keep-id/);
  assert.match(generatedConfig, /execUser:\s*\$\{HOST_UID:-1000\}:\$\{HOST_GID:-1000\}/);
  assert.match(generatedConfig, /gem install bundler --no-document/);
  assert.match(generatedConfig, /bundle install/);
  assert.match(generatedConfig, /bin\/rails server -b 0\.0\.0\.0 -p 3006/);
  assert.match(generatedConfig, /healthcheck:/);
  assert.match(generatedConfig, /TCPSocket\.new\('127\.0\.0\.1', 3006\)\.close/);
  assert.match(generatedConfig, /startPeriodSeconds:\s*10/);
  assert.doesNotMatch(generatedConfig, /rails _7\.1\.5_ new rails7/);
  assert.match(generatedGemfile, /rubygems/);
  assert.match(generatedRailsBin, /env ruby/);
  assert.match(generatedEnv, /RUBY_IMAGE=docker\.io\/library\/ruby:3\.3/);
});

test("init rails7 reports when Podman is unavailable", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "rails7-app-podman");

  const result = runCli(["init", "rails7", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /Podman is required to initialize 'rails7'/i);
});

test("init rails7 adopts an existing Rails project and only adds Loom files", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "rails7-existing");
  await mkdir(join(targetDir, "bin"), { recursive: true });
  await writeFile(join(targetDir, "Gemfile"), "source \"https://rubygems.org\"\n", "utf8");
  await writeFile(join(targetDir, "bin", "rails"), "#!/usr/bin/env ruby\n", "utf8");

  const result = runCli(["init", "rails7", "--dir", targetDir], {
    env: {
      PATH: ""
    }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const existingGemfile = await readFile(join(targetDir, "Gemfile"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{RUBY_IMAGE:-docker\.io\/library\/ruby:3\.3\}/i);
  assert.match(existingGemfile, /rubygems/);
  assert.match(generatedEnv, /RUBY_IMAGE=docker\.io\/library\/ruby:3\.3/);
});
