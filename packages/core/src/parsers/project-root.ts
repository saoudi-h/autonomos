import { existsSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

import { AUTONOMOS_DIR } from '../constants'

/**
 * Markers that identify the root of an Autonomos / git project.
 *
 * `.autonomos/` is a strong signal: if it exists, the project has already
 * been initialized with the protocol and the directory containing it is,
 * by definition, the project root.
 *
 * `.git/` is a weaker signal: it only tells us the directory is inside a
 * git working tree. We still stop at the first `.git/` we see, which is
 * good enough for the common monorepo case (the monorepo root contains
 * the `.git/`, package subdirectories do not).
 */
const PROJECT_MARKERS = [AUTONOMOS_DIR, '.git'] as const

/**
 * Find the directory that owns this project by walking up from `startDir`
 * until we find a directory containing `.autonomos/` or `.git/`.
 *
 * Returns `null` if no such directory exists before we reach the
 * filesystem root.
 *
 * Notes on behavior:
 * - The search stops at the first directory that contains any of the
 *   markers. For monorepos this is the monorepo root, not the package
 *   directory the caller is sitting in.
 * - A directory containing `.git/` is preferred over walking further up:
 *   this prevents leaking into a parent repository in nested-worktree
 *   setups. Callers that need the absolute git toplevel can run
 *   `git rev-parse --show-toplevel` themselves after this returns.
 *
 * @param startDir - Absolute path to start the search from.
 */
export function findProjectRoot(startDir: string): string | null {
    if (!startDir) return null
    const start = resolve(startDir)
    let current = start

    while (true) {
        if (PROJECT_MARKERS.some(marker => existsSync(join(current, marker)))) {
            return current
        }
        const parent = dirname(current)
        if (parent === current) return null
        current = parent
    }
}

/**
 * Check whether two absolute paths refer to the same directory.
 *
 * Resolves `.` / `..` segments before comparing, so `/a/b` and
 * `/a/b/./` are considered the same.
 */
export function isSamePath(a: string, b: string): boolean {
    if (!a || !b) return false
    return resolve(a) === resolve(b)
}

/**
 * Render a path relative to another path, with one guarantee that the
 * default `path.relative` doesn't give us: we never return a value that
 * starts with `..`. If `target` is not under `base`, we return the
 * absolute resolved path of `target` so the caller can still show a
 * useful location.
 */
export function displayRelative(target: string, base: string): string {
    const rel = relative(base, target)
    if (rel === '' || rel === '.') return '.'
    if (rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) {
        return resolve(target)
    }
    return rel
}
