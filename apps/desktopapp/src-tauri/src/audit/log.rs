use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogStatus {
    pub storage: &'static str,
    pub redaction: &'static str,
}

pub fn audit_log_status() -> AuditLogStatus {
    AuditLogStatus {
        storage: "local-only",
        redaction: "enabled",
    }
}
