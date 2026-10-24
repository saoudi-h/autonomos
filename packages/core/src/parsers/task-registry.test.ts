import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { TaskParser } from './task-parser'
import { readTaskRegistry } from './task-registry'

describe('current and archived task discovery', () => {
    let root: string
    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), 'autonomos-registry-'))
    })
    afterEach(() => {
        rmSync(root, { recursive: true, force: true })
    })

    function put(path: string, content: string): void {
        const file = join(root, '.autonomos', path)
        mkdirSync(join(file, '..'), { recursive: true })
        writeFileSync(file, content)
    }

    it('finds legacy IDs without optional metadata, ignoring fenced examples', () => {
        const refs = TaskParser.references(
            [
                '- [x] **[OLD-01]** Done without metadata',
                '```markdown',
                '- [ ] **[EXAMPLE-01]** Not real',
                '```',
                '~~~~',
                '- [x] **[EXAMPLE-02]** Not real either',
                '~~~',
                '- [ ] **[EXAMPLE-03]** Still in the longer fence',
                '~~~~',
                '  - [!] **[CHILD-01]** A real nested task',
            ].join('\r\n')
        )
        expect(refs).toEqual([
            { id: 'OLD-01', status: 'DONE', line: 1 },
            { id: 'CHILD-01', status: 'BLOCKED', line: 10 },
        ])
    })

    it('does not inspect even a broken archive by default', () => {
        put('TASKS.md', '- [/] **[T-02]** Current\n')
        symlinkSync('missing-directory', join(root, '.autonomos', 'archive'))
        const result = readTaskRegistry(root)
        expect(result.current.map(t => t.id)).toEqual(['T-02'])
        expect(result.archived).toEqual([])
        expect(result.warnings).toEqual([])
        expect(result.complete).toBe(true)
    })

    it('keeps historical statuses separate and reserves IDs across nested batches', () => {
        put('TASKS.md', '- [ ] **[T-02]** Current\n')
        put('archive/css/TASKS.md', '- [x] **[T-01]** Settled\n')
        put('archive/docs/phase-1/TASKS.md', '- [ ] **[T-03]** Explicitly abandoned\n')
        put('archive/css/worklogs/history.md', '- [x] **[NOT-A-TASK]** Checklist\n')
        put('archive/README.md', '- [x] **[NOT-A-TASK]** Example\n')
        const result = readTaskRegistry(root, { history: true })
        expect(result.current.map(t => t.id)).toEqual(['T-02'])
        expect(result.archived.map(t => [t.id, t.status])).toEqual([
            ['T-01', 'DONE'],
            ['T-03', 'TODO'],
        ])
        expect(result.archived[0]?.path).toBe(join('.autonomos', 'archive', 'css', 'TASKS.md'))
        expect(result.duplicateIds).toEqual([])
        expect(result.complete).toBe(true)
    })

    it('reports collisions within and across registries without hiding records', () => {
        put('TASKS.md', '- [ ] **[T-01]** Current\n- [x] **[T-01]** Duplicate\n')
        put('archive/batch/TASKS.md', '- [x] **[T-01]** History\n')
        const result = readTaskRegistry(root, { history: true })
        expect(result.duplicateIds).toEqual(['T-01'])
        expect(result.current).toHaveLength(2)
        expect(result.archived).toHaveLength(1)
    })

    it('does not follow linked task files or archive directories', () => {
        put('TASKS.md', '- [ ] **[CURRENT-01]** Current\n')
        put('outside/TASKS.md', '- [x] **[OUTSIDE-01]** Do not read\n')
        mkdirSync(join(root, '.autonomos', 'archive', 'batch'), { recursive: true })
        symlinkSync(
            join(root, '.autonomos', 'outside'),
            join(root, '.autonomos', 'archive', 'linked')
        )
        symlinkSync(
            join(root, '.autonomos', 'outside', 'TASKS.md'),
            join(root, '.autonomos', 'archive', 'batch', 'TASKS.md')
        )
        const result = readTaskRegistry(root, { history: true })
        expect(result.archived).toEqual([])
        expect(result.complete).toBe(false)
        expect(result.warnings).toHaveLength(2)
    })

    it('reports an invalid archive root and handles absent optional files', () => {
        expect(readTaskRegistry(root, { history: true }).complete).toBe(true)
        put('archive', 'not a directory')
        const result = readTaskRegistry(root, { history: true })
        expect(result.complete).toBe(false)
        expect(result.warnings[0]).toContain('Expected an archive directory')
    })

    it('rejects a linked .autonomos ancestor before reading external registries', () => {
        mkdirSync(join(root, 'external', 'archive', 'batch'), { recursive: true })
        writeFileSync(join(root, 'external', 'TASKS.md'), '- [ ] **[OUTSIDE-01]** Outside\n')
        writeFileSync(
            join(root, 'external', 'archive', 'batch', 'TASKS.md'),
            '- [x] **[OUTSIDE-02]** Outside\n'
        )
        symlinkSync(join(root, 'external'), join(root, '.autonomos'))
        const result = readTaskRegistry(root, { history: true })
        expect(result.current).toEqual([])
        expect(result.archived).toEqual([])
        expect(result.complete).toBe(false)
        expect(result.warnings[0]).toContain('Expected a regular project directory')
    })
})
