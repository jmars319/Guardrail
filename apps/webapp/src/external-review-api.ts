import type {
  ExternalActionReviewDecision,
  ExternalActionReviewRequest
} from "@guardrail/api-contracts";
import {
  validateExternalActionReviewDecision,
  validateExternalActionReviewRequest
} from "@guardrail/validation";

export interface ExternalReviewQueueItem {
  request: ExternalActionReviewRequest;
  importedAt: string;
  decision?: ExternalActionReviewDecision | undefined;
}

const queue: ExternalReviewQueueItem[] = [];

function upsertRequest(request: ExternalActionReviewRequest): ExternalReviewQueueItem {
  const importedAt = new Date().toISOString();
  const existingIndex = queue.findIndex((item) => item.request.traceId === request.traceId);
  const item: ExternalReviewQueueItem = {
    request,
    importedAt,
    decision: existingIndex >= 0 ? queue[existingIndex]?.decision : undefined
  };

  if (existingIndex >= 0) {
    queue.splice(existingIndex, 1, item);
  } else {
    queue.unshift(item);
  }

  return item;
}

export function exportExternalReviewQueue() {
  return {
    ok: true,
    schema: "tenra-guardrail.external-review-queue.v1",
    exportedAt: new Date().toISOString(),
    items: queue
  };
}

export function importExternalReviewPayload(payload: unknown) {
  const candidates =
    payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown }).items)
      ? (payload as { items: Array<{ request?: unknown; decision?: unknown }> }).items.map((item) => item.request)
      : [payload];
  const imported: ExternalReviewQueueItem[] = [];
  const errors: string[] = [];

  for (const candidate of candidates) {
    const request = candidate as ExternalActionReviewRequest;
    const requestErrors = validateExternalActionReviewRequest(request);
    if (requestErrors.length) {
      errors.push(...requestErrors);
      continue;
    }
    imported.push(upsertRequest(request));
  }

  if (errors.length) {
    return { ok: false, errors, items: imported };
  }

  return { ...exportExternalReviewQueue(), importedCount: imported.length };
}

export function attachExternalReviewDecision(traceId: string, payload: unknown) {
  const decision = payload as ExternalActionReviewDecision;
  const errors = validateExternalActionReviewDecision(decision);
  if (errors.length) {
    return { ok: false, errors };
  }

  const item = queue.find((candidate) => candidate.request.traceId === traceId);
  if (!item) {
    return { ok: false, errors: [`No review request found for trace ${traceId}.`] };
  }

  item.decision = decision;
  return { ok: true, item };
}
