import test from "node:test";
import assert from "node:assert/strict";
import {
  prepareInitTarget,
  runDrupalCreateProjectWithDependencies,
  runRailsCreateProjectWithDependencies,
  runRailsHotwireCreateProjectWithDependencies,
  runSymfonyCreateProjectWithDependencies,
  runWordPressCreateProjectWithDependencies
} from "./init-template.js";

test("prepareInitTarget returns config-only result for non-empty generic targets without --blank-template", async () => {
  assert.deepEqual(
    await prepareInitTarget("php", "/workspace/app", false, {
      directoryHasFiles: async () => true
    }),
    {
      overwriteTemplateFiles: false,
      templateEntriesToUpdate: ["loom.yaml"],
      templateEntriesToCreateIfMissing: [".env.example"]
    }
  );
});

test("prepareInitTarget clears directory and returns full template result with --blank-template", async () => {
  const cleared: string[] = [];
  const result = await prepareInitTarget("php", "/workspace/app", true, {
    directoryHasFiles: async () => true,
    clearDirectory: async (path) => { cleared.push(path); }
  });
  assert.deepEqual(cleared, ["/workspace/app"]);
  assert.deepEqual(result, { overwriteTemplateFiles: false });
});

test("prepareInitTarget bootstraps Drupal projects in empty targets", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-drupal", "/workspace/drupal", false, {
    directoryHasFiles: async () => false,
    runDrupalCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), { overwriteTemplateFiles: false });

  assert.deepEqual(events, ["/workspace/drupal"]);
});

test("prepareInitTarget adopts existing Drupal projects and skips bootstrap", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-drupal", "/workspace/drupal", false, {
    directoryHasFiles: async () => true,
    fileExists: async (path) => path.endsWith("/web/index.php"),
    runDrupalCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: true,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example"]
  });

  assert.deepEqual(events, []);
});

test("prepareInitTarget rejects non-empty Drupal targets even when forced", async () => {
  await assert.rejects(
    () =>
      prepareInitTarget("php-drupal", "/workspace/drupal", true, {
        directoryHasFiles: async () => true
      }),
    /must be empty to initialize 'php-drupal'/i
  );
});

test("prepareInitTarget bootstraps WordPress projects in empty targets", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-wordpress", "/workspace/wordpress", false, {
    directoryHasFiles: async () => false,
    runWordPressCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), { overwriteTemplateFiles: false });

  assert.deepEqual(events, ["/workspace/wordpress"]);
});

test("prepareInitTarget rejects non-empty WordPress targets even when forced", async () => {
  await assert.rejects(
    () =>
      prepareInitTarget("php-wordpress", "/workspace/wordpress", true, {
        directoryHasFiles: async () => true
      }),
    /must be empty to initialize 'php-wordpress'/i
  );
});

test("prepareInitTarget adopts existing WordPress projects and skips bootstrap", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-wordpress", "/workspace/wordpress", false, {
    directoryHasFiles: async () => true,
    fileExists: async (path) => path.endsWith("/index.php") || path.endsWith("/wp-config.php"),
    runWordPressCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: true,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example", "wp-config.php"]
  });

  assert.deepEqual(events, []);
});

test("prepareInitTarget bootstraps Rails 7 projects in empty targets", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("rails7", "/workspace/rails7", false, {
    directoryHasFiles: async () => false,
    runRailsCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), { overwriteTemplateFiles: false });

  assert.deepEqual(events, ["/workspace/rails7"]);
});

test("prepareInitTarget adopts existing Rails 7 projects and skips bootstrap", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("rails7", "/workspace/rails7", false, {
    directoryHasFiles: async () => true,
    fileExists: async (path) => path.endsWith("/Gemfile") || path.endsWith("/bin/rails"),
    runRailsCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: true,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example"]
  });

  assert.deepEqual(events, []);
});

test("prepareInitTarget rejects non-empty Rails 7 targets even when forced", async () => {
  await assert.rejects(
    () =>
      prepareInitTarget("rails7", "/workspace/rails7", true, {
        directoryHasFiles: async () => true
      }),
    /must be empty to initialize 'rails7'/i
  );
});

test("prepareInitTarget bootstraps Rails 7 + Hotwire projects in empty targets", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("rails7-hotwire", "/workspace/rails-hotwire", false, {
    directoryHasFiles: async () => false,
    runRailsHotwireCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), { overwriteTemplateFiles: false });

  assert.deepEqual(events, ["/workspace/rails-hotwire"]);
});

test("prepareInitTarget adopts existing Rails 7 + Hotwire projects and skips bootstrap", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("rails7-hotwire", "/workspace/rails-hotwire", false, {
    directoryHasFiles: async () => true,
    fileExists: async (path) => path.endsWith("/Gemfile") || path.endsWith("/bin/rails"),
    runRailsHotwireCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: true,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example"]
  });

  assert.deepEqual(events, []);
});

test("prepareInitTarget rejects non-empty Rails 7 + Hotwire targets even when forced", async () => {
  await assert.rejects(
    () =>
      prepareInitTarget("rails7-hotwire", "/workspace/rails-hotwire", true, {
        directoryHasFiles: async () => true
      }),
    /must be empty to initialize 'rails7-hotwire'/i
  );
});

test("prepareInitTarget bootstraps Symfony projects in empty targets", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-symfony", "/workspace/symfony", false, {
    directoryHasFiles: async () => false,
    runSymfonyCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: false,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example"]
  });

  assert.deepEqual(events, ["/workspace/symfony"]);
});

test("prepareInitTarget adopts existing Symfony projects and skips bootstrap", async () => {
  const events: string[] = [];

  assert.deepEqual(await prepareInitTarget("php-symfony", "/workspace/symfony", false, {
    directoryHasFiles: async () => true,
    fileExists: async (path) => path.endsWith("/bin/console"),
    runSymfonyCreateProject: async (targetDir) => {
      events.push(targetDir);
    }
  }), {
    overwriteTemplateFiles: true,
    templateEntriesToUpdate: ["loom.yaml"],
    templateEntriesToCreateIfMissing: [".env.example"]
  });

  assert.deepEqual(events, []);
});

test("prepareInitTarget rejects non-empty Symfony targets even when forced", async () => {
  await assert.rejects(
    () =>
      prepareInitTarget("php-symfony", "/workspace/symfony", true, {
        directoryHasFiles: async () => true
      }),
    /must be empty to initialize 'php-symfony'/i
  );
});

test("runDrupalCreateProjectWithDependencies uses Podman Composer", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await runDrupalCreateProjectWithDependencies("/workspace/drupal", {
    runCommand: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
    }
  });

  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
    "run",
    "--rm",
    ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
    "-e",
    "HOME=/tmp",
    "-v",
    "/workspace/drupal:/app",
    "-w",
    "/app",
    "docker.io/library/composer:2",
    "create-project",
    "drupal/recommended-project",
    "."
      ],
      cwd: "/workspace/drupal"
    }
  ]);
});

test("runDrupalCreateProjectWithDependencies reports when Podman is unavailable", async () => {
  await assert.rejects(
    () =>
      runDrupalCreateProjectWithDependencies("/workspace/drupal", {
        runCommand: async () => {
          const error = new Error("podman missing") as Error & { code?: string };
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Install Podman/i
  );
});

test("runDrupalCreateProjectWithDependencies reports unavailable images clearly", async () => {
  await assert.rejects(
    () =>
      runDrupalCreateProjectWithDependencies("/workspace/drupal", {
        runCommand: async () => {
          throw new Error("manifest unknown: manifest unknown");
        }
      }),
    /image 'docker\.io\/library\/composer:2' is not available or could not be pulled/i
  );
});

test("runWordPressCreateProjectWithDependencies uses Podman to copy WordPress into the target", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await runWordPressCreateProjectWithDependencies("/workspace/wordpress", {
    runCommand: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
    }
  });

  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "run",
        "--rm",
        ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
        "-v",
        "/workspace/wordpress:/app",
        "docker.io/library/wordpress:6-php8.3-apache",
        "sh",
        "-lc",
        "cp -a /usr/src/wordpress/. /app/"
      ],
      cwd: "/workspace/wordpress"
    }
  ]);
});

test("runWordPressCreateProjectWithDependencies reports when Podman is unavailable", async () => {
  await assert.rejects(
    () =>
      runWordPressCreateProjectWithDependencies("/workspace/wordpress", {
        runCommand: async () => {
          const error = new Error("podman missing") as Error & { code?: string };
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Install Podman/i
  );
});

test("runWordPressCreateProjectWithDependencies reports unavailable images clearly", async () => {
  await assert.rejects(
    () =>
      runWordPressCreateProjectWithDependencies("/workspace/wordpress", {
        runCommand: async () => {
          throw new Error("pull access denied");
        }
      }),
    /image 'docker\.io\/library\/wordpress:6-php8\.3-apache' requires registry access or authentication:[\s\S]*podman login docker\.io/i
  );
});

test("runRailsCreateProjectWithDependencies uses Podman to generate Rails in the target", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await runRailsCreateProjectWithDependencies("/workspace/rails7", {
    runCommand: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
    }
  });

  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "run",
        "--rm",
        ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
        "-v",
        "/workspace/rails7:/workspace",
        "-w",
        "/workspace",
        "docker.io/library/ruby:3.3",
        "sh",
        "-lc",
        "gem install bundler --no-document && gem install rails -v 7.1.5 --no-document && /usr/local/bundle/bin/rails _7.1.5_ new . --skip-javascript --skip-test --skip-system-test"
      ],
      cwd: "/workspace/rails7"
    }
  ]);
});

test("runRailsCreateProjectWithDependencies reports when Podman is unavailable", async () => {
  await assert.rejects(
    () =>
      runRailsCreateProjectWithDependencies("/workspace/rails7", {
        runCommand: async () => {
          const error = new Error("podman missing") as Error & { code?: string };
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Install Podman/i
  );
});

test("runRailsCreateProjectWithDependencies reports unavailable images clearly", async () => {
  await assert.rejects(
    () =>
      runRailsCreateProjectWithDependencies("/workspace/rails7", {
        runCommand: async () => {
          throw new Error("image not known");
        }
      }),
    /image 'docker\.io\/library\/ruby:3\.3' is not available or could not be pulled/i
  );
});

test("runRailsHotwireCreateProjectWithDependencies uses Podman to generate Rails with Hotwire in the target", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await runRailsHotwireCreateProjectWithDependencies("/workspace/rails-hotwire", {
    runCommand: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
    }
  });

  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "run",
        "--rm",
        ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
        "-v",
        "/workspace/rails-hotwire:/workspace",
        "-w",
        "/workspace",
        "docker.io/library/ruby:3.3",
        "sh",
        "-lc",
        "gem install bundler --no-document && gem install rails -v 7.1.5 --no-document && /usr/local/bundle/bin/rails _7.1.5_ new . --skip-test --skip-system-test"
      ],
      cwd: "/workspace/rails-hotwire"
    }
  ]);
});

test("runRailsHotwireCreateProjectWithDependencies reports when Podman is unavailable", async () => {
  await assert.rejects(
    () =>
      runRailsHotwireCreateProjectWithDependencies("/workspace/rails-hotwire", {
        runCommand: async () => {
          const error = new Error("podman missing") as Error & { code?: string };
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Install Podman/i
  );
});

test("runRailsCreateProjectWithDependencies reports registry auth failures clearly", async () => {
  await assert.rejects(
    () =>
      runRailsCreateProjectWithDependencies("/workspace/rails7", {
        runCommand: async () => {
          throw new Error("authentication required");
        }
      }),
    /image 'docker\.io\/library\/ruby:3\.3' requires registry access or authentication:[\s\S]*podman login docker\.io/i
  );
});

test("runSymfonyCreateProjectWithDependencies uses Podman Composer", async () => {
  const calls: Array<{ command: string; args: string[]; cwd: string }> = [];

  await runSymfonyCreateProjectWithDependencies("/workspace/symfony", {
    runCommand: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
    }
  });

  assert.deepEqual(calls, [
    {
      command: "podman",
      args: [
        "run",
        "--rm",
        ...(process.platform === "linux" ? ["--userns=keep-id"] : []),
        "-e",
        "HOME=/tmp",
        "-v",
        "/workspace/symfony:/app",
        "-w",
        "/app",
        "docker.io/library/composer:2",
        "sh",
        "-lc",
        "composer create-project symfony/skeleton . && composer require symfony/webapp-pack"
      ],
      cwd: "/workspace/symfony"
    }
  ]);
});

test("runSymfonyCreateProjectWithDependencies reports when Podman is unavailable", async () => {
  await assert.rejects(
    () =>
      runSymfonyCreateProjectWithDependencies("/workspace/symfony", {
        runCommand: async () => {
          const error = new Error("podman missing") as Error & { code?: string };
          error.code = "ENOENT";
          throw error;
        }
      }),
    /Install Podman/i
  );
});

test("runSymfonyCreateProjectWithDependencies reports unavailable images clearly", async () => {
  await assert.rejects(
    () =>
      runSymfonyCreateProjectWithDependencies("/workspace/symfony", {
        runCommand: async () => {
          throw new Error("manifest unknown: manifest unknown");
        }
      }),
    /image 'docker\.io\/library\/composer:2' is not available or could not be pulled/i
  );
});