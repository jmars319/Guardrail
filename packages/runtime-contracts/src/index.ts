import type { RuntimeSurface } from "@guardrail/shared-types";

export type ToolCapability =
  | "filesystem.read"
  | "filesystem.write"
  | "process.spawn"
  | "network.http"
  | "clipboard.read";

export type ToolHostDecision = "allow" | "deny" | "require-approval";

export interface ToolCallEnvelope {
  id: string;
  actor: "agent";
  toolName: string;
  capability: ToolCapability;
  surface: RuntimeSurface;
  projectId: string;
  requestedAt: string;
}

export interface ToolHostPolicySnapshot {
  mode: "deny-by-default";
  directExecutionForbidden: true;
  deterministicEvaluation: true;
  networkToolsEnabled: false;
}

export interface ToolHostDecisionResult {
  decision: ToolHostDecision;
  reason: string;
}

export interface RuntimeOverview {
  productName: string;
  primarySurface: "desktop";
  runtimeShape: "headless-service";
  toolHostBoundary: "required";
  policyMode: "deterministic-deny-by-default";
  networkToolingEnabled: false;
}

export interface ProviderConnection {
  id: string;
  provider: "openai" | "anthropic";
  label: string;
  enabled: boolean;
  networkRequired: true;
  status: "disconnected" | "configured" | "healthy";
}
