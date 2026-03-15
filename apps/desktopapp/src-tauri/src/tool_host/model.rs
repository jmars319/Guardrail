use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RuntimeSurface {
    Desktop,
    Web,
    Mobile,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ToolRequestKind {
    ReadFile,
    WriteFile,
    ShellCommand,
    NetworkRequest,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum DenialRiskCategory {
    Filesystem,
    Secrets,
    Shell,
    Network,
    ProtectedPath,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RequestContext {
    pub id: String,
    pub project_id: String,
    pub requested_at: String,
    pub surface: RuntimeSurface,
}

impl RequestContext {
    pub fn sample(id: &str) -> Self {
        Self {
            id: id.to_string(),
            project_id: "guardrail-desktopapp".to_string(),
            requested_at: current_timestamp_ms().to_string(),
            surface: RuntimeSurface::Desktop,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "kind")]
pub enum ToolRequest {
    #[serde(rename = "read-file")]
    ReadFile {
        #[serde(flatten)]
        context: RequestContext,
        path: String,
    },
    #[serde(rename = "write-file")]
    WriteFile {
        #[serde(flatten)]
        context: RequestContext,
        path: String,
        contents: String,
    },
    #[serde(rename = "shell-command")]
    ShellCommand {
        #[serde(flatten)]
        context: RequestContext,
        command: String,
        #[serde(rename = "workingDirectory")]
        working_directory: Option<String>,
    },
    #[serde(rename = "network-request")]
    NetworkRequest {
        #[serde(flatten)]
        context: RequestContext,
        method: String,
        url: String,
    },
}

impl ToolRequest {
    pub fn sample_read_file(id: &str, path: &str) -> Self {
        Self::ReadFile {
            context: RequestContext::sample(id),
            path: path.to_string(),
        }
    }

    pub fn sample_write_file(id: &str, path: &str, contents: &str) -> Self {
        Self::WriteFile {
            context: RequestContext::sample(id),
            path: path.to_string(),
            contents: contents.to_string(),
        }
    }

    pub fn sample_shell_command(id: &str, command: &str) -> Self {
        Self::ShellCommand {
            context: RequestContext::sample(id),
            command: command.to_string(),
            working_directory: None,
        }
    }

    pub fn sample_network_request(id: &str, url: &str) -> Self {
        Self::NetworkRequest {
            context: RequestContext::sample(id),
            method: "GET".to_string(),
            url: url.to_string(),
        }
    }

    pub fn action_kind(&self) -> ToolRequestKind {
        match self {
            Self::ReadFile { .. } => ToolRequestKind::ReadFile,
            Self::WriteFile { .. } => ToolRequestKind::WriteFile,
            Self::ShellCommand { .. } => ToolRequestKind::ShellCommand,
            Self::NetworkRequest { .. } => ToolRequestKind::NetworkRequest,
        }
    }

    pub fn request_id(&self) -> &str {
        match self {
            Self::ReadFile { context, .. }
            | Self::WriteFile { context, .. }
            | Self::ShellCommand { context, .. }
            | Self::NetworkRequest { context, .. } => &context.id,
        }
    }

    pub fn target_summary(&self) -> String {
        match self {
            Self::ReadFile { path, .. } | Self::WriteFile { path, .. } => path.clone(),
            Self::ShellCommand { command, .. } => command.clone(),
            Self::NetworkRequest { url, .. } => url.clone(),
        }
    }

    pub fn write_contents(&self) -> Option<&str> {
        match self {
            Self::WriteFile { contents, .. } => Some(contents.as_str()),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolAllowedResponse {
    pub status: &'static str,
    pub request_id: String,
    pub action_kind: ToolRequestKind,
    pub summary: String,
    pub output_preview: Option<String>,
}

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolDeniedResponse {
    pub status: &'static str,
    pub request_id: String,
    pub action_kind: ToolRequestKind,
    pub reason: String,
    pub risk_category: DenialRiskCategory,
    pub user_instructions: String,
    pub checklist: Vec<String>,
    pub policy_rule: String,
    pub target_summary: String,
}

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(untagged)]
pub enum ToolExecutionResponse {
    Allowed(ToolAllowedResponse),
    Denied(ToolDeniedResponse),
}

impl ToolExecutionResponse {
    pub fn status(&self) -> &'static str {
        match self {
            Self::Allowed(_) => "allowed",
            Self::Denied(_) => "denied",
        }
    }
}

fn current_timestamp_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock should be after the Unix epoch")
        .as_millis()
}
