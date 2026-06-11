import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_TEMPLATE } from '../templates/protocol'

/**
 * Validates the content of all workflow files and the PROTOCOL_TEMPLATE.
 * These tests guard against regressions on the v0.3 fixes:
 * - No crystallization questions directed at the user
 * - No duplicated close-out procedures in session.md
 * - CLI fallback instructions in all workflows
 * - Consistent AGENT.md format rules
 */

function loadWorkflow(name: string): string {
    return readFileSync(join(import.meta.dirname, name), 'utf-8')
}

const session = loadWorkflow('protocol-session.md')
const crystallize = loadWorkflow('protocol-crystallize.md')
const task = loadWorkflow('protocol-task.md')

// ---------------------------------------------------------------------------
// 1. Crystallization paradox fix — session.md must NOT ask the user
// ---------------------------------------------------------------------------
describe('session.md — no user-directed crystallization', () => {
    it('does not contain "FINAL STEP"', () => {
        expect(session).not.toContain('FINAL STEP')
    })

    it('does not ask the user what to crystallize', () => {
        const lower = session.toLowerCase()
        expect(lower).not.toMatch(/ask(?:ed)?\s+the\s+user.*learn/i)
        expect(lower).not.toMatch(/what did this session learn/i)
    })

    it('points to /crystallize for session close-out', () => {
        expect(session).toContain('protocol-crystallize')
    })
})

// ---------------------------------------------------------------------------
// 2. Crystallize.md — must NOT ask the user
// ---------------------------------------------------------------------------
describe('crystallize.md — self-directed crystallization only', () => {
    it('contains explicit anti-user-question rule', () => {
        expect(crystallize).toContain('MUST NOT ask the user what to crystallize')
    })

    it('directs the agent to ask itself, not the user', () => {
        expect(crystallize).toContain('Ask yourself these three questions')
    })

    it('does not contain a user-questioning pattern', () => {
        const lower = crystallize.toLowerCase()
        expect(lower).not.toMatch(/ask\s+the\s+user.*what.*learn/i)
    })
})

// ---------------------------------------------------------------------------
// 3. No duplication of close-out — session.md defers to crystallize.md
// ---------------------------------------------------------------------------
describe('session.md — no duplicated close-out logic', () => {
    it('does not contain task completion checklist (close-out)', () => {
        expect(session).not.toMatch(/- \[ \] Task status in TASKS\.md/)
    })

    it('does not contain worklog creation checklist (close-out)', () => {
        expect(session).not.toMatch(/- \[ \] A worklog exists/)
    })
})

// ---------------------------------------------------------------------------
// 4. CLI strategy in all workflow files (npm run → npx → find)
// ---------------------------------------------------------------------------
describe('CLI strategy — all workflow files', () => {
    it('session.md has the 3-tier CLI strategy', () => {
        expect(session).toContain('Method 1 (preferred)')
        expect(session).toContain('Method 2 (fallback)')
        expect(session).toContain('Method 3 (last resort)')
    })

    it('session.md includes npx --yes and find fallbacks', () => {
        expect(session).toContain('npx --yes')
        expect(session).toContain('find . -name AGENT.md')
    })

    it('task.md has the 3-tier CLI strategy', () => {
        expect(task).toContain('Method 1 (preferred)')
        expect(task).toContain('Method 2 (fallback)')
        expect(task).toContain('Method 3 (last resort)')
    })

    it('task.md includes npx --yes fallback', () => {
        expect(task).toContain('npx --yes')
    })
})

// ---------------------------------------------------------------------------
// 5. AGENT.md format rules consistency
// ---------------------------------------------------------------------------
describe('AGENT.md format rules — consistent across all files', () => {
    it('session.md clarifies root vs local format', () => {
        expect(session).toContain('root `AGENT.md`, follow the template')
    })

    it('task.md clarifies root vs local format', () => {
        expect(task).toContain('root `AGENT.md`, follow the template')
    })

    it('crystallize.md clarifies root vs local format', () => {
        expect(crystallize).toContain('root AGENT.md, follow the template')
    })

    it('PROTOCOL_TEMPLATE has explicit format rule', () => {
        expect(PROTOCOL_TEMPLATE).toContain('Format rule')
    })
})

// ---------------------------------------------------------------------------
// 6. PROTOCOL_TEMPLATE — self-directed crystallization in Phase 3
// ---------------------------------------------------------------------------
describe('PROTOCOL_TEMPLATE — crystallization is agent-driven', () => {
    it('Phase 3 does not ask the user what to crystallize', () => {
        const lower = PROTOCOL_TEMPLATE.toLowerCase()
        expect(lower).not.toMatch(/ask\s+the\s+user.*what.*learn/i)
    })
})
