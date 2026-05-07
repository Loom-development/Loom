import test from "node:test";
import assert from "node:assert/strict";
import {
  formatHttpsInfo,
  formatProxyPorts,
  formatRouteBindings,
  formatStartedService,
  formatStartHeader
} from "./startup.js";

test("formatStartHeader and formatStartedService create startup progress lines", () => {
  assert.equal(formatStartHeader("demo", 2, "demo-net"), "Starting 2 service(s) for demo on network demo-net...\n");
  assert.equal(formatStartedService("app"), "- started app\n");
});

test("formatRouteBindings renders protocol-specific route lines", () => {
  assert.deepEqual(
    formatRouteBindings([
      {
        host: "demo.test",
        service: "app",
        targetPort: 3000,
        externalPort: 8080,
        https: true
      },
      {
        host: "api.demo.test",
        service: "api",
        targetPort: 4000,
        externalPort: 8081,
        https: false
      }
    ]),
    [
      "Route bindings:\n",
      "- https://demo.test -> app:3000 (direct: http://localhost:8080/)\n",
      "- http://api.demo.test -> api:4000 (direct: http://localhost:8081/)\n"
    ]
  );
});

test("formatProxyPorts and formatHttpsInfo render summary lines", () => {
  assert.equal(
    formatProxyPorts(8080, 8443),
    "Route proxy listener ports: http://localhost:8080 https://localhost:8443 (use with configured route hostnames)\n"
  );
  assert.deepEqual(formatHttpsInfo({ certPath: "/tmp/cert.pem", keyPath: "/tmp/key.pem" }), [
    "HTTPS cert: /tmp/cert.pem\n",
    "HTTPS key: /tmp/key.pem\n"
  ]);
  assert.deepEqual(formatHttpsInfo(undefined), []);
});