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

It also reports context-budget findings: closed records left in `TASKS.md` or
`ISSUES.md`, oversized registries, task entries, `AGENT.md` files and worklogs, and
an outdated artifact format. They are advisory; `--strict` exits non-zero.

Record loss compares `TASKS.md` and `ISSUES.md` with `HEAD` (or `--since <rev>`):
a task or issue removed or shortened is reported when most of its lost words appear
neither in lines the change adds (an archive, a worklog, another record) nor in the
files the record links to. Records closed with `autonomos close` or `migrate` pass.
Findings are advisory; `--strict` exits non-zero. Translated or reworded text can
be reported too: check each finding. A clean status checks structure only, not
that the work is complete or recorded; it does note a change since the base with
no task added or status changed, no worklog written and no `close` yet.

```bash
autonomos status
autonomos status --history
autonomos status --strict
autonomos status --since main   # review a branch for record loss
```

### `close`

Move finished records out of current context into `.autonomos/archive/closed/`.
A task must be `[x]` (a `Completed:` date is added when missing) unless
`--abandoned "<reason>"` is given; an issue must be resolved, declined, closed or
superseded. Entries move intact and their relative links are repaired.

```bash
autonomos close PROTO-15 ISSUE-05
autonomos close SPIKE-02 --abandoned "superseded by PROTO-15"
```

### `migrate`

Upgrade project records to the current artifact format, content-preserving and
idempotent. Format 1 → 2 moves closed records to `archive/closed/`, quarantines
existing worklogs in `archive/worklogs-format-1/`, repairs Markdown references and
records `artifactFormat`. Untagged checked items move too, git-ignored worklogs stay
ignored, and closed records mentioning unfinished work are listed for review. Run
`--dry-run` first with unrelated changes committed; rerun after merging into a
checkout that holds git-ignored legacy worklogs. It ends with numbered next steps:
review follow-ups, resolve remaining findings with `/reconcile` in the same task,
record the upgrade (task, worklog, `close`) and pass `status --strict`.

```bash
autonomos migrate --dry-run
autonomos migrate
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
