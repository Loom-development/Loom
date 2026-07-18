# Rails 7 + Hotwire Template

This template gives you a Rails 7 application with the default Hotwire setup intact, served from local project files. The container image is plain Ruby; Rails 7 and Hotwire are bootstrapped into the project and then loaded from the app's Gemfile.

## Quickstart

```bash
loom init rails7-hotwire --dir my-rails-hotwire
cd my-rails-hotwire
loom start
loom status
```

`loom init rails7-hotwire` bootstraps the app into an empty directory, or adopts an existing Rails project and only adds Loom files. Loom runs the generated app with a Ruby base image, not a separate Rails image.

The first `loom start` can take a while because the container installs native build dependencies and runs `bundle install` before Rails starts serving requests. Linux with rootless Podman gives Loom the most reliable host-aligned file ownership when templates use `userns: keep-id`. On macOS and Windows, Loom still works through Podman machine and `loom exec` still uses the configured `execUser`, but bind-mounted filesystem ownership behavior and install speed can differ from native Linux.

## Services

- `app`
  - Base image: `${RUBY_IMAGE:-docker.io/library/ruby:3.3}`
  - Port: `3008`
  - Purpose: Ruby container running the bootstrapped Rails 7 app with Hotwire defaults

## Route

- App: `https://rails7-hotwire.loom.local`

## Image overrides

- `RUBY_IMAGE` for the Ruby base image used to run the Rails app