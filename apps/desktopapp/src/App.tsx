import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appMetadata, defaultPorts, scaffoldDefaults } from "@guardrail/config";
import {
  seededApprovals,
  seededProfiles,
  seededProjects,
  seededProviders,
  seededSessions
} from "@guardrail/domain";
import { privacyDefaults } from "@guardrail/privacy";
import { providerCatalog } from "@guardrail/provider-config";
import type {
  RuntimeBoundarySnapshot,
  RuntimeOverview,
  ToolDeniedResponse,
  ToolExecutionResponse,
  ToolRequest
} from "@guardrail/runtime-contracts";
import { secretPatternCatalog } from "@guardrail/secrets";
import { desktopNavigation, guardrailStatement } from "@guardrail/ui";

const fallbackSampleRequests: ToolRequest[] = [
  {
    id: "fallback-read-readme",
    kind: "read-file",
    path: "README.md",
    projectId: "guardrail-desktopapp",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "fallback-read-env",
    kind: "read-file",
    path: ".env",
    projectId: "guardrail-desktopapp",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "fallback-read-ssh",
    kind: "read-file",
    path: "~/.ssh/id_ed25519",
    projectId: "guardrail-desktopapp",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "fallback-shell",
    kind: "shell-command",
    command: "rm -rf /tmp/guardrail-test",
    projectId: "guardrail-desktopapp",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "fallback-network",
    kind: "network-request",
    method: "GET",
    projectId: "guardrail-desktopapp",
    requestedAt: "0",
    surface: "desktop",
    url: "https://api.openai.com/v1/models"
  }
];

const suiteClientNavigation = [
  ...desktopNavigation,
  {
    id: "suite-clients",
    label: "Suite Clients",
    description: "Inspect how other tenra apps should enter the Tool Host boundary."
  }
];

const suiteClientRequests: ToolRequest[] = [
  {
    id: "suite-registry-ledger-export",
    kind: "write-file",
    contents: "{\"source\":\"tenra Registry\",\"target\":\"tenra Ledger\"}",
    path: "exports/registry-ledger-handoff.json",
    projectId: "tenra-registry",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "suite-scout-evidence-read",
    kind: "read-file",
    path: "runs/latest/evidence-pack.json",
    projectId: "tenra-scout",
    requestedAt: "0",
    surface: "desktop"
  },
  {
    id: "suite-assembly-send-document",
    kind: "network-request",
    method: "POST",
    projectId: "tenra-assembly",
    requestedAt: "0",
    surface: "desktop",
    url: "https://example.invalid/send-document"
  },
  {
    id: "suite-proxy-profile-read",
    kind: "read-file",
    path: "profiles/default/profile.json",
    projectId: "tenra-proxy",
    requestedAt: "0",
    surface: "desktop"
  }
];

const fallbackOverview: RuntimeOverview = {
  productName: appMetadata.name,
  primarySurface: "desktop",
  runtimeShape: "headless-service",
  toolHostBoundary: "required",
  policyMode: "deterministic-deny-by-default",
  networkToolingEnabled: false,
  loadedPolicySource: "fallback-ui-state",
  auditEntryCount: 0
};

const fallbackBoundarySnapshot: RuntimeBoundarySnapshot = {
  loadedPolicySource: "fallback-ui-state",
  policy: scaffoldDefaults.policy,
  sampleRequests: fallbackSampleRequests,
  auditEntries: []
};

export default function App() {
  const [overview, setOverview] = useState<RuntimeOverview>(fallbackOverview);
  const [boundarySnapshot, setBoundarySnapshot] = useState<RuntimeBoundarySnapshot>(
    fallbackBoundarySnapshot
  );
  const [runtimeSource, setRuntimeSource] = useState<"rust" | "fallback">(
    "fallback"
  );
  const [activeSection, setActiveSection] = useState(suiteClientNavigation[0].id);
  const [selectedRequestId, setSelectedRequestId] = useState(
    fallbackBoundarySnapshot.sampleRequests[0]?.id ?? ""
  );
  const [lastResult, setLastResult] = useState<ToolExecutionResponse | null>(null);
  const [requestRunning, setRequestRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      invoke<RuntimeOverview>("get_runtime_overview"),
      invoke<RuntimeBoundarySnapshot>("get_runtime_boundary_snapshot")
    ])
      .then(([runtimeOverview, snapshot]) => {
        if (cancelled) {
          return;
        }

        setOverview(runtimeOverview);
        setBoundarySnapshot(snapshot);
        setSelectedRequestId(snapshot.sampleRequests[0]?.id ?? "");
        setRuntimeSource("rust");
      })
      .catch(() => {
        if (!cancelled) {
          setOverview(fallbackOverview);
          setBoundarySnapshot(fallbackBoundarySnapshot);
          setSelectedRequestId(fallbackBoundarySnapshot.sampleRequests[0]?.id ?? "");
          setRuntimeSource("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRequest =
    boundarySnapshot.sampleRequests.find((request) => request.id === selectedRequestId) ??
    boundarySnapshot.sampleRequests[0] ??
    null;
  const auditEntries = [...boundarySnapshot.auditEntries].slice(-5).reverse();

  async function runRequest(request: ToolRequest) {
    if (runtimeSource !== "rust") {
      return;
    }

    setRequestRunning(true);
    setSelectedRequestId(request.id);

    try {
      const [result, runtimeOverview, snapshot] = await Promise.all([
        invoke<ToolExecutionResponse>("run_tool_request", { request }),
        invoke<RuntimeOverview>("get_runtime_overview"),
        invoke<RuntimeBoundarySnapshot>("get_runtime_boundary_snapshot")
      ]);

      setLastResult(result);
      setOverview(runtimeOverview);
      setBoundarySnapshot(snapshot);
    } finally {
      setRequestRunning(false);
    }
  }

  return (
    <div className="desktop-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Primary Surface</p>
          <h1>{appMetadata.name}</h1>
          <p>{guardrailStatement}</p>
        </div>

        <nav className="nav-list" aria-label="tenra Guardrail sections">
          {suiteClientNavigation.map((item) => (
            <button
              key={item.id}
              className={item.id === activeSection ? "nav-item active" : "nav-item"}
              onClick={() => setActiveSection(item.id)}
              type="button"
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">Runtime Boundary</p>
            <h2>Local desktop shell, headless Rust runtime, explicit Tool Host</h2>
            <p className="hero-copy">
              tenra Guardrail now loads a real policy, evaluates tool requests through
              the Tool Host, denies unsafe operations deterministically, and
              returns structured coaching instead of acting unsafely.
            </p>
          </div>

          <div className="status-grid">
            <StatusCard
              label="Policy mode"
              value={overview.policyMode}
              tone="neutral"
            />
            <StatusCard
              label="Tool Host"
              value={overview.toolHostBoundary}
              tone="safe"
            />
            <StatusCard
              label="Network tooling"
              value={overview.networkToolingEnabled ? "enabled" : "disabled"}
              tone="warning"
            />
            <StatusCard
              label="Policy source"
              value={overview.loadedPolicySource}
              tone="neutral"
            />
            <StatusCard
              label="Audit entries"
              value={String(overview.auditEntryCount)}
              tone="neutral"
            />
            <StatusCard
              label="Runtime source"
              value={runtimeSource}
              tone="neutral"
            />
          </div>
        </section>

        <section className="panel-grid">
          <Panel
            id="provider-connections"
            activeSection={activeSection}
            title="Provider Connections"
            subtitle="Configured locally. Disabled by default until policy permits use."
          >
            {providerCatalog.map((provider) => {
              const seeded = seededProviders.find(
                (entry) => entry.provider === provider.id
              );

              return (
                <article key={provider.id} className="list-row">
                  <div>
                    <strong>{provider.label}</strong>
                    <p>{provider.notes}</p>
                  </div>
                  <StatusPill tone="warning">
                    {seeded?.status ?? "disconnected"}
                  </StatusPill>
                </article>
              );
            })}
          </Panel>

          <Panel
            id="projects"
            activeSection={activeSection}
            title="Projects"
            subtitle="Local workspaces attach to explicit profiles instead of implicit trust."
          >
            {seededProjects.map((project) => (
              <article key={project.id} className="list-row">
                <div>
                  <strong>{project.name}</strong>
                  <p>Profile: {project.profileId}</p>
                </div>
                <span className="meta-chip">{project.lastOpenedAt}</span>
              </article>
            ))}
          </Panel>

          <Panel
            id="guardrail-profiles"
            activeSection={activeSection}
            title="tenra Guardrail Profiles"
            subtitle="Profiles expose concrete boundary posture instead of prompt-only safety."
          >
            {seededProfiles.map((profile) => (
              <article key={profile.id} className="list-row">
                <div>
                  <strong>{profile.name}</strong>
                  <p>{profile.description}</p>
                </div>
                <StatusPill tone="safe">{profile.policyMode}</StatusPill>
              </article>
            ))}

            <div className="summary-block">
              <span>Blocked path patterns</span>
              <strong>{boundarySnapshot.policy.deniedPaths.join(", ")}</strong>
            </div>

            <div className="summary-block">
              <span>Protected paths</span>
              <strong>{boundarySnapshot.policy.protectedPaths.join(", ")}</strong>
            </div>
          </Panel>

          <Panel
            id="sessions"
            activeSection={activeSection}
            title="Sessions"
            subtitle="Runtime session state stays separate from the UI wrapper."
          >
            {seededSessions.map((session) => (
              <article key={session.id} className="list-row">
                <div>
                  <strong>{session.id}</strong>
                  <p>Project: {session.projectId}</p>
                </div>
                <StatusPill
                  tone={
                    session.status === "awaiting-approval" ? "warning" : "safe"
                  }
                >
                  {session.status}
                </StatusPill>
              </article>
            ))}
          </Panel>

          <Panel
            id="runtime-diagnostics"
            activeSection={activeSection}
            title="Runtime Diagnostics"
            subtitle="Developer-facing boundary test surface backed by the real Tool Host."
          >
            <div className="diagnostic-stack">
              <div className="summary-block">
                <span>Loaded project roots</span>
                <strong>{boundarySnapshot.policy.projectRoots.join(", ")}</strong>
              </div>

              <div className="summary-block">
                <span>Network enabled</span>
                <strong>{String(boundarySnapshot.policy.networkEnabled)}</strong>
              </div>

              <div className="request-actions">
                {boundarySnapshot.sampleRequests.map((request) => (
                  <button
                    key={request.id}
                    className={
                      request.id === selectedRequestId
                        ? "request-button active"
                        : "request-button"
                    }
                    disabled={runtimeSource !== "rust" || requestRunning}
                    onClick={() => void runRequest(request)}
                    type="button"
                  >
                    <span>{describeRequest(request)}</span>
                    <small>{describeTarget(request)}</small>
                  </button>
                ))}
              </div>

              {runtimeSource !== "rust" ? (
                <p className="diagnostic-note">
                  Runtime diagnostics require the Tauri runtime. Launch via{" "}
                  <code>pnpm dev:desktop</code> to execute the real boundary.
                </p>
              ) : null}

              {selectedRequest ? (
                <div className="summary-block">
                  <span>Selected request</span>
                  <strong>{describeRequest(selectedRequest)}</strong>
                </div>
              ) : null}

              {lastResult ? (
                isDenied(lastResult) ? (
                  <article className="decision-card denied">
                    <p className="eyebrow">Denied</p>
                    <h3>{lastResult.reason}</h3>
                    <p>{lastResult.userInstructions}</p>
                    <div className="result-meta">
                      <span>Risk: {lastResult.riskCategory}</span>
                      <span>Rule: {lastResult.policyRule}</span>
                    </div>
                    <p className="decision-target">
                      Target: <code>{lastResult.targetSummary}</code>
                    </p>
                    <ul className="checklist">
                      {lastResult.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ) : (
                  <article className="decision-card allowed">
                    <p className="eyebrow">Allowed</p>
                    <h3>{lastResult.summary}</h3>
                    <p>
                      This request was allowed because it stayed inside trusted
                      scope and did not cross a blocked capability boundary.
                    </p>
                    {lastResult.outputPreview ? (
                      <pre className="preview-block">{lastResult.outputPreview}</pre>
                    ) : null}
                  </article>
                )
              ) : (
                <p className="diagnostic-note">
                  Run one of the sample requests above to see a real allow or
                  deny payload from the Tool Host.
                </p>
              )}

              <div className="audit-list">
                {auditEntries.length > 0 ? (
                  auditEntries.map((entry) => (
                    <article key={`${entry.timestampMs}-${entry.targetSummary}`} className="audit-entry">
                      <div>
                        <strong>{entry.requestKind}</strong>
                        <p>{entry.targetSummary}</p>
                      </div>
                      <div className="audit-meta">
                        <span>{entry.result}</span>
                        <small>{formatTimestamp(entry.timestampMs)}</small>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="diagnostic-note">
                    Audit entries appear here after a request passes through the
                    Tool Host.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel
            id="suite-clients"
            activeSection={activeSection}
            title="Suite Client Requests"
            subtitle="Other tenra apps should ask Guardrail before file writes, evidence reads, network sends, or profile access."
          >
            <div className="diagnostic-stack">
              {suiteClientRequests.map((request) => (
                <article key={request.id} className="list-row">
                  <div>
                    <strong>{request.projectId}</strong>
                    <p>{describeRequest(request)} · {describeTarget(request)}</p>
                  </div>
                  <button
                    className="request-button"
                    disabled={runtimeSource !== "rust" || requestRunning}
                    onClick={() => void runRequest(request)}
                    type="button"
                  >
                    Test
                  </button>
                </article>
              ))}
              <div className="summary-block">
                <span>Boundary rule</span>
                <strong>Suite apps must send structured requests instead of bypassing policy locally.</strong>
              </div>
            </div>
          </Panel>

          <Panel
            id="approvals"
            activeSection={activeSection}
            title="Approvals"
            subtitle="Approval flow is reserved for later. Protected targets are denied explicitly for now."
          >
            {seededApprovals.map((approval) => (
              <article key={approval.id} className="list-row">
                <div>
                  <strong>{approval.capability}</strong>
                  <p>Session: {approval.sessionId}</p>
                </div>
                <StatusPill tone="warning">{approval.status}</StatusPill>
              </article>
            ))}

            <div className="summary-block">
              <span>Current protected paths</span>
              <strong>{boundarySnapshot.policy.protectedPaths.join(", ")}</strong>
            </div>
          </Panel>

          <Panel
            id="settings"
            activeSection={activeSection}
            title="Settings"
            subtitle="Configuration remains explicit, local, and minimally surprising."
          >
            <div className="settings-grid">
              <SummaryMetric label="Desktop UI port" value={String(defaultPorts.desktopUi)} />
              <SummaryMetric label="Local API port" value={String(defaultPorts.localApi)} />
              <SummaryMetric
                label="Privacy mode"
                value={privacyDefaults.defaultMode}
              />
              <SummaryMetric
                label="Secret detectors"
                value={String(secretPatternCatalog.length)}
              />
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

function describeRequest(request: ToolRequest) {
  switch (request.kind) {
    case "read-file":
      return "Read file";
    case "write-file":
      return "Write file";
    case "shell-command":
      return "Shell command";
    case "network-request":
      return "Network request";
  }
}

function describeTarget(request: ToolRequest) {
  switch (request.kind) {
    case "read-file":
    case "write-file":
      return request.path;
    case "shell-command":
      return request.command;
    case "network-request":
      return `${request.method} ${request.url}`;
  }
}

function formatTimestamp(timestampMs: number) {
  return new Date(timestampMs).toLocaleString();
}

function isDenied(
  response: ToolExecutionResponse
): response is ToolDeniedResponse {
  return response.status === "denied";
}

interface StatusCardProps {
  label: string;
  value: string;
  tone: "neutral" | "safe" | "warning";
}

function StatusCard({ label, value, tone }: StatusCardProps) {
  return (
    <article className={`status-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

interface PanelProps {
  activeSection: string;
  children: ReactNode;
  id: string;
  subtitle: string;
  title: string;
}

function Panel({ activeSection, children, id, subtitle, title }: PanelProps) {
  return (
    <section className={id === activeSection ? "panel active" : "panel"}>
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

interface StatusPillProps {
  children: ReactNode;
  tone: "safe" | "warning";
}

function StatusPill({ children, tone }: StatusPillProps) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

interface SummaryMetricProps {
  label: string;
  value: string;
}

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
