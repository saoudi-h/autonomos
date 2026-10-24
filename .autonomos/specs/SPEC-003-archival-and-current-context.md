# SPEC-003 — Archival and bounded current context

- Status: accepted
- Scope: protocol doctrine, workflows, archive discovery and CLI task reporting
- Provenance: owner acceptance of the archival proposal on 2026-10-24; ISSUE-03
- Related tasks: PROTO-14

## Intent

Current context supports ordinary project work without historical archives.
Archives preserve evidence and chronology for justified, targeted investigation.
The agent exercises judgment; tools check mechanical properties rather than
deciding that knowledge is obsolete.

## Requirements

- Extend `/reconcile`; introduce no cleanup workflow, Sprint object, timer or mandatory archive infrastructure.
- Archive settled completed or explicitly abandoned work only after current outcomes, applicable constraints, dependencies and next actions remain discoverable. Abandoned is not completed.
- Judge task and parent-issue acceptance independently. Dates, checkboxes and absent code alone do not establish eligibility. Record new completion dates without inventing old ones.
- Preserve accepted unimplemented requirements, applicable decisions and active temporary directives independently of execution history.
- Reconcile individual claims, retaining valid parts of mixed historical/current paragraphs. Consolidate existing knowledge at its narrowest home rather than append a duplicate or invent a broader prohibition.
- Keep task progress in task/state records, guidance in AGENT.md, rationale in decisions, target requirements in specs, and chronology in worklogs. Optional Current direction in TASKS.md is rewritten, not appended as a journal.
- Batch archival at coherent completed-work boundaries; do not automatically reorganize history after every task. Correct established in-scope drift proactively during normal work.
- Create `.autonomos/archive/README.md` and named batch directories only on first use. Batches may contain TASKS.md, ISSUES.md and worklogs; group/split by meaningful scope as needed. No mandatory per-record metadata or date-based partitions.
- Move historical record content intact except necessary reference-path repairs; preserve source provenance, IDs and evidence. Current-guidance corrections do not rewrite historical conclusions. Existing extraction into new specs/decisions still uses `/adopt`.
- Discover by batch topic and ID without loading history at bootstrap. Avoid permanent per-completion stubs. Archived IDs remain reserved; current dependencies retain only necessary outcome/reference information.
- Check exact source text, relative links, retained current context and convergence before reporting completion. Re-read immediately before shared-file mutations; do not overwrite unrelated concurrent changes or expand into host secrets/production without authority.
- `status` reports only the current registry by default; `--history` adds a separate historical summary and reports unreadable history or duplicate task IDs. Provide a reusable reader across current/archive task registries for ID discovery.
- `init`, `update` and integrity checks do not create, overwrite, relocate or classify project-owned archives as managed artifacts. Installation performs no automatic archival.

## Acceptance criteria

- Workflow artifacts remain at most 35 body lines and preserve read-only authority.
- Default status never reads archives; explicit history includes only archive TASKS.md registries, handles missing archives and does not follow symbolic links.
- Task counts remain separated; duplicate IDs and incomplete reads are visible, not silently treated as complete history.
- Fresh initialization creates no empty archive. Initialization/update preserve existing archive bytes.
- The distributed artifact set has a new protocol version and a coordinated Core/CLI changeset.
- Regression checks and a packaged init/update/status smoke test pass.
- A public-safe research summary and repeatable fictional fixture retain lessons from the 18 exploratory runs; no claim of model ranking or guaranteed semantic accuracy.

## Out of scope

Automatic semantic archiver, bulk consumer migration, new task-status alphabet,
production access, scheduled maintenance, archive database, remote publication.
