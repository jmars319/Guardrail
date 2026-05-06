import { appMetadata } from "@guardrail/config";
import { guardrailStatement } from "@guardrail/ui";
import type { ExternalActionReviewDecision, ExternalActionReviewRequest } from "@guardrail/api-contracts";
import { useEffect, useMemo, useState } from "react";

type ReviewQueueItem = {
  request: ExternalActionReviewRequest;
  importedAt: string;
  decision?: ExternalActionReviewDecision | undefined;
};

type QueueResponse = {
  ok?: boolean;
  items?: ReviewQueueItem[];
  errors?: string[];
};

export default function App() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [notice, setNotice] = useState("Loading external review queue.");
  const [pendingTraceId, setPendingTraceId] = useState("");

  const openItems = useMemo(() => items.filter((item) => !item.decision), [items]);
  const decidedItems = useMemo(() => items.filter((item) => item.decision), [items]);

  async function loadQueue() {
    try {
      const response = await fetch("/api/external-reviews");
      const body = (await response.json()) as QueueResponse;
      if (!response.ok || !body.ok) {
        throw new Error(body.errors?.join(", ") || "External review queue failed.");
      }
      setItems(body.items ?? []);
      setNotice(`${body.items?.length ?? 0} external review request(s) loaded.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "External review queue unavailable.");
    }
  }

  async function createDecision(request: ExternalActionReviewRequest, decision: ExternalActionReviewDecision["decision"]) {
    setPendingTraceId(request.traceId);
    try {
      const response = await fetch("/api/external-review-decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestTraceId: request.traceId,
          decision,
          reason:
            decision === "allow"
              ? "Reviewed evidence and approved the requested action."
              : decision === "deny"
                ? "Reviewed evidence and denied the requested action."
                : "More human review is required before this action can proceed."
        })
      });
      const body = (await response.json()) as QueueResponse;
      if (!response.ok || !body.ok) {
        throw new Error(body.errors?.join(", ") || "Decision creation failed.");
      }
      await loadQueue();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Decision creation failed.");
    } finally {
      setPendingTraceId("");
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  return (
    <main className="web-shell">
      <section className="web-card">
        <p className="eyebrow">Web channel</p>
        <h1>{appMetadata.name}</h1>
        <p className="lead">
          tenra Guardrail is desktop-first. The web channel is reserved for remote visibility and secondary review flows.
        </p>
        <p>{guardrailStatement}</p>
      </section>

      <section className="web-grid">
        <article className="web-panel">
          <h2>External Review Queue</h2>
          <p>{notice}</p>
          <div className="queue-stack">
            {openItems.length ? (
              openItems.map((item) => (
                <div className="queue-item" key={item.request.traceId}>
                  <div>
                    <strong>{item.request.targetLabel}</strong>
                    <span>{item.request.sourceApp} / {item.request.actionKind}</span>
                  </div>
                  <p>{item.request.summary}</p>
                  <ul>
                    {item.request.evidence.slice(0, 4).map((evidence) => (
                      <li key={`${item.request.traceId}-${evidence.label}`}>
                        {evidence.label}: {evidence.value}
                      </li>
                    ))}
                  </ul>
                  <div className="button-row">
                    {(["allow", "review", "deny"] as const).map((decision) => (
                      <button
                        disabled={pendingTraceId === item.request.traceId}
                        key={decision}
                        onClick={() => void createDecision(item.request, decision)}
                        type="button"
                      >
                        {decision}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No pending external action requests.</p>
            )}
          </div>
        </article>

        <article className="web-panel">
          <h2>Decisions</h2>
          <div className="queue-stack">
            {decidedItems.length ? (
              decidedItems.slice(0, 8).map((item) => (
                <div className="queue-item" key={`${item.request.traceId}-decision`}>
                  <div>
                    <strong>{item.decision?.decision}</strong>
                    <span>{item.decision?.sourceReturn.expectedSchema}</span>
                  </div>
                  <p>{item.decision?.reason}</p>
                </div>
              ))
            ) : (
              <p>No decisions have been created yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
