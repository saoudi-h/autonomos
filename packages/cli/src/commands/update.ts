import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    AUTONOMOS_DIR,
    generateManifestContent,
    listHarnesses,
    MANIFEST_FILE,
    parseManifest,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    resolveTargets,
    type Manifest,
} from '@autonomos/core'

import packageJson from '../../package.json' with { type: 'json' }
const CLI_VERSION: string = packageJson.version

interface UpdateOptions {
    cwd?: string
}

interface UpdateResult {
    success: boolean
    message: string
    previousVersion?: string
    newVersion?: string
    cliOutdated?: boolean
}

const WORKFLOW_FILES = [
    'protocol-session.md',
    'protocol-task.md',
    'protocol-crystallize.md',
] as const

/**
 * Resolve the workflows directory inside the @autonomos/core package.
 */
function getWorkflowsDir(): string {
    const here = fileURLToPath(import.meta.url)
    const candidates = [
        resolve(here, '..', '..', '..', '..', 'core', 'src', 'workflows'),
        resolve(here, '..', '..', '..', 'core', 'dist', 'workflows'),
        resolve(here, '..', '..', '..', '..', 'core', 'dist', 'workflows'),
    ]
    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate
    }
    throw new Error('Could not locate the workflows directory inside @autonomos/core')
}

function buildTargetFilename(sourceFile: string, targetExtension: string): string {
    const withoutPrefix = sourceFile.replace(/^protocol-/, '')
    const withoutExt = withoutPrefix.replace(/\.[^.]+$/, '')
    return withoutExt + targetExtension
}

/**
 * Compare two SemVer versions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
        const aNum = aParts[i] ?? 0
        const bNum = bParts[i] ?? 0
        if (aNum < bNum) return -1
        if (aNum > bNum) return 1
    }
    return 0
}

/**
 * Update the Protocol to the latest version
 */
export function update(options: UpdateOptions = {}): UpdateResult {
    const cwd = options.cwd ?? process.cwd()

    // Check if initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)

    if (!existsSync(manifestPath)) {
        return {
            success: false,
            message: 'Project not initialized. Run `autonomos init` first.',
        }
    }

    // Read current manifest
    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const manifest: Manifest = parseManifest(manifestContent)
    const currentVersion = manifest.protocolVersion

    // Compare versions
    const comparison = compareVersions(currentVersion, PROTOCOL_VERSION)

    if (comparison === 0) {
        return {
            success: true,
            message: `Already up to date (Protocol v${PROTOCOL_VERSION})`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
        }
    }

    if (comparison > 0) {
        // Project uses a newer version than CLI knows
        return {
            success: false,
            message: `This project uses Protocol v${currentVersion}, but your CLI only knows v${PROTOCOL_VERSION}. Update your CLI with \`npm i -g @autonomos/cli\`.`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
            cliOutdated: true,
        }
    }

    // Update Protocol (comparison < 0)
    const protocolPath = join(autonomosDir, PROTOCOL_FILE)
    writeFileSync(protocolPath, PROTOCOL_TEMPLATE)

    // Update manifest
    const updatedManifest: Manifest = {
        ...manifest,
        protocolVersion: PROTOCOL_VERSION,
        cliVersion: CLI_VERSION,
        lastUpdated: new Date().toISOString(),
    }
    writeFileSync(manifestPath, generateManifestContent(updatedManifest))

    // Update workflow files in active harnesses
    const updatedTargets: string[] = []
    try {
        const allHarnesses = listHarnesses().map(({ id }) => id)
        const targets = resolveTargets(allHarnesses, cwd)
        const workflowsDir = getWorkflowsDir()

        for (const target of targets) {
            // Check if the target directory exists
            if (existsSync(target.path)) {
                // Check if any of the workflow files exist in this directory
                let hasExistingWorkflow = false
                for (const workflowFile of WORKFLOW_FILES) {
                    const filename = buildTargetFilename(workflowFile, target.fileExtension)
                    if (existsSync(join(target.path, filename))) {
                        hasExistingWorkflow = true
                        break
                    }
                }

                // If at least one workflow file exists, update/rewrite all three
                if (hasExistingWorkflow) {
                    mkdirSync(target.path, { recursive: true })
                    for (const workflowFile of WORKFLOW_FILES) {
                        const source = readFileSync(join(workflowsDir, workflowFile), 'utf-8')
                        const filename = buildTargetFilename(workflowFile, target.fileExtension)
                        const dest = join(target.path, filename)
                        writeFileSync(dest, source)
                    }
                    updatedTargets.push(target.path)
                }
            }
        }
    } catch (err) {
        // Log warning but don't fail the update
        console.warn(`Warning: Could not update harness workflows: ${err instanceof Error ? err.message : String(err)}`)
    }

    const harnessInfo = updatedTargets.length > 0
        ? ` (updated workflows in ${updatedTargets.join(', ')})`
        : ''

    return {
        success: true,
        message: `Protocol updated: v${currentVersion} → v${PROTOCOL_VERSION}${harnessInfo}`,
        previousVersion: currentVersion,
        newVersion: PROTOCOL_VERSION,
    }
}

