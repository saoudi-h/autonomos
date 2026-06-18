---
name: 'Autonomos'
type: 'project'
status: 'active'
stack: ['Node.js', 'TypeScript', 'TurboRepo', 'pnpm', 'Commander.js', 'Vitest', 'tsdown']
protocol: '0.3.0-alpha'
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
- **Build:** [tsdown](https://github.com/saoudi-h/tala-tools/tree/main/packages/tsdown) (via [`@tala-tools`](https://github.com/saoudi-h/tala-tools))
- **CLI:** Commander.js

## 📁 Key Directories

| Path              | Description                              |
| ----------------- | ---------------------------------------- |
| `packages/core`   | Core SDK and Protocol definitions        |
| `packages/cli`    | CLI tool implementation                  |
| `.autonomos/`     | Protocol configuration and task registry |

## ⚠️ Known Constraints

- Project is in early alpha stage (v0.3.0-alpha).
- CLI commands require the protocol structure to be initialized via `autonomos init`.
- v0.3 design: PROTOCOL.md is a read-only reference. Workflows (session/task/crystallize) are the executable contract.
- Workflow `.md` files must stay ≤35 lines (enforced by tests) to fit in LLM working memory.
- **Adopt the protocol from the first turn of any session.** When a user explicitly asks to "use the protocol" / "adopt the protocol" / "follow the workflow", do not jump straight to code. Start a session (read AGENT.md → recent worklog → TASKS.md), pick a task, mark it `[/]`, then work. The protocol is the contract; bypassing it is a bug.
