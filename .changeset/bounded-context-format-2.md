---
'@autonomos/core': minor
'@autonomos/cli': minor
---

Introduce Protocol v0.8.0-alpha and artifact format 2 (SPEC-004): startup context
follows open work instead of project age.

- `TASKS.md` and `ISSUES.md` keep open work only; `autonomos close <ID>` moves
  finished tasks (adding `Completed:`) and resolved/declined issues intact to
  `.autonomos/archive/closed/`, repairing links. `--abandoned` closes unfinished work.
- `/crystallize` prescribes a fixed, bounded worklog shape (Outcome, Decisions,
  Validation, Open) and forbids modelling on existing worklogs; `AGENT.md` admission
  adds a cost criterion and size budgets; task entries are one line.
- `autonomos status` reports context-budget findings (advisory, `--strict` fails);
  `/session` surfaces them and `/reconcile` resolves them.
- `autonomos migrate [--dry-run]` upgrades format 1 → 2 without deleting content:
  closes finished records, moves legacy worklogs to `archive/worklogs-format-1/`,
  repairs Markdown references across the project and records `artifactFormat`.
  `update` points to it. Breaking: `generateWorklogContent` takes the new shape.
