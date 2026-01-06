#!/usr/bin/env node
import { Command } from 'commander'

import { PROTOCOL_VERSION } from '@autonomos/core'
import { init } from './commands/init'
import { update } from './commands/update'

const program = new Command()

program.name('autonomos').description('CLI for the Autonomos Agent Protocol').version('0.0.1')

program
    .command('init')
    .description('Initialize the Agent Protocol in the current directory')
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
    .command('version')
    .description('Show the current Protocol version')
    .action(() => {
        console.log(`Agent Protocol v${PROTOCOL_VERSION}`)
    })

program.parse()
