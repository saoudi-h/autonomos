/**
 * Pure text operations on TASKS.md / ISSUES.md used by `close`, `migrate`
 * and budget checks. They never rewrite the content of a moved record.
 */

const TASK_LINE = /^\s*- \[([ x/!])\] \*\*\[([^\]]+)\]\*\*/
const HEADING = /^(#{1,6})[ \t]+(\S.*)?$/
const FENCE = /^\s{0,3}(`{3,}|~{3,})/
const ISSUE_HEADING = /^##\s+\[([^\]]+)\]/
const ISSUE_STATUS = /^\s*[-*]\s*(?:\*\*)?status:?(?:\*\*)?:?[ \t]*(?:\*\*)?([a-z-]+)/i

/** Issue statuses that mean the issue no longer needs current attention. */
export const CLOSED_ISSUE_STATUSES = ['resolved', 'declined', 'closed', 'superseded', 'rejected']

export interface TaskEntry {
    id: string
    status: ' ' | 'x' | '/' | '!'
    /** 0-based index of the first line of the entry. */
    start: number
    /** 0-based exclusive end line index. */
    end: number
    /** Heading path enclosing the entry, outermost first (title excluded). */
    headings: string[]
    text: string
}

export interface IssueEntry {
    id: string
    status: string
    start: number
    end: number
    text: string
}

function splitLines(markdown: string): string[] {
    return markdown.split(/\r?\n/)
}

/** Mark lines that are inside fenced code blocks (fence lines included). */
function fencedLines(lines: string[]): boolean[] {
    const result: boolean[] = []
    let fence: string | undefined
    for (const line of lines) {
        const marker = line.match(FENCE)
        if (marker?.[1]) {
            if (!fence) {
                fence = marker[1]
                result.push(true)
                continue
            }
            if (
                marker[1][0] === fence[0] &&
                marker[1].length >= fence.length &&
                !line.slice(marker[0].length).trim()
            ) {
                fence = undefined
                result.push(true)
                continue
            }
        }
        result.push(fence !== undefined)
    }
    return result
}

function indentOf(line: string): number {
    return (line.match(/^\s*/)?.[0] ?? '').replace(/\t/g, '    ').length
}

/**
 * Parse task entries: a task line plus following lines indented deeper than it
 * (continuations and sub-bullets). Nested tasks are returned as their own entries
 * and are also part of their parent's text.
 */
export function parseTaskEntries(markdown: string): TaskEntry[] {
    const lines = splitLines(markdown)
    const fenced = fencedLines(lines)
    const entries: TaskEntry[] = []
    const headingStack: { level: number; text: string }[] = []
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? ''
        if (fenced[i]) continue
        const heading = line.match(HEADING)
        if (heading?.[1]) {
            const level = heading[1].length
            while (headingStack.length && (headingStack.at(-1)?.level ?? 0) >= level)
                headingStack.pop()
            headingStack.push({ level, text: (heading[2] ?? '').trim() })
            continue
        }
        const match = line.match(TASK_LINE)
        if (!match) continue
        const indent = indentOf(line)
        let end = i + 1
        let lastContent = i + 1
        while (end < lines.length) {
            const next = lines[end] ?? ''
            if (!fenced[end] && next.trim() === '') {
                end++
                continue
            }
            const opensFence = fenced[end] && !fenced[end - 1]
            if (opensFence && indentOf(next) <= indent) break
            if (!fenced[end] && indentOf(next) <= indent) break
            if (!fenced[end] && HEADING.test(next)) break
            end++
            lastContent = end
        }
        entries.push({
            id: (match[2] ?? '').trim(),
            status: (match[1] ?? ' ') as TaskEntry['status'],
            start: i,
            end: lastContent,
            headings: headingStack.filter(h => h.level > 1).map(h => h.text),
            text: lines.slice(i, lastContent).join('\n'),
        })
    }
    return entries
}

export function parseIssueEntries(markdown: string): IssueEntry[] {
    const lines = splitLines(markdown)
    const fenced = fencedLines(lines)
    const starts: number[] = []
    for (let i = 0; i < lines.length; i++) {
        if (!fenced[i] && /^#{1,2}\s/.test(lines[i] ?? '')) starts.push(i)
    }
    const entries: IssueEntry[] = []
    for (const [index, start] of starts.entries()) {
        const id = (lines[start] ?? '').match(ISSUE_HEADING)?.[1]?.trim()
        if (!id) continue
        let end = starts[index + 1] ?? lines.length
        while (end > start + 1 && (lines[end - 1] ?? '').trim() === '') end--
        const body = lines.slice(start, end)
        let status = ''
        for (const line of body) {
            const m = line.match(ISSUE_STATUS)
            if (m?.[1]) {
                status = m[1].toLowerCase()
                break
            }
        }
        entries.push({ id, status, start, end, text: body.join('\n') })
    }
    return entries
}

export function isClosedIssueStatus(status: string): boolean {
    return CLOSED_ISSUE_STATUSES.includes(status.toLowerCase())
}

/** True when an entry contains an open nested task (it must stay current). */
function hasOpenDescendant(entry: TaskEntry, all: TaskEntry[]): boolean {
    return all.some(
        other => other.start > entry.start && other.start < entry.end && other.status !== 'x'
    )
}

export interface Extraction<T> {
    remaining: string
    moved: T[]
}

/**
 * Remove whole-line ranges from a document, then drop headings that lost all
 * their content because of the removal (never the level-1 title or a heading
 * that was already empty), and collapse blank-line runs.
 */
function removeRanges(markdown: string, ranges: { start: number; end: number }[]): string {
    const lines = splitLines(markdown)
    const originalFenced = fencedLines(lines)
    const drop = new Set<number>()
    for (const range of ranges) for (let i = range.start; i < range.end; i++) drop.add(i)
    const level = (line: string, fenced: boolean | undefined): number =>
        fenced ? 0 : (line.match(HEADING)?.[1]?.length ?? 0)
    // Headings whose section (up to the next heading of the same or higher level) lost lines.
    const eligible = new Set<number>()
    for (let i = 0; i < lines.length; i++) {
        const own = level(lines[i] ?? '', originalFenced[i])
        if (own < 2) continue
        for (let j = i + 1; j < lines.length; j++) {
            const other = level(lines[j] ?? '', originalFenced[j])
            if (other && other <= own) break
            if (drop.has(j)) {
                eligible.add(i)
                break
            }
        }
    }
    let kept = lines.map((text, index) => ({ text, index })).filter(l => !drop.has(l.index))
    for (let changed = true; changed; ) {
        changed = false
        const fenced = fencedLines(kept.map(l => l.text))
        for (let i = kept.length - 1; i >= 0; i--) {
            const current = kept[i]
            if (!current || !eligible.has(current.index)) continue
            const own = level(current.text, fenced[i])
            if (own < 2) continue
            let j = i + 1
            let empty = true
            for (; j < kept.length; j++) {
                const next = kept[j]?.text ?? ''
                const other = level(next, fenced[j])
                if (other && other <= own) break
                if (other || next.trim() !== '') {
                    empty = false
                    break
                }
            }
            if (empty) {
                kept = [...kept.slice(0, i), ...kept.slice(j)]
                changed = true
                break
            }
        }
    }
    const collapsed: string[] = []
    for (const { text } of kept) {
        if (text.trim() === '' && (collapsed.at(-1) ?? 'x').trim() === '') continue
        collapsed.push(text)
    }
    while (collapsed.length && (collapsed.at(-1) ?? '').trim() === '') collapsed.pop()
    return collapsed.join('\n') + '\n'
}

/**
 * Extract task entries matching `select` from a TASKS.md document.
 * Entries with open nested tasks are never extracted.
 */
export function extractTasks(
    markdown: string,
    select: (entry: TaskEntry) => boolean
): Extraction<TaskEntry> {
    const all = parseTaskEntries(markdown)
    const moved: TaskEntry[] = []
    for (const entry of all) {
        if (moved.some(m => entry.start >= m.start && entry.start < m.end)) continue
        if (!select(entry) || hasOpenDescendant(entry, all)) continue
        moved.push(entry)
    }
    if (!moved.length) return { remaining: markdown, moved }
    return { remaining: removeRanges(markdown, moved), moved }
}

export function extractIssues(
    markdown: string,
    select: (entry: IssueEntry) => boolean
): Extraction<IssueEntry> {
    const moved = parseIssueEntries(markdown).filter(select)
    if (!moved.length) return { remaining: markdown, moved }
    return { remaining: removeRanges(markdown, moved), moved }
}

/** Remove the common leading indentation of an entry so it stands alone. */
export function dedentEntry(text: string): string {
    const lines = text.split('\n')
    const indent = indentOf(lines[0] ?? '')
    if (!indent) return text
    return lines.map(line => (indentOf(line) >= indent ? line.slice(indent) : line)).join('\n')
}

/** Add `Completed: <date>` to a task line that has no completion date. */
export function stampCompleted(text: string, date: string): string {
    if (/Completed:\s*\d{4}-\d{2}-\d{2}/.test(text)) return text
    const [first = '', ...rest] = text.split('\n')
    const complexity = first.match(/`Complexity: [^`]+`/)
    const stamped = complexity
        ? first.replace(complexity[0], `${complexity[0]} \`Completed: ${date}\``)
        : `${first} \`Completed: ${date}\``
    return [stamped, ...rest].join('\n')
}

/** Mark an unfinished task as abandoned (it keeps its status marker). */
export function stampAbandoned(text: string, date: string, reason: string): string {
    const [first = '', ...rest] = text.split('\n')
    return [`${first} \`Abandoned: ${date}\` — ${reason}`, ...rest].join('\n')
}

/** Append entries to a closed registry, creating its header when empty. */
export function appendToClosedRegistry(
    existing: string | undefined,
    kind: 'tasks' | 'issues',
    entries: string[],
    groupHeading?: string
): string {
    const source = kind === 'tasks' ? 'TASKS.md' : 'ISSUES.md'
    const title = kind === 'tasks' ? 'Closed tasks' : 'Closed issues'
    const header = `# ${title}\n\n> Append-only history moved out of \`.autonomos/${source}\`. Not startup context; search by ID.\n`
    const base = existing && existing.trim() ? existing.replace(/\s*$/, '\n') : header
    const parts = [base]
    if (groupHeading) parts.push(`## ${groupHeading}\n`)
    const joiner = kind === 'issues' ? '\n\n' : '\n'
    parts.push(entries.map(e => e.replace(/\s*$/, '')).join(joiner) + '\n')
    return parts.join('\n')
}
