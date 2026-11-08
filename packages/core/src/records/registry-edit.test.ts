import { describe, expect, it } from 'vitest'
import {
    appendToClosedRegistry,
    extractIssues,
    extractTasks,
    isClosedIssueStatus,
    parseIssueEntries,
    parseTaskEntries,
    stampCompleted,
} from './registry-edit'

const TASKS = `# PROJECT TASKS

> **LEGEND** keep me

## Current direction

Prose stays.

## Active

- [x] **[A-1]** Done one \`Priority: 🟠\` \`Complexity: S\`
    - evidence line
    - more evidence

- [ ] **[A-2]** Open \`Priority: 🟠\` \`Complexity: M\`

### Nested section

- [x] **[A-3]** Done nested \`Priority: 🔵\` \`Complexity: S\`

## Parent with open child

- [x] **[P-1]** Parent done \`Priority: 🔵\` \`Complexity: L\`
    - [ ] **[P-2]** Child open \`Priority: 🔵\` \`Complexity: S\`

## Already empty

## Code

\`\`\`markdown
- [x] **[F-1]** Fenced example \`Priority: ⚪\` \`Complexity: S\`
\`\`\`
`

describe('parseTaskEntries', () => {
    it('captures continuation lines and heading path, ignoring fences', () => {
        const entries = parseTaskEntries(TASKS)
        expect(entries.map(e => e.id)).toEqual(['A-1', 'A-2', 'A-3', 'P-1', 'P-2'])
        const first = entries[0]
        expect(first?.text.split('\n')).toHaveLength(3)
        expect(first?.headings).toEqual(['Active'])
        expect(entries[2]?.headings).toEqual(['Active', 'Nested section'])
    })
})

describe('extractTasks', () => {
    const { remaining, moved } = extractTasks(TASKS, e => e.status === 'x')

    it('moves completed entries but keeps parents with open children', () => {
        expect(moved.map(e => e.id)).toEqual(['A-1', 'A-3'])
        expect(remaining).toContain('[P-1]')
        expect(remaining).toContain('[P-2]')
        expect(remaining).not.toContain('evidence line')
    })

    it('drops sections emptied by the move only, keeps prose, legend and fences', () => {
        expect(remaining).not.toContain('### Nested section')
        expect(remaining).toContain('## Active')
        expect(remaining).toContain('## Already empty')
        expect(remaining).toContain('Prose stays.')
        expect(remaining).toContain('> **LEGEND** keep me')
        expect(remaining).toContain('[F-1]')
        expect(remaining).not.toMatch(/\n{3,}/)
    })

    it('is idempotent', () => {
        const again = extractTasks(remaining, e => e.status === 'x')
        expect(again.moved).toEqual([])
        expect(again.remaining).toBe(remaining)
    })
})

const ISSUES = `# Issues

## [I-1] Open one

- Type: problem
- Status: open
- Evidence: x

## [I-2] Resolved one

- **Type:** problem
- **Status:** resolved (2026-01-01)
- Evidence: y

## [I-3] Declined

- Status: declined — not needed
`

describe('issues', () => {
    it('reads plain and bold status fields', () => {
        expect(parseIssueEntries(ISSUES).map(e => [e.id, e.status])).toEqual([
            ['I-1', 'open'],
            ['I-2', 'resolved'],
            ['I-3', 'declined'],
        ])
        expect(isClosedIssueStatus('Resolved')).toBe(true)
        expect(isClosedIssueStatus('accepted')).toBe(false)
    })

    it('extracts closed issues and keeps the preamble', () => {
        const { remaining, moved } = extractIssues(ISSUES, e => isClosedIssueStatus(e.status))
        expect(moved.map(e => e.id)).toEqual(['I-2', 'I-3'])
        expect(remaining).toBe(
            '# Issues\n\n## [I-1] Open one\n\n- Type: problem\n- Status: open\n- Evidence: x\n'
        )
    })
})

describe('stampCompleted and closed registry', () => {
    it('adds a completion date after complexity once', () => {
        const line = '- [x] **[A-1]** Done `Priority: 🟠` `Complexity: S` — note'
        const stamped = stampCompleted(line, '2026-11-08')
        expect(stamped).toBe(
            '- [x] **[A-1]** Done `Priority: 🟠` `Complexity: S` `Completed: 2026-11-08` — note'
        )
        expect(stampCompleted(stamped, '2027-01-01')).toBe(stamped)
    })

    it('creates a header once and appends entries', () => {
        const first = appendToClosedRegistry(undefined, 'tasks', ['- [x] **[A]** a'])
        const second = appendToClosedRegistry(first, 'tasks', ['- [x] **[B]** b'], 'Batch')
        expect(second.match(/# Closed tasks/g)).toHaveLength(1)
        expect(second).toContain('- [x] **[A]** a')
        expect(second).toContain('## Batch\n\n- [x] **[B]** b\n')
    })
})
