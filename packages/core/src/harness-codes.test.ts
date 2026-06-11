import { describe, expect, it } from 'vitest'

import {
    getHarness,
    getRawHarnessCodes,
    listHarnesses,
    listPreferredHarnesses,
    resolveTargets,
} from './harness-codes'

describe('harness-codes loader', () => {
    describe('loading', () => {
        it('loads the JSON config and validates it without throwing', () => {
            const codes = getRawHarnessCodes()
            expect(codes).toBeDefined()
            expect(codes.platforms).toBeDefined()
            expect(Object.keys(codes.platforms).length).toBeGreaterThan(0)
        })

        it('loads all 6 expected harnesses', () => {
            const ids = Object.keys(getRawHarnessCodes().platforms).sort()
            expect(ids).toEqual([
                'antigravity',
                'claude-code',
                'cline',
                'codex',
                'kilocode',
                'opencode',
            ])
        })
    })

    describe('getHarness', () => {
        it('returns the entry for a known id', () => {
            const h = getHarness('cline')
            expect(h.name).toBe('Cline')
            expect(h.installer.workflowsDir).toBe('.clinerules/workflows')
            expect(h.installer.fileExtension).toBe('.md')
        })

        it('throws with a helpful message on an unknown id', () => {
            expect(() => getHarness('does-not-exist')).toThrowError(/Unknown harness/)
        })
    })

    describe('listHarnesses', () => {
        it('returns all harnesses as {id, harness} pairs', () => {
            const list = listHarnesses()
            expect(list.length).toBe(6)
            expect(list[0]).toHaveProperty('id')
            expect(list[0]).toHaveProperty('harness')
        })
    })

    describe('listPreferredHarnesses', () => {
        it('returns only the preferred ones', () => {
            const list = listPreferredHarnesses()
            for (const { harness } of list) {
                expect(harness.preferred).toBe(true)
            }
        })
    })

    describe('resolveTargets', () => {
        it('returns a single target for Cline (single-dir mode)', () => {
            const targets = resolveTargets(['cline'], '/proj')
            expect(targets).toHaveLength(1)
            expect(targets[0]?.path).toBe('/proj/.clinerules/workflows')
            expect(targets[0]?.usedBy).toEqual(['cline'])
        })

        it('returns skills + commands targets for Claude Code (split mode)', () => {
            const targets = resolveTargets(['claude-code'], '/proj')
            const paths = targets.map(t => t.path).sort()
            expect(paths).toEqual(['/proj/.claude/commands', '/proj/.claude/skills'])
        })

        it('deduplicates the cross-tool .agents/skills/ standard across Codex + OpenCode + KiloCode', () => {
            const targets = resolveTargets(['codex', 'opencode', 'kilocode'], '/proj')
            const skillsTarget = targets.find(t => t.path === '/proj/.agents/skills')
            expect(skillsTarget).toBeDefined()
            expect(skillsTarget?.usedBy.sort()).toEqual(['codex', 'kilocode', 'opencode'])
            // No duplicate entry for the same path
            const skillsCount = targets.filter(t => t.path === '/proj/.agents/skills').length
            expect(skillsCount).toBe(1)
        })

        it('keeps Antigravity (singular .agent/) separate from the cross-tool standard', () => {
            const targets = resolveTargets(['antigravity', 'codex'], '/proj')
            expect(targets.find(t => t.path === '/proj/.agent/workflows')).toBeDefined()
            expect(targets.find(t => t.path === '/proj/.agents/skills')).toBeDefined()
        })

        it('includes the OpenCode commands dir separately from the shared skills dir', () => {
            const targets = resolveTargets(['opencode'], '/proj')
            const paths = targets.map(t => t.path).sort()
            expect(paths).toEqual(['/proj/.agents/skills', '/proj/.opencode/commands'])
        })

        it('handles an empty list', () => {
            expect(resolveTargets([])).toEqual([])
        })

        it('uses "." as the default cwd', () => {
            const targets = resolveTargets(['cline'])
            expect(targets[0]?.path).toBe('.clinerules/workflows')
        })
    })
})
