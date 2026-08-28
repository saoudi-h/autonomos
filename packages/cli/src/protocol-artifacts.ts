import { existsSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    AUTONOMOS_DIR,
    listHarnesses,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    resolveTargets,
} from '@autonomos/core'

export const WORKFLOW_FILES = [
    'protocol-session.md',
    'protocol-task.md',
    'protocol-crystallize.md',
    'protocol-issue.md',
    'protocol-adopt.md',
    'protocol-reconcile.md',
] as const

export type ArtifactIntegrity = 'valid' | 'drifted' | 'unverifiable'

export interface ArtifactIntegrityResult {
    state: ArtifactIntegrity
    driftedFiles: string[]
}

export function getWorkflowDirCandidates(moduleUrl: string = import.meta.url): string[] {
    const here = fileURLToPath(moduleUrl)
    return [
        resolve(here, '..', '..', '..', 'core', 'src', 'workflows'),
        resolve(here, '..', '..', '..', 'core', 'dist', 'workflows'),
        resolve(here, '..', '..', '..', '..', 'core', 'dist', 'workflows'),
    ]
}

export function getWorkflowsDir(): string {
    const candidates = getWorkflowDirCandidates()
    for (const candidate of candidates) {
        if (existsSync(candidate)) return candidate
    }
    throw new Error('Could not locate the workflows directory inside @autonomos/core')
}

export function buildTargetFilename(sourceFile: string, targetExtension: string): string {
    const withoutPrefix = sourceFile.replace(/^protocol-/, '')
    const withoutExt = withoutPrefix.replace(/\.[^.]+$/, '')
    return withoutExt + targetExtension
}

export function verifyProtocolArtifacts(
    cwd: string,
    declaredVersion: string
): ArtifactIntegrityResult {
    if (declaredVersion !== PROTOCOL_VERSION) {
        return { state: 'unverifiable', driftedFiles: [] }
    }

    const driftedFiles: string[] = []
    const protocolPath = join(cwd, AUTONOMOS_DIR, PROTOCOL_FILE)
    compareFile(protocolPath, PROTOCOL_TEMPLATE, cwd, driftedFiles)

    const workflowsDir = getWorkflowsDir()
    const targets = resolveTargets(
        listHarnesses().map(({ id }) => id),
        cwd
    )

    for (const target of targets) {
        const expected = WORKFLOW_FILES.map(sourceFile => ({
            source: readFileSync(join(workflowsDir, sourceFile), 'utf-8'),
            destination: join(target.path, buildTargetFilename(sourceFile, target.fileExtension)),
        }))
        if (!expected.some(({ destination }) => existsSync(destination))) continue
        for (const file of expected) {
            compareFile(file.destination, file.source, cwd, driftedFiles)
        }
    }

    return {
        state: driftedFiles.length === 0 ? 'valid' : 'drifted',
        driftedFiles,
    }
}

function compareFile(path: string, expected: string, cwd: string, driftedFiles: string[]): void {
    if (!existsSync(path) || readFileSync(path, 'utf-8') !== expected) {
        driftedFiles.push(relative(cwd, path))
    }
}
