# AGENT CONTEXT: @autonomos/cli

## 🧠 Context & Objectives

This package is the public-facing tool for the Agent Protocol.
It consumes `@autonomos/core` to perform actions like bootstrapping projects (`init`), updating docs, or parsing tasks.

## ⚙️ Workflow

- **Dependencies:** Uses `commander` for CLI args.
- **Linkage:** Depends on `workspace:@autonomos/core`.
