use std::{
    path::{Component, Path, PathBuf},
};

use crate::policy::model::GuardrailPolicy;

const DEFAULT_POLICY_JSON: &str = include_str!("../../config/default-policy.json");
const DEFAULT_POLICY_SOURCE: &str = "src-tauri/config/default-policy.json";

#[derive(Clone)]
pub struct LoadedPolicy {
    pub source: String,
    pub policy: GuardrailPolicy,
}

pub fn load_default_policy() -> Result<LoadedPolicy, String> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let mut policy: GuardrailPolicy =
        serde_json::from_str(DEFAULT_POLICY_JSON).map_err(|error| {
            format!("failed to parse {}: {error}", DEFAULT_POLICY_SOURCE)
        })?;

    policy.project_roots = resolve_roots(&manifest_dir, &policy.project_roots);
    policy.allowed_read_roots = resolve_roots(&manifest_dir, &policy.allowed_read_roots);
    policy.allowed_write_roots = resolve_roots(&manifest_dir, &policy.allowed_write_roots);

    Ok(LoadedPolicy {
        source: DEFAULT_POLICY_SOURCE.to_string(),
        policy,
    })
}

fn resolve_roots(base_dir: &Path, entries: &[String]) -> Vec<String> {
    entries
        .iter()
        .map(|entry| normalize_path(&base_dir.join(entry)).display().to_string())
        .collect()
}

fn normalize_path(path: &Path) -> PathBuf {
    let mut normalized = PathBuf::new();

    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                normalized.pop();
            }
            Component::RootDir | Component::Prefix(_) | Component::Normal(_) => {
                normalized.push(component.as_os_str());
            }
        }
    }

    normalized
}
