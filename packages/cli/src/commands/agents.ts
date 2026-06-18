import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

import {
    AGENT_FILE,
    findAncestorAgents,
    findProjectRoot,
    type AncestorAgent,
} from '@autonomos/core'

interface AgentsOptions {
    cwd?: string
    /**
     * When true, search from the project root (discovered by walking up to
     * .autonomos or .git) instead of the current directory.
     */
    all?: boolean
    /**
     * Optional target path (file or directory). When provided, the command
     * switches to "ancestor lookup" mode and prints the ordered list of
     * AGENT.md files on the path from the target up to the project root.
     * Existing ancestors only; gaps are silently skipped.
     */
    target?: string
}

interface AgentEntry {
    path: string
    relativePath: string
    depth: number
}

/**
 * Recursively find all AGENT.md files in a directory
 */
function findAgentFiles(dir: string, baseDir: string, depth = 0): AgentEntry[] {
    const entries: AgentEntry[] = []

    // Check if AGENT.md exists in current directory
    const agentPath = join(dir, AGENT_FILE)
    if (existsSync(agentPath)) {
        entries.push({
            path: agentPath,
            relativePath: relative(baseDir, agentPath) || AGENT_FILE,
            depth,
        })
    }

    // Scan subdirectories
    try {
        const items = readdirSync(dir)
        for (const item of items) {
            // Skip hidden directories and node_modules
            if (
                item.startsWith('.') ||
                item === 'node_modules' ||
                item === 'dist' ||
                item === 'build'
            ) {
                continue
            }

            const itemPath = join(dir, item)
            try {
                if (statSync(itemPath).isDirectory()) {
                    entries.push(...findAgentFiles(itemPath, baseDir, depth + 1))
                }
            } catch {
                // Skip inaccessible directories
            }
        }
    } catch {
        // Skip inaccessible directories
    }

    return entries
}

interface TreeNode {
    name: string
    isAgent: boolean
    children: Record<string, TreeNode>
}

/**
 * Format agent entries as a true tree structure
 */
function formatAsTree(entries: AgentEntry[], baseDir: string): string {
    if (entries.length === 0) {
        return '  (no AGENT.md files found)'
    }

    const rootName = basename(baseDir)
    const tree: TreeNode = { name: rootName, isAgent: false, children: {} }

    // Build the tree
    for (const entry of entries) {
        const parts = entry.relativePath.split('/')
        let current = tree

        for (const part of parts) {
            const isAgent = part === AGENT_FILE

            let child = current.children[part]
            if (!child) {
                child = {
                    name: part,
                    isAgent,
                    children: {},
                }
                current.children[part] = child
            }
            current = child
        }
    }

    const lines: string[] = []
    lines.push(`📁 ${rootName}/`)

    function render(node: TreeNode, prefix = '', _isLast = true): void {
        const children = Object.values(node.children)
        children.sort((a, b) => {
            // Folders first
            if (!a.isAgent && b.isAgent) return -1
            if (a.isAgent && !b.isAgent) return 1
            return a.name.localeCompare(b.name)
        })

        children.forEach((child, index) => {
            const childIsLast = index === children.length - 1
            const branch = childIsLast ? '└── ' : '├── '
            const icon = child.isAgent ? '📄' : '📁'
            const name = child.isAgent ? child.name : `${child.name}/`

            lines.push(`${prefix}${branch}${icon} ${name}`)

            if (!child.isAgent) {
                const nextPrefix = prefix + (childIsLast ? '    ' : '│   ')
                render(child, nextPrefix, childIsLast)
            }
        })
    }

    render(tree)
    return lines.join('\n')
}

/**
 * Format the ancestor-lookup result as a numbered, root-first list.
 */
function formatAncestors(ancestors: AncestorAgent[]): string {
    if (ancestors.length === 0) {
        return '  (no AGENT.md files found in the ancestor chain)'
    }
    const lines = ancestors.map((a, i) => {
        const idx = (i + 1).toString().padStart(ancestors.length.toString().length, ' ')
        return `  ${idx}. ${a.relativeDir === '.' ? './AGENT.md' : `${a.relativeDir}/AGENT.md`}`
    })
    return lines.join('\n')
}

interface AgentsResult {
    success: boolean
    message: string
    tree?: string
    count?: number
    /**
     * When in ancestor-lookup mode, the list of ancestor AGENT.md files
     * (root-first order). Each entry has `dir`, `path`, `relativeDir`.
     */
    ancestors?: AncestorAgent[]
    /** The mode that was used. Useful for the caller to format output. */
    mode: 'tree' | 'ancestors'
}

/**
 * List AGENT.md files in the project.
 *
 * Two modes:
 *
 * 1. **Tree mode** (default, or with `--all`): list all AGENT.md files
 *    in a tree structure. Used at session start to get the full fractal
 *    picture of the project.
 *
 * 2. **Ancestors mode** (with a positional `<path>` argument): return
 *    the ordered list of AGENT.md files on the path from the target
 *    up to the project root. Root-first, with non-existent ancestors
 *    silently skipped. Used at task start to get the precise fractal
 *    context for the file or folder being worked on.
 */
export function agents(options: AgentsOptions = {}): AgentsResult {
    const cwd = options.cwd ?? process.cwd()

    // --- Ancestors mode (positional <path> arg) ---
    if (options.target) {
        const projectRoot = findProjectRoot(cwd) ?? cwd
        let ancestors: AncestorAgent[]
        try {
            ancestors = findAncestorAgents(resolve(cwd, options.target), projectRoot)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            return {
                success: false,
                message: `Failed to look up ancestors: ${message}`,
                mode: 'ancestors',
            }
        }
        const list = formatAncestors(ancestors)
        return {
            success: true,
            message: `Found ${ancestors.length} ancestor AGENT.md file(s) for "${options.target}" (root → target):\n${list}`,
            count: ancestors.length,
            ancestors,
            mode: 'ancestors',
        }
    }

    // --- Tree mode (default) ---
    let searchBase: string
    if (options.all) {
        const projectRoot = findProjectRoot(cwd)
        if (!projectRoot) {
            return {
                success: false,
                message: 'Could not find project root (.autonomos or .git directory).',
                mode: 'tree',
            }
        }
        searchBase = projectRoot
    } else {
        searchBase = cwd
    }

    const entries = findAgentFiles(searchBase, searchBase)

    if (entries.length === 0) {
        return {
            success: true,
            message: 'No AGENT.md files found.',
            count: 0,
            mode: 'tree',
        }
    }

    const tree = formatAsTree(entries, searchBase)
    return {
        success: true,
        message: `Found ${entries.length} AGENT.md file(s)`,
        tree,
        count: entries.length,
        mode: 'tree',
    }
}
