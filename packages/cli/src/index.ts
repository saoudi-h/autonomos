#!/usr/bin/env node
import { Command } from 'commander'

import { PROTOCOL_VERSION } from '@autonomos/core'
import { agents } from './commands/agents'
import { init } from './commands/init'
import { update } from './commands/update'

const CLI_VERSION = '0.0.1'

const program = new Command()

program
    .name('autonomos')
    .description(
        `CLI for the Autonomos Agent Protocol

The Agent Protocol is a specification for AI agents to interact with codebases
in a structured, consistent way. It defines how agents should read context,
execute tasks, and persist knowledge.

Documentation: https://github.com/saoudi-h/autonomos`
    )
    .version(
        `CLI: ${CLI_VERSION}\nProtocol: ${PROTOCOL_VERSION}`,
        '-v, --version',
        'Show version information'
    )
    .helpOption('-h, --help', 'Show help information')
    .addHelpText(
        'after',
        `
Examples:
  $ autonomos init          Initialize the Agent Protocol in current directory
  $ autonomos update        Update Protocol to the latest version
  $ autonomos status        Show project status and task summary
  $ autonomos agents        List all AGENT.md files in the project

More info:
  Run 'autonomos <command> --help' for detailed information about a command.
`
    )

program
    .command('init')
    .description('Initialize the Agent Protocol in the current directory')
    .addHelpText(
        'after',
        `
This command creates the following structure:
  .autonomos/
  ├── manifest.json    # Protocol metadata and version
  ├── PROTOCOL.md      # Immutable protocol specification
  ├── TASKS.md         # Task registry
  └── worklogs/        # Session logs directory
  AGENT.md             # Project context file (at root)

Examples:
  $ autonomos init
  $ cd my-project && autonomos init
`
    )
    .action(() => {
        const result = init()

        if (!result.success) {
            console.error(`❌ ${result.message}`)
            process.exit(1)
        }

        console.log(`✅ ${result.message}`)

        if (result.created.length > 0) {
            console.log('\nCreated:')
            result.created.forEach(file => console.log(`  📄 ${file}`))
        }

        if (result.warnings.length > 0) {
            console.log('\nWarnings:')
            result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`))
        }
    })

program
    .command('update')
    .description('Update the Protocol to the latest version')
    .addHelpText(
        'after',
        `
This command updates PROTOCOL.md to the latest version embedded in the CLI.
Only PROTOCOL.md is modified; your TASKS.md and AGENT.md files are preserved.

Version comparison:
  - If your project has an older version: Updates to the new version
  - If your project has a newer version: Warns you to update the CLI
  - If versions match: No action needed

Examples:
  $ autonomos update
`
    )
    .action(() => {
        const result = update()

        if (!result.success) {
            if (result.cliOutdated) {
                console.error(`⚠️  ${result.message}`)
            } else {
                console.error(`❌ ${result.message}`)
            }
            process.exit(1)
        }

        console.log(`✅ ${result.message}`)
    })

program
    .command('agents')
    .description('List all AGENT.md files in the project')
    .option('-a, --all', 'Search from project root instead of current directory')
    .addHelpText(
        'after',
        `
This command discovers and displays all AGENT.md files in a tree structure.
AGENT.md files provide context to AI agents about specific directories.

Modes:
  (default)   Search from current directory downwards
  --all       Search from project root (finds .autonomos or .git)

Examples:
  $ autonomos agents           # List from current directory
  $ autonomos agents --all     # List from project root
  $ cd packages/core && autonomos agents  # List only in packages/core
`
    )
    .action(opts => {
        const result = agents({ all: opts.all })

        if (!result.success) {
            console.error(`❌ ${result.message}`)
            process.exit(1)
        }

        console.log(result.tree ?? result.message)
        console.log(`\n${result.message}`)
    })

program
    .command('version')
    .description('Show the current Protocol version')
    .action(() => {
        console.log(`Agent Protocol v${PROTOCOL_VERSION} (CLI v${CLI_VERSION})`)
    })

program.parse()
