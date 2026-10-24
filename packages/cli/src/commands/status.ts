import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
    AUTONOMOS_DIR,
    MANIFEST_FILE,
    parseManifest,
    readTaskRegistry,
    TASKS_FILE,
    type Manifest,
    type TaskReference,
} from '@autonomos/core'
import { verifyProtocolArtifacts, type ArtifactIntegrity } from '../protocol-artifacts'

interface StatusOptions {
    cwd?: string
    history?: boolean
}

interface TaskSummary {
    total: number
    todo: number
    inProgress: number
    done: number
    blocked: number
}

export interface StatusResult {
    success: boolean
    message: string
    protocolVersion?: string
    cliVersion?: string
    initialized: boolean
    taskSummary?: TaskSummary
    archivedTaskSummary?: TaskSummary
    historyComplete?: boolean
    duplicateTaskIds?: string[]
    warnings?: string[]
    artifactIntegrity?: ArtifactIntegrity
    driftedArtifacts?: string[]
}

/**
 * Get project status and task summary
 */
export function status(options: StatusOptions = {}): StatusResult {
    const cwd = options.cwd ?? process.cwd()

    // Check if initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)

    if (existsSync(autonomosDir) && !lstatSync(autonomosDir).isDirectory()) {
        return {
            success: false,
            message: 'Expected a regular .autonomos directory; symbolic links are not followed.',
            initialized: false,
        }
    }

    if (!existsSync(manifestPath)) {
        return {
            success: false,
            message: 'Project not initialized. Run `autonomos init` first.',
            initialized: false,
        }
    }

    // Read manifest
    let manifest: Manifest
    try {
        const manifestContent = readFileSync(manifestPath, 'utf-8')
        manifest = parseManifest(manifestContent)
    } catch {
        return {
            success: false,
            message: 'Could not read manifest.json',
            initialized: true,
        }
    }

    // History stays opt-in: ordinary bootstrap must not traverse archives.
    let taskSummary: TaskSummary | undefined
    const registry = readTaskRegistry(cwd, { history: options.history })
    const summarize = (tasks: TaskReference[]): TaskSummary => ({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: tasks.filter(t => t.status === 'DONE').length,
        blocked: tasks.filter(t => t.status === 'BLOCKED').length,
    })
    if (existsSync(join(autonomosDir, TASKS_FILE))) {
        taskSummary = summarize(registry.current)
    }

    const integrity = verifyProtocolArtifacts(cwd, manifest.protocolVersion)

    return {
        success: true,
        message: 'Project status retrieved',
        protocolVersion: manifest.protocolVersion,
        cliVersion: manifest.cliVersion,
        initialized: true,
        taskSummary,
        ...(options.history
            ? {
                  archivedTaskSummary: summarize(registry.archived),
                  historyComplete: registry.complete,
              }
            : {}),
        duplicateTaskIds: registry.duplicateIds,
        warnings: registry.warnings,
        artifactIntegrity: integrity.state,
        driftedArtifacts: integrity.driftedFiles,
    }
}
