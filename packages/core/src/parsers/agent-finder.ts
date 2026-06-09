import { existsSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'

import { AGENT_FILE } from '../constants'

/**
 * Result of an ancestor lookup: a single AGENT.md entry that exists on the
 * path between a target file or directory and the project root.
 */
export interface AncestorAgent {
    /** Absolute path to the directory containing the AGENT.md */
    dir: string
    /** Absolute path to the AGENT.md file */
    path: string
    /** Path of the directory relative to the project root */
    relativeDir: string
}

/**
 * Return the ordered list of AGENT.md files that exist on the path from a
 * target file or directory up to the project root. The order is root-first,
 * then each intermediate directory, then the target directory itself.
 *
 * Non-existent AGENT.md files are silently skipped (the chain can have gaps).
 *
 * @param target - The absolute or project-relative path to a file or directory.
 * @param projectRoot - The absolute path of the project root (where the root
 *   AGENT.md lives). Defaults to the current working directory.
 *
 * @example
 *   findAncestorAgents('/proj/apps/web/components/ui/button.tsx', '/proj')
 *   // Returns, in order:
 *   // - { dir: '/proj',                path: '/proj/AGENT.md' }
 *   // - { dir: '/proj/apps/web',       path: '/proj/apps/web/AGENT.md' }
 *   // (apps/, components/ skipped because they have no AGENT.md)
 *   // (button.tsx itself is a file, so its parent dir is the last one checked)
 */
export function findAncestorAgents(
    target: string,
    projectRoot: string = process.cwd()
): AncestorAgent[] {
    const absRoot = resolve(projectRoot)
    const absTarget = resolveAgainstRoot(target, absRoot)

    // Validate that the target lives within the project root
    const relToRoot = relative(absRoot, absTarget)
    if (relToRoot.startsWith('..') || isAbsolute(relToRoot)) {
        throw new Error(
            `Target "${target}" is outside the project root "${absRoot}". ` +
                `findAncestorAgents only handles paths within the project.`
        )
    }

    // Collect every directory from the target up to the root, in root-first order.
    // For a file target, we only look at the directory chain (not the file itself).
    // For a directory target, the directory itself is included as the last entry.
    const targetDir = isDirectory(absTarget) ? absTarget : dirname(absTarget)
    const dirs = collectAncestorDirs(targetDir, absRoot)

    const result: AncestorAgent[] = []
    for (const dir of dirs) {
        const agentPath = join(dir, AGENT_FILE)
        if (existsSync(agentPath)) {
            result.push({
                dir,
                path: agentPath,
                relativeDir: relativeDir(dir, absRoot),
            })
        }
    }

    return result
}

/**
 * Resolve a target path against the project root. Accepts absolute paths
 * (returned as-is) and project-relative paths (joined with the root).
 */
function resolveAgainstRoot(target: string, absRoot: string): string {
    if (isAbsolute(target)) return target
    return join(absRoot, target)
}

/**
 * Return the directory chain from a starting directory up to (and including)
 * the project root, in root-first order. The chain is computed by walking
 * the relative path segments from the starting dir back to the root.
 */
function collectAncestorDirs(startDir: string, absRoot: string): string[] {
    const rel = relative(absRoot, startDir)
    if (rel === '' || rel === '.') {
        return [absRoot]
    }

    const segments = rel.split(sep).filter(s => s !== '' && s !== '.')
    const chain: string[] = [absRoot]
    let acc = absRoot
    for (const seg of segments) {
        acc = join(acc, seg)
        chain.push(acc)
    }
    return chain
}

/**
 * Compute the directory's path relative to the project root, in a form
 * suitable for display. The root itself is rendered as ".".
 */
function relativeDir(dir: string, absRoot: string): string {
    const rel = relative(absRoot, dir)
    return rel === '' ? '.' : rel
}

function isDirectory(p: string): boolean {
    try {
        return statSync(p).isDirectory()
    } catch {
        return false
    }
}
