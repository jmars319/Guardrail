use tauri::State;

use crate::runtime::{service::RuntimeOverview, state::RuntimeState};

#[tauri::command]
pub fn get_runtime_overview(state: State<'_, RuntimeState>) -> RuntimeOverview {
    state.overview()
}
