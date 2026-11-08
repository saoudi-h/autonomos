# PROJECT ISSUES & PROPOSALS

## [ISSUE-04] Duplicate task IDs have no enforcement or sanctioned resolution path

- **Type:** problem
- **Status:** open
- **Evidence:** A consumer project (commerce, protocol 0.7.0-alpha) has three task
  IDs reused across unrelated completed tasks in its current `TASKS.md`: `OPS-01`
  (BuildKit cache, and a Chatwoot install), `PERF-09` (storefront rendering audit,
  and the product-route `instant-shell-url-data` warning), and `SEC-02` (Meilisearch
  sync key, and production secret rotation). Their worklogs reuse the same IDs in
  filenames. `readTaskRegistry` and `status` already return `duplicateIds` /
  `duplicateTaskIds` by default, yet nothing fails, warns in the workflows, or
  prompts resolution. The protocol's ID rule (Archived IDs remain reserved; search
  before assigning) is guidance only.
- **Impact:** References such as `[PERF-09]` in `ISSUES.md` and worklog links resolve
  to more than one task. Agents can attach evidence to the wrong task. The protocol
  forbids rewriting historical identifiers and archival is "move, not rewrite", so a
  consumer that wants to fix an existing duplicate has no documented non-destructive
  procedure and must invent one locally.
- **Desired outcome:** Duplicate IDs are caught where they are introduced (intake,
  task creation, or the pre-commit/`status` path) with a clear non-zero or blocking
  signal. Existing duplicates in a consumer project have a documented resolution that
  keeps historical evidence and filenames intact (for example, a disambiguating alias
  recorded in the registry, with the reassignment noted in the task body).
- **Constraints:** Keep the design Markdown-first and tool-neutral. Any new check must
  remain optional for projects without the CLI. No historical rewrite or automatic
  renaming of archived or completed work.
- **Related:** SPEC-003 (archived IDs remain reserved; `status --history` duplicate
  reporting); PROTO-14; `packages/core/src/parsers/task-registry.ts`;
  `packages/cli/src/commands/status.ts`; commerce `.autonomos/TASKS.md` (lines 29,
  112, 113, 133, 172, 223).
- **Tasks:** none

## [ISSUE-05] Current context and session records grow without bound in consumer projects

- **Type:** problem
- **Status:** accepted
- **Evidence:** Cross-project review on 2026-11-08 (22 consumer repositories).
  Postdot `TASKS.md` is 213 KB with 377 of 379 tasks completed, read in full by
  `/session` (≈60k tokens before work); it was archived on 2026-11-02 and regrew
  within a week. Commerce 84/90, infra 95/101 and solar-icons 131/147 tasks are
  completed. Task entries average 515 characters in Postdot (max 2,835) and repeat
  worklog evidence; issues accumulate dated "Progress" paragraphs (Postdot
  ISSUE-188 has ten). `ISSUES.md` reaches 206 KB (Postdot) and 140 KB (commerce),
  read in full by `/issue`. Infra's root `AGENT.md` is 51 KB with 121 "Lessons
  Learned" bullets loaded for every task. Postdot worklogs grew from 4.3 KB average
  (September) to 7.9 KB (November) with no matching rise in task size; a test-only
  S task (WEB-607) produced 2.5 KB of narrative. Infra and communications remain on
  protocol 0.4, solar-icons on 0.6. `autonomos update` replaces workflows only, so
  legacy records stay beside new rules and serve as the examples agents imitate.
- **Impact:** Bootstrap cost scales with project age instead of open work; output
  tokens are spent on narrative nobody reads; guidance relevant to a task is diluted
  by unrelated history; a new protocol version is undermined by legacy examples.
- **Desired outcome:** Startup context is bounded by construction, not by agent
  discipline. Closing work removes it from current registries mechanically. Session
  records keep only what outlives the session, proportionate to the work. Each
  artifact-format change ships a migration that quarantines legacy examples.
  Budget drift is visible through `autonomos status`.
- **Related:** ISSUE-03 / SPEC-003 (superseded in part by SPEC-004); ISSUE-04.
- **Tasks:** PROTO-15 (done), PROTO-16, PROTO-17 (done) — owner accepted the direction on 2026-11-08; SPEC-004.
