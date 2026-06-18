import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Regression test for BUG-02 (the tsdown `exports: true` regression that
 * silently rewrote the `bin` field on every build, causing 0.3.1 to ship
 * with `bin: cli` instead of `bin: automos`).
 *
 * Runs the real `pnpm run build` for the CLI package in a child process
 * (so any side effects on package.json are visible to us via a fresh
 * read) and asserts the `bin` field is preserved verbatim.
 *
 * If a future change to the tala-tools/tsdown base config re-enables
 * `exports: true` for this package, this test fails loudly.
 */
describe('cli build preserves the bin field', () => {
    it('does not rewrite the bin field of packages/cli/package.json', () => {
        const cliDir = join(__dirname, '..')
        const pkgPath = join(cliDir, 'package.json')

        // Sanity: the source must already have the correct bin. If a
        // developer reverts the fix locally, this test fails before
        // even running the build.
        const before = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
            bin?: Record<string, string>
        }
        expect(before.bin).toBeDefined()
        expect(Object.keys(before.bin ?? {})[0]).toBe('autonomos')

        // Run the real build in a child process. We don't care if it
        // succeeds — what matters is whether package.json was mutated.
        // Resolve `pnpm` from PATH (no .bin lookup) so the test is robust
        // to monorepo hoisting layouts.
        const pnpmBin = 'pnpm'

        const result = spawnSync(pnpmBin, ['run', 'build'], {
            cwd: cliDir,
            encoding: 'utf-8',
        })

        // Re-read the source package.json. If tsdown's `exports: true`
        // sneaks back in, it would have rewritten the `bin` field to
        // `cli` here.
        const after = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
            bin?: Record<string, string>
        }

        // We do not assert result.status === 0 on purpose: the goal is
        // to catch the bin regression, not to gate on the bundler.
        // If the build genuinely fails, other tests / CI will catch it.
        void result

        expect(after.bin).toBeDefined()
        expect(Object.keys(after.bin ?? {})[0]).toBe('autonomos')
    }, 60_000)
})
