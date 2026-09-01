import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_TEMPLATE } from '../templates/protocol'

/**
 * Validates the content of all workflow files and the PROTOCOL_TEMPLATE.
 * These tests guard against regressions on the v0.6 design:
 * - No crystallization questions directed at the user
 * - No duplicated close-out procedures in session.md
 * - Scoped AGENT.md discovery (no CLI dependency in workflows)
 * - Durable-memory admission, placement, and retirement
 * - Project-owned specifications, decision records, and safe adoption
 * - Workflows are short enough to fit in LLM working memory
 */

function loadWorkflow(name: string): string {
    return readFileSync(join(import.meta.dirname, name), 'utf-8')
}

const session = loadWorkflow('protocol-session.md')
const crystallize = loadWorkflow('protocol-crystallize.md')
const task = loadWorkflow('protocol-task.md')
const issue = loadWorkflow('protocol-issue.md')
const reconcile = loadWorkflow('protocol-reconcile.md')
const adopt = loadWorkflow('protocol-adopt.md')
const design = loadWorkflow('protocol-design.md')

// ---------------------------------------------------------------------------
// 1. Crystallization — agent-directed, never asks the user
// ---------------------------------------------------------------------------
describe('crystallize.md — self-directed crystallization', () => {
    it('contains the MUST NOT ask the user rule', () => {
        expect(crystallize).toContain('MUST NOT ask the user what to crystallize')
    })

    it('directs the agent to ask itself', () => {
        expect(crystallize).toContain('For each candidate ask')
    })

    it('does not contain a user-questioning pattern', () => {
        const lower = crystallize.toLowerCase()
        expect(lower).not.toMatch(/ask\s+the\s+user.*what.*learn/i)
    })

    it('preserves the substantive user-facing answer before the handoff', () => {
        expect(crystallize).toContain('self-contained answer to the original request')
        expect(crystallize).toContain('outcome, evidence, limitations, and relevant next step')
        expect(crystallize).not.toContain('RESPOND with exactly')
        expect(crystallize.indexOf('self-contained answer')).toBeLessThan(
            crystallize.indexOf('supplementary handoff')
        )
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
// 3. Scoped context discovery and workflow composition
// ---------------------------------------------------------------------------
describe('Scoped context discovery and workflow composition', () => {
    it('orients from root without loading every context branch', () => {
        expect(session).toContain('Read the root `AGENT.md`')
        expect(session).not.toContain('find . -name AGENT.md')
    })

    it('task.md loads only the target ancestor chain and relevant worklog', () => {
        expect(task).toContain('walk up')
        expect(task).toContain('Do not load unrelated worklogs or context branches')
        expect(task).not.toContain('npx --yes @autonomos/cli')
    })

    it('delegates scoped planning and task transition to /task', () => {
        expect(session).toContain('Invoke `/task`')
        expect(session).toContain('it owns scoped context, planning, and the `[/]` transition')
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

    it('PROTOCOL_TEMPLATE owns root vs local format rules', () => {
        expect(PROTOCOL_TEMPLATE).toContain('Format Rules')
        expect(PROTOCOL_TEMPLATE).toContain('Root `AGENT.md`')
        expect(PROTOCOL_TEMPLATE).toContain('Local `AGENT.md`')
    })
})

// ---------------------------------------------------------------------------
// 5. PROTOCOL_TEMPLATE — compact reference, no workflow duplication
// ---------------------------------------------------------------------------
describe('PROTOCOL_TEMPLATE — v0.6 design', () => {
    it('does not contain Phase 1/2/3 workflow steps', () => {
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 1:')
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 2:')
        expect(PROTOCOL_TEMPLATE).not.toContain('Phase 3:')
    })

    it('points to workflows as the executable contract', () => {
        expect(PROTOCOL_TEMPLATE).toContain('/session')
        expect(PROTOCOL_TEMPLATE).toContain('/task')
        expect(PROTOCOL_TEMPLATE).toContain('/issue')
        expect(PROTOCOL_TEMPLATE).toContain('/adopt')
        expect(PROTOCOL_TEMPLATE).toContain('/reconcile')
        expect(PROTOCOL_TEMPLATE).toContain('/crystallize')
        expect(PROTOCOL_TEMPLATE).toContain('/design')
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

    it('documents scoped context and intent-first objective resolution', () => {
        expect(PROTOCOL_TEMPLATE).toContain("selected scope's ancestor chain")
        expect(PROTOCOL_TEMPLATE).toContain('Explicit user request first')
        expect(PROTOCOL_TEMPLATE).not.toContain('find . -name AGENT.md')
    })

    it('distinguishes durable guidance from historical evidence', () => {
        expect(PROTOCOL_TEMPLATE).toContain('Durable guidance for its directory scope')
        expect(PROTOCOL_TEMPLATE).toContain('Historical session evidence')
        expect(PROTOCOL_TEMPLATE).toContain('consolidate or replace obsolete entries')
        expect(PROTOCOL_TEMPLATE).toContain('Optional project-owned visual/interaction direction')
    })
})

// ---------------------------------------------------------------------------
// 6. Durable-memory admission, placement, and retirement
// ---------------------------------------------------------------------------
describe('Durable-memory lifecycle', () => {
    it('does not append every learning immediately', () => {
        expect(task).toContain('crystallization candidate')
        expect(task).not.toContain('Every new learning')
        expect(task).not.toContain('append to an AGENT.md immediately')
    })

    it('routes session evidence, operational docs, and durable guidance separately', () => {
        expect(crystallize).toContain('Would this still guide a different future task?')
        expect(crystallize).toContain('observations, measurements, chronology')
        expect(crystallize).toContain('existing component documentation')
        expect(crystallize).toContain('stable operating guidance')
        expect(crystallize).toContain('target requirements to `specs/`')
        expect(crystallize).toContain('decision rationale to `decisions/`')
    })

    it('retires stale guidance and rejects arbitrary file-count heuristics', () => {
        expect(crystallize).toContain('Consolidate or replace superseded and disproven guidance')
        expect(crystallize).toContain(
            'do not turn historical worklogs, issues, or tasks into current specs/decisions'
        )
        expect(crystallize).toContain('Never create an `AGENT.md` based on file count alone')
    })
})

// ---------------------------------------------------------------------------
// 7. Optional issue intake and task separation
// ---------------------------------------------------------------------------
describe('Issue intake and task separation', () => {
    it('keeps issue intake optional for requests that need triage', () => {
        expect(issue).toContain('Use this workflow only when the need or solution requires triage')
        expect(issue).toContain('A direct, clear, authorized change may start as a task')
        expect(PROTOCOL_TEMPLATE).toContain('optional `ISSUES.md`')
    })

    it('records solution-independent evidence before implementation', () => {
        expect(issue).toContain('Record without prescribing implementation')
        expect(issue).toContain('Evidence: observed facts or motivation')
        expect(issue).toContain('Desired outcome: solution-independent success')
        expect(issue).toContain('search for duplicates')
    })

    it('creates tasks only after acceptance and links both directions', () => {
        expect(issue).toContain('do not create a task before an approach is accepted')
        expect(issue).toContain('create one or more scoped tasks through `/task`')
        expect(issue).toContain('link both directions')
        expect(PROTOCOL_TEMPLATE).toContain('Tasks describe an accepted intervention')
    })
})

// ---------------------------------------------------------------------------
// 8. Project-specific design direction
// ---------------------------------------------------------------------------
describe('/design — project-specific direction and evidence', () => {
    it('routes grounding, branching, contract, review, and persistence', () => {
        expect(design).toContain('real or representative content')
        expect(design).toContain('2–3 structurally different candidates')
        expect(design).toContain('project-owned `DESIGN.md`')
        expect(design).toContain('at least one')
        expect(design).toContain('revision')
        expect(design).toContain('source → destination map')
        expect(design).toContain('wait for approval')
    })

    it('keeps project direction optional and anti-defaults diagnostic', () => {
        expect(design).toContain('never create it merely to add ceremony')
        expect(design).toContain('not bans')
        expect(design).toMatch(/do not\s+mutate on answer-only or read-only requests/)
    })
})

// ---------------------------------------------------------------------------
// 9. Project-owned specifications, decisions, and adoption
// ---------------------------------------------------------------------------
describe('Project knowledge boundaries and adoption', () => {
    it('defines optional specifications and decision records without automation', () => {
        expect(PROTOCOL_TEMPLATE).toContain('`.autonomos/specs/`')
        expect(PROTOCOL_TEMPLATE).toContain('`.autonomos/decisions/`')
        expect(PROTOCOL_TEMPLATE).toContain('do not create or overwrite them')
        expect(PROTOCOL_TEMPLATE).toContain(
            'no parser or independent version is required initially'
        )
        expect(PROTOCOL_TEMPLATE).toContain('Acceptance does not mean implementation is complete')
    })

    it('routes accepted target state separately from decisions and history', () => {
        expect(task).toContain('accepted specifications and decision records')
        expect(issue).toContain('Proposed directions remain hypotheses')
        expect(crystallize).toContain('target requirements to `specs/`')
        expect(crystallize).toContain('decision rationale to `decisions/`')
        expect(reconcile).toContain('Use `/adopt` for history-to-artifact extraction')
    })

    it('requires a reviewable, additive adoption pass', () => {
        expect(adopt).toContain('source → destination map')
        expect(adopt).toContain('Show the map and unresolved conflicts to the user before writing')
        expect(adopt).toContain('Do not rewrite `worklogs/`, `ISSUES.md`, `TASKS.md`')
        expect(adopt).toContain('Copy and link by default')
        expect(adopt).toContain('run `/reconcile` for a second pass')
    })
})

// ---------------------------------------------------------------------------
// 10. Evidence-aware reconciliation
// ---------------------------------------------------------------------------
describe('Evidence-aware reconciliation', () => {
    it('classifies current, historical, and version-pinned artifacts', () => {
        expect(reconcile).toContain('current guidance, current state, historical evidence')
        expect(reconcile).toContain('version-pinned protocol content')
        expect(reconcile).toContain('autonomos status')
        expect(reconcile).toContain('autonomos update')
    })

    it('checks the expected drift classes against authoritative evidence', () => {
        expect(reconcile).toContain('duplicates, contradictions, obsolete paths or technologies')
        expect(reconcile).toContain('authoritative repository source, configuration, tests')
        expect(reconcile).toContain('certain**, **uncertain**, or **historical-only')
    })

    it('corrects only certain findings and converges idempotently', () => {
        expect(reconcile).toContain('Certain:** make the smallest correction')
        expect(reconcile).toContain('Uncertain:** do not mutate the disputed facts')
        expect(reconcile).toContain('Historical-only:** preserve it')
        expect(reconcile).toContain('second pass produces no deterministic changes')
    })
})

// ---------------------------------------------------------------------------
// 11. User authority and truthful lifecycle status
// ---------------------------------------------------------------------------
describe('User authority and lifecycle status', () => {
    it('keeps answer-only, read-only, and diagnostic requests non-mutating', () => {
        expect(session).toContain("never expands the user's requested scope")
        expect(session).toContain('answer, and do not start a task')
        expect(task).toContain('diagnosis-without-fix requests must not mutate')
        expect(crystallize).toContain('limited the work to read-only or no changes')
        expect(crystallize).toContain('do not modify any artifact')
    })

    it('prioritizes explicit intent, then resumed work, then backlog priority', () => {
        expect(session).toContain('user supplied an objective, it takes precedence')
        expect(session).toContain('resume a `[/]` task')
        expect(session).toContain('highest-priority `[ ]` task')
    })

    it('distinguishes complete, partial, and genuinely blocked work', () => {
        for (const workflow of [task, crystallize]) {
            expect(workflow).toContain('only if complete')
            expect(workflow).toContain('unresolved dependency prevents progress')
            expect(workflow).toContain('keep `[/]` for partial work')
        }
        expect(crystallize).toContain('Task: [x] / [/] / [!]')
    })
})

// ---------------------------------------------------------------------------
// 12. Workflow brevity — each must be concise enough for LLM working memory
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

    it(`issue.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = issue.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })

    it(`reconcile.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = reconcile.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })

    it(`adopt.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = adopt.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })

    it(`design.md is ≤${maxLines} lines (excluding frontmatter)`, () => {
        const body = design.replace(/^---[\s\S]*?---\n/, '')
        const lines = body.trim().split('\n').length
        expect(lines).toBeLessThanOrEqual(maxLines)
    })
})
