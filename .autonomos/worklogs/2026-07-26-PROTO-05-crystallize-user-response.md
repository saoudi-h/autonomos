# WORKLOG: [PROTO-05] Preserve substantive user-facing result

**Date:** 2026-07-26
**Agent Status:** Complete

## What changed

- Replaced the terminal `RESPOND with exactly` contract in the crystallize workflow.
- The workflow now requires a self-contained answer to the original user request first, followed by one concise crystallization handoff.
- Added a regression test for the required ordering and for removal of the contradictory terminal instruction.

## Decision

The crystallization handoff remains in the same response, appended after the substantive result. This keeps durable-session context visible without displacing the answer the user requested.

## Validation

- `@autonomos/core`: 79 tests, lint, and typecheck passed.
- `@autonomos/cli`: 10 tests, lint, and typecheck passed.

## Release

- Patch releases are required for both packages: the published CLI pins an exact Core version and ships the workflow through `init` and `update`.
- Versioned for `@autonomos/core@0.3.2` and `@autonomos/cli@0.3.4`.
- Published both versions through the successful [Release workflow](https://github.com/saoudi-h/autonomos/actions/runs/30213743748), then confirmed each version on npm.
