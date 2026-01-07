/**
 * Priority levels for tasks
 */
export type Priority = '🔴 Critical' | '🟠 High' | '🔵 Medium' | '⚪ Low'

/**
 * Complexity estimates for tasks
 */
export type Complexity = 'S' | 'M' | 'L' | 'XL'

/**
 * Task status markers
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

/**
 * Task entity parsed from TASKS.md
 */
export interface Task {
    id: string
    title: string
    priority: Priority
    complexity: Complexity
    status: TaskStatus
    worklogPath?: string
}

/**
 * Agent configuration parsed from AGENT.md
 */
export interface AgentConfig {
    name: string
    description?: string
    stack: string[]
    preferences?: Record<string, any>
}

export interface AgentSection {
    title: string
    content: string
}

export interface AgentContext {
    title: string
    description?: string
    sections: AgentSection[]
    metadata?: Record<string, any>
}

export const PRIORITIES: Priority[] = ['🔴 Critical', '🟠 High', '🔵 Medium', '⚪ Low']
export const COMPLEXITIES: Complexity[] = ['S', 'M', 'L', 'XL']
