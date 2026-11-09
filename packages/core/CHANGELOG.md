# @autonomos/core

## 0.8.4

### Patch Changes

- [#24](https://github.com/saoudi-h/autonomos/pull/24) [`59a7818`](https://github.com/saoudi-h/autonomos/commit/59a78181303f0a7b7407a2e726e49827d48ef944) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Record loss counts text kept in an archived record with the same ID or a worklog named for that ID, and no longer treats an untracked moved file as new text, so `status` gives the same verdict before and after commit. `migrate` prints every follow-up ID and `status --history` lists closed records that still mention unfinished work. Next steps say to mark the task `[x]` before `close` and to track findings that need an owner decision in an open task.

## 0.8.3

### Patch Changes

- [#22](https://github.com/saoudi-h/autonomos/pull/22) [`a7a9644`](https://github.com/saoudi-h/autonomos/commit/a7a9644e2f7ef77fa2de9d66014cde0a7a05081d) Thanks [@saoudi-h](https://github.com/saoudi-h)! - `migrate` ends with numbered next steps (follow-ups, remaining findings to resolve with `/reconcile` in the same task, recording the upgrade, `status --strict`). `status` notes a change since `HEAD` (or `--since <rev>`) that adds or moves no task, writes no worklog and closes nothing.

## 0.8.2

### Patch Changes

- [#20](https://github.com/saoudi-h/autonomos/pull/20) [`051d95a`](https://github.com/saoudi-h/autonomos/commit/051d95ad8d0efef5e0eaf25480c5ba9b01171426) Thanks [@saoudi-h](https://github.com/saoudi-h)! - `status` reports tasks and issues removed or shortened since `HEAD` (or `--since <rev>`) whose content lands neither in the change nor in the files they link to; `--strict` fails on them. Workflows say a clean status checks structure, not completion, and never to delete content to satisfy a finding. `migrate` recognizes reworded archive index lines, no longer prints "format 2 to 2", and shows the linked-worktree note only when upgrading.

## 0.8.1

### Patch Changes

- [#17](https://github.com/saoudi-h/autonomos/pull/17) [`cee0646`](https://github.com/saoudi-h/autonomos/commit/cee0646d1db2b757ccab6bbdc5f53f4cb26820d1) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Close the gaps found when agents migrated real projects to format 2: `migrate` moves checked items without an ID tag, keeps git-ignored worklogs ignored, quarantines legacy worklogs merged in later from other checkouts and lists closed records that still mention unfinished work; `close` groups same-day closures under one `Closed <date>` heading instead of appending under the last migration batch; workflows tell agents to use the project's own CLI and to proceed on delegated plans.

## 0.8.0

### Minor Changes

- [#15](https://github.com/saoudi-h/autonomos/pull/15) [`c584df4`](https://github.com/saoudi-h/autonomos/commit/c584df4bb36e91f81cf721fbce480dc4fa83044a) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Introduce Protocol v0.8.0-alpha and artifact format 2 (SPEC-004): startup context
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

## 0.7.1

### Patch Changes

- [#13](https://github.com/saoudi-h/autonomos/pull/13) [`1b472db`](https://github.com/saoudi-h/autonomos/commit/1b472db932dc74420204cee0ba89e9b68b405962) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Align native slash command locations and agent skills directory bundles across AI harnesses.
    - Distinguish flat command targets (e.g. `.claude/commands/`, `.opencode/commands/`, `.codex/prompts/`, `.agents/workflows/`) from directory-based skills targets (`.agents/skills/protocol-*/SKILL.md`).
    - Add native prompt support for OpenAI Codex CLI in `.codex/prompts/`.
    - Update Google Antigravity target to `.agents/workflows/` and shared `.agents/skills/`.
    - Add automated migration in `autonomos update` to clean legacy flat files in `.agents/skills/` and migrate legacy `.agent/workflows/` without affecting custom tools or user project knowledge.

## 0.7.0

### Minor Changes

- [`42e607f`](https://github.com/saoudi-h/autonomos/commit/42e607f0eb2218462b9e8507d7e4350874132354) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Introduce Protocol v0.7.0-alpha with evidence-aware archival in `/reconcile`,
  claim-level knowledge consolidation in `/crystallize`, scoped history discovery
  and current-context continuity. Keep archives project-owned and first-use only;
  installation/update never move historical records automatically.

    Add `readTaskRegistry` and metadata-independent task-ID references for current
    and archived registries. Add `status --history` with separate historical counts,
    collision diagnostics and explicit incomplete reads. Current reporting recognizes
    legacy metadata-free IDs and excludes fenced examples; the detailed task-parser
    API is unchanged. Prepare both packages together so the published CLI pins the
    matching Core artifact set.

## 0.6.0

### Minor Changes

- [`f20d396`](https://github.com/saoudi-h/autonomos/commit/f20d3962df53f4262eac482ab14908c22a465b8a) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Add the optional `/design` protocol workflow for project-specific visual and interaction direction, critique, rendered evidence, and reviewable design-knowledge extraction.

## 0.5.0

### Minor Changes

- [#9](https://github.com/saoudi-h/autonomos/pull/9) [`ab95834`](https://github.com/saoudi-h/autonomos/commit/ab95834b8d3226758ec0cbd1a53e9601a6eaa691) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Add optional project-owned specifications and decision records with a reviewable adoption workflow.

## 0.4.0

### Minor Changes

- [`6fb0402`](https://github.com/saoudi-h/autonomos/commit/6fb04020b8b3b3579b054e319cca99738c80f26c) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Release Protocol v0.4 with intent-first sessions, explicit user-authority boundaries,
  durable-memory routing, optional issue intake, evidence-aware reconciliation, and
  versioned protocol artifact integrity checks.

## 0.3.3

### Patch Changes

- Synchronize installed workflow files and CLI metadata during updates, even
  when the protocol version is already current. Bump the Agent Protocol to
  v0.3.1-alpha.

## 0.3.2

### Patch Changes

- Preserve the substantive answer to the user's original request before adding
  the crystallization handoff at the end of a session.

## 0.3.1

### Patch Changes

- [`ed21d83`](https://github.com/saoudi-h/autonomos/commit/ed21d83a0d428397e1d5e6a613c2848bc279023a) Thanks [@saoudi-h](https://github.com/saoudi-h)! - fix(cli): detect project root by walking up to `.git` / `.autonomos` instead of only checking cwd

    The `init`, `update`, and `agents` commands now share a `findProjectRoot` helper from `@autonomos/core`. When run from a subdirectory inside a git repo (e.g. a monorepo package), `init` now:
    - detects the actual project root,
    - refuses to install in the subdirectory with a clear error message pointing at the root,
    - accepts an explicit `AUTONOMOS_FORCE=1` escape hatch for non-interactive contexts that really do want to install where they stand.

    fix(cli): expose the `autonomos` binary

    The published `bin` field was named `cli`, so `pnpm autonomos` (the npm script written by `init`) failed with `sh: @autonomos/cli: No such file or directory`. The package now exposes a binary literally called `autonomos`, so the registered script works as intended.

    fix(cli): `update` now refreshes the `@autonomos/cli` devDependency version and supports adding harnesses

    When a project was initialized with an older CLI (e.g. `^0.2.0` from the previously published build, which has no matching version on the registry), running `autonomos update` now also bumps the devDependency to the current CLI version. `update` additionally accepts `--harness` / `--all` so users can install workflow files for a new harness (e.g. OpenCode) on an already-initialized project without re-running `init`.

## 0.3.0

### Minor Changes

- [`55ddd2a`](https://github.com/saoudi-h/autonomos/commit/55ddd2a787b93c7275e6da2f734f33d8fbef34b0) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Refactor Agent Protocol to version 0.3.0-alpha.
    - Eliminate duplication in PROTOCOL.md template (making it a reference doc).
    - Shorten workflows (session, task, crystallize) to under 30 lines.
    - Improve the update command to automatically update workflow files in active harnesses.
    - Allow safe initialization of workflows in already-initialized projects.

## 0.0.2

### Patch Changes

- [`524e236`](https://github.com/saoudi-h/autonomos/commit/524e2363082b9d91f0e540456b45d9dec41e3cbc) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Improve package metadata and licensing
