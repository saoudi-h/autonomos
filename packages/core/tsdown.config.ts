import { base } from '@repo/tsdown'
import type { UserConfigFn } from 'tsdown/config'
import { defineConfig } from 'tsdown/config'

const configFn: UserConfigFn = defineConfig(async options => ({
    ...(await base(options, { ci: true })),
    entry: ['./src/index.ts', './src/*/index.ts'],
}))

export default configFn
