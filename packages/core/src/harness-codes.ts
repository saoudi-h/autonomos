import harnessCodesData from './data/harness-codes.json' with { type: 'json' }
import {
    HarnessCodesSchema,
    type Harness,
    type HarnessCodes,
    type Installer,
} from './schemas/harness-codes'

/**
 * Validated, in-memory representation of the harness codes config.
 * Loaded once at module init, validated via Zod.
 */
const codes: HarnessCodes = HarnessCodesSchema.parse(harnessCodesData)

/**
 * Get a single harness entry by its id.
 * Throws if the id is unknown.
 */
export function getHarness(id: string): Harness {
    const entry = codes.platforms[id]
    if (!entry) {
        const known = Object.keys(codes.platforms).join(', ')
        throw new Error(`Unknown harness: "${id}". Known harnesses: ${known}`)
    }
    return entry
}

/**
 * List all configured harnesses, as an array of {id, harness} pairs.
 * Stable order: insertion order of the JSON object.
 */
export function listHarnesses(): Array<{ id: string; harness: Harness }> {
    return Object.entries(codes.platforms).map(([id, harness]) => ({ id, harness }))
}

/**
 * Get the list of preferred harnesses (shown as recommended options).
 */
export function listPreferredHarnesses(): Array<{ id: string; harness: Harness }> {
    return listHarnesses().filter(({ harness }) => harness.preferred)
}

/**
 * A resolved target directory where workflow files will be written.
 * One per unique path, with the list of harness ids that share it.
 */
export interface ResolvedTarget {
    /** Absolute or project-relative path to the directory */
    path: string
    /** File extension to use (e.g. ".md", ".agent.md") */
    fileExtension: string
    /** Ids of the harnesses that will read from this directory */
    usedBy: string[]
}

/**
 * Resolve the unique target directories for a set of harness ids.
 *
 * Harnesses that share the same `skillsDir` (e.g. Codex, OpenCode, KiloCode
 * all use `.agents/skills/`) are deduplicated: the directory appears once
 * in the output, with all the harness ids listed in `usedBy`.
 *
 * The `path` is returned relative to the project root (caller is responsible
 * for joining with the project cwd).
 */
export function resolveTargets(harnessIds: string[], cwd: string = '.'): ResolvedTarget[] {
    const map = new Map<string, ResolvedTarget>()

    for (const id of harnessIds) {
        const { installer } = getHarness(id)
        collectFromInstaller(map, installer, id, cwd)
    }

    return Array.from(map.values())
}

function collectFromInstaller(
    map: Map<string, ResolvedTarget>,
    installer: Installer,
    harnessId: string,
    cwd: string
): void {
    const ext = installer.fileExtension
    if (installer.targetDir) {
        addTarget(map, joinPath(cwd, installer.targetDir), ext, harnessId)
    }
    if (installer.skillsDir) {
        addTarget(map, joinPath(cwd, installer.skillsDir), ext, harnessId)
    }
    if (installer.commandsDir) {
        addTarget(map, joinPath(cwd, installer.commandsDir), ext, harnessId)
    }
}

function addTarget(
    map: Map<string, ResolvedTarget>,
    path: string,
    fileExtension: string,
    harnessId: string
): void {
    const existing = map.get(path)
    if (existing) {
        if (!existing.usedBy.includes(harnessId)) {
            existing.usedBy.push(harnessId)
        }
    } else {
        map.set(path, { path, fileExtension, usedBy: [harnessId] })
    }
}

function joinPath(a: string, b: string): string {
    if (a === '.' || a === '') return b
    if (b.startsWith('/')) return `${a}${b}`
    return `${a}/${b}`
}

/**
 * Get the raw (validated) codes object, for advanced use cases.
 * Most callers should use the higher-level helpers above.
 */
export function getRawHarnessCodes(): HarnessCodes {
    return codes
}
