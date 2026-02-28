const port = Number(process.env.PORT ?? 3004);

Bun.serve({
  port,
  fetch() {
    return new Response("Hello from Loom Bun template\n", {
      headers: { "content-type": "text/plain" }
    });
  }
});

console.log(`Bun app listening on http://0.0.0.0:${port}`);
