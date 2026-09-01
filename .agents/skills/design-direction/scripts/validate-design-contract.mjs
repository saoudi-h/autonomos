#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2] ?? 'DESIGN.md'
const filePath = path.resolve(input)
const errors = []

if (!fs.existsSync(filePath)) {
    errors.push('file not found: ' + filePath)
} else if (!fs.statSync(filePath).isFile()) {
    errors.push('not a file: ' + filePath)
}

if (errors.length === 0) {
    const content = fs.readFileSync(filePath, 'utf8')
    const statusMatch = content.match(/^Status:\s*(draft|accepted|superseded)\s*$/im)
    const status = statusMatch?.[1]?.toLowerCase()

    if (!statusMatch) {
        errors.push('missing an exact Status: draft|accepted|superseded field')
    }

    for (const heading of [
        'Product truth',
        'Direction thesis',
        'System contract',
        'Content and state contract',
        'Anti-default tests',
        'Evidence and change record',
    ]) {
        const section = content.match(
            new RegExp(
                '^## ' +
                    escapeRegExp(heading) +
                    '[ \\t]*(?:\\n|$)([\\s\\S]*?)(?=^## |(?![\\s\\S]))',
                'm'
            )
        )
        if (!section) {
            errors.push('missing required section: ' + heading)
            continue
        }

        const body = section[1].replace(/[-*_|:#\[\]()]/g, ' ').trim()
        if (body.length < 12) {
            errors.push('required section is empty or too thin: ' + heading)
        }
    }

    for (const field of ['Scope', 'Owner', 'Last accepted']) {
        if (!new RegExp('^' + escapeRegExp(field) + '\\s*:\\s*\\S+', 'im').test(content)) {
            errors.push('missing metadata field: ' + field)
        }
    }

    if (status === 'accepted') {
        const unresolved = [
            /\[project(?: or product)?\]/i,
            /\[specific (?:people|audience)/i,
            /\[one sentence/i,
            /\[one verb/i,
            /\[YYYY-MM-DD\]/i,
            /\[person or team\]/i,
            /\[what the interface/i,
        ]
        if (unresolved.some(pattern => pattern.test(content))) {
            errors.push('accepted contract still contains template placeholders')
        }
    }
}

if (errors.length > 0) {
    console.error('Design contract invalid: ' + filePath)
    for (const error of errors) console.error('- ' + error)
    process.exit(1)
}

console.log('Design contract valid: ' + filePath)

function escapeRegExp(value) {
    return value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&')
}
