import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { PROTOCOL_VERSION, type Manifest } from '@autonomos/core'
import { afterEach, describe, expect, it } from 'vitest'

import packageJson from '../../package.json' with { type: 'json' }
import { update } from './update'

describe('update', () => {
    let root: string

    afterEach(() => {
        if (root && existsSync(root)) rmSync(root, { recursive: true, force: true })
    })

    it('refreshes stale workflows and CLI metadata when the protocol is current', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-update-'))
        const manifest: Manifest = {
            protocolVersion: PROTOCOL_VERSION,
            cliVersion: '0.3.3',
            initializedAt: '2026-01-01T00:00:00.000Z',
            lastUpdated: '2026-01-01T00:00:00.000Z',
        }
        const manifestPath = join(root, '.autonomos', 'manifest.json')
        const workflowPath = join(root, '.agent', 'workflows', 'crystallize.md')
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        mkdirSync(join(root, '.agent', 'workflows'), { recursive: true })
        writeFileSync(manifestPath, JSON.stringify(manifest))
        writeFileSync(workflowPath, 'stale workflow')

        const result = update({ cwd: root })

        const updatedManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest
        expect(result.message).toContain('Refreshed workflows')
        expect(updatedManifest.cliVersion).toBe(packageJson.version)
        expect(updatedManifest.lastUpdated).not.toBe(manifest.lastUpdated)
        expect(readFileSync(workflowPath, 'utf-8')).toContain(
            'self-contained answer to the original request'
        )
        expect(existsSync(join(root, '.agent', 'workflows', 'issue.md'))).toBe(true)
        expect(existsSync(join(root, '.agent', 'workflows', 'reconcile.md'))).toBe(true)

        const firstUpdate = updatedManifest.lastUpdated
        const second = update({ cwd: root })
        const unchangedManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest
        expect(second.message).toBe(`Already up to date (Protocol v${PROTOCOL_VERSION}).`)
        expect(unchangedManifest.lastUpdated).toBe(firstUpdate)
    })

    it('migrates a lower prerelease protocol version', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-update-'))
        const manifestPath = join(root, '.autonomos', 'manifest.json')
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        writeFileSync(
            manifestPath,
            JSON.stringify({
                protocolVersion: '0.3.0-alpha',
                cliVersion: '0.3.3',
                initializedAt: '2026-01-01T00:00:00.000Z',
                lastUpdated: '2026-01-01T00:00:00.000Z',
            } satisfies Manifest)
        )

        const result = update({ cwd: root })
        const updatedManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest

        expect(result.message).toContain(`v0.3.0-alpha → v${PROTOCOL_VERSION}`)
        expect(updatedManifest.protocolVersion).toBe(PROTOCOL_VERSION)
    })
})
