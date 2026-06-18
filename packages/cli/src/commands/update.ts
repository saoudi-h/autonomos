import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    AUTONOMOS_DIR,
    findProjectRoot,
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
    /**
     * When provided, install the workflow files for these harness ids in
     * addition to refreshing existing ones. Lets users add a new AI
     * harness (e.g. opencode) to a project that was already initialized
     * with the protocol, without re-running `init`.
     */
    harnesses?: string[]
    /** Convenience flag equivalent to `harnesses: listHarnesses().map(id)`. */
    all?: boolean
}

interface UpdateResult {
    success: boolean
    message: string
    previousVersion?: string
    newVersion?: string
    cliOutdated?: boolean
    /** Harnesses that had workflow files installed (or refreshed) by this run. */
    touchedHarnesses?: string[]
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
 * Bump the `@autonomos/cli` devDependency in the project's package.json
 * to the current CLI version, when one is present. Older init runs
 * (including the previously published 0.2.0) pinned a version that is
 * not on the registry, which broke `pnpm i`. Doing the bump here means
 * users can recover with a single `autonomos update` instead of editing
 * package.json by hand.
 *
 * Returns a human-readable note when something changed, or null when
 * nothing needed to be done.
 */
function refreshDevDependency(cwd: string): string | null {
    const packageJsonPath = join(cwd, 'package.json')
    if (!existsSync(packageJsonPath)) return null

    let pkg: any
    try {
        pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    } catch {
        return null
    }

    const newSpec = `^${CLI_VERSION}`
    const previous = pkg.devDependencies?.['@autonomos/cli']
    if (previous === newSpec) return null

    if (!pkg.devDependencies) pkg.devDependencies = {}
    pkg.devDependencies['@autonomos/cli'] = newSpec

    try {
        writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4) + '\n')
    } catch {
        return null
    }

    return previous
        ? `Bumped @autonomos/cli devDependency: ${previous} → ${newSpec}.`
        : `Added @autonomos/cli devDependency: ${newSpec}.`
}

function writeHarnessWorkflows(cwd: string, harnessIds: string[]): string[] {
    if (harnessIds.length === 0) return []
    const workflowsDir = getWorkflowsDir()
    const targets = resolveTargets(harnessIds, cwd)
    const written: string[] = []
    for (const target of targets) {
        mkdirSync(target.path, { recursive: true })
        for (const workflowFile of WORKFLOW_FILES) {
            const source = readFileSync(join(workflowsDir, workflowFile), 'utf-8')
            const filename = buildTargetFilename(workflowFile, target.fileExtension)
            const dest = join(target.path, filename)
            writeFileSync(dest, source)
            written.push(`${target.path}/${filename}`)
        }
    }
    return written
}

/**
 * Update the Protocol to the latest version
 */
export function update(options: UpdateOptions = {}): UpdateResult {
    const requestedCwd = options.cwd ?? process.cwd()

    // Bubble up to the project root if the user ran us from a subdir.
    // Unlike `init` we don't refuse here: there's nothing destructive
    // about a refresh, and the only way to find the manifest is to look
    // for it where it lives.
    const cwd = findProjectRoot(requestedCwd) ?? requestedCwd

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

    // Refresh devDependency. We do this even when the protocol version
    // is already up to date, because the user may have run `update`
    // precisely to repair a pinned-but-unresolvable version.
    const devDepNote = refreshDevDependency(cwd)

    // Compare versions
    const comparison = compareVersions(currentVersion, PROTOCOL_VERSION)

    if (comparison === 0) {
        // Still install any newly requested harnesses even when the
        // protocol is already current. This is the path used to add
        // (say) opencode to an already-initialized project.
        const requestedHarnesses = options.all
            ? listHarnesses().map(({ id }) => id)
            : (options.harnesses ?? [])
        const touched = writeHarnessWorkflows(cwd, requestedHarnesses)
        const touchedMsg = touched.length > 0 ? ` (installed: ${touched.join(', ')})` : ''
        const devDepMsg = devDepNote ? ` ${devDepNote}` : ''
        return {
            success: true,
            message: `Already up to date (Protocol v${PROTOCOL_VERSION}).${devDepMsg}${touchedMsg}`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
            touchedHarnesses: touched,
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

    // Also install any harnesses the user explicitly asked for. This
    // covers the "I'm on a newer protocol but want to add a new harness"
    // case as well as the more common "my init never installed opencode".
    const requestedHarnesses = options.all
        ? listHarnesses().map(({ id }) => id)
        : (options.harnesses ?? [])
    const newlyInstalled = writeHarnessWorkflows(cwd, requestedHarnesses)

    const harnessInfo = updatedTargets.length > 0
        ? ` (updated workflows in ${updatedTargets.join(', ')})`
        : ''
    const installedInfo = newlyInstalled.length > 0
        ? ` (installed: ${newlyInstalled.join(', ')})`
        : ''
    const devDepInfo = devDepNote ? ` ${devDepNote}` : ''

    return {
        success: true,
        message: `Protocol updated: v${currentVersion} → v${PROTOCOL_VERSION}${harnessInfo}${installedInfo}${devDepInfo}`,
        previousVersion: currentVersion,
        newVersion: PROTOCOL_VERSION,
        touchedHarnesses: [...updatedTargets, ...newlyInstalled],
    }
}
