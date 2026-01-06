import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
    AUTONOMOS_DIR,
    MANIFEST_FILE,
    parseManifest,
    TaskParser,
    TASKS_FILE,
    type Manifest,
} from '@autonomos/core'

interface StatusOptions {
    cwd?: string
}

interface TaskSummary {
    total: number
    todo: number
    inProgress: number
    done: number
    blocked: number
}

interface StatusResult {
    success: boolean
    message: string
    protocolVersion?: string
    cliVersion?: string
    initialized: boolean
    taskSummary?: TaskSummary
}

/**
 * Get project status and task summary
 */
export function status(options: StatusOptions = {}): StatusResult {
    const cwd = options.cwd ?? process.cwd()

    // Check if initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)

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

    // Parse tasks
    let taskSummary: TaskSummary | undefined
    const tasksPath = join(autonomosDir, TASKS_FILE)

    if (existsSync(tasksPath)) {
        try {
            const tasksContent = readFileSync(tasksPath, 'utf-8')
            const tasks = TaskParser.parse(tasksContent)

            taskSummary = {
                total: tasks.length,
                todo: tasks.filter(t => t.status === 'TODO').length,
                inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                done: tasks.filter(t => t.status === 'DONE').length,
                blocked: tasks.filter(t => t.status === 'BLOCKED').length,
            }
        } catch {
            // Tasks file exists but couldn't be parsed
        }
    }

    return {
        success: true,
        message: 'Project status retrieved',
        protocolVersion: manifest.protocolVersion,
        cliVersion: manifest.cliVersion,
        initialized: true,
        taskSummary,
    }
}
