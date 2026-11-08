---
"@autonomos/core": patch
"@autonomos/cli": patch
---

Align native slash command locations and agent skills directory bundles across AI harnesses.

- Distinguish flat command targets (e.g. `.claude/commands/`, `.opencode/commands/`, `.codex/prompts/`, `.agents/workflows/`) from directory-based skills targets (`.agents/skills/protocol-*/SKILL.md`).
- Add native prompt support for OpenAI Codex CLI in `.codex/prompts/`.
- Update Google Antigravity target to `.agents/workflows/` and shared `.agents/skills/`.
- Add automated migration in `autonomos update` to clean legacy flat files in `.agents/skills/` and migrate legacy `.agent/workflows/` without affecting custom tools or user project knowledge.
