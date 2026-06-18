import { defineConfig } from '@tala-tools/tsdown'

export default defineConfig({
    entry: ['./src/index.ts', './src/*/index.ts'],
    // We keep the auto-generated `exports` field (the `exports: true` from
    // the @tala-tools/tsdown base) and explicitly declare the `bin`
    // mapping so the published command is `autonomos`, not the
    // package-name-derived `cli`. Without this override, tsdown rewrites
    // the hand-curated `bin` on every build.
    exports: {
        bin: {
            autonomos: './src/index.ts',
        },
    },
})
