# WORKLOG: [PROTO-07] Durable-memory lifecycle

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Replaced immediate `AGENT.md` appends with crystallization candidates.
- Added a future-task admission test for durable guidance.
- Routed session evidence to worklogs, operational explanations to existing
  component documentation, and stable normative guidance to the narrowest
  applicable `AGENT.md`.
- Required consolidation, replacement, or removal of superseded and disproven
  guidance instead of append-only accumulation.
- Removed the arbitrary file-count heuristic for creating local context files.
- Updated the protocol reference, synchronized installed workflows, and added
  lifecycle regression tests.

## Decisions

- `AGENT.md` is current durable guidance, not session history.
- Worklogs preserve historical evidence and do not become current instructions.
- Existing component documentation is preferred for operational explanations.
- New local context files require a genuine durable scope, not folder size.

## Files modified

- `packages/core/src/workflows/protocol-task.md`
- `packages/core/src/workflows/protocol-crystallize.md`
- `packages/core/src/workflows/protocol-workflows.test.ts`
- `packages/core/src/templates/protocol.ts`
- `.agent/workflows/task.md`
- `.agent/workflows/crystallize.md`
- `.autonomos/PROTOCOL.md`
- `.autonomos/TASKS.md`

## Validation

- Core tests: 86 passed.
- Core lint: passed with zero warnings.
- Core typecheck: passed.

## Next steps

- Define versioned artifact immutability (PROTO-09) and issue/task intake
  semantics (PROTO-10) before building reconciliation (PROTO-08).
