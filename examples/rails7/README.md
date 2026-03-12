# Rails 7 Template

This template gives you a Rails 7 application served from local project files. The container image is plain Ruby; Rails 7 is bootstrapped into the project and then loaded from the app's Gemfile.

## Quickstart

```bash
loom init rails7 --dir my-rails7
cd my-rails7
loom start
loom status
```

`loom init rails7` bootstraps the app into an empty directory, or adopts an existing Rails project and only adds Loom files. Loom runs the generated app with a Ruby base image, not a separate Rails image.

## Services

- `app`
  - Base image: `${RUBY_IMAGE:-ruby:3.3}`
  - Port: `3006`
  - Purpose: Ruby container running the bootstrapped Rails 7 app

## Route

- App: `https://rails7.loom.local`

## Image overrides

- `RUBY_IMAGE` for the Ruby base image used to run the Rails app