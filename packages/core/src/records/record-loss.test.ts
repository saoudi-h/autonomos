import { describe, expect, it } from 'vitest'

import { findRecordLoss } from './record-loss'

const TASKS = `# Tasks

- [ ] **[INT-06]** Web helper — PARKED: competitor research shows the market leader ships no framework packages; Arcjet's counter-example relies on machinery we deliberately don't own \`Priority: ⚪\`
- [x] **[T-1]** Shipped the importer with streaming parser support \`Priority: 🟠\`
- [ ] **[T-2]** Thumbnail serving: direct file serve versus redirect chain \`Priority: ⚪\`
`

const ISSUES = `# Issues

## [I-1] Slow exports on large workspaces

- Status: open
`

describe('findRecordLoss', () => {
    const before = { tasks: TASKS, issues: ISSUES }

    it('reports nothing when registries are unchanged', () => {
        expect(findRecordLoss(before, before, '')).toEqual([])
    })

    it('reports an entry deleted without its content landing elsewhere', () => {
        const tasks = TASKS.replace(/^- \[ \] \*\*\[T-2\]\*\*.*\n/m, '')
        const loss = findRecordLoss(before, { tasks, issues: ISSUES }, '')
        expect(loss).toEqual([expect.objectContaining({ id: 'T-2', change: 'removed' })])
    })

    it('accepts an entry moved to an archive or worklog by the same change', () => {
        const removed = TASKS.match(/^- \[x\] \*\*\[T-1\]\*\*.*$/m)?.[0] ?? ''
        const tasks = TASKS.replace(`${removed}\n`, '')
        const archived = `${removed.replace('`Priority', '`Completed: 2026-11-09` `Priority')}`
        expect(findRecordLoss(before, { tasks, issues: ISSUES }, archived)).toEqual([])
        const issues = '# Issues\n'
        expect(findRecordLoss(before, { tasks: TASKS, issues }, ISSUES)).toEqual([])
    })

    it('reports an open entry shortened without keeping its rationale', () => {
        const tasks = TASKS.replace(
            /PARKED: .*don't own/,
            'PARKED: manual pattern is the norm; wake on demand'
        )
        const loss = findRecordLoss(before, { tasks, issues: ISSUES }, 'PARKED: manual pattern')
        expect(loss).toEqual([expect.objectContaining({ id: 'INT-06', change: 'shortened' })])
        const worklog =
            "competitor research shows the market leader ships no framework packages; Arcjet's counter-example relies on machinery we deliberately don't own"
        expect(findRecordLoss(before, { tasks, issues: ISSUES }, worklog)).toEqual([])
    })

    it('judges duplicate IDs together and ignores small edits', () => {
        const duplicated = `${TASKS}- [x] **[T-2]** Thumbnail serving measured obsolete \`Priority: ⚪\`\n`
        const tasks = duplicated.replace(/^- \[ \] \*\*\[T-2\]\*\*.*\n/m, '')
        const loss = findRecordLoss({ tasks: duplicated }, { tasks }, '')
        expect(loss).toEqual([expect.objectContaining({ id: 'T-2', change: 'shortened' })])
        const edited = TASKS.replace('streaming parser', 'streaming')
        expect(findRecordLoss(before, { tasks: edited, issues: ISSUES }, '')).toEqual([])
    })
})
