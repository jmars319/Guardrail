mod approvals;
mod audit;
mod commands;
mod policy;
mod providers;
mod runtime;
mod secrets;
mod tool_host;

use commands::{
    boundary::{get_runtime_boundary_snapshot, run_tool_request},
    overview::get_runtime_overview,
};
use runtime::state::RuntimeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RuntimeState::new().expect("failed to load tenra Guardrail policy"))
        .invoke_handler(tauri::generate_handler![
            get_runtime_overview,
            get_runtime_boundary_snapshot,
            run_tool_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tenra Guardrail");
}
