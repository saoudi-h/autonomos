import { describe, expect, it } from 'vitest'
import { TaskParser } from './task-parser'

describe('TaskParser', () => {
    it('should parse a TODO task correctly', () => {
        const markdown = '- [ ] **[TASK-01]** Initial task `Priority: 🔴 Critical` `Complexity: S`'
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(1)
        expect(tasks[0]).toEqual({
            id: 'TASK-01',
            title: 'Initial task',
            priority: '🔴 Critical',
            complexity: 'S',
            status: 'TODO',
        })
    })

    it('should parse an IN_PROGRESS task correctly', () => {
        const markdown = '- [/] **[CLI-01]** Coding `Priority: 🟠 High` `Complexity: M`'
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(1)
        expect(tasks[0]!.status).toBe('IN_PROGRESS')
    })

    it('should parse a DONE task correctly', () => {
        const markdown = '- [x] **[DOC-01]** Writing `Priority: 🔵 Medium` `Complexity: L`'
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(1)
        expect(tasks[0]!.status).toBe('DONE')
    })

    it('should parse a BLOCKED task correctly', () => {
        const markdown = '- [!] **[CORE-01]** Waiting `Priority: ⚪ Low` `Complexity: XL`'
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(1)
        expect(tasks[0]!.status).toBe('BLOCKED')
    })

    it('should parse multiple tasks across lines', () => {
        const markdown = `
# Tasks
- [ ] **[T1]** One \`Priority: 🔴 Critical\` \`Complexity: S\`
- [x] **[T2]** Two \`Priority: 🟠 High\` \`Complexity: M\`
        `
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(2)
        expect(tasks[0]!.id).toBe('T1')
        expect(tasks[1]!.id).toBe('T2')
    })

    it('should ignore non-task lines', () => {
        const markdown = `
# Legend
This is some text.
- This is a list but not a task.
        `
        const tasks = TaskParser.parse(markdown)
        expect(tasks).toHaveLength(0)
    })
})
