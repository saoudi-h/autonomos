import { isAbsolute, posix, relative, resolve, sep } from 'node:path'

/** Map an absolute path to its new location, or return it unchanged. */
export type PathMapper = (absolutePath: string) => string

export function prefixMapper(from: string, to: string): PathMapper {
    return path => {
        if (path === from) return to
        if (path.startsWith(from + sep)) return to + path.slice(from.length)
        return path
    }
}

export function composeMappers(...mappers: PathMapper[]): PathMapper {
    return path => mappers.reduce((current, mapper) => mapper(current), path)
}

const INLINE_LINK = /\]\((<[^>\n]+>|[^)\s]+)((?:\s+"[^"\n]*")?)\)/g
const REFERENCE_DEFINITION = /^(\s{0,3}\[[^\]\n]+\]:\s*)(<[^>\n]+>|\S+)/gm

function isRelativeTarget(target: string): boolean {
    return (
        !!target &&
        !target.startsWith('#') &&
        !isAbsolute(target) &&
        !/^[a-z][\w+.-]*:/i.test(target)
    )
}

function toPosix(path: string): string {
    return path.split(sep).join(posix.sep)
}

/**
 * Rewrite relative Markdown link targets of a document that moves from
 * `oldDir` to `newDir`, also following targets that moved (`mapPath`).
 * Targets that resolve to the same file are left byte-identical.
 */
export function relocateLinks(
    markdown: string,
    oldDir: string,
    newDir: string,
    mapPath: PathMapper = p => p
): string {
    const rewrite = (raw: string): string => {
        const angled = raw.startsWith('<') && raw.endsWith('>')
        const target = angled ? raw.slice(1, -1) : raw
        if (!isRelativeTarget(target)) return raw
        const hashIndex = target.search(/[#?]/)
        const pathPart = hashIndex === -1 ? target : target.slice(0, hashIndex)
        const suffix = hashIndex === -1 ? '' : target.slice(hashIndex)
        if (!pathPart) return raw
        let decoded = pathPart
        try {
            decoded = decodeURI(pathPart)
        } catch {
            // keep raw path
        }
        const absolute = resolve(oldDir, decoded)
        const mapped = mapPath(absolute)
        if (mapped === absolute && oldDir === newDir) return raw
        let next = toPosix(relative(newDir, mapped)) || '.'
        if (pathPart.startsWith('./') && !next.startsWith('.')) next = `./${next}`
        if (next === toPosix(decoded)) return raw
        const encoded = angled ? next : next.replace(/ /g, '%20')
        return angled ? `<${encoded}${suffix}>` : `${encoded}${suffix}`
    }
    return markdown
        .replace(
            INLINE_LINK,
            (_m, target: string, title: string) => `](${rewrite(target)}${title})`
        )
        .replace(
            REFERENCE_DEFINITION,
            (_m, lead: string, target: string) => `${lead}${rewrite(target)}`
        )
}

/**
 * Rewrite plain project-root-relative mentions of moved files, such as
 * `_See: .autonomos/worklogs/2026-01-01-X.md_`, outside of link targets.
 */
export function relocateRootMentions(
    markdown: string,
    fromPrefix: string,
    toPrefix: string,
    names: ReadonlySet<string>
): string {
    if (!markdown.includes(fromPrefix + '/')) return markdown
    const escaped = fromPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?<![\\w./-])${escaped}/([^\\s)\\]>'"\`,;|]+)`, 'g')
    return markdown.replace(pattern, (match, candidate: string) => {
        let name = candidate
        while (name && !names.has(name) && /[._*~]$/.test(name)) name = name.slice(0, -1)
        if (!names.has(name)) return match
        return `${toPrefix}/${name}${candidate.slice(name.length)}`
    })
}
