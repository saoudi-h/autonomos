# SPEC-001 — Project-owned specifications and decision records

- Status: accepted
- Scope: Autonomos protocol artifacts and agent workflows
- Provenance: [ISSUE-01](../ISSUES.md#issue-01) and [PROTO-13](../TASKS.md)
- Related decisions: [ADR-001](../decisions/ADR-001-project-knowledge-and-adoption.md)
- Superseded by: none

## Intent

Give projects an optional, durable home for target behavior and technical
rationale without overloading operating guidance, execution state, or history.

## Requirements

- `.autonomos/specs/` contains one Markdown file per bounded target-state specification.
- `.autonomos/decisions/` contains one Markdown file per consequential technical choice.
- Both directories are optional, project-owned, and created on first approved use.
- Specifications and decision records expose status, scope, provenance, and links to related artifacts; specifications also expose acceptance criteria and decision records expose consequences.
- Only accepted records are normative. Draft/proposed records may inform exploration, and superseded records point to their successor.
- `autonomos init`, `autonomos update`, and integrity checks do not create, overwrite, or relocate these project-owned records.
- `/adopt` is an explicit, reviewable migration for legacy knowledge. It proposes a source-to-destination map, requires user confirmation before writes, preserves original sources by default, and never rewrites worklogs, issues, or tasks.

## Acceptance criteria

- A fresh `autonomos init` installs the protocol and workflows without creating empty `specs/` or `decisions/` directories.
- An update of an existing project refreshes managed protocol artifacts and workflows while preserving `AGENT.md`, `TASKS.md`, `ISSUES.md`, worklogs, specifications, decisions, and user documentation.
- The distributed `/adopt` workflow can route target requirements, decision rationale, stable guidance, and reference documentation separately.
- A user can inspect and approve the migration proposal before any project-owned knowledge is created or changed.

## Out of scope

- A parser, registry, database, automatic historical rewrite, or independent specification versioning scheme.
