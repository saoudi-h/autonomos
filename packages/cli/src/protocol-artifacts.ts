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
    'protocol-design.md',
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

export interface TargetArtifactFile {
    sourceFilename: string
    relativeTargetFilePath: string
    destinationPath: string
}

export function buildTargetFilename(sourceFile: string, targetExtension: string): string {
    const withoutPrefix = sourceFile.replace(/^protocol-/, '')
    const withoutExt = withoutPrefix.replace(/\.[^.]+$/, '')
    return withoutExt + targetExtension
}

export function getTargetArtifactFiles(
    target: { path: string; fileExtension: string; kind?: 'flat' | 'skill' },
    workflowFiles: readonly string[] = WORKFLOW_FILES
): TargetArtifactFile[] {
    return workflowFiles.map(sourceFile => {
        if (target.kind === 'skill') {
            const skillName = sourceFile.replace(/\.[^.]+$/, '')
            const relPath = join(skillName, 'SKILL.md')
            return {
                sourceFilename: sourceFile,
                relativeTargetFilePath: relPath,
                destinationPath: join(target.path, relPath),
            }
        }
        const flatFilename = buildTargetFilename(sourceFile, target.fileExtension)
        return {
            sourceFilename: sourceFile,
            relativeTargetFilePath: flatFilename,
            destinationPath: join(target.path, flatFilename),
        }
    })
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

    const legacyAgentWorkflows = join(cwd, '.agent', 'workflows')
    if (existsSync(legacyAgentWorkflows)) {
        targets.push({
            path: legacyAgentWorkflows,
            fileExtension: '.md',
            kind: 'flat',
            usedBy: ['antigravity-legacy'],
        })
    }

    for (const target of targets) {
        const expected = getTargetArtifactFiles(target, WORKFLOW_FILES).map(file => ({
            source: readFileSync(join(workflowsDir, file.sourceFilename), 'utf-8'),
            destination: file.destinationPath,
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
