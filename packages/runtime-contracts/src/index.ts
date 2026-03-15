import type { GuardrailPolicy } from "@guardrail/policy";
import type { RuntimeSurface } from "@guardrail/shared-types";

export type ToolActionKind =
  | "read-file"
  | "write-file"
  | "shell-command"
  | "network-request";

export type DenialRiskCategory =
  | "filesystem"
  | "secrets"
  | "shell"
  | "network"
  | "protected-path";

export interface ToolRequestBase {
  id: string;
  surface: RuntimeSurface;
  projectId: string;
  requestedAt: string;
}

export interface ReadFileRequest extends ToolRequestBase {
  kind: "read-file";
  path: string;
}

export interface WriteFileRequest extends ToolRequestBase {
  kind: "write-file";
  path: string;
  contents: string;
}

export interface ShellCommandRequest extends ToolRequestBase {
  kind: "shell-command";
  command: string;
  workingDirectory?: string;
}

export interface NetworkRequestStub extends ToolRequestBase {
  kind: "network-request";
  method: "GET" | "POST";
  url: string;
}

export type ToolRequest =
  | ReadFileRequest
  | WriteFileRequest
  | ShellCommandRequest
  | NetworkRequestStub;

export interface ToolAllowedResponse {
  status: "allowed";
  requestId: string;
  actionKind: ToolActionKind;
  summary: string;
  outputPreview?: string;
}

export interface ToolDeniedResponse {
  status: "denied";
  requestId: string;
  actionKind: ToolActionKind;
  reason: string;
  riskCategory: DenialRiskCategory;
  userInstructions: string;
  checklist: string[];
  policyRule: string;
  targetSummary: string;
}

export type ToolExecutionResponse = ToolAllowedResponse | ToolDeniedResponse;

export interface AuditLogEntry {
  timestampMs: number;
  requestKind: ToolActionKind;
  targetSummary: string;
  result: ToolExecutionResponse["status"];
}

export interface RuntimeOverview {
  productName: string;
  primarySurface: "desktop";
  runtimeShape: "headless-service";
  toolHostBoundary: "required";
  policyMode: "deterministic-deny-by-default";
  networkToolingEnabled: false;
  loadedPolicySource: string;
  auditEntryCount: number;
}

export interface RuntimeBoundarySnapshot {
  loadedPolicySource: string;
  policy: GuardrailPolicy;
  sampleRequests: ToolRequest[];
  auditEntries: AuditLogEntry[];
}

export interface ProviderConnection {
  id: string;
  provider: "openai" | "anthropic";
  label: string;
  enabled: boolean;
  networkRequired: true;
  status: "disconnected" | "configured" | "healthy";
}
