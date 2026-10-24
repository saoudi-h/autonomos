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

Show project status and current task records from `.autonomos/TASKS.md`.

Use `--history` to add a separate historical summary from archive `TASKS.md`
registries. History is not read by default. Counts recognize task IDs even without
priority/complexity metadata and ignore fenced examples. Archived status is
historical, not current work; abandoned records need not be marked completed.
Symbolic links are not followed. Skipped/unreadable registries and duplicate task
IDs produce diagnostics and exit code 1; incomplete history is labelled.

For projects using the protocol version bundled with the CLI, status also verifies
that `PROTOCOL.md` and installed harness workflows match their canonical published
content. Drift is reported with the affected paths and can be repaired with
`autonomos update`; artifacts from other protocol versions are reported as
unverifiable rather than incorrectly judged against the current release.

```bash
autonomos status
autonomos status --history
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

Optional project-owned `.autonomos/archive/`, `.autonomos/specs/` and `.autonomos/decisions/` directories
are first-use artifacts, not empty directories created by `init`. `update`
refreshes managed protocol files and harness workflows while preserving those
directories, `AGENT.md`, `TASKS.md`, `ISSUES.md`, worklogs, and user documentation.
For semantic migration of an existing project's scattered knowledge, use the
installed `/adopt` workflow: it proposes a source-to-destination map, waits for
user approval, writes draft/proposed records, and leaves historical records
unchanged. Follow it with `/reconcile`. That workflow also archives eligible
settled history after preserving current knowledge and references. Installation
and updates never archive or relocate project records. Archive IDs stay reserved;
use targeted Markdown search before assigning new issue/task IDs.

## License

MIT
