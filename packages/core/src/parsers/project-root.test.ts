import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { AUTONOMOS_DIR } from '../constants'
import { displayRelative, findProjectRoot, isSamePath } from './project-root'

/**
 * Build a small filesystem tree to exercise the project-root detection.
 *
 * Shape:
 *   root/
 *   ├── .git/                (optional, the monorepo marker)
 *   ├── .autonomos/          (optional, strong marker)
 *   ├── apps/
 *   │   └── web/             (deep subdirectory, no markers of its own)
 *   └── packages/
 *       └── ui/
 *
 * The helper returns the absolute path to the created root.
 */
function buildTree(
    opts: {
        git?: boolean
        autonomos?: boolean
        withNestedApp?: boolean
    } = {}
) {
    const { git = true, autonomos = false, withNestedApp = true } = opts
    const root = mkdtempSync(join(tmpdir(), 'autonomos-root-'))

    if (git) mkdirSync(join(root, '.git'))
    if (autonomos) mkdirSync(join(root, AUTONOMOS_DIR))

    if (withNestedApp) {
        mkdirSync(join(root, 'apps', 'web', 'components', 'ui'), { recursive: true })
        mkdirSync(join(root, 'packages', 'ui'), { recursive: true })
        writeFileSync(join(root, 'apps', 'web', 'components', 'ui', 'button.tsx'), '// button\n')
    }

    return root
}

describe('findProjectRoot', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
    })

    describe('basic discovery', () => {
        it('returns the root when called from the root', () => {
            root = buildTree()
            expect(findProjectRoot(root)).toBe(root)
        })

        it('returns the root when called from a deeply nested subdirectory', () => {
            root = buildTree()
            const deep = join(root, 'apps', 'web', 'components', 'ui')
            expect(findProjectRoot(deep)).toBe(root)
        })

        it('returns the root when called from a sibling subdirectory', () => {
            root = buildTree()
            const sibling = join(root, 'packages', 'ui')
            expect(findProjectRoot(sibling)).toBe(root)
        })
    })

    describe('marker priority', () => {
        it('stops at the first .autonomos directory encountered', () => {
            root = buildTree({ autonomos: true, git: true })
            // Even though .git is also a valid marker, .autonomos should win
            // because we stop at the first hit walking upward.
            const deep = join(root, 'apps', 'web')
            expect(findProjectRoot(deep)).toBe(root)
        })

        it('returns null when no marker is reachable from the start dir', () => {
            root = buildTree({ git: false, withNestedApp: false })
            expect(findProjectRoot(root)).toBeNull()
        })
    })

    describe('input validation', () => {
        it('returns null for an empty string', () => {
            expect(findProjectRoot('')).toBeNull()
        })

        it('returns null for a directory that does not exist', () => {
            root = buildTree({ git: false, withNestedApp: false })
            const ghost = join(root, 'definitely', 'not', 'there')
            expect(findProjectRoot(ghost)).toBeNull()
        })
    })

    describe('monorepo scenario', () => {
        it('finds the monorepo root from a package directory, not the package itself', () => {
            root = buildTree()
            // Simulate a sub-package that has its own package.json but no
            // .git / .autonomos of its own. The detection must bubble up to
            // the monorepo root, otherwise init would install inside the
            // package by mistake.
            const pkgDir = join(root, 'packages', 'ui')
            mkdirSync(pkgDir, { recursive: true })
            writeFileSync(join(pkgDir, 'package.json'), '{}\n')

            expect(findProjectRoot(pkgDir)).toBe(root)
        })
    })
})

describe('isSamePath', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
    })

    it('returns true for two equal absolute paths', () => {
        root = buildTree({ git: false, withNestedApp: false })
        expect(isSamePath(root, root)).toBe(true)
    })

    it('returns true when one path contains redundant segments', () => {
        root = buildTree({ git: false, withNestedApp: false })
        expect(isSamePath(root, join(root, '.'))).toBe(true)
        expect(isSamePath(root, join(root, 'apps', '..'))).toBe(true)
    })

    it('returns false for two different directories', () => {
        root = buildTree({ git: false, withNestedApp: false })
        expect(isSamePath(root, join(root, 'apps'))).toBe(false)
    })

    it('returns false for empty inputs', () => {
        expect(isSamePath('', '/a')).toBe(false)
        expect(isSamePath('/a', '')).toBe(false)
    })
})

describe('displayRelative', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
    })

    it('renders the root itself as "."', () => {
        root = buildTree({ git: false, withNestedApp: false })
        expect(displayRelative(root, root)).toBe('.')
    })

    it('renders a nested directory relative to the root', () => {
        root = buildTree({ git: false, withNestedApp: false })
        const nested = join(root, 'apps', 'web')
        expect(displayRelative(nested, root)).toBe('apps/web')
    })

    it('falls back to the absolute path when the target is not under the base', () => {
        root = buildTree({ git: false, withNestedApp: false })
        const outside = '/tmp/elsewhere'
        expect(displayRelative(outside, root)).toBe(outside)
    })
})
