# Stack Template Simplification Design

Date: 2026-09-01

## Objective

Simplify Loom's 30 non-WordPress stack templates without removing behavior required to generate, start, and use their applications. The change should make startup predictable, eliminate avoidable network and privilege failures, and keep each template understandable from its `loom.yaml`.

The WordPress template is the reference outcome: no optional cache service, no OS package installation at startup, only application-relevant environment variables, a short readiness allowance, and permission handling limited to writable bind mounts.

## Scope

The work covers every template except `php-wordpress`, grouped as follows:

- JavaScript: Node, Astro, Bun, JAMstack, Serverless, MEAN, MERN, and T3.
- Python: Python, Django, Flask, FastAPI, and Django with React.
- PHP: base PHP, Drupal, and Symfony.
- Ruby: Rails 7 and Rails 7 with Hotwire.
- JVM and compiled runtimes: Spring Boot, Spring with React, .NET.
- Databases: MySQL, MariaDB, PostgreSQL, MongoDB, Redis, Elasticsearch, SQLite, SQL Server, and the combined database template.

The work includes each affected stack definition, template `loom.yaml`, `.env.example`, README, migration fixture, and public generation tests. It does not introduce or publish custom runtime images, change framework versions, redesign Loom's configuration schema, or alter user projects already generated from older templates.

## Simplification Contract

Each template will be evaluated independently against these rules:

1. Service startup must not run an OS package manager or compile runtime extensions. Commands such as `apt-get`, `apk add`, PECL, and `docker-php-ext-install` are removed from application startup.
2. A service remains only when the generated application consumes it or when the user explicitly requests it through Loom's database composition flow. Optional caches are not started merely to silence framework recommendations.
3. Language-level dependency restoration remains when the generated source cannot start without it. This includes `npm install`, `pnpm install`, `pip install`, `bundle install`, and `composer install`. These commands may be simplified but are not removed without an equivalent existing mechanism.
4. UID/GID or privilege adjustment remains only where a service writes to bind-mounted host paths. Read-only or container-owned workloads use the image's native user behavior when safe.
5. Image defaults, application start commands, routes, exposed ports, and health checks remain explicit when they are part of Loom's generated-project contract.
6. Health-check start periods reflect expected local application boot time. Multi-minute allowances used for runtime compilation are reduced after that compilation is removed.
7. Environment variables remain only when consumed by the service command, the application, or Loom's image override and database composition paths.
8. `execUser`, `workdir`, tasks, and command wrappers are removed only when their removal preserves generated-project behavior.
9. Templates already satisfying these rules are left unchanged. Uniformity alone is not a reason to rewrite a working template.

## Family-Specific Decisions

### PHP

Remove Memcached and all startup-time OS and extension compilation from base PHP, Drupal, and Symfony. Preserve Composer restoration and Apache/application startup. If a generated application requires a PHP extension absent from its selected runtime image, that requirement must be satisfied by selecting an appropriate existing image; custom Loom images are outside this change.

### JavaScript

Remove startup-time native build-tool installation. Preserve the package-manager command required by each project and the existing development server command. Retain writable dependency directories and host-aligned permissions where package managers write into bind mounts. Multi-service frontend/backend dependencies remain intact.

### Python

Remove startup-time system development packages. Preserve Python dependency installation, migrations, and server startup. Keep the user-local package location and writable cache/home handling only where required by rootless Podman and bind mounts.

### Rails

Remove startup-time system package installation. Preserve Bundler restoration and Rails startup. Keep writable bundle and application paths needed by rootless execution.

### Compiled Runtimes

Keep framework build or run commands required by source-based development. Remove redundant wrappers and optional fields only when the runtime image already provides the same behavior.

### Databases

Preserve database initialization, persistent data mounts, credentials, and health checks. Database templates are expected to need few changes. SQLite package installation at service startup must be replaced by an image that already contains the SQLite CLI or by a verification approach using tools already present in the chosen image.

## Generated-Project Behavior

`loom init <stack>` remains the public interface under test. Generated projects must contain the expected services, image overrides, bind mounts, dependency restoration, startup command, ports, routes, and readiness checks. Removed behavior must be asserted absent where regression risk is high, especially OS package installation and unconsumed cache services.

Database selection remains opt-in through Loom's existing `--db` composition behavior. Template simplification must not hard-code a database service into application templates that currently receive one through initialization.

## Failure Handling

A template must fail promptly when its application cannot start. Health checks may allow normal dependency restoration but must not conceal a permanently failed startup for several minutes. Startup commands continue to use fail-fast shell behavior where multiple required steps are composed.

If removing system packages exposes a genuine framework dependency that no existing runtime image supplies, implementation stops for that template and records the incompatibility rather than silently weakening its generated project. The resolution can be an existing compatible image or a separately designed custom-image effort.

## Testing Strategy

Testing uses public seams and proceeds family by family:

- Stack-definition tests verify exact runtime images, install/start metadata, readiness budgets, and writable-path metadata.
- CLI integration tests verify generated `loom.yaml`, `.env`, and preserved/adopted project behavior.
- Negative assertions prevent reintroduction of runtime OS package installation and unused cache services.
- Migration fixtures are updated whenever approved template bytes change.
- Repository verification runs lint, TypeScript type checking, and all workspace tests.
- Generated-stack smoke tests run for templates whose dependencies are already locally available and do not require unrestricted external downloads. Network-dependent smoke tests are reported separately rather than treated as proof of configuration correctness.

Each family must return to green before the next family is changed. This limits failures to a small set of templates and keeps fixture updates attributable.

## Completion Criteria

The work is complete when:

- All 30 non-WordPress templates have been audited against the simplification contract.
- Every justified simplification is reflected consistently in template assets, stack metadata, documentation, and tests.
- No affected application service installs OS packages or compiles extensions during startup.
- Required application dependency restoration and writable bind-mount behavior remain functional.
- `pnpm verify` passes.
- Applicable generated-stack smoke tests pass, with any environment-blocked tests explicitly identified.

