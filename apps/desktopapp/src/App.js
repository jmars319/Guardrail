import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { appMetadata, defaultPorts } from "@guardrail/config";
import { seededApprovals, seededProfiles, seededProjects, seededProviders, seededSessions } from "@guardrail/domain";
import { defaultPolicySnapshot, evaluateToolRequest } from "@guardrail/policy";
import { privacyDefaults } from "@guardrail/privacy";
import { providerCatalog } from "@guardrail/provider-config";
import { secretPatternCatalog } from "@guardrail/secrets";
import { desktopNavigation, guardrailStatement } from "@guardrail/ui";
const fallbackOverview = {
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
    const [overview, setOverview] = useState(fallbackOverview);
    const [runtimeSource, setRuntimeSource] = useState("fallback");
    const [activeSection, setActiveSection] = useState(desktopNavigation[0].id);
    useEffect(() => {
        let cancelled = false;
        invoke("get_runtime_overview")
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
    return (_jsxs("div", { className: "desktop-shell", children: [_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "brand-card", children: [_jsx("p", { className: "eyebrow", children: "Primary Surface" }), _jsx("h1", { children: appMetadata.name }), _jsx("p", { children: guardrailStatement })] }), _jsx("nav", { className: "nav-list", "aria-label": "Guardrail sections", children: desktopNavigation.map((item) => (_jsxs("button", { className: item.id === activeSection ? "nav-item active" : "nav-item", onClick: () => setActiveSection(item.id), type: "button", children: [_jsx("span", { children: item.label }), _jsx("small", { children: item.description })] }, item.id))) })] }), _jsxs("main", { className: "content", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Runtime Boundary" }), _jsx("h2", { children: "Local desktop shell, headless Rust runtime, explicit Tool Host" }), _jsx("p", { className: "hero-copy", children: "Guardrail keeps agent execution behind controlled boundaries. Direct tool execution is forbidden, policy is deterministic, and network-capable tooling starts disabled." })] }), _jsxs("div", { className: "status-grid", children: [_jsx(StatusCard, { label: "Policy mode", value: overview.policyMode, tone: "neutral" }), _jsx(StatusCard, { label: "Tool Host", value: overview.toolHostBoundary, tone: "safe" }), _jsx(StatusCard, { label: "Network tooling", value: overview.networkToolingEnabled ? "enabled" : "disabled", tone: "warning" }), _jsx(StatusCard, { label: "Runtime source", value: runtimeSource, tone: "neutral" })] })] }), _jsxs("section", { className: "panel-grid", children: [_jsx(Panel, { id: "provider-connections", activeSection: activeSection, title: "Provider Connections", subtitle: "Configured locally. Disabled by default until policy permits use.", children: providerCatalog.map((provider) => {
                                    const seeded = seededProviders.find((entry) => entry.provider === provider.id);
                                    return (_jsxs("article", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: provider.label }), _jsx("p", { children: provider.notes })] }), _jsx(StatusPill, { tone: "warning", children: seeded?.status ?? "disconnected" })] }, provider.id));
                                }) }), _jsx(Panel, { id: "projects", activeSection: activeSection, title: "Projects", subtitle: "Local workspaces attach to explicit profiles instead of implicit trust.", children: seededProjects.map((project) => (_jsxs("article", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: project.name }), _jsxs("p", { children: ["Profile: ", project.profileId] })] }), _jsx("span", { className: "meta-chip", children: project.lastOpenedAt })] }, project.id))) }), _jsxs(Panel, { id: "guardrail-profiles", activeSection: activeSection, title: "Guardrail Profiles", subtitle: "Profiles expose policy posture in plain language.", children: [seededProfiles.map((profile) => (_jsxs("article", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: profile.name }), _jsx("p", { children: profile.description })] }), _jsx(StatusPill, { tone: "safe", children: profile.policyMode })] }, profile.id))), _jsxs("div", { className: "summary-block", children: [_jsx("span", { children: "Direct execution forbidden" }), _jsx("strong", { children: String(defaultPolicySnapshot.directExecutionForbidden) })] })] }), _jsx(Panel, { id: "sessions", activeSection: activeSection, title: "Sessions", subtitle: "Runtime session state stays separate from the UI wrapper.", children: seededSessions.map((session) => (_jsxs("article", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: session.id }), _jsxs("p", { children: ["Project: ", session.projectId] })] }), _jsx(StatusPill, { tone: session.status === "awaiting-approval" ? "warning" : "safe", children: session.status })] }, session.id))) }), _jsxs(Panel, { id: "approvals", activeSection: activeSection, title: "Approvals", subtitle: "Sensitive actions queue before execution. No silent bypass path exists.", children: [seededApprovals.map((approval) => (_jsxs("article", { className: "list-row", children: [_jsxs("div", { children: [_jsx("strong", { children: approval.capability }), _jsxs("p", { children: ["Session: ", approval.sessionId] })] }), _jsx(StatusPill, { tone: "warning", children: approval.status })] }, approval.id))), _jsxs("div", { className: "summary-block", children: [_jsx("span", { children: "Sample Tool Host decision" }), _jsx("strong", { children: sampleDecision.reason })] })] }), _jsx(Panel, { id: "settings", activeSection: activeSection, title: "Settings", subtitle: "Configuration remains explicit, local, and minimally surprising.", children: _jsxs("div", { className: "settings-grid", children: [_jsx(SummaryMetric, { label: "Desktop UI port", value: String(defaultPorts.desktopUi) }), _jsx(SummaryMetric, { label: "Local API port", value: String(defaultPorts.localApi) }), _jsx(SummaryMetric, { label: "Privacy mode", value: privacyDefaults.defaultMode }), _jsx(SummaryMetric, { label: "Secret detectors", value: String(secretPatternCatalog.length) })] }) })] })] })] }));
}
function StatusCard({ label, value, tone }) {
    return (_jsxs("article", { className: `status-card ${tone}`, children: [_jsx("span", { children: label }), _jsx("strong", { children: value })] }));
}
function Panel({ activeSection, children, id, subtitle, title }) {
    return (_jsxs("section", { className: id === activeSection ? "panel active" : "panel", children: [_jsx("div", { className: "panel-header", children: _jsxs("div", { children: [_jsx("h3", { children: title }), _jsx("p", { children: subtitle })] }) }), _jsx("div", { className: "panel-body", children: children })] }));
}
function StatusPill({ children, tone }) {
    return _jsx("span", { className: `status-pill ${tone}`, children: children });
}
function SummaryMetric({ label, value }) {
    return (_jsxs("article", { className: "metric-card", children: [_jsx("span", { children: label }), _jsx("strong", { children: value })] }));
}
