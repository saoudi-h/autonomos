import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

import { ARCHIVE_DIR, AUTONOMOS_DIR, TASKS_FILE } from '../constants'
import { TaskParser } from './task-parser'

export interface TaskReference {
    id: string
    status: ReturnType<typeof TaskParser.references>[number]['status']
    line: number
    /** Source path relative to the supplied project root. */
    path: string
}

export interface TaskRegistry {
    current: TaskReference[]
    archived: TaskReference[]
    duplicateIds: string[]
    warnings: string[]
    /** False if a requested registry could not be inspected completely. */
    complete: boolean
}

/** Read current task IDs; opt into history for reporting or reserving a new ID. */
export function readTaskRegistry(root: string, options: { history?: boolean } = {}): TaskRegistry {
    const registry: TaskRegistry = {
        current: [],
        archived: [],
        duplicateIds: [],
        warnings: [],
        complete: true,
    }
    function warn(path: string, message: string): void {
        registry.complete = false
        registry.warnings.push(`${relative(root, path)}: ${message}`)
    }
    function read(path: string, target: TaskReference[]): void {
        try {
            const stat = lstatSync(path)
            if (!stat.isFile()) {
                warn(path, 'Expected a regular task registry; symbolic links are not followed')
                return
            }
            target.push(
                ...TaskParser.references(readFileSync(path, 'utf8')).map(task => ({
                    ...task,
                    path: relative(root, path),
                }))
            )
        } catch (error) {
            warn(path, error instanceof Error ? error.message : String(error))
        }
    }
    function scan(path: string, optional = false): void {
        try {
            const stat = lstatSync(path)
            if (!stat.isDirectory()) {
                warn(path, 'Expected an archive directory; symbolic links are not followed')
                return
            }
            for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
                a.name.localeCompare(b.name)
            )) {
                const child = join(path, entry.name)
                if (entry.isSymbolicLink()) warn(child, 'Skipped symbolic link in archive')
                else if (entry.isDirectory()) scan(child)
                else if (entry.name === TASKS_FILE) read(child, registry.archived)
            }
        } catch (error) {
            if (optional && (error as NodeJS.ErrnoException).code === 'ENOENT') return
            warn(path, error instanceof Error ? error.message : String(error))
        }
    }
    const autonomosPath = join(root, AUTONOMOS_DIR)
    try {
        if (!lstatSync(autonomosPath).isDirectory()) {
            warn(
                autonomosPath,
                'Expected a regular project directory; symbolic links are not followed'
            )
            return registry
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            warn(autonomosPath, error instanceof Error ? error.message : String(error))
        }
        return registry
    }
    const currentPath = join(autonomosPath, TASKS_FILE)
    try {
        lstatSync(currentPath)
        read(currentPath, registry.current)
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            warn(currentPath, error instanceof Error ? error.message : String(error))
        }
    }
    if (options.history) scan(join(root, AUTONOMOS_DIR, ARCHIVE_DIR), true)
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    for (const task of [...registry.current, ...registry.archived]) {
        if (seen.has(task.id)) duplicates.add(task.id)
        seen.add(task.id)
    }
    registry.duplicateIds = [...duplicates].sort()
    return registry
}
