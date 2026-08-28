# Autonomos Agent Protocol

> **Standardizing the interface between AI Agents and Codebases.**

Autonomos is a structured protocol and toolset designed to solve the "lost in context" problem for AI coding agents. It provides a formal way for agents to read project context, track tasks, and persist session knowledge through a standardized file structure.

## 🚀 Vision

AI agents should walk into any codebase and immediately understand:

1.  **Who** the agent is and what its boundaries are (`AGENT.md`).
2.  **What** needs to be done next and what's completed (`TASKS.md`).
3.  **Which signals need triage**, when the optional `ISSUES.md` is useful.
4.  **What target behavior** the project accepts (`specs/`).
5.  **Why** it chose a technical approach (`decisions/`, commonly ADRs).
6.  **How** it should behave and interact (`PROTOCOL.md`).
7.  **What happened** in previous sessions (`worklogs/`).

The `/reconcile` workflow periodically audits accumulated protocol drift. It
repairs only evidence-backed deterministic findings, preserves historical records,
and returns uncertain semantic conflicts to the user for joint resolution.

## 📦 Monorepo Structure

| Package                              | Version                                                                 | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| **[@autonomos/cli](packages/cli)**   | ![cli version](https://img.shields.io/badge/version-0.3.0--alpha-blue)  | The primary tool for project initialization and management. |
| **[@autonomos/core](packages/core)** | ![core version](https://img.shields.io/badge/version-0.3.0--alpha-blue) | Core logic, YAML/Markdown parsers, and Protocol templates.  |

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

## 📜 The Protocol (v0.5.0-alpha)

The protocol is centered around the `.autonomos/` directory:

- **`manifest.json`**: Structured metadata and versioning.
- **`PROTOCOL.md`**: The read-only kernel for the declared protocol version.
- **`TASKS.md`**: The single source of truth for task state.
- **`ISSUES.md`**: Optional intake for problems, proposals, and questions that need triage before implementation.
- **`worklogs/`**: Detailed history of sessions to save context tokens.
- **`specs/`**: Optional, project-owned Markdown records for accepted target behavior and requirements.
- **`decisions/`**: Optional, project-owned Markdown records for technical choices and rationale. ADR is a common convention, not a required external standard.
- **`AGENT.md`**: (Root level) The identity and context anchor for the agent.

## 🔄 Upgrading & Migration

As the protocol evolves, you can easily migrate your projects to the latest version.

### Upgrading an Existing Project (mechanical update)

If your project was already initialized with a previous version (v0.2.x), update your global CLI and run the update command:

```bash
npm install -g @autonomos/cli@latest
autonomos update
```

This performs the mechanical update:

1. Update `.autonomos/PROTOCOL.md` to the latest version.
2. Update `.autonomos/manifest.json`.
3. Scan for active harness folders (e.g. `.agents/skills`, `.clinerules/workflows`, `.claude/skills`) and **automatically update** the managed workflow files in them.
4. **Preserve** your existing `AGENT.md`, `TASKS.md`, `ISSUES.md`, worklogs, `specs/`, `decisions/`, and user documentation.

It does not create empty `specs/` or `decisions/` directories and it does not
infer missing records from project history.

For a declared protocol version, `PROTOCOL.md` and installed harness workflows
must exactly match the published artifacts. Project agents treat them as read-only;
`autonomos update` is the supported path to install another published version or
repair local drift. Run `autonomos status` to check artifact integrity.

### Adopting Existing Project Knowledge

For an existing project with useful Markdown scattered across `docs/`, the
repository root, or local guidance files, run the installed `/adopt` workflow
after the mechanical update. It inventories sources, classifies candidates, and
presents a source → destination map before writing. With approval it can create
draft `specs/` and proposed `decisions/`, or route stable guidance to `AGENT.md`
and reference material to `docs/`. It copies and links by default, preserves the
original sources, and never rewrites worklogs, issues, or tasks. Run
`/reconcile` afterwards for a bounded second pass.

### Migrating a Legacy Project (older protocol versions)

Older projects may not have harness-specific workflow files (they may only have `PROTOCOL.md` and `TASKS.md`).

To upgrade and install the new workflow files for your AI harness without losing your `TASKS.md` roadmap or `AGENT.md` files, run:

```bash
npm install -g @autonomos/cli@latest
autonomos init --harness <harness-name>
# e.g. autonomos init --harness codex
# or run interactively: autonomos init
```

The CLI will detect that `.autonomos/` already exists, update the protocol specification, and safely write the workflow files into your target harness directories without overwriting your project-specific task board or other project-owned knowledge.

This is also the recommended way to add new harnesses (e.g. `antigravity`, `claude-code`) to an already initialized project, or to repair/reinstall workflow files if a harness directory path has changed or became corrupted.

## 🌈 Rich CLI Experience

Autonomos provides a premium CLI experience with:

- **Colorized output** for better readability.
- **Dry-run support** to preview changes before writing.
- **Detailed help** and examples for every command.

## 🤝 Contributing

This project is currently in **active alpha development**. Feel free to explore the code, but be aware that interfaces are subject to change until v1.0.

## ⚖️ License

MIT
