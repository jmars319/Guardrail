import type {
  ToolCallEnvelope,
  ToolCapability,
  ToolHostDecisionResult,
  ToolHostPolicySnapshot
} from "@guardrail/runtime-contracts";

export interface GuardrailPolicyRule {
  id: string;
  capability: ToolCapability;
  decision: ToolHostDecisionResult["decision"];
  reason: string;
}

export const defaultPolicySnapshot: ToolHostPolicySnapshot = {
  mode: "deny-by-default",
  directExecutionForbidden: true,
  deterministicEvaluation: true,
  networkToolsEnabled: false
};

export const defaultPolicyRules: GuardrailPolicyRule[] = [
  {
    id: "deny-network-capable-tools",
    capability: "network.http",
    decision: "deny",
    reason: "Network-capable agent tooling is disabled by default in v0."
  },
  {
    id: "deny-process-execution",
    capability: "process.spawn",
    decision: "deny",
    reason: "Agent tool execution must stay behind an explicit Tool Host policy gate."
  }
];

export function evaluateToolRequest(
  request: ToolCallEnvelope
): ToolHostDecisionResult {
  const matchedRule = defaultPolicyRules.find(
    (rule) => rule.capability === request.capability
  );

  if (matchedRule) {
    return {
      decision: matchedRule.decision,
      reason: matchedRule.reason
    };
  }

  return {
    decision: "deny",
    reason:
      "No allow rule exists. Guardrail remains deterministic and deny-by-default."
  };
}
