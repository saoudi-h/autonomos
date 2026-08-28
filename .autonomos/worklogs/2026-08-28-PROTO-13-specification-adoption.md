# Worklog: PROTO-13 — Specification and decision-record adoption

- Date: 2026-08-28
- Status: complete
- Issue: ISSUE-01
- Protocol: 0.5.0-alpha

## What was done

- Added optional project-owned `.autonomos/specs/` and `.autonomos/decisions/` boundaries.
- Defined lightweight Markdown conventions for target behavior, acceptance criteria, decision rationale, alternatives, consequences, provenance, and replacement links.
- Chose `decision record` as the protocol term; documented ADR (Architecture Decision Record) as the common convention name rather than a required external schema.
- Added and distributed `/adopt`, an explicit and reviewable migration workflow that inventories legacy Markdown, proposes a source-to-destination map, waits for user confirmation, preserves sources by default, and never rewrites worklogs, issues, or tasks.
- Kept `/reconcile` focused on bounded audit and routed history extraction to `/adopt`; extended `/task`, `/issue`, and `/crystallize` with the new boundaries.
- Kept `init`, `update`, and integrity checks non-destructive for project-owned knowledge. Optional directories are first-use artifacts; the CLI installs and refreshes only managed protocol artifacts and workflows.
- Recorded the accepted target state in `specs/SPEC-001-project-knowledge-artifacts.md` and the rationale in `decisions/ADR-001-project-knowledge-and-adoption.md`.

## Key decisions and why

- Use a directory of one-file-per-bounded-record instead of a monolithic registry: it keeps scope, ownership, and review boundaries clear while remaining Markdown-first.
- Separate target state from rationale: specifications guide multiple tasks; decision records preserve one technical choice and its trade-offs.
- Make adoption a user-reviewed workflow rather than an automatic CLI migration: semantic classification, promotion, and cleanup cannot be inferred safely from a mechanical update.
- Keep extracted records `draft`/`proposed` until project governance accepts them; acceptance is distinct from implementation completion.

## Files modified

- Core protocol version, constants, template, workflow source, workflow tests, and package documentation.
- CLI workflow distribution/help and init/update/status regression tests.
- All supported installed workflow copies (`.agent`, `.agents`, `.claude`, `.clinerules`, and `.opencode`).
- Root guidance, README documentation, protocol manifest, ISSUE-01, PROTO-13, and the release changeset.

## Validation

- Core: 98 tests passed; CLI: 20 tests passed.
- Core and CLI lint and typecheck passed.
- Core and CLI builds passed; `dist/workflows/protocol-adopt.md` was present.
- `autonomos status` reported v0.5.0-alpha artifacts valid.
- All six distributed workflow target families matched the canonical Core sources.
- `git diff --check` passed. Targeted formatting passed for changed files except the pre-existing legacy style in `.autonomos/TASKS.md`.

## Next steps

- Release the coordinated Core/CLI changeset after review.
- Pilot `/adopt` on Herald and one older Autonomos consumer project; review whether the map, provenance, confidence, and confirmation steps are sufficient.
- Consider a parser or CLI-assisted adoption command only if pilots show repeated, deterministic value; do not expand the protocol contract ahead of evidence.
