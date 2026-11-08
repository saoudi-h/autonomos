# WORKLOG: [PROTO-04] Protocol v0.3 refactoring

**Date:** 2026-06-13
**Agent Status:** Complete

## 📝 Description

Major protocol refactoring from v0.2-alpha to v0.3-alpha. Applied the 7 recommendations from the critical review to fix the core structural issues:

1. **Eliminated duplication** — PROTOCOL.md no longer contains workflow steps (Phase 1/2/3 removed). It is now a compact quick-reference (~50 lines) that points to the 3 workflow files as the executable contract.
2. **Shortened all workflows** — Each workflow is now ≤30 lines (excluding frontmatter). Instructions are 100% imperative with no justifications.
3. **Fixed path inconsistencies** — All references now use `.autonomos/` consistently. The deployed PROTOCOL.md was regenerated from the template.
4. **Simplified local AGENT.md** — Added `generateLocalAgentTemplate()` to agent.ts for minimal 4-line subdirectory AGENT.md files.
5. **Promoted `find` as primary discovery method** — Workflows no longer depend on `@autonomos/cli` for AGENT.md discovery. `find . -name AGENT.md` is method #1.
6. **Created missing fractal AGENT.md** — `packages/core/AGENT.md` now exists with practical conventions.
7. **Updated tests** — 21 new test assertions covering v0.3 design invariants (no duplication, self-directed crystallization, find-based discovery, brevity limits).

## 🛠 Technical Details

- **Files Modified:**
  - `packages/core/src/constants.ts` — version bump to 0.3.0-alpha
  - `packages/core/src/templates/protocol.ts` — complete rewrite
  - `packages/core/src/templates/agent.ts` — added `generateLocalAgentTemplate()`
  - `packages/core/src/workflows/protocol-session.md` — rewritten (51→28 lines)
  - `packages/core/src/workflows/protocol-task.md` — rewritten (41→26 lines)
  - `packages/core/src/workflows/protocol-crystallize.md` — rewritten (51→30 lines)
  - `packages/core/src/workflows/protocol-workflows.test.ts` — complete rewrite
  - `.autonomos/PROTOCOL.md` — regenerated from new template
  - `.autonomos/manifest.json` — version bump + lastUpdated
  - `.autonomos/TASKS.md` — added PROTO-04

- **Files Created:**
  - `packages/core/AGENT.md` — fractal context for the core package

- **Key Decisions:**
  - PROTOCOL.md is now a reference doc, not an executable contract. Workflows are the contract.
  - `find` replaces CLI dependency in all workflows. CLI `autonomos agents` remains available but is not required.
  - Brevity tests (≤35 lines per workflow) enforce the compactness invariant going forward.

## ⏭ Next Steps / Context for Successor

- The `AGENT.md` root should be updated to reflect that the protocol is now v0.3
- Consider adding a `packages/vitest/AGENT.md` for completeness
- The `v0.2-alpha-review.md` at project root is now outdated and could be moved to `docs/` or archived
- The `feedback/feedback-agency-1.md` suggestions (e.g., `[?]` status for Awaiting Review) were not implemented in v0.3 — they could be reconsidered for v0.4
- Run the protocol in real conditions (on a different project) to validate the brevity and clarity improvements
