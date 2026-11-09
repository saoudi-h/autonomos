import { execFileSync } from 'node:child_process'
import {
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
} from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'

import {
    appendToClosedRegistry,
    ARCHIVE_DIR,
    ARCHIVE_INDEX_FILE,
    ARTIFACT_FORMAT,
    AUTONOMOS_DIR,
    checkContextBudgets,
    CLOSED_DIR,
    dedentEntry,
    extractIssues,
    extractTasks,
    findProjectRoot,
    generateManifestContent,
    isClosedIssueStatus,
    ISSUES_FILE,
    LEGACY_WORKLOGS_DIR,
    MANIFEST_FILE,
    manifestArtifactFormat,
    mentionsUnfinishedWork,
    parseIssueEntries,
    parseManifest,
    parseTaskEntries,
    prefixMapper,
    relocateLinks,
    relocateRootMentions,
    stampAbandoned,
    stampCompleted,
    TASKS_FILE,
    WORKLOGS_DIR,
    type BudgetFinding,
    type Manifest,
    type PathMapper,
} from '@autonomos/core'

interface Paths {
    root: string
    autonomos: string
    manifest: string
    tasks: string
    issues: string
    closedDir: string
    closedTasks: string
    closedIssues: string
    worklogs: string
    legacyWorklogs: string
    archiveIndex: string
}

function resolvePaths(cwd: string): Paths {
    const root = findProjectRoot(cwd) ?? cwd
    const autonomos = join(root, AUTONOMOS_DIR)
    const archive = join(autonomos, ARCHIVE_DIR)
    const closedDir = join(archive, CLOSED_DIR)
    return {
        root,
        autonomos,
        manifest: join(autonomos, MANIFEST_FILE),
        tasks: join(autonomos, TASKS_FILE),
        issues: join(autonomos, ISSUES_FILE),
        closedDir,
        closedTasks: join(closedDir, TASKS_FILE),
        closedIssues: join(closedDir, ISSUES_FILE),
        worklogs: join(autonomos, WORKLOGS_DIR),
        legacyWorklogs: join(archive, LEGACY_WORKLOGS_DIR),
        archiveIndex: join(archive, ARCHIVE_INDEX_FILE),
    }
}

function today(): string {
    return new Date().toISOString().slice(0, 10)
}

function readOptional(path: string): string | undefined {
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
}

function readManifest(paths: Paths): Manifest | string {
    if (!existsSync(paths.manifest)) return 'Project not initialized. Run `autonomos init` first.'
    try {
        return parseManifest(readFileSync(paths.manifest, 'utf8'))
    } catch {
        return 'Could not read manifest.json'
    }
}

/** Pending writes; `read` sees planned content before it reaches the disk. */
class Plan {
    readonly writes = new Map<string, string>()
    readonly renames: { from: string; to: string }[] = []
    readonly deletes = new Set<string>()

    read(path: string): string | undefined {
        return this.writes.get(path) ?? (this.deletes.has(path) ? undefined : readOptional(path))
    }

    write(path: string, content: string): void {
        if (readOptional(path) === content && !this.writes.has(path)) return
        this.writes.set(path, content)
    }

    apply(): void {
        for (const { from, to } of this.renames) {
            mkdirSync(dirname(to), { recursive: true })
            renameSync(from, to)
        }
        for (const [path, content] of this.writes) {
            mkdirSync(dirname(path), { recursive: true })
            writeFileSync(path, content)
        }
        for (const path of this.deletes) if (existsSync(path)) unlinkSync(path)
    }
}

interface ClosedRecords {
    tasks: string[]
    issues: string[]
    /** Closed records that still mention unfinished work. */
    followUps: string[]
}

/**
 * Move selected task/issue entries into the closed registries.
 * `transformTask` may stamp dates; link targets are repaired for the new location.
 */
function planClose(
    plan: Plan,
    paths: Paths,
    selectTask: (id: string, status: string) => boolean,
    selectIssue: (id: string, status: string) => boolean,
    options: {
        mapPath?: PathMapper
        transformTask?: (text: string, status: string) => string
        /** Date for migration batches grouped by source heading. */
        groupByHeading?: string
        /** Fixed group heading, e.g. `Closed 2026-11-08`. */
        heading?: string
    } = {}
): ClosedRecords {
    const closed: ClosedRecords = { tasks: [], issues: [], followUps: [] }
    const relocate = (text: string): string =>
        relocateLinks(text, paths.autonomos, paths.closedDir, options.mapPath)

    const tasks = plan.read(paths.tasks)
    if (tasks !== undefined) {
        const { remaining, moved } = extractTasks(tasks, e => selectTask(e.id, e.status))
        if (moved.length) {
            plan.write(paths.tasks, remaining)
            let registry = plan.read(paths.closedTasks)
            const groups = new Map<string, string[]>()
            for (const entry of moved) {
                closed.tasks.push(entry.id)
                if (mentionsUnfinishedWork(entry.text)) closed.followUps.push(entry.id)
                let text = dedentEntry(entry.text)
                if (options.transformTask) text = options.transformTask(text, entry.status)
                const key = options.groupByHeading
                    ? relocate(
                          `${['From TASKS.md', ...entry.headings].join(' › ')} (moved ${options.groupByHeading})`
                      )
                    : (options.heading ?? '')
                groups.set(key, [...(groups.get(key) ?? []), relocate(text)])
            }
            for (const [heading, entries] of groups)
                registry = appendToClosedRegistry(registry, 'tasks', entries, heading || undefined)
            plan.write(paths.closedTasks, registry ?? '')
        }
    }

    const issues = plan.read(paths.issues)
    if (issues !== undefined) {
        const { remaining, moved } = extractIssues(issues, e => selectIssue(e.id, e.status))
        if (moved.length) {
            plan.write(paths.issues, remaining)
            const heading = options.groupByHeading
                ? `From ISSUES.md (moved ${options.groupByHeading})`
                : options.heading
            plan.write(
                paths.closedIssues,
                appendToClosedRegistry(
                    plan.read(paths.closedIssues),
                    'issues',
                    moved.map(e => relocate(e.text)),
                    heading
                )
            )
            closed.issues.push(...moved.map(e => e.id))
            closed.followUps.push(
                ...moved.filter(e => mentionsUnfinishedWork(e.text)).map(e => e.id)
            )
        }
    }
    return closed
}

// ---------------------------------------------------------------------------
// close
// ---------------------------------------------------------------------------

export interface CloseOptions {
    cwd?: string
    ids: string[]
    date?: string
    /** Close unfinished tasks as abandoned with this reason. */
    abandoned?: string
    dryRun?: boolean
}

export interface CloseResult {
    success: boolean
    message: string
    closedTasks: string[]
    closedIssues: string[]
}

export function close(options: CloseOptions): CloseResult {
    const paths = resolvePaths(options.cwd ?? process.cwd())
    const fail = (message: string): CloseResult => ({
        success: false,
        message,
        closedTasks: [],
        closedIssues: [],
    })
    const manifest = readManifest(paths)
    if (typeof manifest === 'string') return fail(manifest)
    const ids = [...new Set(options.ids.map(id => id.trim()).filter(Boolean))]
    if (!ids.length) return fail('Provide at least one task or issue ID.')
    const date = options.date ?? today()

    const tasks = parseTaskEntries(readOptional(paths.tasks) ?? '')
    const issues = parseIssueEntries(readOptional(paths.issues) ?? '')
    const problems: string[] = []
    for (const id of ids) {
        const task = tasks.find(t => t.id === id)
        const issue = issues.find(i => i.id === id)
        if (!task && !issue) {
            const history = `${readOptional(paths.closedTasks) ?? ''}\n${readOptional(paths.closedIssues) ?? ''}`
            problems.push(
                history.includes(`[${id}]`)
                    ? `${id} is already closed.`
                    : `${id} is not in the current TASKS.md or ISSUES.md.`
            )
            continue
        }
        if (task && task.status !== 'x' && !options.abandoned)
            problems.push(
                `${id} is not marked [x]; complete it first or pass --abandoned "<reason>".`
            )
        if (task && tasks.some(t => t.start > task.start && t.start < task.end && t.status !== 'x'))
            problems.push(`${id} has open nested tasks; close or move them first.`)
        if (!task && issue && !isClosedIssueStatus(issue.status))
            problems.push(
                `${id} has status "${issue.status || 'unknown'}"; set it to resolved or declined first.`
            )
    }
    if (problems.length) return fail(problems.join('\n'))

    const plan = new Plan()
    const wanted = new Set(ids)
    const closed = planClose(
        plan,
        paths,
        id => wanted.has(id),
        id => wanted.has(id) && !tasks.some(t => t.id === id),
        {
            heading: `Closed ${date}`,
            transformTask: (text, status) =>
                status === 'x'
                    ? stampCompleted(text, date)
                    : stampAbandoned(text, date, options.abandoned ?? 'abandoned'),
        }
    )
    if (!options.dryRun) plan.apply()
    const all = [...closed.tasks, ...closed.issues]
    return {
        success: true,
        message: `${options.dryRun ? 'Would close' : 'Closed'} ${all.join(', ')} → ${relative(paths.root, paths.closedDir)}/`,
        closedTasks: closed.tasks,
        closedIssues: closed.issues,
    }
}

// ---------------------------------------------------------------------------
// migrate
// ---------------------------------------------------------------------------

export interface MigrateOptions {
    cwd?: string
    dryRun?: boolean
    date?: string
}

export interface MigrateResult {
    success: boolean
    message: string
    fromFormat?: number
    toFormat?: number
    closedTasks: string[]
    closedIssues: string[]
    movedWorklogs: number
    rewrittenFiles: string[]
    /** Closed records that still mention unfinished work; review before relying on the archive. */
    followUps: string[]
    /** Notes about what this run could not see or did to keep ignored files ignored. */
    notes: string[]
    bytes?: { tasks: [number, number]; issues: [number, number] }
    /** Remaining semantic work for `/reconcile`. */
    findings: BudgetFinding[]
    /** What the agent must still do to finish the upgrade, in order. */
    nextSteps: string[]
}

const SKIPPED = new Set(['node_modules', 'dist', 'build', 'coverage'])

function listFiles(dir: string): string[] {
    const files: string[] = []
    const walk = (current: string): void => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            const path = join(current, entry.name)
            if (entry.isDirectory()) walk(path)
            else if (entry.isFile()) files.push(path)
        }
    }
    if (existsSync(dir)) walk(dir)
    return files
}

function listMarkdown(root: string): string[] {
    const files: string[] = []
    const walk = (dir: string): void => {
        let entries
        try {
            entries = readdirSync(dir, { withFileTypes: true })
        } catch {
            return
        }
        for (const entry of entries) {
            const path = join(dir, entry.name)
            if (entry.isDirectory()) {
                if (SKIPPED.has(entry.name)) continue
                if (entry.name.startsWith('.') && entry.name !== AUTONOMOS_DIR) continue
                walk(path)
            } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) files.push(path)
        }
    }
    walk(root)
    return files
}

/** Remove empty directories below `dir`, keeping `dir` itself. */
function removeEmptyDirectories(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const child = join(dir, entry.name)
        removeEmptyDirectories(child)
        if (readdirSync(child).length === 0) rmdirSync(child)
    }
}

function toPosix(path: string): string {
    return path.split(sep).join('/')
}

function git(root: string, args: string[], input?: string): string | undefined {
    try {
        return execFileSync('git', args, {
            cwd: root,
            input,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        })
    } catch (error) {
        // check-ignore exits 1 when nothing matches.
        const out = (error as { stdout?: string }).stdout
        return typeof out === 'string' ? out : undefined
    }
}

/** Paths (relative to root, posix) that git ignores among `paths`. */
function ignoredPaths(root: string, paths: string[]): Set<string> {
    if (!paths.length) return new Set()
    const out = git(root, ['check-ignore', '--stdin'], paths.join('\n') + '\n')
    return new Set((out ?? '').split('\n').filter(Boolean))
}

function isLinkedWorktree(root: string): boolean {
    const dir = git(root, ['rev-parse', '--path-format=absolute', '--git-dir'])?.trim()
    const common = git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir'])?.trim()
    return Boolean(dir && common && dir !== common)
}

/** Date legacy worklogs were quarantined, read from the archive index. */
function quarantineDate(index: string | undefined): string | undefined {
    const line = index?.split('\n').find(l => l.includes(`\`${LEGACY_WORKLOGS_DIR}/\``))
    return line?.match(/moved on (\d{4}-\d{2}-\d{2})/)?.[1]
}

const INDEX_HEADER = `# Archive index

> Project history, searched by topic or ID only when a question requires it. Not startup context.
`

export function migrate(options: MigrateOptions = {}): MigrateResult {
    const paths = resolvePaths(options.cwd ?? process.cwd())
    const empty = {
        closedTasks: [],
        closedIssues: [],
        movedWorklogs: 0,
        rewrittenFiles: [],
        followUps: [],
        notes: [],
        findings: [],
        nextSteps: [],
    }
    const manifest = readManifest(paths)
    if (typeof manifest === 'string') return { success: false, message: manifest, ...empty }
    if (lstatSync(paths.autonomos).isSymbolicLink())
        return {
            success: false,
            message: 'Refusing to migrate a symbolic .autonomos directory.',
            ...empty,
        }

    const fromFormat = manifestArtifactFormat(manifest)
    const date = options.date ?? today()
    const plan = new Plan()
    const tasksBefore = Buffer.byteLength(readOptional(paths.tasks) ?? '')
    const issuesBefore = Buffer.byteLength(readOptional(paths.issues) ?? '')

    // 1. Quarantine legacy worklogs so they stop serving as examples. After the
    // upgrade, files dated before the quarantine (e.g. git-ignored worklogs of
    // another checkout, merged later) still belong to the old format.
    const since = quarantineDate(readOptional(paths.archiveIndex))
    const legacy = listFiles(paths.worklogs).filter(path => {
        if (path.endsWith(`${sep}.gitkeep`)) return false
        if (fromFormat < ARTIFACT_FORMAT) return true
        const date = relative(paths.worklogs, path).match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
        return Boolean(since && date && date < since)
    })
    const conflicts = legacy.filter(path =>
        existsSync(join(paths.legacyWorklogs, relative(paths.worklogs, path)))
    )
    if (conflicts.length)
        return {
            success: false,
            message: `Cannot move worklogs; already present in ${relative(paths.root, paths.legacyWorklogs)}: ${conflicts.map(p => relative(paths.worklogs, p)).join(', ')}`,
            ...empty,
        }
    const mapPath = legacy.length
        ? prefixMapper(paths.worklogs, paths.legacyWorklogs)
        : (p: string) => p
    const movedNames = new Set(legacy.map(path => toPosix(relative(paths.worklogs, path))))
    const fromPrefix = toPosix(relative(paths.root, paths.worklogs))
    const toPrefix = toPosix(relative(paths.root, paths.legacyWorklogs))
    const notes: string[] = []
    // Keep git-ignored (private) worklogs ignored at their new location.
    const rel = (path: string): string => toPosix(relative(paths.root, path))
    const ignoredSources = ignoredPaths(paths.root, legacy.map(rel))
    const ignoredTargets = ignoredPaths(
        paths.root,
        legacy.map(p => rel(mapPath(p)))
    )
    const keepIgnored = legacy
        .filter(p => ignoredSources.has(rel(p)) && !ignoredTargets.has(rel(mapPath(p))))
        .map(p => `/${toPosix(relative(paths.legacyWorklogs, mapPath(p)))}`)
    if (keepIgnored.length) {
        const ignoreFile = join(paths.legacyWorklogs, '.gitignore')
        const current =
            plan.read(ignoreFile) ?? '# Worklogs that were git-ignored before the move.\n'
        const known = new Set(current.split('\n'))
        const added = keepIgnored.filter(line => !known.has(line))
        if (added.length) plan.write(ignoreFile, current + added.join('\n') + '\n')
        notes.push(
            `${keepIgnored.length} git-ignored worklog(s) stay ignored via ${rel(ignoreFile)}.`
        )
    }
    // Only the format upgrade moves every worklog, so only then can another checkout's be missed.
    if (fromFormat < ARTIFACT_FORMAT && isLinkedWorktree(paths.root))
        notes.push(
            'Linked git worktree: git-ignored worklogs of other checkouts are not visible here. After merging, run `autonomos migrate` in each checkout that has them.'
        )
    for (const path of legacy) {
        const target = mapPath(path)
        if (/\.mdx?$/.test(path)) {
            plan.write(
                target,
                relocateLinks(readFileSync(path, 'utf8'), dirname(path), dirname(target), mapPath)
            )
            plan.deletes.add(path)
        } else plan.renames.push({ from: path, to: target })
    }

    // 2. Close completed tasks and closed issues (no invented completion dates).
    const closed = planClose(
        plan,
        paths,
        (_id, status) => status === 'x',
        (_id, status) => isClosedIssueStatus(status),
        { mapPath, groupByHeading: date }
    )

    // 3. Repair references to moved worklogs across project Markdown.
    const planned = [...plan.writes.keys()]
    const candidates = new Set([
        ...listMarkdown(paths.root).filter(p => !plan.deletes.has(p)),
        ...planned.filter(p => /\.mdx?$/.test(p)),
    ])
    for (const path of candidates) {
        const current = plan.read(path)
        if (current === undefined) continue
        let next = legacy.length
            ? relocateLinks(current, dirname(path), dirname(path), mapPath)
            : current
        if (movedNames.size) next = relocateRootMentions(next, fromPrefix, toPrefix, movedNames)
        if (next !== current) plan.write(path, next)
    }
    const rewrittenFiles = [...plan.writes.keys()]
        .filter(path => existsSync(path) && !legacy.includes(path))
        .map(path => relative(paths.root, path))
        .sort()

    // 4. Index the batches.
    const indexLines: string[] = []
    if (closed.tasks.length || closed.issues.length || existsSync(paths.closedDir))
        indexLines.push(
            `- \`${CLOSED_DIR}/\` — closed tasks and issues, appended when work closes (artifact format 2). Search by ID.`
        )
    if (legacy.length)
        indexLines.push(
            `- \`${LEGACY_WORKLOGS_DIR}/\` — files written before artifact format 2, moved on ${since ?? date}. Historical evidence only; not a model for new worklogs.`
        )
    if (indexLines.length) {
        let index = plan.read(paths.archiveIndex) ?? INDEX_HEADER
        // Match on the directory name alone: index lines may be reworded by hand.
        const missing = indexLines.filter(
            line => !index.includes(line.match(/`[^`]+`/)?.[0] ?? line)
        )
        if (missing.length) {
            index = index.replace(/\s*$/, '\n') + '\n' + missing.join('\n') + '\n'
            plan.write(paths.archiveIndex, index)
        }
    }

    // 5. Record the format.
    if (fromFormat < ARTIFACT_FORMAT) {
        plan.write(
            paths.manifest,
            generateManifestContent({
                ...manifest,
                artifactFormat: ARTIFACT_FORMAT,
                lastUpdated: new Date().toISOString(),
            })
        )
    }

    if (!options.dryRun) {
        plan.apply()
        if (legacy.length) {
            removeEmptyDirectories(paths.worklogs)
            // Keep the emptied directory under version control for new worklogs.
            if (readdirSync(paths.worklogs).length === 0)
                writeFileSync(join(paths.worklogs, '.gitkeep'), '')
        }
    }
    const tasksAfter = Buffer.byteLength(plan.read(paths.tasks) ?? '')
    const issuesAfter = Buffer.byteLength(plan.read(paths.issues) ?? '')
    const findings = options.dryRun
        ? []
        : checkContextBudgets(paths.root, { artifactFormat: ARTIFACT_FORMAT }).filter(
              f => f.code !== 'format-outdated'
          )
    const changed = plan.writes.size + plan.renames.length + plan.deletes.size > 0
    const nextSteps: string[] = []
    if (options.dryRun && changed) nextSteps.push('Run `autonomos migrate` to apply this plan.')
    if (closed.followUps.length)
        nextSteps.push(
            `Review the ${closed.followUps.length} closed record(s) listed above (\`autonomos status --history\` lists them again): move each unfinished follow-up into an open task or issue, or note in the worklog that it is settled.`
        )
    if (findings.length)
        nextSteps.push(
            `Resolve the ${findings.length} remaining finding(s) now with /reconcile: move details and acceptance criteria of long open tasks to worklogs before shortening them; move scoped AGENT.md guidance verbatim to narrower AGENT.md files or docs. Never delete content. Findings are agent work, not owner decisions; if one cannot be finished in this task, register an open task saying what remains instead of leaving it silently.`
        )
    if (changed)
        nextSteps.push(
            'Record the upgrade: register its task in TASKS.md if missing, write its worklog, mark the task [x], then run `autonomos close <ID>`.',
            'Run `autonomos status --strict`; every finding left must be tracked by an open task.'
        )
    return {
        success: true,
        message: !changed
            ? `Already at artifact format ${ARTIFACT_FORMAT}; nothing to move.`
            : fromFormat < ARTIFACT_FORMAT
              ? `${options.dryRun ? 'Would migrate' : 'Migrated'} records from format ${fromFormat} to ${ARTIFACT_FORMAT}.`
              : `${options.dryRun ? 'Would archive' : 'Archived'} records left in current context (format ${ARTIFACT_FORMAT}).`,
        fromFormat,
        toFormat: ARTIFACT_FORMAT,
        closedTasks: closed.tasks,
        closedIssues: closed.issues,
        movedWorklogs: legacy.length,
        rewrittenFiles,
        followUps: closed.followUps,
        notes,
        bytes: { tasks: [tasksBefore, tasksAfter], issues: [issuesBefore, issuesAfter] },
        findings,
        nextSteps,
    }
}
