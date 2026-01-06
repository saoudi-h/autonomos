import { describe, expect, it } from 'vitest'
import { generateWorklogContent } from './worklog'

describe('Worklog Template', () => {
    it('should generate a valid worklog content', () => {
        const content = generateWorklogContent({
            taskId: 'TASK-01',
            taskName: 'Fixing Bug',
            status: 'Complete',
            description: 'Fixed the line splitting issue.',
            filesModified: ['src/parsers/task-parser.ts'],
            decisions: ['Used regex for splitting'],
            challenges: ['Template literal escaping'],
            nextSteps: ['Add more tests'],
        })

        expect(content).toContain('# WORKLOG: [TASK-01] Fixing Bug')
        expect(content).toContain('**Agent Status:** [Complete]')
        expect(content).toContain('- src/parsers/task-parser.ts')
        expect(content).toContain('- Used regex for splitting')
    })

    it('should use current date if not provided', () => {
        const content = generateWorklogContent({
            taskId: 'T',
            taskName: 'N',
            status: 'Partial',
            description: 'D',
            filesModified: [],
            decisions: [],
            challenges: [],
            nextSteps: [],
        })
        const today = new Date().toISOString().split('T')[0]
        expect(content).toContain(`**Date:** ${today}`)
    })
})
