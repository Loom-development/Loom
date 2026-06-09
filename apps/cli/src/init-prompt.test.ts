import test from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { chooseInitImageOverrides, chooseInitTemplate } from "./init-prompt.js";

test("chooseInitTemplate accepts numeric selection", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  let captured = "";
  output.on("data", (chunk) => {
    captured += chunk.toString();
  });

  input.end("12\n");

  const template = await chooseInitTemplate(undefined, input, output);

  assert.equal(template, "php-drupal");
  assert.match(captured, /Choose a template to initialize:/);
  assert.match(captured, /12\. php-drupal - Drupal with PHP and MySQL\./);
  assert.match(captured, /3\. node-mern - MongoDB, Express\.js API, React frontend, and Node\.js runtime\./);
  assert.match(captured, /\d+\. jamstack - JavaScript, APIs, Markup with a static-first frontend and Node\.js API\./);
});

test("chooseInitTemplate accepts template name selection", async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  input.end("rails7\n");

  const template = await chooseInitTemplate(undefined, input, output);

  assert.equal(template, "rails7");
});

test("chooseInitTemplate accepts enter for suggested template", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  let captured = "";
  output.on("data", (chunk) => {
    captured += chunk.toString();
  });

  input.end("\n");

  const template = await chooseInitTemplate("php-drupal", input, output);

  assert.equal(template, "php-drupal");
  assert.match(captured, /Suggested template: php-drupal/);
  assert.match(captured, /default: php-drupal/);
});

test("chooseInitTemplate rejects invalid selections", async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  input.end("unknown\n");

  await assert.rejects(() => chooseInitTemplate(undefined, input, output), /Unknown template selection/);
});

test("chooseInitImageOverrides accepts numeric runtime selections", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  let captured = "";
  output.on("data", (chunk) => {
    captured += chunk.toString();
  });

  input.end("1\n");

  const selected = await chooseInitImageOverrides("node", { NODE_IMAGE: "docker.io/library/node:24-alpine" }, [], input, output);

  assert.deepEqual(selected, { NODE_IMAGE: "docker.io/library/node:22-alpine" });
  assert.match(captured, /Choose Node runtime for 'node'/);
});

test("chooseInitImageOverrides accepts enter for current default", async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  input.end("\n");

  const selected = await chooseInitImageOverrides("php-wordpress", { WORDPRESS_IMAGE: "docker.io/library/wordpress:6-php8.3-apache" }, [], input, output);

  assert.deepEqual(selected, { WORDPRESS_IMAGE: "docker.io/library/wordpress:6-php8.3-apache" });
});

test("chooseInitImageOverrides skips locked env keys", async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  input.end("this should not be read\n");

  const selected = await chooseInitImageOverrides(
    "php",
    { PHP_IMAGE: "docker.io/dunglas/frankenphp:1-php8.3" },
    ["PHP_IMAGE"],
    input,
    output
  );

  assert.deepEqual(selected, {});
});

test("chooseInitImageOverrides rejects invalid runtime selections", async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  input.end("unknown\n");

  await assert.rejects(
    () => chooseInitImageOverrides("node", { NODE_IMAGE: "docker.io/library/node:24-alpine" }, [], input, output),
    /Unknown Node runtime selection/
  );
});