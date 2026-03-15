#![allow(dead_code)]

use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConnectorStatus {
    pub configured_count: usize,
    pub supported: Vec<&'static str>,
    pub network_posture: &'static str,
}

pub fn provider_connector_status() -> ProviderConnectorStatus {
    ProviderConnectorStatus {
        configured_count: 0,
        supported: vec!["OpenAI", "Anthropic"],
        network_posture: "disabled-by-default",
    }
}
