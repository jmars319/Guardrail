# tenra Guardrail

tenra Guardrail is a local-first, desktop-first application for running AI agents inside hard runtime boundaries. The desktop shell wraps a headless Rust service that routes all agent actions through a Tool Host instead of letting models execute tools directly.

This repository is intentionally not a generic SaaS starter. The v0 scaffold favors a stable desktop product surface, explicit workspace contracts, and future-proof structure for policy enforcement, approvals, auditability, and provider configuration.

## Core constraints

These constraints are architectural, not aspirational:

- Agents never execute tools directly.
- All actions flow through a Tool Host boundary.
- Tool Host policy enforcement is deterministic and deny-by-default.
- Network-capable agent tooling is disabled by default in v0.
- The UI wrapper and runtime service remain separate.
- `apps/desktopapp` is the primary active app.
- `apps/webapp` and `apps/mobileapp` are placeholders for later activation.

## Repository layout

The monorepo uses `pnpm` workspaces:

- `apps/desktopapp`: primary Tauri + React + TypeScript surface with local runtime diagnostics and JSON snapshot export for policy/audit review.
- `apps/webapp`: lightweight future-facing web placeholder.
- `apps/mobileapp`: lightweight mobile placeholder.
- `packages/shared-types`: common type aliases and utility contracts.
- `packages/domain`: domain models and seeded placeholder records.
- `packages/api-contracts`: UI-to-runtime command and event contracts.
- `packages/runtime-contracts`: Tool Host and runtime service contracts.
- `packages/policy`: deterministic deny-by-default policy helpers.
- `packages/provider-config`: provider catalog and defaults.
- `packages/privacy`: privacy defaults and audit redaction rules.
- `packages/secrets`: placeholder secret-detection descriptors and redaction helpers.
- `packages/validation`: small runtime validation helpers.
- `packages/ui`: shared navigation and tenra Guardrail product copy.
- `packages/config`: scaffold-level configuration defaults.
- `scripts`: bootstrap, health, dev, and verification entrypoints.
- `docs`: repo map, developer guide, and stability checklist.

## Why desktop-first and local-first

tenra Guardrail’s initial job is to constrain what an agent can see and do on a local machine. That pushes the product toward a desktop wrapper with a Rust runtime rather than a browser-first or cloud-first control plane. The local machine is where filesystem, process, approval, and secrets boundaries must be enforced.

Web and mobile surfaces may exist later, but they are intentionally inactive in v0 because the policy and Tool Host spine matters more than multi-surface breadth.

## Bootstrap

1. Copy `.env.example` to `.env` if local overrides are needed.
2. Run `pnpm bootstrap`.
3. Run `pnpm doctor` for a quick repo health check.

## Daily commands

- `pnpm dev:desktop`: run the primary Tauri desktop app.
- `pnpm dev:web`: run the future web placeholder.
- `pnpm dev:mobile`: run the mobile placeholder notice.
- `pnpm verify:all`: run lint, typecheck, and app verification flows.

## Active vs placeholder surfaces

- Active now: `apps/desktopapp`.
- Placeholder only: `apps/webapp`, `apps/mobileapp`.

The placeholder apps exist so future activation has a stable home, not because tenra Guardrail is trying to be everything on day one.
