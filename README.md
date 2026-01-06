# Autonomos Agent Protocol

> **Standardizing the interface between AI Agents and Codebases.**

Autonomos is a structured protocol and toolset designed to solve the "lost in context" problem for AI coding agents. It provides a formal way for agents to read project context, track tasks, and persist session knowledge through a standardized file structure.

## 🚀 Vision

AI agents should walk into any codebase and immediately understand:
1.  **Who** the agent is and what its boundaries are (`AGENT.md`).
2.  **What** needs to be done next and what's completed (`TASKS.md`).
3.  **How** it should behave and interact (`PROTOCOL.md`).
4.  **Why** previous sessions made certain decisions (`worklogs/`).

## 📦 Monorepo Structure

| Package | Version | Description |
|---------|---------|-------------|
| **[@autonomos/cli](packages/cli)** | ![cli version](https://img.shields.io/badge/version-0.0.1--alpha-blue) | The primary tool for project initialization and management. |
| **[@autonomos/core](packages/core)** | ![core version](https://img.shields.io/badge/version-0.0.1--alpha-blue) | Core logic, YAML/Markdown parsers, and Protocol templates. |

## 🛠 Quick Start

### 1. Installation

```bash
pnpm add -g @autonomos/cli
```

### 2. Initialization

Initialize the protocol in your project (creates `.autonomos/` and `AGENT.md`):

```bash
autonomos init
```

### 3. Check Status

Get an overview of your project's protocol adherence and task progress:

```bash
autonomos status
```

### 4. Locate Context

List all `AGENT.md` context anchors in the project tree:

```bash
autonomos agents --all
```

## 📜 The Protocol (v0.1.0-alpha)

The protocol is centered around the `.autonomos/` directory:

-   **`manifest.json`**: Structured metadata and versioning.
-   **`PROTOCOL.md`**: The immutable kernel of the AI workflow.
-   **`TASKS.md`**: The single source of truth for task state.
-   **`worklogs/`**: Detailed history of sessions to save context tokens.
-   **`AGENT.md`**: (Root level) The identity and context anchor for the agent.

## 🌈 Rich CLI Experience

Autonomos provides a premium CLI experience with:
-   **Colorized output** for better readability.
-   **Dry-run support** to preview changes before writing.
-   **Detailed help** and examples for every command.

## 🤝 Contributing

This project is currently in **active alpha development**. Feel free to explore the code, but be aware that interfaces are subject to change until v1.0.

## ⚖️ License

MIT
