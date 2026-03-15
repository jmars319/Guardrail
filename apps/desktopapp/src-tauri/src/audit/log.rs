use std::{
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};

use serde::Serialize;

use crate::tool_host::model::{ToolExecutionResponse, ToolRequest, ToolRequestKind};

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AuditLogEntry {
    pub timestamp_ms: u128,
    pub request_kind: ToolRequestKind,
    pub target_summary: String,
    pub result: String,
}

pub struct AuditLog {
    entries: Mutex<Vec<AuditLogEntry>>,
}

impl AuditLog {
    pub fn new() -> Self {
        Self {
            entries: Mutex::new(Vec::new()),
        }
    }

    pub fn record(&self, request: &ToolRequest, response: &ToolExecutionResponse) {
        let mut entries = self.entries.lock().expect("audit log mutex poisoned");

        entries.push(AuditLogEntry {
            timestamp_ms: current_timestamp_ms(),
            request_kind: request.action_kind(),
            target_summary: request.target_summary(),
            result: response.status().to_string(),
        });
    }

    pub fn entries(&self) -> Vec<AuditLogEntry> {
        self.entries
            .lock()
            .expect("audit log mutex poisoned")
            .clone()
    }

    pub fn len(&self) -> usize {
        self.entries
            .lock()
            .expect("audit log mutex poisoned")
            .len()
    }
}

fn current_timestamp_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock should be after the Unix epoch")
        .as_millis()
}
