use serde::Serialize;

use crate::{
    audit::log::AuditLogEntry,
    policy::model::GuardrailPolicy,
    tool_host::model::ToolRequest,
};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeOverview {
    pub product_name: &'static str,
    pub primary_surface: &'static str,
    pub runtime_shape: &'static str,
    pub tool_host_boundary: &'static str,
    pub policy_mode: &'static str,
    pub network_tooling_enabled: bool,
    pub loaded_policy_source: String,
    pub audit_entry_count: usize,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeBoundarySnapshot {
    pub loaded_policy_source: String,
    pub policy: GuardrailPolicy,
    pub sample_requests: Vec<ToolRequest>,
    pub audit_entries: Vec<AuditLogEntry>,
}
