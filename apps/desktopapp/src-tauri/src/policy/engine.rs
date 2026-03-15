use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PolicyStatus {
    pub mode: &'static str,
    pub deterministic: bool,
    pub network_tools_enabled: bool,
}

pub fn policy_status() -> PolicyStatus {
    // v0 starts from explicit denial, then adds capability only through policy work.
    PolicyStatus {
        mode: "deterministic-deny-by-default",
        deterministic: true,
        network_tools_enabled: false,
    }
}
