import type { GuardrailPolicy } from "@guardrail/policy";
import type { ProviderDefinition } from "@guardrail/provider-config";
import type { ExternalActionReviewRequest } from "@guardrail/api-contracts";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateProviderDefinition(
  provider: ProviderDefinition
): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(provider.label)) {
    errors.push("provider label must be a non-empty string");
  }

  if (!isNonEmptyString(provider.notes)) {
    errors.push("provider notes must be a non-empty string");
  }

  return errors;
}

export function validateGuardrailPolicy(
  policy: GuardrailPolicy
): string[] {
  const errors: string[] = [];

  if (policy.projectRoots.length === 0) {
    errors.push("policy must declare at least one project root");
  }

  if (policy.allowedReadRoots.length === 0) {
    errors.push("policy must declare at least one allowed read root");
  }

  if (policy.allowedWriteRoots.length === 0) {
    errors.push("policy must declare at least one allowed write root");
  }

  if (policy.networkEnabled) {
    errors.push("network-capable tooling must stay disabled by default");
  }

  return errors;
}

export function validateExternalActionReviewRequest(
  request: ExternalActionReviewRequest
): string[] {
  const errors: string[] = [];

  if (request.schema !== "tenra-guardrail.external-action-review.v1") {
    errors.push("external action review request must use schema tenra-guardrail.external-action-review.v1");
  }

  for (const [label, value] of [
    ["exportedAt", request.exportedAt],
    ["actorLabel", request.actorLabel],
    ["targetLabel", request.targetLabel],
    ["summary", request.summary],
    ["traceId", request.traceId]
  ] as const) {
    if (!isNonEmptyString(value)) {
      errors.push(`${label} must be a non-empty string`);
    }
  }

  if (request.evidence.length === 0) {
    errors.push("external action review request must include at least one evidence item");
  }

  for (const item of request.evidence) {
    if (!isNonEmptyString(item.label) || !isNonEmptyString(item.value)) {
      errors.push("external action review evidence items must include labels and values");
    }
  }

  return errors;
}
