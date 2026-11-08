import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import {
    AGENT_FILE,
    ARTIFACT_FORMAT,
    AUTONOMOS_DIR,
    CONTEXT_BUDGETS,
    ISSUES_FILE,
    TASKS_FILE,
    WORKLOGS_DIR,
} from '../constants'
import { isClosedIssueStatus, parseIssueEntries, parseTaskEntries } from './registry-edit'

export type BudgetFindingCode =
    | 'format-outdated'
    | 'closed-tasks-in-current'
    | 'closed-issues-in-current'
    | 'tasks-size'
    | 'issues-size'
    | 'task-entry-length'
    | 'root-agent-size'
    | 'local-agent-size'
    | 'worklog-size'

export interface BudgetFinding {
    code: BudgetFindingCode
    /** Project-relative path the finding concerns. */
    path: string
    message: string
    /** Offending IDs or files, largest first, when relevant. */
    items?: string[]
}

export type ContextBudgets = { [K in keyof typeof CONTEXT_BUDGETS]: number }

const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage'])

function size(path: string): number {
    return Buffer.byteLength(readFileSync(path, 'utf8'))
}

function kb(bytes: number): string {
    return `${bytes.toLocaleString('en-US')} bytes`
}

function readIfFile(path: string): string | undefined {
    try {
        return lstatSync(path).isFile() ? readFileSync(path, 'utf8') : undefined
    } catch {
        return undefined
    }
}

/** Find AGENT.md files below root, skipping hidden, dependency and build directories. */
export function findAgentFilePaths(root: string): string[] {
    const found: string[] = []
    const walk = (dir: string): void => {
        let entries
        try {
            entries = readdirSync(dir, { withFileTypes: true })
        } catch {
            return
        }
        for (const entry of entries) {
            if (entry.isFile() && entry.name === AGENT_FILE) found.push(join(dir, entry.name))
            else if (
                entry.isDirectory() &&
                !entry.name.startsWith('.') &&
                !SKIPPED_DIRS.has(entry.name)
            )
                walk(join(dir, entry.name))
        }
    }
    walk(root)
    return found.sort()
}

/**
 * Report where current context exceeds the protocol's proportionate budgets.
 * Findings are advisory; agents resolve them through `/reconcile` or `migrate`.
 */
export function checkContextBudgets(
    root: string,
    options: { artifactFormat?: number; budgets?: Partial<ContextBudgets> } = {}
): BudgetFinding[] {
    const budgets: ContextBudgets = { ...CONTEXT_BUDGETS, ...options.budgets }
    const findings: BudgetFinding[] = []
    const autonomos = join(root, AUTONOMOS_DIR)
    const rel = (path: string): string => relative(root, path)

    const format = options.artifactFormat ?? 1
    if (format < ARTIFACT_FORMAT) {
        findings.push({
            code: 'format-outdated',
            path: rel(join(autonomos, 'manifest.json')),
            message: `Records use artifact format ${format}; run \`autonomos migrate\` to reach format ${ARTIFACT_FORMAT}.`,
        })
    }

    const tasksPath = join(autonomos, TASKS_FILE)
    const tasks = readIfFile(tasksPath)
    if (tasks !== undefined) {
        const entries = parseTaskEntries(tasks)
        const closed = entries.filter(e => e.status === 'x').map(e => e.id)
        if (closed.length) {
            findings.push({
                code: 'closed-tasks-in-current',
                path: rel(tasksPath),
                message: `${closed.length} completed task(s) still in the current registry; run \`autonomos close <ID>\`.`,
                items: closed,
            })
        }
        const bytes = Buffer.byteLength(tasks)
        if (bytes > budgets.tasksBytes) {
            findings.push({
                code: 'tasks-size',
                path: rel(tasksPath),
                message: `${kb(bytes)} exceeds the ${kb(budgets.tasksBytes)} budget.`,
            })
        }
        const long = entries
            .filter(e => e.status !== 'x' && e.text.length > budgets.taskEntryChars)
            .sort((a, b) => b.text.length - a.text.length)
        if (long.length) {
            findings.push({
                code: 'task-entry-length',
                path: rel(tasksPath),
                message: `${long.length} open task entr${long.length === 1 ? 'y exceeds' : 'ies exceed'} ${budgets.taskEntryChars} characters; keep evidence in worklogs.`,
                items: long.map(e => `${e.id} (${e.text.length})`),
            })
        }
    }

    const issuesPath = join(autonomos, ISSUES_FILE)
    const issues = readIfFile(issuesPath)
    if (issues !== undefined) {
        const closed = parseIssueEntries(issues)
            .filter(e => isClosedIssueStatus(e.status))
            .map(e => e.id)
        if (closed.length) {
            findings.push({
                code: 'closed-issues-in-current',
                path: rel(issuesPath),
                message: `${closed.length} closed issue(s) still in the current registry; run \`autonomos close <ID>\`.`,
                items: closed,
            })
        }
        const bytes = Buffer.byteLength(issues)
        if (bytes > budgets.issuesBytes) {
            findings.push({
                code: 'issues-size',
                path: rel(issuesPath),
                message: `${kb(bytes)} exceeds the ${kb(budgets.issuesBytes)} budget.`,
            })
        }
    }

    for (const agentPath of findAgentFilePaths(root)) {
        const isRoot = agentPath === join(root, AGENT_FILE)
        const limit = isRoot ? budgets.rootAgentBytes : budgets.localAgentBytes
        const bytes = size(agentPath)
        if (bytes > limit) {
            findings.push({
                code: isRoot ? 'root-agent-size' : 'local-agent-size',
                path: rel(agentPath),
                message: `${kb(bytes)} exceeds the ${kb(limit)} budget; move scoped or incidental knowledge to a narrower AGENT.md or project documentation.`,
            })
        }
    }

    const worklogs = join(autonomos, WORKLOGS_DIR)
    if (existsSync(worklogs)) {
        const over: { name: string; bytes: number }[] = []
        for (const entry of readdirSync(worklogs, { withFileTypes: true })) {
            if (!entry.isFile() || !entry.name.endsWith('.md')) continue
            const bytes = size(join(worklogs, entry.name))
            if (bytes > budgets.worklogBytes) over.push({ name: entry.name, bytes })
        }
        if (over.length) {
            over.sort((a, b) => b.bytes - a.bytes)
            findings.push({
                code: 'worklog-size',
                path: rel(worklogs),
                message: `${over.length} worklog(s) exceed ${kb(budgets.worklogBytes)}; keep only outcome, decisions, validation and open items.`,
                items: over.map(w => `${w.name} (${kb(w.bytes)})`),
            })
        }
    }

    return findings
}
