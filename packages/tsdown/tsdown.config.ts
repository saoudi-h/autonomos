import type { UserConfigFn } from 'tsdown/config'
import { defineConfig } from 'tsdown/config'
import { base } from './src/configs/base.ts'

const config: UserConfigFn = defineConfig(async options => ({
    ...(await base(options, { ci: true })),
    entry: ['./src/index.ts', './src/**/index.ts'],
}))

export default config
