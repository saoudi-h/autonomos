export type Priority = '🔴 Critical' | '🟠 High' | '🔵 Medium' | '⚪ Low'
export type Complexity = 'S' | 'M' | 'L' | 'XL'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export interface Task {
    id: string
    title: string
    priority: Priority
    complexity: Complexity
    status: TaskStatus
    worklogPath?: string
}

export interface AgentConfig {
    projectRoot: string
    workflow: {
        commits: string
        linting: string
        specificCommands: Record<string, string>
    }
}

export const PRIORITIES: Priority[] = ['🔴 Critical', '🟠 High', '🔵 Medium', '⚪ Low']
export const COMPLEXITIES: Complexity[] = ['S', 'M', 'L', 'XL']
