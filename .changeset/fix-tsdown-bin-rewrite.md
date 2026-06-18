---
'@autonomos/cli': patch
---

fix(cli): do not let tsdown's `exports: true` rewrite the `bin` field on build

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
