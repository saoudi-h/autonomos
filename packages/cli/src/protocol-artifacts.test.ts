import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { getWorkflowDirCandidates } from './protocol-artifacts'

describe('workflow directory resolution', () => {
    it('resolves a sibling Core package from a bundled CLI entry', () => {
        const entry = pathToFileURL('/fixture/node_modules/@autonomos/cli/dist/index.mjs').href

        expect(getWorkflowDirCandidates(entry)).toContain(
            join('/fixture/node_modules/@autonomos/core/dist/workflows')
        )
    })

    it('resolves Core source from the monorepo CLI source tree', () => {
        const entry = pathToFileURL('/fixture/packages/cli/src/protocol-artifacts.ts').href

        expect(getWorkflowDirCandidates(entry)).toContain(
            join('/fixture/packages/core/src/workflows')
        )
    })
})
