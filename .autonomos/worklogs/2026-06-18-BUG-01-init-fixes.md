# WORKLOG: [BUG-01] Init git detection, bin name, update devDep refresh

**Date:** 2026-06-18
**Agent Status:** Complete

## 📝 Description

Fixed three user-reported bugs in `@autonomos/cli` that together made the published `0.2.0` package effectively unusable from a monorepo:

1. **Git detection from a subdirectory** — `init` only checked `cwd` for `.git`, so running it from a package inside a monorepo installed the protocol *inside the package* and then warned "No Git repository detected" because the surrounding monorepo's `.git/` was invisible.
2. **`pnpm autonomos` script did not work** — the package's `bin` field was named `cli`, so the npm script written by `init` (`pkg.scripts.autonomos = "autonomos"`) pointed at a binary that did not exist. `sh: @autonomos/cli: No such file or directory` on every run.
3. **Stale `^0.2.0` devDependency** — earlier published CLI builds pinned `@autonomos/cli@^0.2.0` in `devDependencies`, but no such version exists on the registry. `pnpm i` failed with `ERR_PNPM_NO_MATCHING_VERSION` and users could not recover without editing `package.json` by hand.

## 🛠 Technical Details

- **New module** `packages/core/src/parsers/project-root.ts`:
  - `findProjectRoot(startDir)` — walks up from a directory until it finds `.autonomos/` or `.git/`. Returns the first hit or `null`. Stops at the first hit to avoid leaking into a parent repo (e.g. nested worktrees).
  - `isSamePath(a, b)` — resolves `.` / `..` segments and compares.
  - `displayRelative(target, base)` — relative path that never returns a `..` prefix; falls back to an absolute path when the target is not under the base.
- **`init.ts` rewrite of the install-target resolution:**
  - `resolveInstallDir()` is now exported and pure (no `process.stdin` access inside) so it can be unit-tested.
  - Non-interactive mode (CI / no TTY): refuses with a clear "Cannot initialize from a subdirectory" message that points at the detected root and mentions `--force` / `AUTONOMOS_FORCE=1`.
  - Interactive TTY mode: prompts the user to confirm installing at the detected root.
  - `--force` flag and `AUTONOMOS_FORCE=1` env var: install at the detected root and emit a warning.
  - DevDependency handling distinguishes three cases and warns appropriately: fresh install, version bump from a stale pin, script-only update.
- **`update.ts` changes:**
  - Bubbles up to the project root via `findProjectRoot` (it is non-destructive, so we never refuse).
  - `refreshDevDependency()` bumps `@autonomos/cli` to the current CLI version when stale, so `pnpm i` recovers automatically.
  - New `--harness <name...>` and `--all` options: install workflow files for additional harnesses on an already-initialized project. This is the recommended path for adding `opencode` (or any other harness) without re-running `init`.
- **`agents.ts`:** replaced its local `findProjectRoot` with the shared one from `@autonomos/core`.
- **`packages/cli/package.json`:** changed `bin` from `cli` to `autonomos`. This is the actual fix for the `pnpm autonomos` failure — the npm script that `init` writes now resolves.
- **`packages/cli/src/index.ts`:** wired `--force` into `init`, `--harness` and `--all` into `update`, and updated help text.

## 🧪 Tests

- 15 new tests in `packages/core/src/parsers/project-root.test.ts` covering the monorepo walk-up, the monorepo + sub-package case, missing-marker fallback, input validation, and `displayRelative` edge cases.
- 9 new tests in `packages/cli/src/commands/init.test.ts` covering: in-place install at the root, refusal from a subdir in non-interactive mode, `AUTONOMOS_FORCE=1` override, `--force` flag, and the devDep bump from a stale `^0.2.0`.
- All 87 tests in the monorepo pass (78 core + 9 cli). Lint and typecheck are clean.

## ⏭ Next Steps / Context for Successor

- **BUG-02 (publish):** create a changeset and push so the changesets action can cut patch releases of `@autonomos/cli` and `@autonomos/core`. No protocol version bump — this is a CLI bugfix, not a protocol change.
- **AGENT.md lesson learned:** when the user asks to "adopt the protocol" (or any explicit protocol/methodology), follow it from the *first* turn of the session, not after being called out. See root `AGENT.md` for the new entry.
- **TEST-02 (integration tests):** some of the new `init.test.ts` cases cross the boundary between unit and integration. Once TEST-02 lands, consider promoting a subset of the `init.test.ts` scenarios into the integration suite.
- **Future hardening:** the `findProjectRoot` walk stops at the first `.git/` it finds. In a nested-worktree setup, that is correct; in a single-worktree case, it gives the same answer as `git rev-parse --show-toplevel`. If a user reports a false positive from a sibling repo, we may need to additionally check that the discovered root is an ancestor of the start dir.
