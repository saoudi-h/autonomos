import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'rolldown'

import { defineConfig } from '@tala-tools/tsdown'

/**
 * Build configuration for @autonomos/core.
 *
 * The src/workflows/ directory contains the protocol workflow .md templates
 * that the published package needs at runtime. They are not TypeScript modules
 * so tsdown does not bundle them by default. The `copyWorkflowsPlugin` below
 * hooks into rolldown's `closeBundle` step to copy them into dist/workflows/
 * once the JS bundle is done.
 */
function copyWorkflowsPlugin(): Plugin {
    return {
        name: 'autonomos:copy-workflows',
        async closeBundle() {
            const cwd = process.cwd()
            const srcWorkflows = resolve(cwd, 'src/workflows')
            const outWorkflows = resolve(cwd, 'dist/workflows')
            await mkdir(outWorkflows, { recursive: true })
            await cp(srcWorkflows, outWorkflows, { recursive: true })
            // eslint-disable-next-line no-console
            console.log(`✔ Copied ${srcWorkflows} -> ${outWorkflows}`)
        },
    }
}

export default defineConfig({
    entry: ['./src/index.ts', './src/*/index.ts'],
    plugins: [copyWorkflowsPlugin()],
})
