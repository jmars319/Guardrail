use tauri::State;

use crate::{
    runtime::{model::RuntimeBoundarySnapshot, state::RuntimeState},
    tool_host::model::{ToolExecutionResponse, ToolRequest},
};

#[tauri::command]
pub fn get_runtime_boundary_snapshot(state: State<'_, RuntimeState>) -> RuntimeBoundarySnapshot {
    state.boundary_snapshot()
}

#[tauri::command]
pub fn run_tool_request(
    state: State<'_, RuntimeState>,
    request: ToolRequest,
) -> ToolExecutionResponse {
    state.run_tool_request(request)
}
