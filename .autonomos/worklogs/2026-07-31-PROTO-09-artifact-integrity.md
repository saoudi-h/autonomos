# WORKLOG: [PROTO-09] Versioned protocol artifact integrity

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Centralized canonical workflow location and filename resolution in the CLI.
- Extended `autonomos status` to verify exact content parity for `PROTOCOL.md`
  and every active installed harness workflow.
- Added `valid`, `drifted`, and `unverifiable` integrity states.
- Reported modified or missing artifact paths and directed users to the supported
  `autonomos update` repair path.
- Documented the boundary between read-only consumer artifacts and versioned
  protocol evolution in the Autonomos source repository.

## Decisions

- Exact comparison is performed only when the manifest version equals the
  protocol version bundled with the CLI.
- Artifacts from another version are unverifiable, not drifted; the current CLI
  cannot authoritatively reconstruct arbitrary historical release content.
- A harness target is considered installed when at least one expected workflow
  exists; missing siblings then count as deterministic drift.
- Project Git policy remains out of scope.

## Files modified

- `packages/cli/src/protocol-artifacts.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/src/commands/update.ts`
- `packages/cli/src/commands/status.ts`
- `packages/cli/src/commands/status.test.ts`
- `packages/cli/src/index.ts`
- `README.md`
- `packages/cli/README.md`
- `.autonomos/TASKS.md`

## Validation

- CLI tests: 15 passed.
- CLI lint: passed with zero warnings.
- CLI typecheck: passed.

## Next steps

- Define optional issue/proposal intake in PROTO-10, then use the clarified
  artifact roles as the basis for PROTO-08 reconciliation.
