/**
 * Detect task and issue content that a change removed from the current
 * registries without keeping it anywhere else. Pure: the caller supplies the
 * registries before the change and the text the change added.
 */

import { parseIssueEntries, parseTaskEntries } from './registry-edit'

export interface RegistryTexts {
    tasks?: string
    issues?: string
}

export interface RecordLoss {
    id: string
    kind: 'task' | 'issue'
    /** `removed`: the ID is gone; `shortened`: the entry lost words. */
    change: 'removed' | 'shortened'
    /** Distinct words lost and not added anywhere else by the change. */
    lostWords: number
}

/** Below this many lost words, a removal or rewording is not reported. */
const MIN_LOST_WORDS = 5
/** Content counts as moved when this share of its lost words was added elsewhere. */
const MOVED_SHARE = 0.8

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'._%/-]*[\p{L}\p{N}%]|[\p{L}\p{N}]/gu

/** Distinct significant words: lower-cased, four characters or more, no file paths. */
export function significantWords(text: string): Set<string> {
    const words = new Set<string>()
    for (const match of text.toLowerCase().matchAll(WORD))
        // Paths are references, not content; links are checked through `readLinked`.
        if (match[0].length >= 4 && !/\.mdx?$/.test(match[0])) words.add(match[0])
    return words
}

interface Entry {
    key: string
    id: string
    kind: 'task' | 'issue'
    text: string
    words: Set<string>
}

function entries(texts: RegistryTexts): Entry[] {
    const tasks = parseTaskEntries(texts.tasks ?? '')
        .filter(e => e.tagged)
        .map(e => ({ id: e.id, kind: 'task' as const, text: e.text }))
    const issues = parseIssueEntries(texts.issues ?? '').map(e => ({
        id: e.id,
        kind: 'issue' as const,
        text: e.text,
    }))
    return [...tasks, ...issues].map(e => ({
        key: `${e.kind}:${e.id}`,
        id: e.id,
        kind: e.kind,
        text: e.text,
        words: significantWords(e.text),
    }))
}

/** Union of words per entry key (duplicate IDs are judged together). */
function wordsByKey(list: Entry[]): Map<string, Entry> {
    const map = new Map<string, Entry>()
    for (const entry of list) {
        const known = map.get(entry.key)
        if (known) {
            for (const word of entry.words) known.words.add(word)
            known.text += `\n${entry.text}`
        } else map.set(entry.key, { ...entry, words: new Set(entry.words) })
    }
    return map
}

/**
 * Compare registries before and after a change. An entry whose ID disappeared,
 * or that lost words, is reported unless the change added most of
 * the lost words elsewhere (an archive, a worklog, another record) or they
 * already appear in text the caller considers kept (`readLinked`, given the
 * entry's text before and after the change and its ID): linked files, or an
 * archived record with the same ID.
 */
export function findRecordLoss(
    before: RegistryTexts,
    after: RegistryTexts,
    addedText: string,
    readLinked?: (entryText: string, id: string) => string
): RecordLoss[] {
    const added = significantWords(addedText)
    const current = wordsByKey(entries(after))
    const losses: RecordLoss[] = []
    for (const entry of wordsByKey(entries(before)).values()) {
        const now = current.get(entry.key)
        const lost = [...entry.words].filter(word => !now?.words.has(word))
        if (lost.length < MIN_LOST_WORDS) continue
        let unmoved = lost.filter(word => !added.has(word))
        if (unmoved.length > lost.length * (1 - MOVED_SHARE) && readLinked) {
            const linked = significantWords(
                readLinked(`${entry.text}\n${now?.text ?? ''}`, entry.id)
            )
            unmoved = unmoved.filter(word => !linked.has(word))
        }
        if (unmoved.length <= lost.length * (1 - MOVED_SHARE)) continue
        losses.push({
            id: entry.id,
            kind: entry.kind,
            change: now ? 'shortened' : 'removed',
            lostWords: unmoved.length,
        })
    }
    return losses
}
