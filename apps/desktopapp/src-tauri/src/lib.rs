mod approvals;
mod audit;
mod commands;
mod policy;
mod providers;
mod runtime;
mod secrets;
mod tool_host;

use commands::overview::get_runtime_overview;
use runtime::state::RuntimeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RuntimeState::default())
        .invoke_handler(tauri::generate_handler![get_runtime_overview])
        .run(tauri::generate_context!())
        .expect("error while running Guardrail");
}
