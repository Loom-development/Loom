# TODO — PHP-FPM fixes, runtime shell fix & template cleanup

## HIGH PRIORITY

- [ ] Re-run PHP example integration test (`loom start --recreate`) to confirm
      "Unable to open log: Permission denied" is gone end-to-end.
- [ ] Verify PHP-FPM reaches "ready to handle connections" and the app container
      can reach it on :9000.

### Convert all remaining template `sh -lc` → `sh -c` (login-shell bug)
The runtime outer wrapper is now `sh -c`, but these templates still embed
`sh -lc` inside their command string, so the login shell (which sources
profile scripts and resets PATH/env) is still invoked. Change each to `sh -c`:

- [ ] examples/spring-react/loom.yaml:26
- [ ] examples/astro/loom.yaml:33
- [ ] examples/django-react/loom.yaml:21
- [ ] examples/django-react/loom.yaml:46
- [ ] examples/rails7/loom.yaml:34
- [ ] examples/node/t3/loom.yaml:34
- [ ] examples/node/loom.yaml:33
- [ ] examples/node/mean/loom.yaml:33
- [ ] examples/node/mean/loom.yaml:70
- [ ] examples/node/mern/loom.yaml:33
- [ ] examples/node/mern/loom.yaml:70
- [ ] examples/databases/sqlite/loom.yaml:12
- [ ] examples/databases/all/loom.yaml:101
- [ ] examples/rails7-hotwire/loom.yaml:34

(Python templates — python/django, python, python/flask, python/fastapi —
were already converted to `sh -c` in a prior session.)

## MEDIUM PRIORITY

- [ ] Run regression test on Python template to confirm `sh -c` change didn't
      break pip-installed binary execution.
- [ ] Run regression test on Node template to confirm `sh -c` change didn't
      break command execution (npm/pnpm found via correct PATH).
- [ ] Run regression test on Ruby/Rails templates after converting `sh -lc`.
- [ ] Run `pnpm typecheck` / lint across changed packages to confirm clean build.
- [ ] Verify `buildPhpBaseCommand` in apps/cli/src/index.ts uses `sh -c` (not
      `sh -lc`) for the PHP-FPM startup command.

## LOW PRIORITY

- [ ] Revisit now-redundant Python template `sh -lc` → `sh -c` edits (decide
      keep vs revert since runtime no longer adds `-l`).

## CONTEXT

- Root cause: `packages/runtime-podman/src/containers.ts:304` wrapped every
  service command with `sh -lc` (login shell). The `-l` flag sources profile
  scripts, resetting PATH/env and breaking PHP/Python/Node/Ruby containers.
  Outer wrapper fixed to `sh -c`; templates still need the same fix.
- PHP-FPM template fix: copy all `/usr/local/etc/php-fpm.d/*.conf` to
  `/tmp/pool.d/`, edit `www.conf` user/group in place, point `include` to
  `/tmp/pool.d/*.conf`, and add `error_log = /dev/stderr` to `[global]`
  (non-root via `--userns=keep-id` cannot write default log files).
- Updated files so far: `examples/php/loom.yaml`, `examples/php/drupal/loom.yaml`,
  `apps/cli/src/index.ts` (`buildPhpBaseCommand`),
  `packages/runtime-podman/src/containers.ts` (line 304).
