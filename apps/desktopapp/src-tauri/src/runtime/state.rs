use crate::{
    audit::log::AuditLog,
    policy::loader::load_default_policy,
    runtime::{
        model::{RuntimeBoundarySnapshot, RuntimeOverview},
        service::{runtime_boundary_snapshot, runtime_overview},
    },
    tool_host::{
        host::ToolHost,
        model::{ToolExecutionResponse, ToolRequest},
    },
};

pub struct RuntimeState {
    loaded_policy_source: String,
    tool_host: ToolHost,
    policy: crate::policy::model::GuardrailPolicy,
    audit_log: AuditLog,
}

impl RuntimeState {
    pub fn new() -> Result<Self, String> {
        let loaded_policy = load_default_policy()?;

        Ok(Self {
            loaded_policy_source: loaded_policy.source,
            tool_host: ToolHost::new(loaded_policy.policy.clone()),
            policy: loaded_policy.policy,
            audit_log: AuditLog::new(),
        })
    }

    pub fn overview(&self) -> RuntimeOverview {
        runtime_overview(&self.loaded_policy_source, self.audit_log.len())
    }

    pub fn boundary_snapshot(&self) -> RuntimeBoundarySnapshot {
        runtime_boundary_snapshot(
            &self.loaded_policy_source,
            self.policy.clone(),
            self.audit_log.entries(),
        )
    }

    pub fn run_tool_request(&self, request: ToolRequest) -> ToolExecutionResponse {
        let response = self.tool_host.handle(request.clone());
        self.audit_log.record(&request, &response);
        response
    }
}
