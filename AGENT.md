---
name: "Autonomos"
type: "project"
status: "active"
stack: ["Node.js", "TypeScript", "TurboRepo", "pnpm", "Commander.js", "Vitest", "tsdown"]
---
# AGENT CONTEXT: Autonomos

## 🧠 Context & Objectives

Autonomos is a project dedicated to defining and implementing a robust, structured protocol for AI Agents to interact with codebases. The goal is to maximize agent autonomy while maintaining system integrity and long-term project context.

## ⚙️ Workflow & Preferences

- **Commits:** Conventional Commits (feat, fix, docs, refactor, chore, style, test, ci, build). Always specify package scope (e.g., \`feat(cli): ...\`).
- **Linting:** Strict linting and type-checking must pass before every commit.
- **Language:** English (US) for all documentation and code.

## 🏗 Stack & Architecture

- **Manager:** pnpm (Workspace)
- **Repo:** TurboRepo
- **Build:** [tsdown](file:///home/hakim/projects/autonomos/packages/tsdown)
- **CLI:** Commander.js
- **Test:** Vitest

## 📁 Key Directories

| Path | Description |
|------|-------------|
| \`packages/core\` | Core SDK and Protocol definitions |
| \`packages/cli\` | CLI tool implementation |
| \`.autonomos/\` | Protocol configuration and task registry |

## ⚠️ Known Constraints

- Project is in early alpha stage (v0.1.0-alpha).
- CLI commands require the protocol structure to be initialized via \`autonomos init\`.
