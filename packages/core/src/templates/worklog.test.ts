import { describe, expect, it } from 'vitest'
import { CONTEXT_BUDGETS } from '../constants'
import { generateWorklogContent } from './worklog'

describe('Worklog Template (format 2)', () => {
    it('produces the proportionate four-field shape', () => {
        const content = generateWorklogContent({
            taskId: 'TASK-01',
            title: 'Fix line splitting',
            outcome: 'Parser accepts CRLF input.',
            decisions: ['Split on /\\r?\\n/ instead of normalizing files: preserves bytes'],
            validation: ['`vitest run task-parser` → 12 passed'],
        })
        expect(content).toContain('# [TASK-01] Fix line splitting')
        expect(content).toContain('Outcome: Parser accepts CRLF input.')
        expect(content).toContain('Decisions:\n- Split on')
        expect(content).toContain('Validation:\n- `vitest run task-parser` → 12 passed')
        expect(content).toContain('Open: none')
    })

    it('omits narrative sections and stays within budget', () => {
        const content = generateWorklogContent({ taskId: 'T', title: 'N', outcome: 'D' })
        expect(content).not.toMatch(/Files Modified|Description|Challenges|Next Steps/)
        expect(Buffer.byteLength(content)).toBeLessThan(CONTEXT_BUDGETS.worklogBytes)
    })
})
