import type { TaskStatus } from '../types'

interface WorklogOptions {
    taskId: string
    taskName: string
    date?: string
    status: 'Complete' | 'Partial' | 'Blocked'
    description: string
    filesModified: string[]
    decisions: string[]
    challenges: string[]
    nextSteps: string[]
}

/**
 * Generate a Worklog markdown content
 */
export function generateWorklogContent(options: WorklogOptions): string {
    const date = options.date ?? new Date().toISOString().split('T')[0]

    return `# WORKLOG: [${options.taskId}] ${options.taskName}
**Date:** ${date}
**Agent Status:** [${options.status}]

## 📝 Description
${options.description}

## 🛠 Technical Details
- **Files Modified:**
${options.filesModified.map(f => `  - ${f}`).join('\n')}
- **Key Decisions:**
${options.decisions.map(d => `  - ${d}`).join('\n')}
- **Challenges:**
${options.challenges.map(c => `  - ${c}`).join('\n')}

## ⏭ Next Steps / Context for Successor
${options.nextSteps.map(s => `- ${s}`).join('\n')}
`
}

/**
 * Common status mapping for worklogs
 */
export function mapTaskStatusToWorklogStatus(
    status: TaskStatus
): 'Complete' | 'Partial' | 'Blocked' {
    switch (status) {
        case 'DONE':
            return 'Complete'
        case 'BLOCKED':
            return 'Blocked'
        default:
            return 'Partial'
    }
}
