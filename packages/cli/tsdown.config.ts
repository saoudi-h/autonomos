import { defineConfig } from '@tala-tools/tsdown'

export default defineConfig({
    entry: ['./src/index.ts', './src/*/index.ts'],
    // The @tala-tools/tsdown base config enables `exports: true`, which
    // silently rewrites the `bin` field of this package's package.json on
    // every build. The cli has a hand-crafted `exports` block, so we don't
    // need auto-generation here; turning it off keeps `bin` intact. See
    // worklog BUG-02 for the full investigation.
    exports: false,
})
