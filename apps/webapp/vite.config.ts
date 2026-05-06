import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  attachExternalReviewDecision,
  exportExternalReviewQueue,
  importExternalReviewPayload
} from "./src/external-review-api";

function readRequestBody(request: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "guardrail-external-review-api",
      configureServer(server) {
        server.middlewares.use("/api/external-reviews", async (request, response, next) => {
          if (request.method !== "GET" && request.method !== "POST") {
            next();
            return;
          }

          try {
            const body = request.method === "POST" ? await readRequestBody(request) : "";
            const payload = request.method === "POST" ? JSON.parse(body || "{}") : undefined;
            const result =
              request.method === "GET"
                ? exportExternalReviewQueue()
                : importExternalReviewPayload(payload);

            response.statusCode = result.ok ? 200 : 400;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify(result, null, 2));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ ok: false, errors: [error instanceof Error ? error.message : "Review API failed."] }));
          }
        });

        server.middlewares.use("/api/external-review-decisions", async (request, response, next) => {
          if (request.method !== "POST") {
            next();
            return;
          }

          try {
            const body = await readRequestBody(request);
            const payload = JSON.parse(body || "{}");
            const traceId = typeof payload.requestTraceId === "string" ? payload.requestTraceId : "";
            const result = attachExternalReviewDecision(traceId, payload);
            response.statusCode = result.ok ? 200 : 400;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify(result, null, 2));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ ok: false, errors: [error instanceof Error ? error.message : "Decision API failed."] }));
          }
        });
      }
    }
  ]
});
