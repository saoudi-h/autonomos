import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
    AGENT_FILE,
    AUTONOMOS_DIR,
    createManifest,
    generateAgentTemplate,
    generateManifestContent,
    MANIFEST_FILE,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    TASKS_FILE,
    TASKS_TEMPLATE,
    WORKLOGS_DIR,
} from '@autonomos/core'

// Get CLI version from package.json
const CLI_VERSION = '0.0.1' // TODO: Import from package.json

interface InitOptions {
    cwd?: string
    dryRun?: boolean
}

interface InitResult {
    success: boolean
    message: string
    created: string[]
    warnings: string[]
    dryRun?: boolean
}

/**
 * Initialize the Autonomos Agent Protocol in a directory
 */
export function init(options: InitOptions = {}): InitResult {
    const cwd = options.cwd ?? process.cwd()
    const dryRun = options.dryRun ?? false
    const created: string[] = []
    const warnings: string[] = []

    // Check for .git
    const gitDir = join(cwd, '.git')
    if (!existsSync(gitDir)) {
        warnings.push('No Git repository detected. Consider running `git init` first.')
    }

    // Check if already initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    if (existsSync(autonomosDir)) {
        return {
            success: false,
            message: `Project already initialized with Protocol v${PROTOCOL_VERSION}. Use \`autonomos update\` to update.`,
            created: [],
            warnings: [],
            dryRun,
        }
    }

    // In dry-run mode, just collect what would be created
    if (dryRun) {
        created.push(AUTONOMOS_DIR)
        created.push(`${AUTONOMOS_DIR}/${WORKLOGS_DIR}`)
        created.push(`${AUTONOMOS_DIR}/${MANIFEST_FILE}`)
        created.push(`${AUTONOMOS_DIR}/${PROTOCOL_FILE}`)
        created.push(`${AUTONOMOS_DIR}/${TASKS_FILE}`)

        const agentPath = join(cwd, AGENT_FILE)
        if (!existsSync(agentPath)) {
            created.push(AGENT_FILE)
        } else {
            warnings.push(`${AGENT_FILE} already exists, would skip.`)
        }

        return {
            success: true,
            message: `Would initialize project with Agent Protocol v${PROTOCOL_VERSION}`,
            created,
            warnings,
            dryRun: true,
        }
    }

    // Create .autonomos directory
    mkdirSync(autonomosDir, { recursive: true })
    created.push(AUTONOMOS_DIR)

    // Create worklogs directory
    const worklogsDir = join(autonomosDir, WORKLOGS_DIR)
    mkdirSync(worklogsDir, { recursive: true })
    created.push(`${AUTONOMOS_DIR}/${WORKLOGS_DIR}`)

    // Create manifest.json
    const manifest = createManifest(CLI_VERSION)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)
    writeFileSync(manifestPath, generateManifestContent(manifest))
    created.push(`${AUTONOMOS_DIR}/${MANIFEST_FILE}`)

    // Create PROTOCOL.md
    const protocolPath = join(autonomosDir, PROTOCOL_FILE)
    writeFileSync(protocolPath, PROTOCOL_TEMPLATE)
    created.push(`${AUTONOMOS_DIR}/${PROTOCOL_FILE}`)

    // Create TASKS.md
    const tasksPath = join(autonomosDir, TASKS_FILE)
    writeFileSync(tasksPath, TASKS_TEMPLATE)
    created.push(`${AUTONOMOS_DIR}/${TASKS_FILE}`)

    // Create AGENT.md at root (only if it doesn't exist)
    const agentPath = join(cwd, AGENT_FILE)
    if (!existsSync(agentPath)) {
        const projectName = cwd.split('/').pop() ?? 'Project'
        writeFileSync(agentPath, generateAgentTemplate(projectName))
        created.push(AGENT_FILE)
    } else {
        warnings.push(`${AGENT_FILE} already exists, skipping.`)
    }

    return {
        success: true,
        message: `Project initialized with Agent Protocol v${PROTOCOL_VERSION}`,
        created,
        warnings,
        dryRun: false,
    }
}
