# @autonomos/core

The core logic and specification for the Autonomos Agent Protocol.

## Overview

This package contains the shared constants, types, templates, and parsers that define the Autonomos Agent Protocol. It is designed to be used by the CLI and other tools that need to interact with the protocol.

## Features

- **Constants**: Shared directory and file names (`.autonomos`, `manifest.json`, optional `specs/`, and `decisions/`)
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

## Structure

- `src/constants.ts`: Global constants and versioning.
- `src/types.ts`: Core type definitions.
- `src/templates/`: Protocol file templates.
- `src/workflows/`: Distributed harness workflow sources, including `/adopt` for reviewable legacy-knowledge migration.
- `src/parsers/`: Logic for parsing protocol files.

## License

MIT
