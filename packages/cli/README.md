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

For projects using the protocol version bundled with the CLI, status also verifies
that `PROTOCOL.md` and installed harness workflows match their canonical published
content. Drift is reported with the affected paths and can be repaired with
`autonomos update`; artifacts from other protocol versions are reported as
unverifiable rather than incorrectly judged against the current release.

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
- `PROTOCOL.md`: The read-only specification for the declared protocol version.
- `TASKS.md`: Your project's task registry.
- `ISSUES.md`: An optional intake registry, created on first use when a problem or proposal needs triage.
- `worklogs/`: Directory for session logs.

It also creates a root `AGENT.md` file if it doesn't exist, which serves as the primary context for AI agents.

## License

MIT
