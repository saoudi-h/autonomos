# WORKLOG: [PROTO-08] Evidence-aware protocol reconciliation

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Added `/reconcile` to audit accumulated drift across current guidance, current
  state, historical evidence, and version-pinned protocol artifacts.
- Defined checks for duplicates, contradictions, obsolete technology or paths,
  misplaced knowledge, vague rules, broken references, and status mismatches.
- Required verification against authoritative scoped repository evidence.
- Defined certain, uncertain, and historical-only outcomes with distinct actions.
- Required a second pass with no deterministic changes as the convergence test.
- Distributed the workflow through init/update and artifact-integrity checks.

## Decisions

- Reconciliation corrects only certain findings and makes the smallest change.
- Uncertain semantic conflicts are returned to the user with evidence and options.
- Historical evidence remains unchanged unless sensitive or falsely presented as
  current guidance.
- Managed protocol drift is repaired through `autonomos update`, not manual edits.
- A workflow is sufficient for this release; a CLI audit command remains deferred
  until repeated use identifies deterministic checks worth automating.

## Files modified

- `packages/core/src/workflows/protocol-reconcile.md`
- `packages/core/src/workflows/protocol-workflows.test.ts`
- `packages/core/src/templates/protocol.ts`
- `packages/cli/src/protocol-artifacts.ts`
- `packages/cli/src/commands/init.test.ts`
- `packages/cli/src/commands/update.test.ts`
- `.agent/workflows/reconcile.md`
- `.autonomos/PROTOCOL.md`
- `.autonomos/TASKS.md`
- `README.md`

## Validation

- Core tests: 94 passed.
- CLI tests: 15 passed.
- Repository lint and typecheck: passed.

## Next steps

- Bump the protocol and affected package versions, run the full release validation,
  then publish coordinated Core and CLI releases.
