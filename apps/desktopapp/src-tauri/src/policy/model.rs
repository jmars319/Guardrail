use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GuardrailPolicy {
    pub project_roots: Vec<String>,
    pub denied_paths: Vec<String>,
    pub allowed_read_roots: Vec<String>,
    pub allowed_write_roots: Vec<String>,
    pub denied_shell_commands: Vec<String>,
    pub network_enabled: bool,
    pub protected_paths: Vec<String>,
}
