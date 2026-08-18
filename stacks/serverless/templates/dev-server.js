const crypto = require("node:crypto");
const http = require("node:http");

const handlers = require("./handler");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function mapRequestToEvent(request, bodyText) {
  return {
    version: "2.0",
    routeKey: `${request.method} ${request.url}`,
    rawPath: request.url,
    headers: request.headers,
    requestContext: {
      http: {
        method: request.method,
        path: request.url,
        sourceIp: request.socket.remoteAddress
      },
      requestId: crypto.randomUUID()
    },
    body: bodyText || undefined
  };
}

async function execute(handler, request, response, bodyText = "") {
  try {
    const result = await handler(mapRequestToEvent(request, bodyText));
    response.writeHead(result.statusCode ?? 200, result.headers ?? { "content-type": "application/json; charset=utf-8" });
    response.end(result.body ?? "");
  } catch (error) {
    sendJson(response, 500, {
      status: "error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    void execute(handlers.health, request, response);
    return;
  }

  if (request.method === "GET" && request.url === "/feed") {
    void execute(handlers.feed, request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/webhooks/content") {
    const chunks = [];
    request.on("data", (chunk) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      void execute(handlers.ingest, request, response, Buffer.concat(chunks).toString("utf8"));
    });
    return;
  }

  sendJson(response, 404, {
    status: "not_found",
    endpoints: ["GET /health", "GET /feed", "POST /webhooks/content"]
  });
});

server.listen(3007, "0.0.0.0", () => {
  process.stdout.write("Local serverless function router listening on 3007\n");
});