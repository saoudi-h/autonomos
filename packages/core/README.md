# @autonomos/core

The core logic and specification for the Autonomos Agent Protocol.

## Overview

This package contains the shared constants, types, templates, and parsers that define the Autonomos Agent Protocol. It is designed to be used by the CLI and other tools that need to interact with the protocol.

## Features

- **Constants**: Shared directory and file names (`.autonomos`, `manifest.json`, optional `archive/`, `specs/`, and `decisions/`)
- **Templates**: Immutable templates for `PROTOCOL.md`, `TASKS.md`, `AGENT.md`, and `manifest.json`.
- **Knowledge boundaries**: Markdown-first conventions for optional specifications and decision records (ADR), without requiring a parser.
- **Types**: TypeScript definitions for protocol entities (Tasks, Agents, Manifest).
- **Parsers**: Tools for extracting structured data from markdown (e.g., `TaskParser`).

## Usage

```typescript
import { PROTOCOL_VERSION, TaskParser } from '@autonomos/core'

console.log(`Current Protocol Version: ${PROTOCOL_VERSION}`)

const tasks = TaskParser.parse(markdownContent)
```

## Current and Historical Task IDs

```typescript
import { readTaskRegistry } from '@autonomos/core'

const registry = readTaskRegistry(projectRoot, { history: true })
const reservedIds = new Set([...registry.current, ...registry.archived].map(task => task.id))
// Do not allocate a new ID until registry.complete is true and duplicates are resolved.
console.log(registry.duplicateIds, registry.warnings, reservedIds)
```

The default reads only the current task registry. Explicit history recursively
reads `.autonomos/archive/**/TASKS.md`, without following symbolic links. References
include ID, status, source path relative to the supplied root, and line number.
`TaskParser.references` recognizes task IDs/status without optional metadata and
ignores fenced examples; the existing detailed `TaskParser.parse` API is unchanged.
`complete` describes the requested read, not semantic validity or task completion.
The reader never mutates or decides which records are obsolete. Archives and their
index remain project-owned Markdown; no CLI or Git is required for retrieval.

## Structure

- `src/constants.ts`: Global constants and versioning.
- `src/types.ts`: Core type definitions.
- `src/templates/`: Protocol file templates.
- `src/workflows/`: Distributed harness workflow sources, including `/adopt` for reviewable legacy-knowledge migration.
- `src/parsers/`: Logic for parsing protocol files.

## License

MIT
