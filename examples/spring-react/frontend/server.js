import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const apiOrigin = process.env.API_ORIGIN ?? "http://backend:8080";

function contentType(filePath) {
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }

  if (filePath.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }

  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }

  if (filePath.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "text/html; charset=utf-8";
}

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-store"
    });
    response.end(data);
  });
}

function proxyRequest(request, response) {
  const upstream = new URL(request.url, apiOrigin);
  const proxy = http.request(
    upstream,
    {
      method: request.method,
      headers: request.headers
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    }
  );

  proxy.on("error", (error) => {
    response.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "bad_gateway", message: error.message }));
  });

  request.pipe(proxy);
}

http
  .createServer((request, response) => {
    if (request.url.startsWith("/api/")) {
      proxyRequest(request, response);
      return;
    }

    const urlPath = request.url === "/" ? "/index.html" : request.url;
    const filePath = path.join(distDir, urlPath.replace(/^\//, ""));
    sendFile(response, filePath);
  })
  .listen(5175, "0.0.0.0", () => {
    process.stdout.write("Spring React frontend listening on 5175\n");
  });