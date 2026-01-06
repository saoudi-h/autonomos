import type { Complexity, Priority, Task, TaskStatus } from '../types'

export class TaskParser {
    static parse(markdown: string): Task[] {
        const tasks: Task[] = []
        const lines = markdown.split('\\n')
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
