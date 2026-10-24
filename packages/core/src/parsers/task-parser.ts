import type { Complexity, Priority, Task, TaskStatus } from '../types'

export class TaskParser {
    /** Discover IDs/status without requiring optional priority or complexity metadata. */
    static references(markdown: string): { id: string; status: TaskStatus; line: number }[] {
        const references: { id: string; status: TaskStatus; line: number }[] = []
        let fence: string | undefined
        for (const [index, line] of markdown.split(/\r?\n/).entries()) {
            const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
            if (marker?.[1]) {
                if (!fence) fence = marker[1]
                else if (
                    marker[1][0] === fence[0] &&
                    marker[1].length >= fence.length &&
                    !line.slice(marker[0].length).trim()
                )
                    fence = undefined
                continue
            }
            if (fence) continue
            const match = line.match(/^\s*- \[([ x/!])\] \*\*\[([^\]]+)\]\*\*/)
            if (match?.[1] && match[2]?.trim()) {
                references.push({
                    id: match[2].trim(),
                    status: this.mapStatus(match[1]),
                    line: index + 1,
                })
            }
        }
        return references
    }

    static parse(markdown: string): Task[] {
        const tasks: Task[] = []
        const lines = markdown.split(/\r?\n/)
        const taskRegex = /- \[([ x/!])\] \*\*\[(.+)\]\*\* (.+) `Priority: (.+)` `Complexity: (.+)`/

        for (const line of lines) {
            const match = line.match(taskRegex)
            if (match) {
                const [, statusChar = ' ', id = '', title = '', priority = '', complexity = ''] =
                    match
                tasks.push({
                    id,
                    title: title.trim(),
                    priority: priority as Priority,
                    complexity: complexity as Complexity,
                    status: this.mapStatus(statusChar),
                })
            }
        }
        return tasks
    }

    private static mapStatus(char: string): TaskStatus {
        switch (char) {
            case ' ':
                return 'TODO'
            case '/':
                return 'IN_PROGRESS'
            case 'x':
                return 'DONE'
            case '!':
                return 'BLOCKED'
            default:
                return 'TODO'
        }
    }
}
