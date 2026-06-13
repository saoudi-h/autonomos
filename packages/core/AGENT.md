# AGENT: @autonomos/core

- **Stack:** TypeScript, Vitest, tsdown (via @tala-tools)
- **Exports:** All public API via `src/index.ts`
- **Tests:** Co-located `*.test.ts` files alongside source
- **Constraints:**
    - Template changes (`src/templates/`) MUST be followed by workflow test updates (`src/workflows/protocol-workflows.test.ts`)
    - Workflow `.md` files in `src/workflows/` are shipped to user projects via CLI init — they are protocol artifacts, not documentation
    - `harness-codes.json` schema is enforced at load time via Zod
