import type { ProviderDefinition } from "@guardrail/provider-config";
import type { ToolHostPolicySnapshot } from "@guardrail/runtime-contracts";

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

export function validatePolicySnapshot(
  policy: ToolHostPolicySnapshot
): string[] {
  const errors: string[] = [];

  if (policy.mode !== "deny-by-default") {
    errors.push("policy mode must remain deny-by-default");
  }

  if (!policy.directExecutionForbidden) {
    errors.push("direct tool execution must remain forbidden");
  }

  if (policy.networkToolsEnabled) {
    errors.push("network-capable tooling must stay disabled by default");
  }

  return errors;
}
