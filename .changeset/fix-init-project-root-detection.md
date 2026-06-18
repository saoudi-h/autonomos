---
'@autonomos/cli': patch
'@autonomos/core': patch
---

fix(cli): detect project root by walking up to `.git` / `.autonomos` instead of only checking cwd

The `init`, `update`, and `agents` commands now share a `findProjectRoot` helper from `@autonomos/core`. When run from a subdirectory inside a git repo (e.g. a monorepo package), `init` now:
- detects the actual project root,
- refuses to install in the subdirectory with a clear error message pointing at the root,
- accepts an explicit `AUTONOMOS_FORCE=1` escape hatch for non-interactive contexts that really do want to install where they stand.

fix(cli): expose the `autonomos` binary

The published `bin` field was named `cli`, so `pnpm autonomos` (the npm script written by `init`) failed with `sh: @autonomos/cli: No such file or directory`. The package now exposes a binary literally called `autonomos`, so the registered script works as intended.

fix(cli): `update` now refreshes the `@autonomos/cli` devDependency version and supports adding harnesses

When a project was initialized with an older CLI (e.g. `^0.2.0` from the previously published build, which has no matching version on the registry), running `autonomos update` now also bumps the devDependency to the current CLI version. `update` additionally accepts `--harness` / `--all` so users can install workflow files for a new harness (e.g. OpenCode) on an already-initialized project without re-running `init`.
