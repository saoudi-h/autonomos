# WORKLOG: [PROTO-12] User authority and truthful lifecycle status

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Added an explicit authority boundary to the session, task, and crystallization
  workflows: using Autonomos never expands the changes authorized by the user.
- Made answer-only, read-only, and diagnosis-without-fix requests non-mutating.
- Replaced binary close-out behavior with truthful complete, partial, and blocked
  outcomes. Partial work remains `[/]`; `[!]` requires an unresolved dependency.
- Synchronized the Core workflow sources and this repository's installed copies.

## Decisions

- User authority is a protocol invariant, not a project preference.
- Read-only work may consume project artifacts as context but cannot create tasks,
  worklogs, or durable-memory entries merely to satisfy protocol ceremony.
- A session ending before task completion is not automatically blocked.

## Files modified

- `packages/core/src/workflows/protocol-session.md`
- `packages/core/src/workflows/protocol-task.md`
- `packages/core/src/workflows/protocol-crystallize.md`
- `packages/core/src/workflows/protocol-workflows.test.ts`
- `.agent/workflows/session.md`
- `.agent/workflows/task.md`
- `.agent/workflows/crystallize.md`
- `.autonomos/TASKS.md`

## Validation

- Core tests: 81 passed.
- Core lint: passed with zero warnings.
- Core typecheck: passed.

## Next steps

- Continue with PROTO-11 so session task selection and context loading honor the
  newly explicit authority boundary.
