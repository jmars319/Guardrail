use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApprovalQueueStatus {
    pub pending_count: u32,
    pub strategy: &'static str,
}

pub fn approval_queue_status() -> ApprovalQueueStatus {
    ApprovalQueueStatus {
        pending_count: 1,
        strategy: "explicit-human-review",
    }
}
