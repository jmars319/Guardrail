use crate::runtime::service::{runtime_module_status, runtime_overview, RuntimeModuleStatus, RuntimeOverview};

#[derive(Default)]
pub struct RuntimeState;

impl RuntimeState {
    pub fn overview(&self) -> RuntimeOverview {
        runtime_overview()
    }

    #[allow(dead_code)]
    pub fn modules(&self) -> RuntimeModuleStatus {
        runtime_module_status()
    }
}
