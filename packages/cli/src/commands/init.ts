import { checkbox, confirm } from '@inquirer/prompts'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    AGENT_FILE,
    AUTONOMOS_DIR,
    createManifest,
    displayRelative,
    findProjectRoot,
    generateAgentTemplate,
    generateManifestContent,
    isSamePath,
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
    /** When true, skip installing @autonomos/cli devDependency.
     *  The npm script will use npx instead. */
    noInstall?: boolean
    /**
     * When true, ignore the "you're inside a bigger project" check and
     * initialize the protocol in `cwd` no matter what. Mirrors the
     * `AUTONOMOS_FORCE=1` env var, which is more convenient in scripts.
     */
    force?: boolean
    /**
     * When set, treat stdin as a TTY (true) or non-TTY (false) regardless
     * of the real value. Tests use this to opt in/out of the project-root
     * confirmation prompt without mutating the real TTY state.
     */
    interactiveOverride?: boolean
}

export interface ResolveInstallResult {
    installDir: string
    warnings: string[]
    abort?: { message: string }
}

interface ResolveInstallOptions {
    force: boolean
    noPrompt: boolean
    isInteractive: boolean
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
 * Resolve which directory the protocol should be installed into.
 *
 * The protocol expects to live at the root of the user's project (where
 * `.git` / `.autonomos` already exists, or where one would be created).
 * When `init` is invoked from a subdirectory of such a project, we must
 * either:
 *
 *  - point the user at the actual root and refuse to install, or
 *  - install at the detected root on their behalf.
 *
 * We pick the first option by default, because silently installing
 * elsewhere is the bug that motivated this helper. The user can opt
 * into the second behavior with `--force` or `AUTONOMOS_FORCE=1`.
 *
 * Returns the directory to install in. When the caller passes `--force`
 * (or the env var is set), and a different project root is detected, we
 * install at that root instead. In interactive mode we also confirm the
 * detour with the user.
 */
export async function resolveInstallDir(
    requestedCwd: string,
    options: ResolveInstallOptions
): Promise<ResolveInstallResult> {
    const warnings: string[] = []
    const detectedRoot = findProjectRoot(requestedCwd)

    // No project root found above us: nothing to bubble up to. Either
    // we're in a fresh directory (warn about no git) or we're literally
    // at the root of a project that uses neither marker. Either way we
    // install in place.
    if (!detectedRoot) {
        if (!existsSync(join(requestedCwd, '.git'))) {
            warnings.push('No Git repository detected. Consider running `git init` first.')
        }
        return { installDir: requestedCwd, warnings }
    }

    // The project root is exactly where we are: ideal case, no detour.
    if (isSamePath(detectedRoot, requestedCwd)) {
        return { installDir: requestedCwd, warnings }
    }

    // The project root is somewhere above us. Decide what to do.
    const relCwd = displayRelative(requestedCwd, detectedRoot)
    const force = options.force || process.env.AUTONOMOS_FORCE === '1'

    if (force) {
        warnings.push(
            `Detected project root at ${displayRelative(detectedRoot, requestedCwd)} ` +
                `(AUTONOMOS_FORCE=1); installing there instead of "${relCwd}".`
        )
        return { installDir: detectedRoot, warnings }
    }

    if (options.isInteractive && !options.noPrompt) {
        const proceed = await confirm({
            message:
                `You're inside a project rooted at ${detectedRoot}.\n` +
                `The protocol should be installed at the project root, not in "${relCwd}".\n` +
                `Install at the project root instead?`,
            default: true,
        })
        if (proceed) {
            warnings.push(
                `Detected project root above "${relCwd}"; installing at ${detectedRoot}.`
            )
            return { installDir: detectedRoot, warnings }
        }
        return {
            installDir: requestedCwd,
            warnings,
            abort: {
                message:
                    `Aborted: refusing to install Autonomos inside a subdirectory. ` +
                    `Run the command from ${detectedRoot} (or pass --force / set AUTONOMOS_FORCE=1).`,
            },
        }
    }

    return {
        installDir: requestedCwd,
        warnings,
        abort: {
            message:
                `Cannot initialize Autonomos from a subdirectory.\n` +
                `  Current directory : ${requestedCwd}\n` +
                `  Detected root    : ${detectedRoot}\n` +
                `Re-run from the project root, or pass --force (or set AUTONOMOS_FORCE=1) to install here anyway.`,
        },
    }
}

/**
 * Initialize the Autonomos Agent Protocol in a directory.
 */
export async function init(options: InitOptions = {}): Promise<InitResult> {
    const requestedCwd = options.cwd ?? process.cwd()
    const dryRun = options.dryRun ?? false

    // Resolve the install target. We do this before any other check so a
    // bad install location fails fast with a clear message.
    const isInteractive =
        options.interactiveOverride ?? (process.stdin.isTTY === true && !options.dryRun)
    const resolution = await resolveInstallDir(requestedCwd, {
        force: options.force ?? false,
        noPrompt: options.noPrompt ?? false,
        isInteractive,
    })
    if (resolution.abort) {
        return {
            success: false,
            message: resolution.abort.message,
            created: [],
            warnings: resolution.warnings,
            dryRun,
        }
    }
    const cwd = resolution.installDir
    const warnings: string[] = [...resolution.warnings]

    const created: string[] = []
    const harnessFiles: string[] = []

    // Detect package.json for npm script registration
    const packageJsonPath = join(cwd, 'package.json')
    const hasPackageJson = existsSync(packageJsonPath) && statSync(packageJsonPath).isFile()

    // Check if already initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const isInitialized = existsSync(autonomosDir)

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

    if (isInitialized && selectedHarnesses.length === 0) {
        return {
            success: false,
            message: `Project already initialized with Protocol v${PROTOCOL_VERSION}. Use \`autonomos update\` to update, or specify harnesses with --harness to install workflow files.`,
            created: [],
            warnings: [],
            dryRun,
        }
    }

    // Compute the unique target directories
    const targets = resolveTargets(selectedHarnesses, cwd)

    // In dry-run mode, just collect what would be created
    if (dryRun) {
        if (!isInitialized) {
            created.push(AUTONOMOS_DIR)
            created.push(`${AUTONOMOS_DIR}/${WORKLOGS_DIR}`)
            created.push(`${AUTONOMOS_DIR}/${MANIFEST_FILE}`)
            created.push(`${AUTONOMOS_DIR}/${PROTOCOL_FILE}`)
            created.push(`${AUTONOMOS_DIR}/${TASKS_FILE}`)
        } else {
            created.push(`${AUTONOMOS_DIR}/${MANIFEST_FILE} (update)`)
            created.push(`${AUTONOMOS_DIR}/${PROTOCOL_FILE} (update)`)
        }

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
            message: `Would ${isInitialized ? 'update workflows in' : 'initialize'} project with Agent Protocol v${PROTOCOL_VERSION}${selectedHarnesses.length ? ` (harnesses: ${selectedHarnesses.join(', ')})` : ''}`,
            created,
            warnings,
            dryRun: true,
            harnessFiles,
        }
    }

    // Create .autonomos directory
    if (!existsSync(autonomosDir)) {
        mkdirSync(autonomosDir, { recursive: true })
        created.push(AUTONOMOS_DIR)
    }

    // Create worklogs directory
    const worklogsDir = join(autonomosDir, WORKLOGS_DIR)
    if (!existsSync(worklogsDir)) {
        mkdirSync(worklogsDir, { recursive: true })
        created.push(`${AUTONOMOS_DIR}/${WORKLOGS_DIR}`)
    }

    // Create manifest.json
    const manifest = createManifest(CLI_VERSION)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)
    writeFileSync(manifestPath, generateManifestContent(manifest))
    created.push(`${AUTONOMOS_DIR}/${MANIFEST_FILE}`)

    // Create PROTOCOL.md
    const protocolPath = join(autonomosDir, PROTOCOL_FILE)
    writeFileSync(protocolPath, PROTOCOL_TEMPLATE)
    created.push(`${AUTONOMOS_DIR}/${PROTOCOL_FILE}`)

    // Create TASKS.md (only if it doesn't exist)
    const tasksPath = join(autonomosDir, TASKS_FILE)
    if (!existsSync(tasksPath)) {
        writeFileSync(tasksPath, TASKS_TEMPLATE)
        created.push(`${AUTONOMOS_DIR}/${TASKS_FILE}`)
    } else {
        warnings.push(`${TASKS_FILE} already exists, skipping.`)
    }

    // Create AGENT.md at root (only if it doesn't exist)
    const agentPath = join(cwd, AGENT_FILE)
    if (!existsSync(agentPath)) {
        const projectName = cwd.split('/').pop() ?? 'Project'
        writeFileSync(agentPath, generateAgentTemplate(projectName))
        created.push(AGENT_FILE)
    } else {
        warnings.push(`${AGENT_FILE} already exists, skipping.`)
    }

    // Register npm script "autonomos" if package.json exists
    if (hasPackageJson) {
        try {
            const pkgRaw = readFileSync(packageJsonPath, 'utf-8')
            const pkg = JSON.parse(pkgRaw)
            const hadScript = !!pkg.scripts?.['autonomos']
            const previousDevDep = pkg.devDependencies?.['@autonomos/cli']
            const newDevDep = `^${CLI_VERSION}`

            if (!pkg.scripts) pkg.scripts = {}

            if (options.noInstall || options.dryRun) {
                // Mode B: npx only, no devDependency
                pkg.scripts['autonomos'] = 'npx --yes @autonomos/cli'
                writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4) + '\n')
                created.push('package.json (scripts.autonomos via npx)')
                if (!hadScript) {
                    warnings.push(
                        'Added "autonomos" npm script using npx (--no-install mode). Run `npm install` when ready.'
                    )
                }
            } else {
                // Mode A (default): install as devDependency
                pkg.scripts['autonomos'] = 'autonomos'

                if (!pkg.devDependencies) pkg.devDependencies = {}
                pkg.devDependencies['@autonomos/cli'] = newDevDep

                writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4) + '\n')
                created.push('package.json (scripts.autonomos + devDependencies.@autonomos/cli)')

                // Three distinct situations to communicate:
                //   1. fresh install: nothing existed before
                //   2. devDep was already there but pinned to a stale
                //      version (typical of older CLI builds that wrote
                //      ^0.2.0, which doesn't exist on the registry)
                //   3. devDep was already there at the current version
                //      and only the script needed adding
                if (!hadScript && !previousDevDep) {
                    warnings.push(
                        'Added "autonomos" npm script and @autonomos/cli devDependency. Run `npm install` to install.'
                    )
                } else if (previousDevDep && previousDevDep !== newDevDep) {
                    // Covers both "old script + stale devDep" and
                    // "no script + stale devDep" cases. Refreshing the
                    // devDep is what unblocks `pnpm i` when the pinned
                    // version isn't on the registry.
                    warnings.push(
                        `Bumped @autonomos/cli devDependency: ${previousDevDep} → ${newDevDep}. Run \`npm install\` to apply.`
                    )
                } else if (!hadScript && previousDevDep) {
                    warnings.push(
                        'Added "autonomos" npm script (devDependency was already set).'
                    )
                }
            }
        } catch {
            warnings.push('Could not update package.json (invalid JSON or read error).')
        }
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
