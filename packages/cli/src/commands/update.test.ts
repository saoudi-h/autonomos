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
        expect(existsSync(join(root, '.agent', 'workflows', 'adopt.md'))).toBe(true)
        expect(existsSync(join(root, '.agent', 'workflows', 'reconcile.md'))).toBe(true)
        expect(existsSync(join(root, '.agent', 'workflows', 'design.md'))).toBe(true)
        expect(existsSync(join(root, '.autonomos', 'archive'))).toBe(false)
        expect(existsSync(join(root, '.autonomos', 'specs'))).toBe(false)
        expect(existsSync(join(root, '.autonomos', 'decisions'))).toBe(false)

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

    it('preserves project-owned specifications and decisions during update', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-update-'))
        const manifestPath = join(root, '.autonomos', 'manifest.json')
        const specsPath = join(root, '.autonomos', 'specs', 'SPEC-01-herald-v1.md')
        const decisionsPath = join(root, '.autonomos', 'decisions', 'ADR-001-storage.md')
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        mkdirSync(join(root, '.autonomos', 'specs'), { recursive: true })
        mkdirSync(join(root, '.autonomos', 'decisions'), { recursive: true })
        mkdirSync(join(root, '.autonomos', 'worklogs'), { recursive: true })
        mkdirSync(join(root, 'docs'), { recursive: true })
        mkdirSync(join(root, '.autonomos', 'archive', 'old-batch', 'worklogs'), { recursive: true })
        const manifest: Manifest = {
            protocolVersion: '0.3.0-alpha',
            cliVersion: '0.3.3',
            initializedAt: '2026-01-01T00:00:00.000Z',
            lastUpdated: '2026-01-01T00:00:00.000Z',
        }
        const spec = '# SPEC-01\n\n- Status: accepted\n'
        const decision = '# ADR-001\n\n- Status: accepted\n'
        writeFileSync(manifestPath, JSON.stringify(manifest))
        const preservedFiles = {
            [join(root, '.autonomos', 'archive', 'README.md')]: '# Archive topic index\n',
            [join(root, '.autonomos', 'archive', 'old-batch', 'TASKS.md')]:
                '- [x] **[OLD-01]** Historical task\n',
            [join(root, '.autonomos', 'archive', 'old-batch', 'ISSUES.md')]: '# Resolved issue\n',
            [join(root, '.autonomos', 'archive', 'old-batch', 'worklogs', 'evidence.md')]:
                '# Original evidence\n',
            [join(root, 'AGENT.md')]: '# Existing guidance\n',
            [join(root, '.autonomos', 'TASKS.md')]: '- [/] Existing task\n',
            [join(root, '.autonomos', 'ISSUES.md')]: '# Existing issue\n',
            [join(root, '.autonomos', 'worklogs', 'history.md')]: '# Historical record\n',
            [join(root, 'docs', 'notes.md')]: '# Existing docs\n',
        }
        for (const [file, content] of Object.entries(preservedFiles)) writeFileSync(file, content)
        writeFileSync(specsPath, spec)
        writeFileSync(decisionsPath, decision)

        const result = update({ cwd: root })

        expect(result.success).toBe(true)
        expect(result.newVersion).toBe(PROTOCOL_VERSION)
        for (const [file, content] of Object.entries(preservedFiles)) {
            expect(readFileSync(file, 'utf-8')).toBe(content)
        }
        expect(readFileSync(specsPath, 'utf-8')).toBe(spec)
        expect(readFileSync(decisionsPath, 'utf-8')).toBe(decision)
    })

    it('fails before mutating project files when packaged workflows are unavailable', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-update-'))
        const manifestPath = join(root, '.autonomos', 'manifest.json')
        const protocolPath = join(root, '.autonomos', 'PROTOCOL.md')
        const packagePath = join(root, 'package.json')
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        const manifest = {
            protocolVersion: '0.3.0-alpha',
            cliVersion: '0.3.0',
            initializedAt: '2026-01-01T00:00:00.000Z',
            lastUpdated: '2026-01-01T00:00:00.000Z',
        } satisfies Manifest
        writeFileSync(manifestPath, JSON.stringify(manifest))
        writeFileSync(protocolPath, 'old protocol')
        writeFileSync(packagePath, JSON.stringify({ name: 'fixture' }))

        const result = update({
            cwd: root,
            all: true,
            resolveWorkflowsDir: () => {
                throw new Error('missing packaged workflows')
            },
        })

        expect(result.success).toBe(false)
        expect(result.message).toContain('missing packaged workflows')
        expect(readFileSync(manifestPath, 'utf-8')).toBe(JSON.stringify(manifest))
        expect(readFileSync(protocolPath, 'utf-8')).toBe('old protocol')
        expect(readFileSync(packagePath, 'utf-8')).toBe(JSON.stringify({ name: 'fixture' }))
    })

    it('migrates legacy harness layouts (flat skills in .agents/skills, .agent/workflows, .claude/skills)', () => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-migrate-'))
        const manifestPath = join(root, '.autonomos', 'manifest.json')
        mkdirSync(join(root, '.autonomos'), { recursive: true })
        writeFileSync(
            manifestPath,
            JSON.stringify({
                protocolVersion: PROTOCOL_VERSION,
                cliVersion: '0.7.0',
                initializedAt: '2026-01-01T00:00:00.000Z',
                lastUpdated: '2026-01-01T00:00:00.000Z',
            } satisfies Manifest)
        )

        // Simulate legacy layout:
        // 1. flat files in .agents/skills/
        const agentsSkills = join(root, '.agents', 'skills')
        mkdirSync(agentsSkills, { recursive: true })
        writeFileSync(join(agentsSkills, 'session.md'), 'old flat session')
        writeFileSync(join(agentsSkills, 'task.md'), 'old flat task')
        // Preserved custom skill in .agents/skills/
        mkdirSync(join(agentsSkills, 'custom-tool'), { recursive: true })
        writeFileSync(join(agentsSkills, 'custom-tool', 'SKILL.md'), 'custom tool skill')

        // 2. legacy singular .agent/workflows
        const legacyAgent = join(root, '.agent', 'workflows')
        mkdirSync(legacyAgent, { recursive: true })
        writeFileSync(join(legacyAgent, 'session.md'), 'old agent session')

        // 3. legacy flat files in .claude/skills
        const claudeSkills = join(root, '.claude', 'skills')
        mkdirSync(claudeSkills, { recursive: true })
        writeFileSync(join(claudeSkills, 'session.md'), 'old claude session')

        const result = update({ cwd: root })

        expect(result.success).toBe(true)

        // 1. Flat files removed, standard skill bundle created
        expect(existsSync(join(agentsSkills, 'session.md'))).toBe(false)
        expect(existsSync(join(agentsSkills, 'task.md'))).toBe(false)
        expect(existsSync(join(agentsSkills, 'protocol-session', 'SKILL.md'))).toBe(true)
        expect(existsSync(join(agentsSkills, 'protocol-task', 'SKILL.md'))).toBe(true)
        // Custom skill untouched
        expect(readFileSync(join(agentsSkills, 'custom-tool', 'SKILL.md'), 'utf-8')).toBe(
            'custom tool skill'
        )

        // 2. Modern .agents/workflows created
        expect(existsSync(join(root, '.agents', 'workflows', 'session.md'))).toBe(true)

        // 3. Legacy flat claude/skills cleaned
        expect(existsSync(join(claudeSkills, 'session.md'))).toBe(false)
    })
})
