# WORKLOG: [PROTO-10] Optional issue and proposal intake

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Added an optional `/issue` workflow for problems, proposals, and questions that
  require triage before implementation.
- Defined `ISSUES.md` as a first-use artifact rather than an `init` requirement.
- Separated solution-independent evidence, impact, and desired outcome from an
  accepted task's intervention and completion criteria.
- Defined duplicate merging, issue status, and bidirectional issue/task links.
- Integrated issue routing with session and task startup.
- Distributed the new workflow through CLI init/update and artifact-integrity
  verification without adding a parser or structured storage layer.

## Decisions

- Direct, clear, authorized changes may become tasks without issue ceremony.
- Open issues do not create tasks until an approach is accepted.
- Resolved and declined issues remain as historical intake records.
- Plain Markdown semantics are sufficient for the first release; automation must
  be justified by future usage evidence.

## Files modified

- `packages/core/src/workflows/protocol-issue.md`
- `packages/core/src/workflows/protocol-session.md`
- `packages/core/src/workflows/protocol-task.md`
- `packages/core/src/workflows/protocol-workflows.test.ts`
- `packages/core/src/templates/protocol.ts`
- `packages/cli/src/protocol-artifacts.ts`
- `packages/cli/src/commands/init.test.ts`
- `packages/cli/src/commands/update.test.ts`
- `.agent/workflows/issue.md`
- `.agent/workflows/session.md`
- `.agent/workflows/task.md`
- `.autonomos/PROTOCOL.md`
- `.autonomos/TASKS.md`
- `README.md`
- `packages/cli/README.md`

## Validation

- Core tests: 90 passed.
- CLI tests: 15 passed.
- Repository lint and typecheck: passed.

## Next steps

- Implement PROTO-08 reconciliation using the now-defined artifact roles and
  certainty boundary.
