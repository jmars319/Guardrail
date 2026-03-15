use serde::Serialize;

use crate::{
    approvals::queue::{approval_queue_status, ApprovalQueueStatus},
    audit::log::{audit_log_status, AuditLogStatus},
    policy::engine::{policy_status, PolicyStatus},
    providers::catalog::{provider_connector_status, ProviderConnectorStatus},
    secrets::detector::{secrets_detector_status, SecretsDetectorStatus},
    tool_host::router::{tool_host_status, ToolHostStatus},
};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeOverview {
    pub product_name: &'static str,
    pub primary_surface: &'static str,
    pub runtime_shape: &'static str,
    pub tool_host_boundary: &'static str,
    pub policy_mode: &'static str,
    pub network_tooling_enabled: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeModuleStatus {
    pub tool_host: ToolHostStatus,
    pub policy: PolicyStatus,
    pub providers: ProviderConnectorStatus,
    pub approvals: ApprovalQueueStatus,
    pub audit: AuditLogStatus,
    pub secrets: SecretsDetectorStatus,
}

pub fn runtime_overview() -> RuntimeOverview {
    let tool_host = tool_host_status();
    let policy = policy_status();

    RuntimeOverview {
        product_name: "Guardrail by JAMARQ",
        primary_surface: "desktop",
        runtime_shape: "headless-service",
        tool_host_boundary: tool_host.boundary,
        policy_mode: policy.mode,
        network_tooling_enabled: policy.network_tools_enabled,
    }
}

pub fn runtime_module_status() -> RuntimeModuleStatus {
    RuntimeModuleStatus {
        tool_host: tool_host_status(),
        policy: policy_status(),
        providers: provider_connector_status(),
        approvals: approval_queue_status(),
        audit: audit_log_status(),
        secrets: secrets_detector_status(),
    }
}
