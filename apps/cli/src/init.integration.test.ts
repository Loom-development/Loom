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
  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-dunglas\/frankenphp:1-php8\.3\}/);
  assert.match(generatedEnv, /PHP_IMAGE=dunglas\/frankenphp:1-php8\.3/);
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

  const result = runCli(["init", "node", "--dir", targetDir, "--image", "NODE_IMAGE=node:22-alpine"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedConfig, /image:\s*\$\{NODE_IMAGE:-node:24-alpine\}/);
  assert.match(generatedEnv, /NODE_IMAGE=node:22-alpine/);
  assert.match(result.stdout, /Configured runtime image selections/);
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
  assert.match(generatedConfig, /image:\s*\$\{PYTHON_IMAGE:-python:3\.12-slim\}/);
  assert.match(generatedConfig, /image:\s*\$\{NODE_IMAGE:-node:24-alpine\}/);
  assert.match(generatedEnv, /PYTHON_IMAGE=python:3\.12-slim/);
  assert.match(generatedEnv, /NODE_IMAGE=node:24-alpine/);
  assert.match(backendRequirements, /Django~=5\.2\.0/);
  assert.match(frontendPackage, /loom-django-react-frontend/);
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
  assert.match(generatedEnv, /NODE_IMAGE=node:24-alpine/);
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
  assert.match(generatedEnv, /RUBY_IMAGE=ruby:3\.3/);
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

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(generatedConfig, /workdir:\s*\/app/);
  assert.match(generatedConfig, /--root public/);
  assert.match(generatedIndex, /Symfony stub/);
  assert.match(generatedEnv, /PHP_IMAGE=dunglas\/frankenphp:1-php8\.3/);
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
  assert.match(generatedEnv, /PHP_IMAGE=dunglas\/frankenphp:1-php8\.3/);
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

test("init rejects non-empty target directory without --force", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "non-empty");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "keep.txt"), "existing", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr || result.stdout, /not empty/i);
});

test("init allows non-empty target directory with --force", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "loom-cli-init-"));
  const targetDir = join(tempRoot, "forced");
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, "keep.txt"), "existing", "utf8");

  const result = runCli(["init", "php", "--dir", targetDir, "--force"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const generatedConfig = await readFile(join(targetDir, "loom.yaml"), "utf8");
  assert.match(generatedConfig, /name:\s*loom-forced/i);
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

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(generatedConfig, /\.\/:\/app/);
  assert.match(generatedConfig, /\.\/data\/files:\/app\/web\/sites\/default\/files/);
  assert.match(generatedComposer, /drupal\/recommended-project/);
  assert.match(generatedIndex, /Drupal stub/);
  assert.match(generatedEnv, /PHP_IMAGE=dunglas\/frankenphp:1-php8\.3/);
  assert.match(generatedEnv, /MYSQL_IMAGE=mysql:8\.4/);
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

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-dunglas\/frankenphp:1-php8\.3\}/i);
  assert.match(existingIndex, /existing drupal/);
  assert.match(generatedEnv, /PHP_IMAGE=dunglas\/frankenphp:1-php8\.3/);
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

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-php:8\.3-apache\}/i);
  assert.match(generatedConfig, /\.\/:\/var\/www\/html/);
  assert.match(generatedConfig, /a2enmod rewrite/);
  assert.match(generatedConfig, /WORDPRESS_DB_HOST:\s*db:3306/);
  assert.match(generatedIndex, /WordPress stub/);
  assert.match(generatedWpConfig, /DB_NAME/);
  assert.match(generatedEnv, /PHP_IMAGE=php:8\.3-apache/);
  assert.match(generatedEnv, /MYSQL_IMAGE=mysql:8\.4/);
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

  assert.match(generatedConfig, /image:\s*\$\{PHP_IMAGE:-php:8\.3-apache\}/i);
  assert.match(existingWpConfig, /existing/);
  assert.doesNotMatch(existingWpConfig, /loom-auth-key/);
  assert.match(generatedEnv, /PHP_IMAGE=php:8\.3-apache/);
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
  const generatedEnv = await readFile(join(targetDir, ".env"), "utf8");

  assert.match(generatedWpConfig, /DB_NAME/);
  assert.match(generatedEnv, /PHP_IMAGE=php:8\.3-apache/);
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

  assert.match(generatedConfig, /image:\s*\$\{RUBY_IMAGE:-ruby:3\.3\}/i);
  assert.match(generatedConfig, /bundle install && bin\/rails server -b 0\.0\.0\.0 -p 3006/);
  assert.doesNotMatch(generatedConfig, /rails _7\.1\.5_ new rails7/);
  assert.match(generatedGemfile, /rubygems/);
  assert.match(generatedRailsBin, /env ruby/);
  assert.match(generatedEnv, /RUBY_IMAGE=ruby:3\.3/);
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

  assert.match(generatedConfig, /image:\s*\$\{RUBY_IMAGE:-ruby:3\.3\}/i);
  assert.match(existingGemfile, /rubygems/);
  assert.match(generatedEnv, /RUBY_IMAGE=ruby:3\.3/);
});
