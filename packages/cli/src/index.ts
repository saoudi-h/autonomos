#!/usr/bin/env node
import { Command } from 'commander'
import pc from 'picocolors'

import { PROTOCOL_VERSION } from '@autonomos/core'
import { agents } from './commands/agents'
import { init } from './commands/init'
import { status } from './commands/status'
import { update } from './commands/update'

const CLI_VERSION = '0.0.1'

const program = new Command()

program
    .name('autonomos')
    .description(
        pc.cyan(`CLI for the Autonomos Agent Protocol

The Agent Protocol is a specification for AI agents to interact with codebases
in a structured, consistent way. It defines how agents should read context,
execute tasks, and persist knowledge.`) +
            `

Documentation: ${pc.underline('https://github.com/saoudi-h/autonomos')}`
    )
    .version(
        `${pc.bold('CLI:')} ${pc.green(CLI_VERSION)}\n${pc.bold('Protocol:')} ${pc.green(PROTOCOL_VERSION)}`,
        '-v, --version',
        'Show version information'
    )
    .helpOption('-h, --help', 'Show help information')
    .addHelpText(
        'after',
        `
${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos init')}          Initialize the Agent Protocol in current directory
  $ ${pc.cyan('autonomos update')}        Update Protocol to the latest version
  $ ${pc.cyan('autonomos status')}        Show project status and task summary
  $ ${pc.cyan('autonomos agents')}        List all AGENT.md files in the project

${pc.bold('More info:')}
  Run '${pc.cyan('autonomos <command> --help')}' for detailed information about a command.
`
    )

program
    .command('init')
    .description('Initialize the Agent Protocol in the current directory')
    .addHelpText(
        'after',
        `
This command creates the following structure:
  ${pc.blue('.autonomos/')}
  ├── ${pc.white('manifest.json')}    # Protocol metadata and version
  ├── ${pc.white('PROTOCOL.md')}      # Immutable protocol specification
  ├── ${pc.white('TASKS.md')}         # Task registry
  └── ${pc.blue('worklogs/')}        # Session logs directory
  ${pc.white('AGENT.md')}             # Project context file (at root)

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos init')}
  $ ${pc.cyan('cd my-project && autonomos init')}
`
    )
    .option('-n, --dry-run', 'Preview what would be created without writing files')
    .action(opts => {
        const result = init({ dryRun: opts.dryRun })

        if (!result.success) {
            console.error(pc.red(`\n❌ ${result.message}`))
            process.exit(1)
        }

        if (result.dryRun) {
            console.log(pc.cyan(`\n🔍 ${result.message} (dry-run)`))
        } else {
            console.log(pc.green(`\n✅ ${result.message}`))
        }

        if (result.created.length > 0) {
            console.log(`\n${pc.bold(result.dryRun ? 'Would create:' : 'Created:')}`)
            result.created.forEach(file => console.log(`  ${pc.blue('📄')} ${pc.white(file)}`))
        }

        if (result.warnings.length > 0) {
            console.log(pc.yellow('\nWarnings:'))
            result.warnings.forEach(warn => console.log(`  ${pc.yellow('⚠️')}  ${warn}`))
        }
    })

program
    .command('update')
    .description('Update the Protocol to the latest version')
    .addHelpText(
        'after',
        `
This command updates ${pc.white('PROTOCOL.md')} to the latest version embedded in the CLI.
Only ${pc.white('PROTOCOL.md')} is modified; your ${pc.white('TASKS.md')} and ${pc.white('AGENT.md')} files are preserved.

${pc.bold('Version comparison:')}
  - If your project has an older version: Updates to the new version
  - If your project has a newer version: Warns you to update the CLI
  - If versions match: No action needed

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos update')}
`
    )
    .action(() => {
        const result = update()

        if (!result.success) {
            if (result.cliOutdated) {
                console.error(pc.yellow(`\n⚠️  ${result.message}`))
            } else {
                console.error(pc.red(`\n❌ ${result.message}`))
            }
            process.exit(1)
        }

        console.log(pc.green(`\n✅ ${result.message}`))
    })

program
    .command('status')
    .description('Show project status and task summary')
    .addHelpText(
        'after',
        `
Displays information about the current project:
  - Protocol version
  - CLI version used for initialization
  - Task summary (todo, in-progress, done, blocked)

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos status')}
`
    )
    .action(() => {
        const result = status()

        if (!result.success) {
            console.error(pc.red(`\n❌ ${result.message}`))
            process.exit(1)
        }

        console.log(
            `\n${pc.bold('📦 Protocol')} ${pc.green(`v${result.protocolVersion}`)} ${pc.dim(`(CLI v${result.cliVersion})`)}`
        )

        if (result.taskSummary) {
            const s = result.taskSummary
            console.log(`\n${pc.bold('📋 Tasks:')} ${pc.cyan(s.total)} total`)
            console.log(`   ${pc.white('⬜ Todo:')} ${pc.white(s.todo)}`)
            console.log(`   ${pc.blue('🔄 In Progress:')} ${pc.blue(s.inProgress)}`)
            console.log(`   ${pc.green('✅ Done:')} ${pc.green(s.done)}`)
            if (s.blocked > 0) {
                console.log(`   ${pc.red('🚫 Blocked:')} ${pc.red(s.blocked)}`)
            }
        }
    })

program
    .command('agents')
    .description('List all AGENT.md files in the project')
    .option('-a, --all', 'Search from project root instead of current directory')
    .addHelpText(
        'after',
        `
This command discovers and displays all ${pc.white('AGENT.md')} files in a tree structure.
${pc.white('AGENT.md')} files provide context to AI agents about specific directories.

${pc.bold('Modes:')}
  (default)   Search from current directory downwards
  --all       Search from project root (finds .autonomos or .git)

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos agents')}           # List from current directory
  $ ${pc.cyan('autonomos agents --all')}     # List from project root
  $ ${pc.cyan('cd packages/core && autonomos agents')}  # List only in packages/core
`
    )
    .action(opts => {
        const result = agents({ all: opts.all })

        if (!result.success) {
            console.error(pc.red(`\n❌ ${result.message}`))
            process.exit(1)
        }

        console.log('\n' + (result.tree ?? result.message))
        console.log(pc.dim(`\n${result.message}`))
    })

program
    .command('version')
    .description('Show the current Protocol version')
    .action(() => {
        console.log(
            `${pc.bold('Agent Protocol')} ${pc.green(`v${PROTOCOL_VERSION}`)} ${pc.dim(`(CLI v${CLI_VERSION})`)}`
        )
    })

program.parse()
