# TODO — runtime shell and PHP verification

## Remaining integration checks

- [x] Run the PHP example with `loom start --recreate` and confirm there are no
      log permission errors.
- [x] Confirm the PHP service reaches its ready state and is reachable through
      its configured route.
- [x] Run container-backed smoke tests for the Python, Node, and Rails examples.

These checks require a working Podman runtime and cannot be replaced by the
unit and CLI integration suites.

## Completed

- [x] Use non-login `sh -c` execution for service, task, backup, restore,
      Composer setup, and container-backed project bootstrap commands.
- [x] Convert embedded example-template commands from `sh -lc` to `sh -c`.
- [x] Make the startup notice accurate for both cold and cached starts.
- [x] Add or update focused regression expectations for the shell behavior.
- [x] Make proxy cleanup tolerate startup failures that occur before proxy
      configuration is created.
- [x] Run lint, typechecking, and the automated test suite.
