import type {
  ApprovalRequestSummary,
  GuardrailProfileSummary,
  ProjectSummary,
  ProviderConnectionSummary,
  SessionSummary
} from "@guardrail/domain";
import type {
  EvaluateServiceActionResponse,
  GuardrailServiceBoundary,
  RuntimeBoundarySnapshot,
  ProviderConnection,
  RuntimeOverview,
  ToolExecutionResponse
} from "@guardrail/runtime-contracts";

export interface RuntimeQueryMap {
  "runtime.getOverview": RuntimeOverview;
  "runtime.getBoundarySnapshot": RuntimeBoundarySnapshot;
  "runtime.runToolRequest": ToolExecutionResponse;
  "service.evaluateAction": EvaluateServiceActionResponse;
  "service.getBoundary": GuardrailServiceBoundary;
  "providers.list": ProviderConnection[];
  "projects.list": ProjectSummary[];
  "profiles.list": GuardrailProfileSummary[];
  "sessions.list": SessionSummary[];
  "approvals.list": ApprovalRequestSummary[];
}

export interface DesktopSnapshotPayload {
  overview: RuntimeOverview;
  providers: ProviderConnectionSummary[];
  projects: ProjectSummary[];
  profiles: GuardrailProfileSummary[];
  sessions: SessionSummary[];
  approvals: ApprovalRequestSummary[];
}

export interface RuntimeEvent {
  type: "approval-requested" | "session-updated";
  summary: string;
}
