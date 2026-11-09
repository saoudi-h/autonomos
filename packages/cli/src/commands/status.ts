import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import {
    ARCHIVE_DIR,
    AUTONOMOS_DIR,
    checkContextBudgets,
    findRecordLoss,
    ISSUES_FILE,
    LEGACY_WORKLOGS_DIR,
    MANIFEST_FILE,
    manifestArtifactFormat,
    parseManifest,
    readTaskRegistry,
    TASKS_FILE,
    type BudgetFinding,
    type Manifest,
    type RecordLoss,
    type TaskReference,
} from '@autonomos/core'
import { verifyProtocolArtifacts, type ArtifactIntegrity } from '../protocol-artifacts'

interface StatusOptions {
    cwd?: string
    history?: boolean
    /** Git revision to compare records with (default: HEAD, i.e. uncommitted changes). */
    since?: string
}

interface TaskSummary {
    total: number
    todo: number
    inProgress: number
    done: number
    blocked: number
}

export interface StatusResult {
    success: boolean
    message: string
    protocolVersion?: string
    cliVersion?: string
    initialized: boolean
    taskSummary?: TaskSummary
    archivedTaskSummary?: TaskSummary
    historyComplete?: boolean
    duplicateTaskIds?: string[]
    warnings?: string[]
    artifactIntegrity?: ArtifactIntegrity
    driftedArtifacts?: string[]
    artifactFormat?: number
    /** Advisory context-budget findings (artifact format 2). */
    budgetFindings?: BudgetFinding[]
    /** Records removed or shortened without their content being kept elsewhere. */
    recordLoss?: RecordLoss[]
    /** Revision the record comparison used, when it ran. */
    recordBase?: string
    /** Why the record comparison could not run with an explicit `since`. */
    recordBaseError?: string
}

function git(cwd: string, args: string[]): string | undefined {
    try {
        return execFileSync('git', args, {
            cwd,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 64 * 1024 * 1024,
        })
    } catch {
        return undefined
    }
}

/**
 * Compare current registries with a git revision. The added text is every line
 * the change adds (tracked diff plus untracked Markdown), where moved content lands.
 */
function checkRecordLoss(cwd: string, since: string): { losses?: RecordLoss[]; error?: string } {
    if (git(cwd, ['rev-parse', '--verify', '--quiet', `${since}^{commit}`]) === undefined)
        return { error: `Unknown git revision: ${since}` }
    const show = (file: string): string =>
        git(cwd, ['show', `${since}:./${AUTONOMOS_DIR}/${file}`]) ?? ''
    const read = (file: string): string => {
        const path = join(cwd, AUTONOMOS_DIR, file)
        return existsSync(path) ? readFileSync(path, 'utf8') : ''
    }
    const before = { tasks: show(TASKS_FILE), issues: show(ISSUES_FILE) }
    if (!before.tasks && !before.issues) return { losses: [] }
    const diff = git(cwd, ['diff', '--no-color', '--no-ext-diff', '-U0', since, '--', '.']) ?? ''
    const added = diff
        .split('\n')
        .filter(line => line.startsWith('+') && !line.startsWith('+++'))
        .map(line => line.slice(1))
    const untracked = (git(cwd, ['ls-files', '--others', '--exclude-standard', '--', '.']) ?? '')
        .split('\n')
        .filter(path => /\.mdx?$/.test(path))
    for (const path of untracked) {
        try {
            added.push(readFileSync(join(cwd, path), 'utf8'))
        } catch {
            // Unreadable files cannot hold moved content.
        }
    }
    return {
        losses: findRecordLoss(
            before,
            { tasks: read(TASKS_FILE), issues: read(ISSUES_FILE) },
            added.join('\n'),
            text => readLinkedMarkdown(cwd, text)
        ),
    }
}

/** Contents of the project Markdown files a record links to (worklogs, specs). */
function readLinkedMarkdown(root: string, text: string): string {
    const dot = join(root, AUTONOMOS_DIR)
    const contents: string[] = []
    const seen = new Set<string>()
    for (const [link] of text.matchAll(/[\w./-]+\.mdx?\b/g)) {
        const name = link.replace(/^\.\//, '')
        const candidates = [resolve(root, name), resolve(dot, name)]
        // Format-1 worklogs moved to the legacy archive after the entry was written.
        const worklog = name.match(/(?:^|\/)worklogs\/(.+)$/)?.[1]
        if (worklog) candidates.push(join(dot, ARCHIVE_DIR, LEGACY_WORKLOGS_DIR, worklog))
        const path = candidates.find(c => !relative(root, c).startsWith('..') && existsSync(c))
        if (!path || seen.has(path)) continue
        seen.add(path)
        try {
            contents.push(readFileSync(path, 'utf8'))
        } catch {
            // A directory or unreadable file holds no record text.
        }
    }
    return contents.join('\n')
}

/**
 * Get project status and task summary
 */
export function status(options: StatusOptions = {}): StatusResult {
    const cwd = options.cwd ?? process.cwd()

    // Check if initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)

    if (existsSync(autonomosDir) && !lstatSync(autonomosDir).isDirectory()) {
        return {
            success: false,
            message: 'Expected a regular .autonomos directory; symbolic links are not followed.',
            initialized: false,
        }
    }

    if (!existsSync(manifestPath)) {
        return {
            success: false,
            message: 'Project not initialized. Run `autonomos init` first.',
            initialized: false,
        }
    }

    // Read manifest
    let manifest: Manifest
    try {
        const manifestContent = readFileSync(manifestPath, 'utf-8')
        manifest = parseManifest(manifestContent)
    } catch {
        return {
            success: false,
            message: 'Could not read manifest.json',
            initialized: true,
        }
    }

    // History stays opt-in: ordinary bootstrap must not traverse archives.
    let taskSummary: TaskSummary | undefined
    const registry = readTaskRegistry(cwd, { history: options.history })
    const summarize = (tasks: TaskReference[]): TaskSummary => ({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: tasks.filter(t => t.status === 'DONE').length,
        blocked: tasks.filter(t => t.status === 'BLOCKED').length,
    })
    if (existsSync(join(autonomosDir, TASKS_FILE))) {
        taskSummary = summarize(registry.current)
    }

    const integrity = verifyProtocolArtifacts(cwd, manifest.protocolVersion)
    const base = options.since ?? 'HEAD'
    // Without git (or before the first commit), the default comparison is skipped.
    const loss =
        options.since || git(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD^{commit}'])
            ? checkRecordLoss(cwd, base)
            : {}

    return {
        success: true,
        message: 'Project status retrieved',
        protocolVersion: manifest.protocolVersion,
        cliVersion: manifest.cliVersion,
        initialized: true,
        taskSummary,
        ...(options.history
            ? {
                  archivedTaskSummary: summarize(registry.archived),
                  historyComplete: registry.complete,
              }
            : {}),
        duplicateTaskIds: registry.duplicateIds,
        warnings: registry.warnings,
        artifactIntegrity: integrity.state,
        driftedArtifacts: integrity.driftedFiles,
        artifactFormat: manifestArtifactFormat(manifest),
        budgetFindings: checkContextBudgets(cwd, {
            artifactFormat: manifestArtifactFormat(manifest),
        }),
        ...(loss.losses ? { recordLoss: loss.losses, recordBase: base } : {}),
        ...(loss.error ? { recordBaseError: loss.error } : {}),
    }
}
