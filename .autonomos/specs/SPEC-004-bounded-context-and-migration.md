# SPEC-004 — Bounded current context, proportionate records and format migration

- Status: accepted
- Scope: protocol doctrine, workflows, artifact format 2, CLI `close`, `migrate`, `status`
- Provenance: ISSUE-05; owner acceptance on 2026-11-08
- Supersedes in part: SPEC-003 (batch-only archival of completed tasks/issues; "no automatic cleanup on install" now applies to `update`, not to the explicit `migrate`)
- Related tasks: PROTO-15

## Intent

What an agent reads at startup must be bounded by open work, not by project age.
Bounds are enforced by structure and tooling; agent judgment is reserved for
semantic consolidation.

## Requirements

### Current registries hold open work only

- `TASKS.md` holds `[ ]`, `[/]`, `[!]` tasks and optional Current direction. `ISSUES.md` holds open and accepted issues.
- Closing moves the record, in the same session, to the append-only closed registries `.autonomos/archive/closed/TASKS.md` and `.autonomos/archive/closed/ISSUES.md`. Content, IDs and provenance are preserved; relative links are repaired.
- `autonomos close <ID...>` performs the move. A task must be `[x]` (a `Completed:` date is added when missing) or closed with `--abandoned <reason>`. An issue must be resolved, declined, closed or superseded. Without the CLI, agents move the entry by hand.
- `/reconcile` remains for semantic consolidation (parents, constraints still needed, AGENT.md), not for routine removal of closed records.

### Entries stay short

- A task entry is one line: status, ID, title, priority, complexity, optional `Completed:` date, optional short note and link. Budget: 300 characters. Evidence belongs in the worklog.
- An issue records evidence, impact, desired outcome and tasks. Progress is not appended to issues; resolution is one line linking the task or worklog.

### Session records are proportionate

- A worklog keeps only what a future agent cannot recover from code, git, tests or other artifacts: the outcome, non-obvious decisions with their reason, validation actually run, and open limits or follow-ups.
- Fixed shape: title, `Outcome`, `Decisions`, `Validation`, `Open`. Budget: 2,500 bytes; an S task may omit the worklog when the commit and task line suffice.
- Excluded: chronology, plans, file lists, restating the task/issue/commit, justification of things not done, raw data (attach as a separate file and link it).
- Agents follow the workflow template and do not use existing worklogs as a model.

### AGENT.md admission has a cost criterion

- Root `AGENT.md` admits guidance that applies to most tasks in the project. Tool-, component- or incident-specific knowledge goes to the narrowest `AGENT.md` or to project documentation (runbooks).
- Budgets: root 8,000 bytes; local 4,000 bytes. Over budget, consolidate before adding.

### Visibility

- `autonomos status` reports budget findings: artifact format below current, closed records in current registries, registry size (TASKS.md 16 KB, ISSUES.md 24 KB), task entries over budget, AGENT.md over budget, worklogs over budget. Findings are advisory (exit 0) unless `--strict`.
- `/session` runs `autonomos status` when available and mentions findings in its summary; `/reconcile` treats them as work items.

### Format versioning and migration

- `manifest.json` records `artifactFormat` (absent = 1). Protocol 0.8.0-alpha defines format 2.
- `autonomos migrate [--dry-run]` upgrades format 1 → 2 mechanically: closes all closed tasks and issues, moves existing worklogs to `.autonomos/archive/worklogs-format-1/` so legacy examples leave the working directory, repairs references to moved files in Markdown across the project, records the batches in `archive/README.md` and sets `artifactFormat: 2`. It never deletes or rewrites record content.
- After migration, the agent runs `/reconcile` on the remaining `status` findings (AGENT.md budgets, open task entries, Current direction).
- `autonomos update` stays non-destructive and points to `migrate` when the format is outdated.

## Acceptance criteria

- Workflows stay ≤35 body lines; read-only authority is preserved.
- `close`, `migrate` and the new `status` findings have unit tests, including link repair, fenced code, nested headings, empty-section cleanup, dry-run and idempotence (a second `migrate` changes nothing).
- A copy of a large consumer project migrates without losing any task or issue ID (current + closed counts equal the original), and its current registries contain no closed record.
- Coordinated Core/CLI changeset; protocol version 0.8.0-alpha.

## Out of scope

Automatic semantic rewriting of AGENT.md or open tasks; deleting history;
duplicate-ID resolution (ISSUE-04); harness directory consolidation.
