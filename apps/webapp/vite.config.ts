import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  attachExternalReviewDecision,
  createExternalReviewDecision,
  exportExternalReviewDecisions,
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
          if (request.method !== "GET" && request.method !== "POST") {
            next();
            return;
          }

          try {
            if (request.method === "GET") {
              const result = exportExternalReviewDecisions();
              response.statusCode = 200;
              response.setHeader("Content-Type", "application/json; charset=utf-8");
              response.end(JSON.stringify(result, null, 2));
              return;
            }

            const body = await readRequestBody(request);
            const payload = JSON.parse(body || "{}");
            const traceId = typeof payload.requestTraceId === "string" ? payload.requestTraceId : "";
            const result =
              payload.schema === "tenra-guardrail.external-action-decision.v1"
                ? attachExternalReviewDecision(traceId, payload)
                : createExternalReviewDecision({
                    traceId,
                    decision: payload.decision,
                    reason: typeof payload.reason === "string" ? payload.reason : undefined,
                    reviewerLabel: typeof payload.reviewerLabel === "string" ? payload.reviewerLabel : undefined
                  });
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
