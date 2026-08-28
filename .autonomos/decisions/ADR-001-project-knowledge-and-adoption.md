# ADR-001 — Use optional Markdown records with explicit adoption

- Status: accepted
- Scope: Autonomos protocol knowledge lifecycle
- Provenance: [ISSUE-01](../ISSUES.md#issue-01) and [PROTO-13](../TASKS.md)
- Related specs: [SPEC-001](../specs/SPEC-001-project-knowledge-artifacts.md)
- Superseded by: none

## Context

Projects need durable product constraints, target behavior, and architectural
rationale that can guide more than one task. `AGENT.md` is operating guidance,
`TASKS.md` is execution state, issues are intake, and worklogs are historical
evidence. Unclassified Markdown in `docs/` or at the repository root is useful
but has no reliable protocol boundary. Existing projects also need a safe way to
organize that knowledge without rewriting their history.

## Decision

Use two optional, project-owned Markdown directories: `.autonomos/specs/` for
accepted target behavior and `.autonomos/decisions/` for one technical choice and
its rationale. Keep the records lightweight and human-readable; do not require a
parser or empty directories during initialization. Add `/adopt` as an explicit,
reviewable migration that proposes classification before writing and preserves
historical sources by default.

## Alternatives considered

- A single `SPECIFICATIONS.md` registry: simpler at first, but it combines unrelated boundaries and becomes a merge and discovery bottleneck.
- Automatic migration in `autonomos update`: convenient, but semantic classification and deletion are too risky for a non-interactive mechanical update.
- Reusing `AGENT.md`, `docs/`, or worklogs: avoids new paths but preserves the ambiguity that caused the issue.

## Consequences

- Agents have a predictable distinction between target state, rationale, guidance,
  execution, intake, and history.
- Existing projects get a deliberate adoption path, but migration still needs
  user review and does not promise to infer intent perfectly.
- The protocol stays Markdown-first and low-friction, while future parser or CLI
  support can be added only when real usage demonstrates the need.
