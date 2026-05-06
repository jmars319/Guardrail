import { appMetadata } from "@guardrail/config";
import { guardrailStatement } from "@guardrail/ui";
import type { ExternalActionReviewDecision, ExternalActionReviewRequest } from "@guardrail/api-contracts";
import { useEffect, useMemo, useState } from "react";

type ReviewQueueItem = {
  request: ExternalActionReviewRequest;
  importedAt: string;
  decision?: ExternalActionReviewDecision | undefined;
  callback?: {
    endpoint?: string | undefined;
    status: "not-configured" | "sent" | "failed";
    message?: string | undefined;
    deliveredAt?: string | undefined;
  } | undefined;
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
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [callbackUrlByTrace, setCallbackUrlByTrace] = useState<Record<string, string>>({});

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSource = sourceFilter === "all" || item.request.sourceApp === sourceFilter;
      const searchable = [
        item.request.sourceApp,
        item.request.actionKind,
        item.request.targetLabel,
        item.request.summary,
        item.decision?.decision ?? "",
        item.callback?.status ?? "",
        ...item.request.evidence.map((evidence) => `${evidence.label} ${evidence.value}`)
      ]
        .join(" ")
        .toLowerCase();
      return matchesSource && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, query, sourceFilter]);
  const openItems = useMemo(() => filteredItems.filter((item) => !item.decision), [filteredItems]);
  const decidedItems = useMemo(() => filteredItems.filter((item) => item.decision), [filteredItems]);
  const sourceOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.request.sourceApp))).sort(),
    [items]
  );

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
          callbackUrl: callbackUrlByTrace[request.traceId]?.trim() || undefined,
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

  async function sendDecisionCallback(item: ReviewQueueItem) {
    setPendingTraceId(item.request.traceId);
    try {
      const response = await fetch("/api/external-review-callbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestTraceId: item.request.traceId,
          callbackUrl: callbackUrlByTrace[item.request.traceId]?.trim() || item.callback?.endpoint
        })
      });
      const body = (await response.json()) as QueueResponse;
      if (!response.ok || !body.ok) {
        throw new Error(body.errors?.join(", ") || "Decision callback failed.");
      }
      await loadQueue();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Decision callback failed.");
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
          <div className="filter-row">
            <input
              aria-label="Search review queue"
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search source, target, evidence"
              value={query}
            />
            <select
              aria-label="Filter by source app"
              onChange={(event) => setSourceFilter(event.currentTarget.value)}
              value={sourceFilter}
            >
              <option value="all">All source apps</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
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
                  <label className="callback-field">
                    <span>Decision callback endpoint</span>
                    <input
                      onChange={(event) =>
                        setCallbackUrlByTrace((current) => ({
                          ...current,
                          [item.request.traceId]: event.currentTarget.value
                        }))
                      }
                      placeholder="Optional source app decision endpoint"
                      value={callbackUrlByTrace[item.request.traceId] ?? item.callback?.endpoint ?? ""}
                    />
                  </label>
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
                  {item.callback ? (
                    <p>Callback: {item.callback.status}{item.callback.message ? ` - ${item.callback.message}` : ""}</p>
                  ) : null}
                  <label className="callback-field">
                    <span>Callback endpoint</span>
                    <input
                      onChange={(event) =>
                        setCallbackUrlByTrace((current) => ({
                          ...current,
                          [item.request.traceId]: event.currentTarget.value
                        }))
                      }
                      placeholder="Optional source app decision endpoint"
                      value={callbackUrlByTrace[item.request.traceId] ?? item.callback?.endpoint ?? ""}
                    />
                  </label>
                  <div className="button-row">
                    <button
                      disabled={pendingTraceId === item.request.traceId}
                      onClick={() => void sendDecisionCallback(item)}
                      type="button"
                    >
                      Send callback
                    </button>
                  </div>
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
