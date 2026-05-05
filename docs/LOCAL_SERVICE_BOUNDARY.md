# Local Service Boundary

Guardrail should act as a local approval service for the rest of the tenra apps. The apps stay separate, but they can ask Guardrail for a decision before they perform actions with higher operational risk.

## Contract

The shared TypeScript contract lives in `packages/runtime-contracts/src/index.ts`.

- `GuardrailServiceRequest` describes the app, surface, target record, proposed action, and risk categories.
- `GuardrailServiceDecision` returns `allowed`, `denied`, or `needs-review` with the rule, reason, and checklist.
- `GuardrailServiceBoundary` describes the local transport and supported clients/actions.

The first implementation should be local IPC from desktop shells. A localhost HTTP adapter can be added later for web-first development builds, but the decision model should stay the same.

## First Clients

- Registry: document generation, email sends, imports, ledger-affecting receivable entries.
- Align: external profile sync and provider writes.
- Scout: market briefs that create outreach or Registry leads.
- Proxy: outbound copy that should be checked before delivery.

## Operating Rule

If an action writes customer data, sends an external message, touches money, updates a provider listing, or runs a system tool, the calling app should include a Guardrail request before committing the action.
