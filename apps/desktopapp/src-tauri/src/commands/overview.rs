use tauri::State;

use crate::runtime::{model::RuntimeOverview, state::RuntimeState};

#[tauri::command]
pub fn get_runtime_overview(state: State<'_, RuntimeState>) -> RuntimeOverview {
    state.overview()
}
