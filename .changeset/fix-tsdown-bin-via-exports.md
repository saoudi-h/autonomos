---
'@autonomos/cli': patch
---

fix(cli): declare `bin` via tsdown's `exports` config, not by disabling exports

The previous fix (0.3.2) disabled tsdown's `exports: true` to stop the
build from rewriting the `bin` field. That threw the baby out with the
bathwater: we also lost the auto-generated `exports` field.

The proper fix is to keep `exports: true` and declare the `bin` mapping
explicitly in the tsdown config. tsdown has a built-in `exports.bin`
option (boolean / string / Record<string, string>) that auto-generates
the `bin` field based on the package name or an explicit mapping.

For `@autonomos/cli` the default would derive the command name from the
package's scope (yielding `cli`), so we use the Record form to force
the command to be `autonomos`:

```ts
export default defineConfig({
  entry: ['./src/index.ts', './src/*/index.ts'],
  exports: {
    bin: { autonomos: './src/index.ts' },
  },
})
```

This way:
- `exports` is auto-generated from the build output (as before).
- `bin` is auto-generated from the explicit mapping, with the right
  command name. No more silent rewrite to `cli`.
- All other fields (keywords, author, license, repository, etc.) are
  preserved by the `...pkg` spread inside tsdown.
