# @autonomos/cli

## 0.3.2

### Patch Changes

- [`adf5f0b`](https://github.com/saoudi-h/autonomos/commit/adf5f0b201275e511c61ed5d7f9ffd31474b68ae) Thanks [@saoudi-h](https://github.com/saoudi-h)! - fix(cli): do not let tsdown's `exports: true` rewrite the `bin` field on build

    The `@tala-tools/tsdown` base config enables `exports: true`, which
    silently rewrites the `bin` field of this package's `package.json` on
    every build. Because the cli has a hand-crafted `exports` block (and no
    need for tsdown to auto-generate one), we override the base config to
    `exports: false` for this package only.

    Without this override, the published `0.3.1` shipped with
    `"bin": { "cli": "./dist/index.mjs" }` even though the source had
    `"bin": { "autonomos": "./dist/index.mjs" }`. The npm script that
    `autonomos init` writes (`"autonomos": "autonomos"`) then failed at
    runtime with `sh: autonomos: command not found`.

    A regression test (`tsdown-bin-regression.test.ts`) is added that runs
    the real build in a child process and asserts the `bin` field is
    preserved verbatim. If a future change re-enables `exports: true` for
    this package, the test fails loudly.

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

- Updated dependencies [[`ed21d83`](https://github.com/saoudi-h/autonomos/commit/ed21d83a0d428397e1d5e6a613c2848bc279023a)]:
    - @autonomos/core@0.3.1

## 0.3.0

### Minor Changes

- [`55ddd2a`](https://github.com/saoudi-h/autonomos/commit/55ddd2a787b93c7275e6da2f734f33d8fbef34b0) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Refactor Agent Protocol to version 0.3.0-alpha.
    - Eliminate duplication in PROTOCOL.md template (making it a reference doc).
    - Shorten workflows (session, task, crystallize) to under 30 lines.
    - Improve the update command to automatically update workflow files in active harnesses.
    - Allow safe initialization of workflows in already-initialized projects.

### Patch Changes

- Updated dependencies [[`55ddd2a`](https://github.com/saoudi-h/autonomos/commit/55ddd2a787b93c7275e6da2f734f33d8fbef34b0)]:
    - @autonomos/core@0.3.0

## 0.0.3

### Patch Changes

- [`12ffbab`](https://github.com/saoudi-h/autonomos/commit/12ffbab3879fc4defa7a2e1b9fa7119e2f391a61) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Improve agent tree visualization with proper hierarchy

## 0.0.2

### Patch Changes

- [`524e236`](https://github.com/saoudi-h/autonomos/commit/524e2363082b9d91f0e540456b45d9dec41e3cbc) Thanks [@saoudi-h](https://github.com/saoudi-h)! - Improve package metadata and licensing

- Updated dependencies [[`524e236`](https://github.com/saoudi-h/autonomos/commit/524e2363082b9d91f0e540456b45d9dec41e3cbc)]:
    - @autonomos/core@0.0.2
