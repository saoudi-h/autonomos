import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { findAncestorAgents } from './agent-finder'

/**
 * Build a temporary project tree shaped like a monorepo:
 *
 *   root/
 *   ├── AGENT.md                    (always present)
 *   ├── apps/
 *   │   ├── AGENT.md                (present in some tests)
 *   │   └── web/
 *   │       ├── AGENT.md
 *   │       └── components/
 *   │           └── ui/
 *   │               └── button.tsx  (a file target)
 *   └── packages/
 *       └── ui/
 *           └── AGENT.md
 *
 * Each test can opt to skip writing certain AGENT.md files.
 */
function buildTree(
    opts: {
        rootAgent?: boolean
        appsAgent?: boolean
        appsWebAgent?: boolean
        appsComponentsAgent?: boolean
        appsWebComponentsUiAgent?: boolean
        packagesUiAgent?: boolean
    } = {}
) {
    const {
        rootAgent = true,
        appsAgent = false,
        appsWebAgent = true,
        appsComponentsAgent = false,
        appsWebComponentsUiAgent = false,
        packagesUiAgent = true,
    } = opts
    const projectRoot = mkdtempSync(join(tmpdir(), 'autonomos-finder-'))

    const write = (relPath: string, content = '# agent\n') => {
        const abs = join(projectRoot, relPath)
        mkdirSync(join(abs, '..'), { recursive: true })
        writeFileSync(abs, content)
    }

    // Always create the directory tree
    mkdirSync(join(projectRoot, 'apps/web/components/ui'), { recursive: true })
    mkdirSync(join(projectRoot, 'packages/ui'), { recursive: true })
    writeFileSync(join(projectRoot, 'apps/web/components/ui/button.tsx'), '// button\n')

    if (rootAgent) write('AGENT.md')
    if (appsAgent) write('apps/AGENT.md')
    if (appsWebAgent) write('apps/web/AGENT.md')
    if (appsComponentsAgent) write('apps/web/components/AGENT.md')
    if (appsWebComponentsUiAgent) write('apps/web/components/ui/AGENT.md')
    if (packagesUiAgent) write('packages/ui/AGENT.md')

    return projectRoot
}

describe('findAncestorAgents', () => {
    let projectRoot: string

    afterEach(() => {
        if (projectRoot) rmSync(projectRoot, { recursive: true, force: true })
    })

    describe('basic cases', () => {
        it('returns the root AGENT.md when only the root has one', () => {
            projectRoot = buildTree({ appsWebAgent: false, packagesUiAgent: false })
            const result = findAncestorAgents('apps/web/components/ui/button.tsx', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.'])
            expect(result).toHaveLength(1)
        })

        it('returns root + web + ui when all three exist', () => {
            projectRoot = buildTree({ appsWebComponentsUiAgent: true })
            const result = findAncestorAgents('apps/web/components/ui/button.tsx', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual([
                '.',
                'apps/web',
                'apps/web/components/ui',
            ])
        })

        it('skips non-existent ancestors silently', () => {
            projectRoot = buildTree({
                appsAgent: false,
                appsWebAgent: true,
                packagesUiAgent: false,
            })
            // root + web/components/AGENT.md absent, only web has it
            const result = findAncestorAgents('apps/web/components/ui/button.tsx', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.', 'apps/web'])
        })

        it('returns just the root when no other ancestors exist', () => {
            projectRoot = buildTree({ appsWebAgent: false, packagesUiAgent: false })
            const result = findAncestorAgents('apps/web/components/ui/button.tsx', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.'])
        })
    })

    describe('directory targets', () => {
        it('includes the target dir itself if it has an AGENT.md', () => {
            projectRoot = buildTree({ appsWebComponentsUiAgent: true })
            const result = findAncestorAgents('apps/web/components/ui', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual([
                '.',
                'apps/web',
                'apps/web/components/ui',
            ])
        })

        it('does not include the target dir if it has no AGENT.md', () => {
            projectRoot = buildTree({ appsWebComponentsUiAgent: false })
            const result = findAncestorAgents('apps/web/components/ui', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.', 'apps/web'])
        })
    })

    describe('cross-tree lookups', () => {
        it('finds the packages/ui AGENT.md from a target there', () => {
            projectRoot = buildTree()
            const result = findAncestorAgents('packages/ui', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.', 'packages/ui'])
        })
    })

    describe('path normalization', () => {
        it('accepts a project-relative path', () => {
            projectRoot = buildTree({ appsWebAgent: true })
            const result = findAncestorAgents('apps/web/components/ui/button.tsx', projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.', 'apps/web'])
        })

        it('accepts an absolute path', () => {
            projectRoot = buildTree({ appsWebAgent: true })
            const abs = join(projectRoot, 'apps/web/components/ui/button.tsx')
            const result = findAncestorAgents(abs, projectRoot)
            expect(result.map(r => r.relativeDir)).toEqual(['.', 'apps/web'])
        })

        it('returns the root with relativeDir "." for the root itself', () => {
            projectRoot = buildTree()
            const result = findAncestorAgents('.', projectRoot)
            expect(result).toHaveLength(1)
            expect(result[0]?.relativeDir).toBe('.')
        })
    })

    describe('error handling', () => {
        it('throws when the target is outside the project root', () => {
            projectRoot = buildTree()
            expect(() => findAncestorAgents('/etc/passwd', projectRoot)).toThrowError(
                /outside the project root/
            )
        })

        it('throws when the target is a parent of the project root', () => {
            projectRoot = buildTree()
            expect(() => findAncestorAgents('..', projectRoot)).toThrowError(
                /outside the project root/
            )
        })
    })

    describe('returns absolute paths', () => {
        it('the dir and path fields are absolute', () => {
            projectRoot = buildTree({ appsWebAgent: true })
            const result = findAncestorAgents('apps/web', projectRoot)
            for (const entry of result) {
                expect(entry.dir.startsWith('/')).toBe(true)
                expect(entry.path.startsWith('/')).toBe(true)
                expect(entry.path.endsWith('/AGENT.md')).toBe(true)
            }
        })
    })
})
