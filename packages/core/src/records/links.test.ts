import { describe, expect, it } from 'vitest'
import { prefixMapper, relocateLinks, relocateRootMentions } from './links'

const root = '/repo'
const dotDir = `${root}/.autonomos`
const closedDir = `${root}/.autonomos/archive/closed`
const mapWorklogs = prefixMapper(
    `${root}/.autonomos/worklogs`,
    `${root}/.autonomos/archive/worklogs-format-1`
)

describe('relocateLinks', () => {
    it('repairs links of a record moving deeper, following moved worklogs', () => {
        const text =
            '[evidence](worklogs/a.md) [adr](decisions/ADR-1.md#ctx) [doc](<../docs/x y.md>) [web](https://e.com) [anchor](#top)'
        expect(relocateLinks(text, dotDir, closedDir, mapWorklogs)).toBe(
            '[evidence](../worklogs-format-1/a.md) [adr](../../decisions/ADR-1.md#ctx) [doc](<../../../docs/x y.md>) [web](https://e.com) [anchor](#top)'
        )
    })

    it('leaves unrelated links of a file that does not move byte-identical', () => {
        const text = '[a](./other.md) [b](../x.md "title") [w](worklogs/a.md)'
        expect(relocateLinks(text, dotDir, dotDir, mapWorklogs)).toBe(
            '[a](./other.md) [b](../x.md "title") [w](archive/worklogs-format-1/a.md)'
        )
    })

    it('rewrites reference definitions and encoded spaces', () => {
        const text = '[r]: worklogs/a%20b.md\n'
        expect(relocateLinks(text, dotDir, dotDir, mapWorklogs)).toBe(
            '[r]: archive/worklogs-format-1/a%20b.md\n'
        )
    })
})

describe('relocateRootMentions', () => {
    const names = new Set(['2026-01-01-X.md', 'data.json'])
    it('rewrites plain mentions of moved files only', () => {
        const text =
            '_See: .autonomos/worklogs/2026-01-01-X.md_; `.autonomos/worklogs/data.json`, .autonomos/worklogs/unknown.md, ../.autonomos/worklogs/data.json'
        expect(
            relocateRootMentions(
                text,
                '.autonomos/worklogs',
                '.autonomos/archive/worklogs-format-1',
                names
            )
        ).toBe(
            '_See: .autonomos/archive/worklogs-format-1/2026-01-01-X.md_; `.autonomos/archive/worklogs-format-1/data.json`, .autonomos/worklogs/unknown.md, ../.autonomos/worklogs/data.json'
        )
    })
})
