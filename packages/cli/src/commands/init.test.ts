import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { init, resolveInstallDir } from './init'

/**
 * Build a minimal project tree:
 *
 *   root/
 *   ├── .git/                 (optional, the monorepo marker)
 *   └── packages/
 *       └── ui/               (a "sub-package" with no markers of its own)
 */
function buildTree(opts: { git?: boolean; withPackage?: boolean } = {}) {
    const { git = true, withPackage = true } = opts
    const root = mkdtempSync(join(tmpdir(), 'autonomos-init-'))
    if (git) mkdirSync(join(root, '.git'))
    if (withPackage) mkdirSync(join(root, 'packages', 'ui'), { recursive: true })
    return root
}

describe('resolveInstallDir', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
        delete process.env.AUTONOMOS_FORCE
    })

    it('returns cwd when called from the project root', async () => {
        root = buildTree()
        const result = await resolveInstallDir(root, {
            force: false,
            noPrompt: true,
            isInteractive: false,
        })
        expect(result.installDir).toBe(root)
        expect(result.abort).toBeUndefined()
    })

    it('refuses to install from a subdirectory in non-interactive mode', async () => {
        root = buildTree()
        const subdir = join(root, 'packages', 'ui')
        const result = await resolveInstallDir(subdir, {
            force: false,
            noPrompt: true,
            isInteractive: false,
        })
        expect(result.abort).toBeDefined()
        expect(result.abort?.message).toMatch(/project root/i)
        expect(result.abort?.message).toContain(root)
        expect(result.abort?.message).toMatch(/--force|AUTONOMOS_FORCE/)
    })

    it('installs at the detected root when --force is passed', async () => {
        root = buildTree()
        const subdir = join(root, 'packages', 'ui')
        const result = await resolveInstallDir(subdir, {
            force: true,
            noPrompt: true,
            isInteractive: false,
        })
        expect(result.installDir).toBe(root)
        expect(result.abort).toBeUndefined()
        expect(result.warnings.join('\n')).toMatch(/Detected project root/)
    })

    it('installs at the detected root when AUTONOMOS_FORCE=1 is set', async () => {
        root = buildTree()
        const subdir = join(root, 'packages', 'ui')
        process.env.AUTONOMOS_FORCE = '1'
        const result = await resolveInstallDir(subdir, {
            force: false,
            noPrompt: true,
            isInteractive: false,
        })
        expect(result.installDir).toBe(root)
        expect(result.abort).toBeUndefined()
    })

    it('installs in place when no project root can be found', async () => {
        root = buildTree({ git: false, withPackage: false })
        const result = await resolveInstallDir(root, {
            force: false,
            noPrompt: true,
            isInteractive: false,
        })
        expect(result.installDir).toBe(root)
        expect(result.abort).toBeUndefined()
        expect(result.warnings.join('\n')).toMatch(/No Git repository detected/)
    })
})

describe('init', () => {
    let root: string
    const originalForce = process.env.AUTONOMOS_FORCE

    beforeEach(() => {
        process.env.AUTONOMOS_FORCE = originalForce
    })

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
        if (originalForce === undefined) delete process.env.AUTONOMOS_FORCE
        else process.env.AUTONOMOS_FORCE = originalForce
    })

    it('initializes in the project root when called from the root', async () => {
        root = buildTree()
        const result = await init({
            cwd: root,
            noPrompt: true,
            noInstall: true,
            harnesses: ['claude-code'],
            interactiveOverride: false,
        })
        expect(result.success).toBe(true)
        expect(existsSync(join(root, '.autonomos', 'manifest.json'))).toBe(true)
        expect(existsSync(join(root, 'AGENT.md'))).toBe(true)
        expect(existsSync(join(root, '.claude', 'skills', 'session.md'))).toBe(true)
    })

    it('refuses to install from a subdirectory in non-interactive mode', async () => {
        root = buildTree()
        const subdir = join(root, 'packages', 'ui')
        const result = await init({
            cwd: subdir,
            noPrompt: true,
            noInstall: true,
            harnesses: ['claude-code'],
            interactiveOverride: false,
        })
        expect(result.success).toBe(false)
        expect(result.message).toMatch(/project root/i)
        // The subdir must remain untouched: no .autonomos inside the package.
        expect(existsSync(join(subdir, '.autonomos'))).toBe(false)
    })

    it('installs at the project root when AUTONOMOS_FORCE=1 is set', async () => {
        root = buildTree()
        const subdir = join(root, 'packages', 'ui')
        process.env.AUTONOMOS_FORCE = '1'
        const result = await init({
            cwd: subdir,
            noPrompt: true,
            noInstall: true,
            harnesses: ['claude-code'],
            interactiveOverride: false,
        })
        expect(result.success).toBe(true)
        // The protocol lives at the root, not the subdir.
        expect(existsSync(join(root, '.autonomos', 'manifest.json'))).toBe(true)
        expect(existsSync(join(subdir, '.autonomos'))).toBe(false)
    })

    it('bumps the @autonomos/cli devDependency to the current CLI version', async () => {
        root = buildTree()
        // Pre-existing package.json pinned to a stale version (the
        // 0.2.0 / 0.1.x versions that were published before the bin
        // name fix). init should overwrite it.
        const pkgPath = join(root, 'package.json')
        writeFileSync(
            pkgPath,
            JSON.stringify({ name: 'fixture', devDependencies: { '@autonomos/cli': '^0.2.0' } })
        )
        const result = await init({
            cwd: root,
            noPrompt: true,
            noInstall: false,
            harnesses: ['claude-code'],
            interactiveOverride: false,
        })
        expect(result.success).toBe(true)
        const updated = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        // The current CLI_VERSION (from the local package.json) is 0.3.0;
        // we don't want to hardcode that here, so we just assert that
        // the new spec is not the old stale one and that it starts with ^.
        expect(updated.devDependencies['@autonomos/cli']).toMatch(/^\^/)
        expect(updated.devDependencies['@autonomos/cli']).not.toBe('^0.2.0')
        expect(result.warnings.join('\n')).toMatch(/Bumped @autonomos\/cli/)
    })
})
