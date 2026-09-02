# Published Image Stack Consumption Design

Date: 2026-09-02

## Objective

Make newly generated Loom applications consume the images published by Loom's
GHCR release pipeline. Runtime and infrastructure defaults must use immutable
manifest digests from `images/digests.json` while preserving the existing
environment-variable override interface.

This change applies only when Loom generates a project. Loom does not rewrite
an existing project's `loom.yaml`, `.env`, or other configuration.

## Source of Truth

`images/digests.json` is the authoritative record of successfully published
images. Stack code must not duplicate its digest values in a second hand-edited
constant table.

A focused stack image-pin module loads the document and exposes references by
catalog name. Given `loom-node-24`, it returns a reference in this form:

```text
ghcr.io/loom-development/loom-node-24@sha256:<manifest-digest>
```

The module validates the document at load time. It rejects:

- a missing or unsupported schema version;
- a registry other than `ghcr.io/loom-development`;
- duplicate image names;
- a missing requested image;
- an image repository that does not equal `<registry>/<name>`;
- a digest that is not a lowercase 64-character SHA-256 value.

Errors identify both the invalid image name and the violated rule. Stack code
refers to images by catalog name rather than embedding registry paths.

## Stack Defaults

Every stack runtime or infrastructure service with a matching published Loom
image uses the digest-pinned GHCR reference as its generated default. This
includes the maintained runtime images for Node 22, Node 24, Bun 1, PHP,
WordPress, Java 21, Python 3.12, Ruby 3.3, .NET 8, and SQLite 3, plus the
published PostgreSQL, MySQL, MariaDB, MongoDB, Redis, Elasticsearch, and SQL
Server mirrors.

Existing override names and expansion behavior remain unchanged. For example,
a generated Node service has this shape:

```yaml
image: ${NODE_IMAGE:-ghcr.io/loom-development/loom-node-24@sha256:<digest>}
```

A developer can continue setting `NODE_IMAGE` to any compatible reference.
The same rule applies to each existing runtime and database image variable.

Generator containers use a matching Loom image when the generator's runtime
requirements match a published image. Purpose-built generator tools without a
matching Loom image remain on their existing pinned source. This work does not
add new published images merely to eliminate every external generator image.

## Generation and Committed Outputs

Stack definitions obtain runtime references from the image-pin module. The
normal stack generation path writes the resolved references into template
`loom.yaml` files and any committed migration fixtures or generated output.
Generated project files remain self-contained: starting a project does not
need to read the Loom repository's digest catalog or query a registry to choose
a version.

When an image release changes `images/digests.json`, the stack tests must expose
any generated output that still contains the previous digest. Updating stack
defaults is therefore a deterministic repository change following the digest
pull request, not a runtime lookup.

## Runtime Behavior and Failures

Podman pulls the digest-pinned GHCR image when the generated application first
needs it. An already cached matching manifest may be reused. No image is pulled
by `git pull` or during project generation unless an existing generator step
already runs a container.

The runtime keeps its existing registry and pull error classification. A GHCR
authentication or availability failure reports the affected image and registry
login guidance. The stack image-pin module handles catalog consistency errors;
the runtime handles network, authentication, platform, and pull failures.

## Compatibility and Rollout

Only newly generated projects receive the GHCR defaults. Existing projects are
not migrated automatically because their checked-in configuration belongs to
the developer. Users may adopt a new Loom image manually by replacing the
default reference or setting the existing environment override.

The generated `loom.yaml` schema and environment-variable names do not change.
No dynamic digest resolution is added to application startup. This preserves
offline use of cached images and makes the exact runtime visible in project
configuration.

## Testing

Unit tests for the image-pin module cover valid resolution, malformed digests,
wrong repositories, duplicate names, unknown names, and registry/schema
validation.

Stack definition tests verify that:

- every supported runtime and database default uses `ghcr.io/loom-development`;
- every Loom default contains an immutable manifest digest;
- every referenced catalog name exists in `images/digests.json`;
- environment-variable overrides remain present and unchanged;
- generator-only images without a matching Loom image remain explicitly
  allowed rather than being mistaken for runtime defaults.

Migration fixtures and generated-output snapshots are refreshed through the
existing stack tooling. Representative runtime, database, and combined stack
smoke tests prove that generation succeeds with the new defaults.

One opt-in end-to-end smoke test generates an application, pulls its published
GHCR image, and starts the service through Loom. The default unit and stack
test suites remain network-free.

## Documentation

User documentation explains that new projects default to immutable Loom images
published on GHCR, that the first start may pull an image, that environment
overrides remain supported, and that existing projects do not change
automatically.

Maintainer documentation records the update sequence:

1. Update and release image definitions.
2. Merge the automated `images/digests.json` pull request.
3. Regenerate stack outputs from the new digest catalog.
4. Run unit, stack, and opt-in GHCR smoke tests.
5. Commit the resulting stack and fixture changes.

## Completion Criteria

- Every eligible stack runtime and infrastructure default uses its published
  digest-pinned Loom image.
- `images/digests.json` is the only hand-maintained source of published digest
  values.
- Generated projects retain all existing image environment overrides.
- Existing projects are never rewritten automatically.
- Catalog validation and stack drift tests fail before an invalid reference can
  ship.
- Network-free repository tests and the opt-in published-image smoke test pass.
- User and maintainer documentation describe consumption and future updates.
