import { defineConfig } from '@tala-tools/tsdown'

export default defineConfig({
    entry: ['./src/index.ts', './src/**/index.ts'],
})
