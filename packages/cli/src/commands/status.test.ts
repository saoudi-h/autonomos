import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { PROTOCOL_TEMPLATE, PROTOCOL_VERSION, type Manifest } from '@autonomos/core'
import { afterEach, describe, expect, it } from 'vitest'

import { status } from './status'

describe('status protocol artifact integrity', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
    })

    function initialize(protocolVersion: string = PROTOCOL_VERSION): void {
        root = mkdtempSync(join(tmpdir(), 'autonomos-status-'))
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        const manifest: Manifest = {
            protocolVersion,
            cliVersion: '0.0.0-test',
            initializedAt: '2026-01-01T00:00:00.000Z',
            lastUpdated: '2026-01-01T00:00:00.000Z',
        }
        writeFileSync(join(root, '.autonomos', 'manifest.json'), JSON.stringify(manifest))
        writeFileSync(join(root, '.autonomos', 'PROTOCOL.md'), PROTOCOL_TEMPLATE)
    }

    it('reports canonical artifacts as valid', () => {
        initialize()

        const result = status({ cwd: root })

        expect(result.artifactIntegrity).toBe('valid')
        expect(result.driftedArtifacts).toEqual([])
    })

    it('reports modified and incomplete installed artifact sets as drifted', () => {
        initialize()
        writeFileSync(join(root, '.autonomos', 'PROTOCOL.md'), 'locally edited')
        mkdirSync(join(root, '.agent', 'workflows'), { recursive: true })
        writeFileSync(join(root, '.agent', 'workflows', 'session.md'), 'stale session')

        const result = status({ cwd: root })

        expect(result.artifactIntegrity).toBe('drifted')
        expect(result.driftedArtifacts).toEqual(
            expect.arrayContaining([
                '.autonomos/PROTOCOL.md',
                '.agent/workflows/session.md',
                '.agent/workflows/task.md',
                '.agent/workflows/crystallize.md',
                '.agent/workflows/adopt.md',
                '.agent/workflows/design.md',
            ])
        )
    })

    it('does not judge artifacts from a different protocol version', () => {
        initialize('0.1.0-alpha')
        writeFileSync(join(root, '.autonomos', 'PROTOCOL.md'), 'old canonical content')

        const result = status({ cwd: root })

        expect(result.artifactIntegrity).toBe('unverifiable')
        expect(result.driftedArtifacts).toEqual([])
    })

    it('reports current and historical tasks separately, including legacy metadata-free IDs', () => {
        initialize()
        writeFileSync(join(root, '.autonomos', 'TASKS.md'), '- [/] **[T-02]** Current\n')
        mkdirSync(join(root, '.autonomos', 'archive', 'batch'), { recursive: true })
        writeFileSync(
            join(root, '.autonomos', 'archive', 'batch', 'TASKS.md'),
            '- [x] **[T-01]** Done\n- [ ] **[T-03]** Abandoned with reason\n'
        )
        const current = status({ cwd: root })
        expect(current.taskSummary).toMatchObject({ total: 1, inProgress: 1, done: 0 })
        expect(current).not.toHaveProperty('archivedTaskSummary')
        const history = status({ cwd: root, history: true })
        expect(history.taskSummary).toEqual(current.taskSummary)
        expect(history.archivedTaskSummary).toMatchObject({ total: 2, done: 1, todo: 1 })
        expect(history.historyComplete).toBe(true)
        expect(history.artifactIntegrity).toBe('valid')
    })

    it('surfaces duplicate IDs and incomplete history without implying a complete total', () => {
        initialize()
        writeFileSync(join(root, '.autonomos', 'TASKS.md'), '- [ ] **[T-01]** Current\n')
        mkdirSync(join(root, '.autonomos', 'archive', 'batch'), { recursive: true })
        writeFileSync(
            join(root, '.autonomos', 'archive', 'batch', 'TASKS.md'),
            '- [x] **[T-01]** History\n'
        )
        symlinkSync('missing', join(root, '.autonomos', 'archive', 'unreadable'))
        const result = status({ cwd: root, history: true })
        expect(result.duplicateTaskIds).toEqual(['T-01'])
        expect(result.historyComplete).toBe(false)
        expect(result.warnings).toHaveLength(1)
        expect(result.archivedTaskSummary?.total).toBe(1)
    })

    it('rejects a linked protocol root instead of reading its manifest and archive', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-status-'))
        mkdirSync(join(root, 'external'))
        writeFileSync(join(root, 'external', 'manifest.json'), '{}')
        symlinkSync(join(root, 'external'), join(root, '.autonomos'))
        const result = status({ cwd: root, history: true })
        expect(result.success).toBe(false)
        expect(result.message).toContain('symbolic links are not followed')
    })
})
