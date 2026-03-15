import type { GuardrailPolicy } from "@guardrail/policy";
import type { ProviderDefinition } from "@guardrail/provider-config";

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
