# @autonomos/cli

A command-line interface for managing the Autonomos Agent Protocol.

## Installation

```bash
# Locally in your project
pnpm add -D @autonomos/cli

# Or globally
pnpm add -g @autonomos/cli
```

## Commands

### `init`

Initialize the Agent Protocol in the current directory.

```bash
autonomos init
autonomos init --dry-run
```

### `update`

Update the project's Protocol to the latest version embedded in the CLI.

```bash
autonomos update
```

### `status`

Show project status and a summary of tasks from `TASKS.md`.

```bash
autonomos status
```

### `agents`

List all `AGENT.md` files in the project.

```bash
autonomos agents        # Search from current directory
autonomos agents --all  # Search from project root
```

### `version`

Show current CLI and Protocol versions.

```bash
autonomos --version
```

## How it works

The CLI manages the `.autonomos/` directory in your project, which contains:

- `manifest.json`: Protocol metadata and versioning.
- `PROTOCOL.md`: The immutable protocol specification.
- `TASKS.md`: Your project's task registry.
- `worklogs/`: Directory for session logs.

It also creates a root `AGENT.md` file if it doesn't exist, which serves as the primary context for AI agents.

## License

MIT
