import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

import { AGENT_FILE, AUTONOMOS_DIR } from '@autonomos/core'

interface AgentsOptions {
    cwd?: string
    all?: boolean
}

interface AgentEntry {
    path: string
    relativePath: string
    depth: number
}

/**
 * Find the project root by looking for .autonomos or .git directory
 */
function findProjectRoot(startDir: string): string | null {
    let currentDir = startDir

    while (currentDir !== '/') {
        if (existsSync(join(currentDir, AUTONOMOS_DIR)) || existsSync(join(currentDir, '.git'))) {
            return currentDir
        }
        currentDir = join(currentDir, '..')
    }

    return null
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

/**
 * Format agent entries as a tree structure
 */
function formatAsTree(entries: AgentEntry[], baseDir: string): string {
    if (entries.length === 0) {
        return '  (no AGENT.md files found)'
    }

    const lines: string[] = []
    const baseName = basename(baseDir)

    lines.push(`📁 ${baseName}/`)

    // Group entries by their parent directory
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const isLast = i === entries.length - 1
        const prefix = isLast ? '└── ' : '├── '
        const indent = '    '.repeat(entry.depth)

        lines.push(`${indent}${prefix}📄 ${entry.relativePath}`)
    }

    return lines.join('\n')
}

interface AgentsResult {
    success: boolean
    message: string
    tree?: string
    count?: number
}

/**
 * List all AGENT.md files in the project
 */
export function agents(options: AgentsOptions = {}): AgentsResult {
    const cwd = options.cwd ?? process.cwd()

    // Determine search base
    let searchBase: string

    if (options.all) {
        // Find project root
        const projectRoot = findProjectRoot(cwd)
        if (!projectRoot) {
            return {
                success: false,
                message: 'Could not find project root (.autonomos or .git directory).',
            }
        }
        searchBase = projectRoot
    } else {
        searchBase = cwd
    }

    // Find all AGENT.md files
    const entries = findAgentFiles(searchBase, searchBase)

    if (entries.length === 0) {
        return {
            success: true,
            message: 'No AGENT.md files found.',
            count: 0,
        }
    }

    const tree = formatAsTree(entries, searchBase)

    return {
        success: true,
        message: `Found ${entries.length} AGENT.md file(s)`,
        tree,
        count: entries.length,
    }
}
