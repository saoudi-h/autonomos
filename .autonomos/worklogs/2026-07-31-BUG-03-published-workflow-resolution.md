# WORKLOG: [BUG-03] Published workflow resolution

**Date:** 2026-07-31
**Agent Status:** [Complete]

## Problem

- `npx @autonomos/cli@0.4.0 update --all` resolved the bundled CLI's sibling
  Core package from the wrong directory and could not find
  `@autonomos/core/dist/workflows` in the published npm layout.
- The update checked that prerequisite only after writing the protocol,
  manifest, and package metadata, which could leave a consumer repository in a
  mixed state.

## Resolution

- Added explicit workflow-directory candidates for the monorepo source layout,
  the published bundled CLI layout, and the per-entry build layout.
- Resolve and validate the workflow source before any consumer project write.
- Return a failed update result without changing managed artifacts when the
  workflow source is unavailable.
- Added regression coverage for both path layouts and update atomicity.
- Published `@autonomos/cli@0.4.1`; Core and Protocol content were unchanged.

## Validation

- CLI: 18 tests passed.
- CLI lint, typecheck, build, and publint passed.
- npm publish workflow `30653256920` completed successfully.
- Retried `update --all` in `/home/hakim/projects/infra` with CLI `0.4.1`.
- `autonomos status` reports Protocol `0.4.0-alpha`, CLI `0.4.1`, canonical
  artifact integrity, and the expected task summary.

## Files modified

- `packages/cli/src/protocol-artifacts.ts`
- `packages/cli/src/protocol-artifacts.test.ts`
- `packages/cli/src/commands/update.ts`
- `packages/cli/src/commands/update.test.ts`
- `.autonomos/TASKS.md`
- `.autonomos/worklogs/2026-07-31-BUG-03-published-workflow-resolution.md`
