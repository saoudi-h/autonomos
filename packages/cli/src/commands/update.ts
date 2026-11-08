import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import {
    ARTIFACT_FORMAT,
    AUTONOMOS_DIR,
    findProjectRoot,
    generateManifestContent,
    listHarnesses,
    MANIFEST_FILE,
    manifestArtifactFormat,
    parseManifest,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    resolveTargets,
    type Manifest,
} from '@autonomos/core'

import packageJson from '../../package.json' with { type: 'json' }
import {
    buildTargetFilename,
    getTargetArtifactFiles,
    getWorkflowsDir,
    WORKFLOW_FILES,
} from '../protocol-artifacts'
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
    /** Test seam for packaged workflow resolution. */
    resolveWorkflowsDir?: () => string
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

/**
 * Compare two SemVer versions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
    const parse = (version: string) => {
        const [numeric = '', prerelease] = version.split('-', 2)
        return { parts: numeric.split('.').map(Number), prerelease }
    }
    const aVersion = parse(a)
    const bVersion = parse(b)

    for (let i = 0; i < 3; i++) {
        const aNum = aVersion.parts[i] ?? 0
        const bNum = bVersion.parts[i] ?? 0
        if (aNum < bNum) return -1
        if (aNum > bNum) return 1
    }

    if (aVersion.prerelease === bVersion.prerelease) return 0
    if (aVersion.prerelease === undefined) return 1
    if (bVersion.prerelease === undefined) return -1

    return aVersion.prerelease.localeCompare(bVersion.prerelease)
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
    // Only bump an existing pin: adding one would impose a dependency the
    // project chose not to have (e.g. a workspace that builds the CLI itself).
    if (typeof previous !== 'string' || previous === newSpec) return null
    if (previous.startsWith('workspace:')) return null

    pkg.devDependencies['@autonomos/cli'] = newSpec

    try {
        writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4) + '\n')
    } catch {
        return null
    }

    return `Bumped @autonomos/cli devDependency: ${previous} → ${newSpec}.`
}

function writeHarnessWorkflows(cwd: string, harnessIds: string[], workflowsDir: string): string[] {
    if (harnessIds.length === 0) return []
    const targets = resolveTargets(harnessIds, cwd)
    const written: string[] = []
    for (const target of targets) {
        for (const file of getTargetArtifactFiles(target, WORKFLOW_FILES)) {
            mkdirSync(dirname(file.destinationPath), { recursive: true })
            const source = readFileSync(join(workflowsDir, file.sourceFilename), 'utf-8')
            writeFileSync(file.destinationPath, source)
            written.push(file.destinationPath)
        }
    }
    return written
}

/**
 * Refresh workflows for harnesses already installed in the project.
 * Automatically migrates legacy layouts to conform to modern harness requirements:
 *  - Migrates legacy flat files in .agents/skills/ to standard skill bundles (.agents/skills/protocol-[name]/SKILL.md)
 *  - Migrates legacy .agent/workflows/ to .agents/workflows/
 *  - Cleans legacy flat files from .claude/skills/
 */
function refreshInstalledHarnessWorkflows(cwd: string, workflowsDir: string): string[] {
    const updatedTargets: string[] = []

    // 1. Migration of legacy flat files in .agents/skills
    const agentsSkillsDir = join(cwd, '.agents', 'skills')
    if (existsSync(agentsSkillsDir)) {
        let removedFlat = false
        for (const workflowFile of WORKFLOW_FILES) {
            const flatFile = join(agentsSkillsDir, buildTargetFilename(workflowFile, '.md'))
            if (existsSync(flatFile)) {
                try {
                    rmSync(flatFile, { force: true })
                    removedFlat = true
                } catch {
                    // Ignore removal failures
                }
            }
        }
        if (removedFlat) {
            // Install skill bundles in .agents/skills
            const skillTarget = {
                path: agentsSkillsDir,
                fileExtension: '.md',
                kind: 'skill' as const,
            }
            for (const file of getTargetArtifactFiles(skillTarget, WORKFLOW_FILES)) {
                mkdirSync(dirname(file.destinationPath), { recursive: true })
                const source = readFileSync(join(workflowsDir, file.sourceFilename), 'utf-8')
                writeFileSync(file.destinationPath, source)
            }
            updatedTargets.push(agentsSkillsDir)
        }
    }

    // 2. Migration of legacy .agent/workflows (singular) to .agents/workflows
    const legacyAgentWorkflowsDir = join(cwd, '.agent', 'workflows')
    if (existsSync(legacyAgentWorkflowsDir)) {
        const modernWorkflowsDir = join(cwd, '.agents', 'workflows')
        mkdirSync(modernWorkflowsDir, { recursive: true })
        let changedLegacy = false
        for (const workflowFile of WORKFLOW_FILES) {
            const flatName = buildTargetFilename(workflowFile, '.md')
            const source = readFileSync(join(workflowsDir, workflowFile), 'utf-8')
            const modernDest = join(modernWorkflowsDir, flatName)
            if (!existsSync(modernDest) || readFileSync(modernDest, 'utf-8') !== source) {
                writeFileSync(modernDest, source)
                changedLegacy = true
            }
            const legacyDest = join(legacyAgentWorkflowsDir, flatName)
            if (!existsSync(legacyDest) || readFileSync(legacyDest, 'utf-8') !== source) {
                writeFileSync(legacyDest, source)
                changedLegacy = true
            }
        }
        if (changedLegacy) {
            if (!updatedTargets.includes(modernWorkflowsDir)) {
                updatedTargets.push(modernWorkflowsDir)
            }
            if (!updatedTargets.includes(legacyAgentWorkflowsDir)) {
                updatedTargets.push(legacyAgentWorkflowsDir)
            }
        }
    }

    // 3. Migration of legacy flat files in .claude/skills
    const claudeSkillsDir = join(cwd, '.claude', 'skills')
    if (existsSync(claudeSkillsDir)) {
        for (const workflowFile of WORKFLOW_FILES) {
            const flatFile = join(claudeSkillsDir, buildTargetFilename(workflowFile, '.md'))
            if (existsSync(flatFile)) {
                try {
                    rmSync(flatFile, { force: true })
                } catch {
                    // Ignore removal failures
                }
            }
        }
    }

    // 4. Standard refresh across all targets resolved from configured platforms
    const targets = resolveTargets(
        listHarnesses().map(({ id }) => id),
        cwd
    )

    for (const target of targets) {
        if (!existsSync(target.path)) continue

        const files = getTargetArtifactFiles(target, WORKFLOW_FILES).map(file => ({
            source: readFileSync(join(workflowsDir, file.sourceFilename), 'utf-8'),
            dest: file.destinationPath,
        }))
        if (!files.some(({ dest }) => existsSync(dest))) continue

        let changed = false
        for (const { source, dest } of files) {
            if (!existsSync(dest) || readFileSync(dest, 'utf-8') !== source) {
                mkdirSync(dirname(dest), { recursive: true })
                writeFileSync(dest, source)
                changed = true
            }
        }
        if (changed && !updatedTargets.includes(target.path)) {
            updatedTargets.push(target.path)
        }
    }

    return updatedTargets
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

    // Resolve every packaged input before mutating project-owned files. A broken
    // CLI installation must fail without leaving a partially updated protocol.
    let workflowsDir: string
    try {
        workflowsDir = (options.resolveWorkflowsDir ?? getWorkflowsDir)()
    } catch (error) {
        return {
            success: false,
            message: `Cannot update protocol artifacts: ${error instanceof Error ? error.message : String(error)}`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
        }
    }

    // Refresh devDependency. We do this even when the protocol version
    // is already up to date, because the user may have run `update`
    // precisely to repair a pinned-but-unresolvable version.
    const devDepNote = refreshDevDependency(cwd)

    // Compare versions
    const comparison = compareVersions(currentVersion, PROTOCOL_VERSION)

    if (comparison === 0) {
        // Workflows are executable artifacts, so refresh installed harnesses
        // even when the protocol specification itself is already current.
        let updatedTargets: string[] = []
        try {
            updatedTargets = refreshInstalledHarnessWorkflows(cwd, workflowsDir)
        } catch (err) {
            console.warn(
                `Warning: Could not update harness workflows: ${err instanceof Error ? err.message : String(err)}`
            )
        }

        // Still install any newly requested harnesses even when the protocol
        // is current. This is the path used to add a new harness.
        const requestedHarnesses = options.all
            ? listHarnesses().map(({ id }) => id)
            : (options.harnesses ?? [])
        const newlyInstalled = writeHarnessWorkflows(cwd, requestedHarnesses, workflowsDir)

        if (
            manifest.cliVersion !== CLI_VERSION ||
            updatedTargets.length > 0 ||
            newlyInstalled.length > 0
        ) {
            writeFileSync(
                manifestPath,
                generateManifestContent({
                    ...manifest,
                    cliVersion: CLI_VERSION,
                    lastUpdated: new Date().toISOString(),
                })
            )
        }

        const workflowMsg =
            updatedTargets.length > 0 ? ` Refreshed workflows in ${updatedTargets.join(', ')}.` : ''
        const installedMsg =
            newlyInstalled.length > 0 ? ` Installed: ${newlyInstalled.join(', ')}.` : ''
        const devDepMsg = devDepNote ? ` ${devDepNote}` : ''
        return {
            success: true,
            message: `Already up to date (Protocol v${PROTOCOL_VERSION}).${workflowMsg}${installedMsg}${devDepMsg}`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
            touchedHarnesses: [...updatedTargets, ...newlyInstalled],
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
        updatedTargets.push(...refreshInstalledHarnessWorkflows(cwd, workflowsDir))
    } catch (err) {
        // Log warning but don't fail the update
        console.warn(
            `Warning: Could not update harness workflows: ${err instanceof Error ? err.message : String(err)}`
        )
    }

    // Also install any harnesses the user explicitly asked for. This
    // covers the "I'm on a newer protocol but want to add a new harness"
    // case as well as the more common "my init never installed opencode".
    const requestedHarnesses = options.all
        ? listHarnesses().map(({ id }) => id)
        : (options.harnesses ?? [])
    const newlyInstalled = writeHarnessWorkflows(cwd, requestedHarnesses, workflowsDir)

    const harnessInfo =
        updatedTargets.length > 0 ? ` (updated workflows in ${updatedTargets.join(', ')})` : ''
    const installedInfo =
        newlyInstalled.length > 0 ? ` (installed: ${newlyInstalled.join(', ')})` : ''
    const devDepInfo = devDepNote ? ` ${devDepNote}` : ''
    const formatInfo =
        manifestArtifactFormat(manifest) < ARTIFACT_FORMAT
            ? ` Project records still use artifact format ${manifestArtifactFormat(manifest)}: run \`autonomos migrate --dry-run\`, then \`autonomos migrate\`, then \`/reconcile\` on the reported findings.`
            : ''

    return {
        success: true,
        message: `Protocol updated: v${currentVersion} → v${PROTOCOL_VERSION}${harnessInfo}${installedInfo}${devDepInfo}${formatInfo}`,
        previousVersion: currentVersion,
        newVersion: PROTOCOL_VERSION,
        touchedHarnesses: [...updatedTargets, ...newlyInstalled],
    }
}
