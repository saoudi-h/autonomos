import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readTaskRegistry, type Manifest } from '@autonomos/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { close, migrate } from './records'
import { status } from './status'

const TASKS = `# PROJECT TASKS

## Current direction

Ship format 2.

## Active

- [x] **[T-1]** Done \`Priority: 🟠\` \`Complexity: S\` — [evidence](worklogs/2026-01-01-T-1.md)
    - detail
- [ ] **[T-2]** Open \`Priority: 🟠\` \`Complexity: M\`
- [/] **[T-3]** Going \`Priority: 🔵\` \`Complexity: S\`

## Old sprint — [spec](specs/SPEC-1.md)

- [x] **[T-4]** Older \`Priority: 🔵\` \`Complexity: S\` _See: .autonomos/worklogs/2026-01-02-T-4.md_
- [x] SITE-9 Untagged done item
    - [ ] follow-up left behind
`

const ISSUES = `# Issues

## [I-1] Open

- Status: open
- Tasks: T-2

## [I-2] Done

- **Status:** resolved
- Evidence: [log](worklogs/2026-01-01-T-1.md)
`

const hasRelocatedHeading = (text: string): boolean =>
    text.includes(
        '## From TASKS.md › Old sprint — [spec](../../specs/SPEC-1.md) (moved 2026-11-08)'
    )

describe('records commands', () => {
    let root: string
    const dot = (...parts: string[]): string => join(root, '.autonomos', ...parts)
    const read = (...parts: string[]): string => readFileSync(dot(...parts), 'utf8')

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-records-'))
        mkdirSync(dot('worklogs'), { recursive: true })
        mkdirSync(dot('decisions'), { recursive: true })
        mkdirSync(join(root, 'docs'), { recursive: true })
        const manifest: Manifest = {
            protocolVersion: '0.7.0-alpha',
            cliVersion: '0.0.0-test',
            initializedAt: '2026-01-01T00:00:00.000Z',
            lastUpdated: '2026-01-01T00:00:00.000Z',
        }
        writeFileSync(dot('manifest.json'), JSON.stringify(manifest))
        writeFileSync(dot('TASKS.md'), TASKS)
        writeFileSync(dot('ISSUES.md'), ISSUES)
        writeFileSync(
            dot('worklogs', '2026-01-01-T-1.md'),
            '# T-1\nSee [ADR](../decisions/ADR-1.md) and [next](2026-01-02-T-4.md).\n'
        )
        writeFileSync(dot('worklogs', '2026-01-02-T-4.md'), '# T-4\n')
        writeFileSync(dot('worklogs', 'results.json'), '{}')
        mkdirSync(dot('worklogs', 'audit'))
        writeFileSync(dot('worklogs', 'audit', 'part.md'), '[up](../2026-01-02-T-4.md)\n')
        writeFileSync(
            dot('decisions', 'ADR-1.md'),
            'Evidence: [w](../worklogs/2026-01-01-T-1.md)\n'
        )
        writeFileSync(
            join(root, 'docs', 'guide.md'),
            'Data in [results](../.autonomos/worklogs/results.json).\n'
        )
    })

    afterEach(() => rmSync(root, { recursive: true, force: true }))

    describe('close', () => {
        it('moves a completed task with a completion date and repaired links', () => {
            const result = close({ cwd: root, ids: ['T-1'], date: '2026-11-08' })
            expect(result.success).toBe(true)
            expect(read('TASKS.md')).not.toContain('[T-1]')
            const closed = read('archive', 'closed', 'TASKS.md')
            expect(closed).toContain('# Closed tasks')
            expect(closed).toContain(
                '- [x] **[T-1]** Done `Priority: 🟠` `Complexity: S` `Completed: 2026-11-08` — [evidence](../../worklogs/2026-01-01-T-1.md)\n    - detail'
            )
        })

        it('closes resolved issues and refuses open work', () => {
            expect(close({ cwd: root, ids: ['I-2'] }).closedIssues).toEqual(['I-2'])
            expect(read('archive', 'closed', 'ISSUES.md')).toContain(
                '[log](../../worklogs/2026-01-01-T-1.md)'
            )
            const refused = close({ cwd: root, ids: ['T-2', 'I-1', 'NOPE', 'I-2'] })
            expect(refused.success).toBe(false)
            expect(refused.message).toContain('T-2 is not marked [x]')
            expect(refused.message).toContain('I-1 has status "open"')
            expect(refused.message).toContain('NOPE is not in the current')
            expect(refused.message).toContain('I-2 is already closed')
            expect(read('TASKS.md')).toBe(TASKS)
        })

        it('closes unfinished work only as abandoned', () => {
            const result = close({
                cwd: root,
                ids: ['T-3'],
                abandoned: 'superseded',
                date: '2026-11-08',
            })
            expect(result.success).toBe(true)
            expect(read('archive', 'closed', 'TASKS.md')).toContain(
                '- [/] **[T-3]** Going `Priority: 🔵` `Complexity: S` `Abandoned: 2026-11-08` — superseded'
            )
        })

        it('groups closures of the same day under one heading', () => {
            close({ cwd: root, ids: ['T-1'], date: '2026-11-08' })
            writeFileSync(
                dot('TASKS.md'),
                read('TASKS.md').replace('- [ ] **[T-2]**', '- [x] **[T-2]**')
            )
            close({ cwd: root, ids: ['T-2'], date: '2026-11-08' })
            const closed = read('archive', 'closed', 'TASKS.md')
            expect(closed.match(/## Closed 2026-11-08/g)).toHaveLength(1)
            expect(closed).toMatch(/\[T-1\].*\n {4}- detail\n- \[x\] \*\*\[T-2\]\*\*/)
        })

        it('writes nothing in dry-run', () => {
            expect(close({ cwd: root, ids: ['T-1'], dryRun: true }).closedTasks).toEqual(['T-1'])
            expect(read('TASKS.md')).toBe(TASKS)
            expect(existsSync(dot('archive'))).toBe(false)
        })
    })

    describe('migrate', () => {
        it('dry-run reports the plan without writing', () => {
            const result = migrate({ cwd: root, dryRun: true, date: '2026-11-08' })
            expect(result.closedTasks).toEqual(['T-1', 'T-4', 'SITE-9'])
            expect(result.closedIssues).toEqual(['I-2'])
            expect(result.followUps).toEqual(['SITE-9'])
            expect(result.movedWorklogs).toBe(4)
            expect(read('TASKS.md')).toBe(TASKS)
            expect(existsSync(dot('worklogs', 'results.json'))).toBe(true)
        })

        it('moves closed records and worklogs, repairs references and keeps every ID', () => {
            const before = readTaskRegistry(root, { history: true })
            const result = migrate({ cwd: root, date: '2026-11-08' })
            expect(result.success).toBe(true)

            const tasks = read('TASKS.md')
            expect(tasks).toContain('Ship format 2.')
            expect(tasks).toContain('[T-2]')
            expect(tasks).toContain('[T-3]')
            expect(tasks).not.toContain('[T-1]')
            expect(tasks).not.toContain('## Old sprint')
            expect(hasRelocatedHeading(read('archive', 'closed', 'TASKS.md'))).toBe(true)

            const closed = read('archive', 'closed', 'TASKS.md')
            expect(closed).toContain('## From TASKS.md › Active (moved 2026-11-08)')
            expect(closed).toContain('[evidence](../worklogs-format-1/2026-01-01-T-1.md)')
            expect(closed).toContain(
                '_See: .autonomos/archive/worklogs-format-1/2026-01-02-T-4.md_'
            )
            expect(closed).not.toContain('Completed:')

            expect(read('ISSUES.md')).not.toContain('[I-2]')
            expect(read('archive', 'closed', 'ISSUES.md')).toContain(
                '[log](../worklogs-format-1/2026-01-01-T-1.md)'
            )

            expect(existsSync(dot('worklogs', '2026-01-01-T-1.md'))).toBe(false)
            expect(read('archive', 'worklogs-format-1', '2026-01-01-T-1.md')).toBe(
                '# T-1\nSee [ADR](../../decisions/ADR-1.md) and [next](2026-01-02-T-4.md).\n'
            )
            expect(read('archive', 'worklogs-format-1', 'results.json')).toBe('{}')
            expect(read('archive', 'worklogs-format-1', 'audit', 'part.md')).toBe(
                '[up](../2026-01-02-T-4.md)\n'
            )
            expect(existsSync(dot('worklogs', 'audit'))).toBe(false)
            expect(existsSync(dot('worklogs', '.gitkeep'))).toBe(true)
            expect(read('decisions', 'ADR-1.md')).toBe(
                'Evidence: [w](../archive/worklogs-format-1/2026-01-01-T-1.md)\n'
            )
            expect(readFileSync(join(root, 'docs', 'guide.md'), 'utf8')).toBe(
                'Data in [results](../.autonomos/archive/worklogs-format-1/results.json).\n'
            )
            expect(read('archive', 'README.md')).toContain('`worklogs-format-1/`')
            expect(JSON.parse(read('manifest.json')).artifactFormat).toBe(2)

            const after = readTaskRegistry(root, { history: true })
            const ids = (r: typeof before): string[] =>
                [...r.current, ...r.archived].map(t => t.id).sort()
            expect(ids(after)).toEqual(ids(before))
            expect(after.duplicateIds).toEqual([])
        })

        it('is idempotent and leaves new worklogs in place', () => {
            migrate({ cwd: root, date: '2026-11-08' })
            writeFileSync(dot('worklogs', '2026-11-09-T-2.md'), '# [T-2] x\n\nOutcome: y\n')
            const snapshot = read('archive', 'closed', 'TASKS.md')
            const second = migrate({ cwd: root, date: '2026-11-09' })
            expect(second.message).toContain('nothing to move')
            expect(second.notes).toEqual([])
            expect(second.nextSteps).toEqual([])
            expect(second.movedWorklogs).toBe(0)
            expect(read('archive', 'closed', 'TASKS.md')).toBe(snapshot)
            expect(existsSync(dot('worklogs', '2026-11-09-T-2.md'))).toBe(true)
        })

        it('archives late closed records without re-indexing a reworded archive index', () => {
            migrate({ cwd: root, date: '2026-11-08' })
            writeFileSync(
                dot('archive', 'README.md'),
                read('archive', 'README.md').replaceAll(' — ', ': ')
            )
            writeFileSync(
                dot('TASKS.md'),
                `${read('TASKS.md')}- [x] **[T-9]** Late \`Priority: 🔵\`\n`
            )
            const again = migrate({ cwd: root, date: '2026-11-09' })
            expect(again.message).toBe('Archived records left in current context (format 2).')
            expect(again.closedTasks).toEqual(['T-9'])
            expect(again.nextSteps.join(' ')).toContain('autonomos close <ID>')
            expect(read('archive', 'README.md').match(/`closed\/`/g)).toHaveLength(1)
        })
    })

    describe('migrate with git', () => {
        const gitIn = (...args: string[]): string =>
            execFileSync('git', args, { cwd: root, encoding: 'utf8' })

        it('keeps ignored worklogs ignored and quarantines late arrivals', () => {
            gitIn('init', '-q')
            writeFileSync(join(root, '.gitignore'), '.autonomos/worklogs/*-private.md\n')
            writeFileSync(dot('worklogs', '2026-01-03-private.md'), '# secret\n')
            const first = migrate({ cwd: root, date: '2026-11-08' })
            expect(read('archive', 'worklogs-format-1', '.gitignore')).toContain(
                '/2026-01-03-private.md'
            )
            expect(first.notes.join(' ')).toContain('stay ignored')
            expect(
                gitIn('check-ignore', '.autonomos/archive/worklogs-format-1/2026-01-03-private.md')
            ).toContain('private')

            // An ignored legacy worklog arriving from another checkout after the upgrade.
            writeFileSync(dot('worklogs', '2026-01-05-private.md'), '# late\n')
            writeFileSync(dot('worklogs', '2026-11-09-T-2.md'), '# new\n')
            const second = migrate({ cwd: root, date: '2026-11-09' })
            expect(second.movedWorklogs).toBe(1)
            expect(existsSync(dot('archive', 'worklogs-format-1', '2026-01-05-private.md'))).toBe(
                true
            )
            expect(existsSync(dot('worklogs', '2026-11-09-T-2.md'))).toBe(true)
            expect(read('archive', 'worklogs-format-1', '.gitignore')).toContain(
                '/2026-01-05-private.md'
            )
        })
    })

    describe('status record loss', () => {
        const gitIn = (...args: string[]): string =>
            execFileSync('git', args, { cwd: root, encoding: 'utf8' })
        const commit = (message: string): void => {
            gitIn('add', '-A')
            gitIn('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', message)
        }

        it('flags records deleted to satisfy findings, not records closed with the CLI', () => {
            gitIn('init', '-q')
            writeFileSync(
                dot('TASKS.md'),
                TASKS.replace(
                    '- [ ] **[T-2]** Open',
                    '- [ ] **[T-2]** Open: compare direct file serving against the redirect chain'
                )
            )
            commit('base')
            expect(status({ cwd: root }).recordLoss).toEqual([])
            expect(status({ cwd: root }).unrecorded).toBe(false)

            close({ cwd: root, ids: ['T-1', 'I-2'], date: '2026-11-09' })
            expect(status({ cwd: root }).recordLoss).toEqual([])
            expect(status({ cwd: root }).unrecorded).toBe(false)
            commit('close')

            const tasks = read('TASKS.md').replace(/^- \[ \] \*\*\[T-2\]\*\*.*\n/m, '')
            writeFileSync(dot('TASKS.md'), tasks)
            const result = status({ cwd: root })
            expect(result.recordBase).toBe('HEAD')
            expect(result.recordLoss?.map(l => `${l.id}:${l.change}`)).toEqual(['T-2:removed'])
            expect(result.unrecorded).toBe(true)
            commit('drop T-2')
            expect(status({ cwd: root }).recordLoss).toEqual([])
            expect(status({ cwd: root, since: 'HEAD~1' }).recordLoss?.map(l => l.id)).toEqual([
                'T-2',
            ])
            expect(status({ cwd: root, since: 'nope' }).recordBaseError).toContain('nope')
        })

        it('reports unrecorded changes until a task, worklog or closure is written', () => {
            gitIn('init', '-q')
            commit('base')
            writeFileSync(join(root, 'docs', 'note.md'), '# note\n')
            expect(status({ cwd: root }).unrecorded).toBe(true)
            writeFileSync(dot('worklogs', '2026-11-09-T-2.md'), '# [T-2] x\n')
            expect(status({ cwd: root }).unrecorded).toBe(false)
        })
    })

    describe('status budget findings', () => {
        it('reports format, closed records and oversized files, then clears after migration', () => {
            writeFileSync(join(root, 'AGENT.md'), 'x'.repeat(9_000))
            const before = status({ cwd: root }).budgetFindings?.map(f => f.code)
            expect(before).toEqual(
                expect.arrayContaining([
                    'format-outdated',
                    'closed-tasks-in-current',
                    'closed-issues-in-current',
                    'root-agent-size',
                ])
            )
            migrate({ cwd: root })
            const after = status({ cwd: root }).budgetFindings?.map(f => f.code)
            expect(after).toEqual(['root-agent-size'])
        })
    })
})
