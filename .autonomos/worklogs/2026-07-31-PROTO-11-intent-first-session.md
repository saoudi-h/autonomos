# WORKLOG: [PROTO-11] Intent-first session startup

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Made an explicit user objective take precedence over the global backlog.
- Defined the no-objective fallback as resume `[/]`, then select the
  highest-priority open task.
- Replaced global `AGENT.md` discovery with root orientation followed by the
  selected target's ancestor chain.
- Delegated scoped context, planning, and status transition to `/task` instead of
  duplicating those responsibilities in `/session`.
- Made resumed tasks load their own latest worklog without unrelated history.
- Updated the compact protocol reference and synchronized installed workflows.

## Decisions

- Backlog priority is a fallback, not permission to override current user intent.
- Session startup owns orientation and objective resolution; task startup owns
  execution preparation.
- Context is selected by applicability, not by exhaustively reading the repository.

## Files modified

- `packages/core/src/workflows/protocol-session.md`
- `packages/core/src/workflows/protocol-task.md`
- `packages/core/src/workflows/protocol-workflows.test.ts`
- `packages/core/src/templates/protocol.ts`
- `.agent/workflows/session.md`
- `.agent/workflows/task.md`
- `.autonomos/PROTOCOL.md`
- `.autonomos/TASKS.md`

## Validation

- Core tests: 84 passed.
- Core lint: passed with zero warnings.
- Core typecheck: passed.

## Next steps

- Implement PROTO-07 so scoped context contains durable guidance instead of
  accumulated session history.
