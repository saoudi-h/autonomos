# RELEASE-04 — Native harness commands and skills layout alignment

## Authority and plan

Authorized by user to release coordinated patch updates for `@autonomos/core` and `@autonomos/cli`.

1. Align harness codes and targets to support native slash command directories (`.claude/commands`, `.opencode/commands`, `.codex/prompts`, `.agents/workflows`) alongside the universal Agent Skills directory standard (`.agents/skills/protocol-*/SKILL.md`).
2. Add automated migration in `autonomos update` to transition legacy layouts transparently.
3. Verify test suite, linters, types, and build artifacts.
4. Prepare Changeset, push branch, and create pull request.

## Outcomes

- Core and CLI test suites passing (111 core, 24 cli tests).
- Turbo lint and typecheck passing.
- Changeset registered in `.changeset/native-harness-skills-commands.md`.
