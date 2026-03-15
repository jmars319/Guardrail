use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretsDetectorStatus {
    pub enabled: bool,
    pub action: &'static str,
}

pub fn secrets_detector_status() -> SecretsDetectorStatus {
    SecretsDetectorStatus {
        enabled: true,
        action: "detect-and-redact",
    }
}
