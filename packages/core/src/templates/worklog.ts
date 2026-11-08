import type { TaskStatus } from '../types'

interface WorklogOptions {
    taskId: string
    title: string
    /** 1–3 lines: what is now true. */
    outcome: string
    /** Non-obvious choices with their reason. */
    decisions?: string[]
    /** Checks actually run, `command → result`. */
    validation?: string[]
    /** Limits and follow-ups. */
    open?: string[]
}

const list = (items: string[] | undefined): string =>
    items?.length ? '\n' + items.map(item => `- ${item}`).join('\n') : ' none'

/**
 * Generate a proportionate worklog (artifact format 2): only what a future
 * agent cannot recover from code, git, tests or other records.
 */
export function generateWorklogContent(options: WorklogOptions): string {
    return `# [${options.taskId}] ${options.title}

Outcome: ${options.outcome}
Decisions:${list(options.decisions)}
Validation:${list(options.validation)}
Open:${list(options.open)}
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
