import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appMetadata, defaultPorts } from "@guardrail/config";
import {
  seededApprovals,
  seededProfiles,
  seededProjects,
  seededProviders,
  seededSessions
} from "@guardrail/domain";
import {
  defaultPolicySnapshot,
  evaluateToolRequest
} from "@guardrail/policy";
import { privacyDefaults } from "@guardrail/privacy";
import { providerCatalog } from "@guardrail/provider-config";
import type { RuntimeOverview } from "@guardrail/runtime-contracts";
import { secretPatternCatalog } from "@guardrail/secrets";
import { desktopNavigation, guardrailStatement } from "@guardrail/ui";

const fallbackOverview: RuntimeOverview = {
  productName: appMetadata.name,
  primarySurface: "desktop",
  runtimeShape: "headless-service",
  toolHostBoundary: "required",
  policyMode: "deterministic-deny-by-default",
  networkToolingEnabled: false
};

const sampleDecision = evaluateToolRequest({
  id: "sample-network-request",
  actor: "agent",
  toolName: "fetch",
  capability: "network.http",
  surface: "desktop",
  projectId: "project-agent-lab",
  requestedAt: "2026-03-15T12:00:00.000Z"
});

export default function App() {
  const [overview, setOverview] = useState<RuntimeOverview>(fallbackOverview);
  const [runtimeSource, setRuntimeSource] = useState<"rust" | "fallback">(
    "fallback"
  );
  const [activeSection, setActiveSection] = useState(desktopNavigation[0].id);

  useEffect(() => {
    let cancelled = false;

    invoke<RuntimeOverview>("get_runtime_overview")
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setOverview(payload);
        setRuntimeSource("rust");
      })
      .catch(() => {
        if (!cancelled) {
          setOverview(fallbackOverview);
          setRuntimeSource("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="desktop-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Primary Surface</p>
          <h1>{appMetadata.name}</h1>
          <p>{guardrailStatement}</p>
        </div>

        <nav className="nav-list" aria-label="Guardrail sections">
          {desktopNavigation.map((item) => (
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
              Guardrail keeps agent execution behind controlled boundaries.
              Direct tool execution is forbidden, policy is deterministic, and
              network-capable tooling starts disabled.
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
            title="Guardrail Profiles"
            subtitle="Profiles expose policy posture in plain language."
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
              <span>Direct execution forbidden</span>
              <strong>{String(defaultPolicySnapshot.directExecutionForbidden)}</strong>
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
            id="approvals"
            activeSection={activeSection}
            title="Approvals"
            subtitle="Sensitive actions queue before execution. No silent bypass path exists."
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
              <span>Sample Tool Host decision</span>
              <strong>{sampleDecision.reason}</strong>
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
