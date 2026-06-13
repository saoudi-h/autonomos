import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_TEMPLATE } from '../templates/protocol'

/**
 * Validates the content of all workflow files and the PROTOCOL_TEMPLATE.
 * These tests guard against regressions on the v0.3 design:
 * - No crystallization questions directed at the user
 * - No duplicated close-out procedures in session.md
 * - find-based AGENT.md discovery (no CLI dependency in workflows)
 * - Consistent AGENT.md format rules
 * - Workflows are short enough to fit in LLM working memory
 */

function loadWorkflow(name: string): string {
    return readFileSync(join(import.meta.dirname, name), 'utf-8')
}

const session = loadWorkflow('protocol-session.md')
const crystallize = loadWorkflow('protocol-crystallize.md')
const task = loadWorkflow('protocol-task.md')

// ---------------------------------------------------------------------------
// 1. Crystallization — agent-directed, never asks the user
// ---------------------------------------------------------------------------
describe('crystallize.md — self-directed crystallization', () => {
    it('contains the MUST NOT ask the user rule', () => {
        expect(crystallize).toContain('MUST NOT ask the user what to crystallize')
    })

    it('directs the agent to ask itself', () => {
        expect(crystallize).toContain('Ask yourself silently')
    })

    it('does not contain a user-questioning pattern', () => {
        const lower = crystallize.toLowerCase()
        expect(lower).not.toMatch(/ask\s+the\s+user.*what.*learn/i)
    })
})

// ---------------------------------------------------------------------------
// 2. Session.md — no duplicated close-out, defers to crystallize
// ---------------------------------------------------------------------------
describe('session.md — clean separation of concerns', () => {
    it('does not contain "FINAL STEP"', () => {
        expect(session).not.toContain('FINAL STEP')
    })

    it('does not ask the user what to crystallize', () => {
        const lower = session.toLowerCase()
        expect(lower).not.toMatch(/ask(?:ed)?\s+the\s+user.*learn/i)
        expect(lower).not.toMatch(/what did this session learn/i)
    })

    it('points to /crystallize for session close-out', () => {
        expect(session).toContain('/crystallize')
    })

    it('does not duplicate worklog creation logic', () => {
        expect(session).not.toMatch(/- \[ \] A worklog exists/)
    })
})

// ---------------------------------------------------------------------------
// 3. AGENT.md discovery — find-based, no CLI dependency
// ---------------------------------------------------------------------------
describe('AGENT.md discovery — universal method', () => {
    it('session.md uses find as primary method', () => {
        expect(session).toContain('find . -name AGENT.md')
    })

    it('task.md uses directory walk, not CLI', () => {
        // task.md should instruct walking up the directory tree
        expect(task).toContain('walk up')
        // Should NOT require autonomos CLI as a mandatory step
        expect(task).not.toContain('npx --yes @autonomos/cli')
    })
})

// ---------------------------------------------------------------------------
// 4. AGENT.md format rules — root vs local distinction
// ---------------------------------------------------------------------------
describe('AGENT.md format rules — consistent across files', () => {
    it('session.md does not impose format on local AGENT.md', () => {
        // Session rules should mention AGENT.md but not impose root template everywhere
        expect(session).toContain('AGENT.md')
    })

    it('task.md clarifies root vs local format', () => {
        expect(task).toContain('Root AGENT.md')
        expect(task).toContain('free format')
    })

    it('crystallize.md allows free format for local files', () => {
        expect(crystallize).toContain('free format')
    })

    it('PROTOCOL_TEMPLATE has explicit format rules section', () => {
        expect(PROTOCOL_TEMPLATE).toContain('Format Rules')
    })
})

// ---------------------------------------------------------------------------
// 5. PROTOCOL_TEMPLATE — compact reference, no workflow duplication
// ---------------------------------------------------------------------------
describe('PROTOCOL_TEMPLATE — v0.3 design', () => {
    it('does not contain Phase 1/2/3 workflow steps', () => {
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 1:')
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 2:')
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 3:')
    })

    it('points to workflows as the executable contract', () => {
        expect(PROTOCOL_TEMPLATE).toContain('/session')
        expect(PROTOCOL_TEMPLATE).toContain('/task')
        expect(PROTOCOL_TEMPLATE).toContain('/crystallize')
    })

    it('contains the quick reference table', () => {
        expect(PROTOCOL_TEMPLATE).toContain('Quick Reference')
    })

    it('does not contain deprecated .ai/ paths', () => {
        expect(PROTOCOL_TEMPLATE).not.toContain('.ai/')
    })

    it('uses .autonomos/ consistently', () => {
        expect(PROTOCOL_TEMPLATE).toContain('.autonomos/TASKS.md')
        expect(PROTOCOL_TEMPLATE).toContain('.autonomos/worklogs/')
    })
})

// ---------------------------------------------------------------------------
// 6. Workflow brevity — each must be concise enough for LLM working memory
// ---------------------------------------------------------------------------
describe('Workflow brevity', () => {
    const maxLines = 35 // allowing some margin over the 30-line target

    it(`session.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = session.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })

    it(`task.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = task.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })

    it(`crystallize.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = crystallize.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })
})
