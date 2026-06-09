import { checkbox } from '@inquirer/prompts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    AGENT_FILE,
    AUTONOMOS_DIR,
    createManifest,
    generateAgentTemplate,
    generateManifestContent,
    listHarnesses,
    MANIFEST_FILE,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    resolveTargets,
    TASKS_FILE,
    TASKS_TEMPLATE,
    WORKLOGS_DIR,
} from '@autonomos/core'

// Synchronize with the package.json version at build time. The bundler
// inlines this JSON, so the resolved value is always current.
// (package.json import — inlined by the bundler)
import packageJson from '../../package.json' with { type: 'json' }
const CLI_VERSION: string = packageJson.version

interface InitOptions {
    cwd?: string
    dryRun?: boolean
    /** Specific harness ids to install for. */
    harnesses?: string[]
    /** Install for all known harnesses (overrides `harnesses`). */
    all?: boolean
    /** Skip the interactive prompt even when no harnesses are specified. */
    noPrompt?: boolean
}

interface InitResult {
    success: boolean
    message: string
    created: string[]
    warnings: string[]
    dryRun?: boolean
    harnessFiles?: string[]
}

const WORKFLOW_FILES = [
    'protocol-session.md',
    'protocol-task.md',
    'protocol-crystallize.md',
] as const

/**
 * Resolve the workflows directory inside the @autonomos/core package.
 * In dev (tsdown not yet run), this points to src/workflows. In published
 * builds, it falls back to dist/workflows.
 */
function getWorkflowsDir(): string {
    const here = fileURLToPath(import.meta.url)
    // here is .../packages/cli/dist/commands/init.mjs (or src/commands/init.ts in dev)
    // Walk up until we find @autonomos/core
    const candidates = [
        // Dev (running from src via tsdown --watch): packages/cli/src/commands/init.ts
        resolve(here, '..', '..', '..', '..', 'core', 'src', 'workflows'),
        // Built (single bundle at packages/cli/dist/index.mjs): packages/core/dist/workflows
        resolve(here, '..', '..', '..', 'core', 'dist', 'workflows'),
        // Built (per-entry at packages/cli/dist/commands/init.mjs): packages/core/dist/workflows
        resolve(here, '..', '..', '..', '..', 'core', 'dist', 'workflows'),
    ]
    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate
    }
    throw new Error('Could not locate the workflows directory inside @autonomos/core')
}

/**
 * Prompt the user interactively for which harnesses to install for.
 * Returns the selected harness ids. An empty array means the user chose
 * to skip harness installation entirely.
 */
async function promptForHarnesses(): Promise<string[]> {
    const harnesses = listHarnesses()
    return checkbox({
        message:
            'Which AI harnesses do you want to install the protocol for? (space to toggle, enter to confirm)',
        choices: harnesses.map(({ id, harness }) => ({
            name: harness.name,
            value: id,
            checked: harness.preferred,
        })),
    })
}

/**
 * Initialize the Autonomos Agent Protocol in a directory.
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
    const cwd = options.cwd ?? process.cwd()
    const dryRun = options.dryRun ?? false
    const created: string[] = []
    const warnings: string[] = []
    const harnessFiles: string[] = []

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

    // Resolve which harnesses to install for
    let selectedHarnesses: string[]
    if (options.all) {
        selectedHarnesses = listHarnesses().map(({ id }) => id)
    } else if (options.harnesses && options.harnesses.length > 0) {
        selectedHarnesses = options.harnesses
    } else if (options.noPrompt || options.dryRun) {
        selectedHarnesses = []
    } else {
        selectedHarnesses = await promptForHarnesses()
    }

    // Compute the unique target directories
    const targets = resolveTargets(selectedHarnesses, cwd)

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

        for (const target of targets) {
            for (const workflowFile of WORKFLOW_FILES) {
                const filename = buildTargetFilename(workflowFile, target.fileExtension)
                harnessFiles.push(`${target.path}/${filename}`)
            }
        }

        return {
            success: true,
            message: `Would initialize project with Agent Protocol v${PROTOCOL_VERSION}${selectedHarnesses.length ? ` (harnesses: ${selectedHarnesses.join(', ')})` : ''}`,
            created,
            warnings,
            dryRun: true,
            harnessFiles,
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

    // Install workflow files for each selected harness
    const workflowsDir = getWorkflowsDir()
    for (const target of targets) {
        mkdirSync(target.path, { recursive: true })
        for (const workflowFile of WORKFLOW_FILES) {
            const source = readFileSync(join(workflowsDir, workflowFile), 'utf-8')
            const filename = buildTargetFilename(workflowFile, target.fileExtension)
            const dest = join(target.path, filename)
            writeFileSync(dest, source)
            harnessFiles.push(`${target.path}/${filename}`)
        }
    }

    const harnessMsg =
        selectedHarnesses.length > 0
            ? ` for harnesses: ${selectedHarnesses.join(', ')}`
            : ' (no harness workflows installed)'

    return {
        success: true,
        message: `Project initialized with Agent Protocol v${PROTOCOL_VERSION}${harnessMsg}`,
        created,
        warnings,
        dryRun: false,
        harnessFiles,
    }
}

/**
 * Strip the leading `protocol-` prefix from a workflow filename so that
 * the installed file is just `session.md`, `task.md`, `crystallize.md`.
 * This gives shorter invocation names (`/session` instead of `/protocol-session`).
 */
function buildTargetFilename(sourceFile: string, targetExtension: string): string {
    // sourceFile: "protocol-session.md" -> "session.md" (drop prefix, drop source ext, add target ext)
    const withoutPrefix = sourceFile.replace(/^protocol-/, '')
    const withoutExt = withoutPrefix.replace(/\.[^.]+$/, '')
    return withoutExt + targetExtension
}
