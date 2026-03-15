use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ToolHostStatus {
    pub boundary: &'static str,
    pub direct_execution_forbidden: bool,
    pub enforcement_model: &'static str,
}

pub fn tool_host_status() -> ToolHostStatus {
    // Agents never execute tools directly. Every action must cross this boundary.
    ToolHostStatus {
        boundary: "required",
        direct_execution_forbidden: true,
        enforcement_model: "tool-host-only",
    }
}
