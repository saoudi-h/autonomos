#!/usr/bin/env node
import { Command } from 'commander'
import pc from 'picocolors'

import { PROTOCOL_VERSION } from '@autonomos/core'
import { agents } from './commands/agents'
import { init } from './commands/init'
import { status } from './commands/status'
import { update } from './commands/update'

// Synchronize with the package.json version at build time. The bundler
// inlines this JSON, so the resolved value is always current.
// (package.json import — inlined by the bundler)
import packageJson from '../package.json' with { type: 'json' }
const CLI_VERSION: string = packageJson.version

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

Additionally, when one or more harnesses are selected, the protocol workflow
files (session / task / crystallize) are installed at the harness-specific
target directory, e.g. .clinerules/workflows/ for Cline, .claude/skills/ for
Claude Code, .agents/skills/ for the cross-tool standard (Cursor, Codex, etc.).

${pc.bold('Harness selection:')}
  (default)     Interactive multi-select prompt at the start of init.
  --harness     Skip the prompt and install only for the given harness id(s).
                May be repeated, e.g. --harness cline --harness claude-code.
  --all         Skip the prompt and install for all known harnesses.
  --no-prompt   Same as not specifying a TTY; useful in CI/scripted contexts.

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos init')}
  $ ${pc.cyan('autonomos init --harness cline')}
  $ ${pc.cyan('autonomos init --harness cline --harness claude-code')}
  $ ${pc.cyan('autonomos init --all')}
  $ ${pc.cyan('autonomos init --dry-run')}
  $ ${pc.cyan('cd my-project && autonomos init')}
`
    )
    .option('-n, --dry-run', 'Preview what would be created without writing files')
    .option(
        '--harness <name...>',
        'Install workflows for the specified harness id(s); skip the prompt'
    )
    .option('--all', 'Install workflows for all known harnesses; skip the prompt')
    .option('--no-prompt', 'Skip the interactive harness prompt (use with --harness or --all)')
    .action(
        async (opts: { dryRun?: boolean; harness?: string[]; all?: boolean; prompt?: boolean }) => {
            try {
                const result = await init({
                    dryRun: opts.dryRun,
                    harnesses: opts.harness,
                    all: opts.all,
                    noPrompt: opts.prompt === false,
                })

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
                    result.created.forEach(file =>
                        console.log(`  ${pc.blue('📄')} ${pc.white(file)}`)
                    )
                }

                if (result.harnessFiles && result.harnessFiles.length > 0) {
                    console.log(`\n${pc.bold('Harness workflow files:')}`)
                    result.harnessFiles.forEach(file =>
                        console.log(`  ${pc.cyan('⚙️ ')} ${pc.white(file)}`)
                    )
                }

                if (result.warnings.length > 0) {
                    console.log(pc.yellow('\nWarnings:'))
                    result.warnings.forEach(warn => console.log(`  ${pc.yellow('⚠️')}  ${warn}`))
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                console.error(pc.red(`\n❌ ${message}`))
                process.exit(1)
            }
        }
    )

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
    .description('List all AGENT.md files in the project, or the ancestor chain for a path')
    .argument(
        '[path]',
        'Optional file or folder. When provided, return the ordered list of ancestor AGENT.md files (root -> target) instead of the full tree.'
    )
    .option('-a, --all', 'In tree mode: search from project root instead of current directory')
    .addHelpText(
        'after',
        `
This command has two modes:

${pc.bold('Tree mode')} (default, or with ${pc.cyan('--all')}):
  Discover and display all ${pc.white('AGENT.md')} files in a tree structure.
  Used at session start to get the broader fractal picture of the project.

${pc.bold('Ancestors mode')} (with a positional ${pc.cyan('<path>')} argument):
  Return the ordered list of ${pc.white('AGENT.md')} files on the path from the
  target up to the project root. Root-first; non-existent ancestors are
  silently skipped. Used at task start to get the precise fractal context
  for the file or folder being worked on.

${pc.bold('Examples:')}
  $ ${pc.cyan('autonomos agents')}                                    # Tree, from current dir
  $ ${pc.cyan('autonomos agents --all')}                              # Tree, from project root
  $ ${pc.cyan('autonomos agents apps/web')}                           # Ancestors for apps/web
  $ ${pc.cyan('autonomos agents apps/web/components/ui/button.tsx')}  # Ancestors for a file
`
    )
    .action((path: string | undefined, opts: { all?: boolean }) => {
        const result = agents({ all: opts.all, target: path })

        if (!result.success) {
            console.error(
                pc.red(`
❌ ${result.message}`)
            )
            process.exit(1)
        }

        if (result.mode === 'ancestors') {
            console.log(
                pc.cyan(`
🔍 ${result.message}`)
            )
        } else {
            console.log('\n' + (result.tree ?? result.message))
            console.log(
                pc.dim(`
${result.message}`)
            )
        }
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
