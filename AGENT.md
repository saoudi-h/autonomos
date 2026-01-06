# AGENT CONTEXT: ROOT (Autonomos)

## 🧠 Context & Objectives
**Autonomos** is a Monorepo serving as the reference implementation and framework for the "Agent Protocol".
It houses the SDK (`@autonomos/core`), the CLI tool (`@autonomos/cli`), and potentially other tools like MCP servers.

**Goal:** Provide a standardized way for AI Agents to onboard, execute, and persist knowledge in software projects.

## ⚙️ Workflow & Preferences
- **Commits:** Conventional Commits REQUIRED (e.g., `feat(core): add parser`).
- **Package Manager:** `pnpm` (via TurboRepo).
- **Language:** English for documentation.
- **Strict Mode:** Do not modify `PROTOCOL.md`. It is the kernel.

## 🏗 Stack & Architecture
- **Repo:** Turborepo + PNPM Workspaces.
- **Packages:**
    - `packages/core`: (**The Brain**) Shared definition of the protocol, types, templates, and parsers.
    - `packages/cli`: (**The Hands**) Public CLI tool.
