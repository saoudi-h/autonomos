import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
    AUTONOMOS_DIR,
    generateManifestContent,
    MANIFEST_FILE,
    parseManifest,
    PROTOCOL_FILE,
    PROTOCOL_TEMPLATE,
    PROTOCOL_VERSION,
    type Manifest,
} from '@autonomos/core'

// Get CLI version from package.json
const CLI_VERSION = '0.0.1' // TODO: Import from package.json

interface UpdateOptions {
    cwd?: string
}

interface UpdateResult {
    success: boolean
    message: string
    previousVersion?: string
    newVersion?: string
    cliOutdated?: boolean
}

/**
 * Compare two SemVer versions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
        const aNum = aParts[i] ?? 0
        const bNum = bParts[i] ?? 0
        if (aNum < bNum) return -1
        if (aNum > bNum) return 1
    }
    return 0
}

/**
 * Update the Protocol to the latest version
 */
export function update(options: UpdateOptions = {}): UpdateResult {
    const cwd = options.cwd ?? process.cwd()

    // Check if initialized
    const autonomosDir = join(cwd, AUTONOMOS_DIR)
    const manifestPath = join(autonomosDir, MANIFEST_FILE)

    if (!existsSync(manifestPath)) {
        return {
            success: false,
            message: 'Project not initialized. Run `autonomos init` first.',
        }
    }

    // Read current manifest
    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const manifest: Manifest = parseManifest(manifestContent)
    const currentVersion = manifest.protocolVersion

    // Compare versions
    const comparison = compareVersions(currentVersion, PROTOCOL_VERSION)

    if (comparison === 0) {
        return {
            success: true,
            message: `Already up to date (Protocol v${PROTOCOL_VERSION})`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
        }
    }

    if (comparison > 0) {
        // Project uses a newer version than CLI knows
        return {
            success: false,
            message: `This project uses Protocol v${currentVersion}, but your CLI only knows v${PROTOCOL_VERSION}. Update your CLI with \`npm i -g @autonomos/cli\`.`,
            previousVersion: currentVersion,
            newVersion: PROTOCOL_VERSION,
            cliOutdated: true,
        }
    }

    // Update Protocol (comparison < 0)
    const protocolPath = join(autonomosDir, PROTOCOL_FILE)
    writeFileSync(protocolPath, PROTOCOL_TEMPLATE)

    // Update manifest
    const updatedManifest: Manifest = {
        ...manifest,
        protocolVersion: PROTOCOL_VERSION,
        cliVersion: CLI_VERSION,
        lastUpdated: new Date().toISOString(),
    }
    writeFileSync(manifestPath, generateManifestContent(updatedManifest))

    return {
        success: true,
        message: `Protocol updated: v${currentVersion} → v${PROTOCOL_VERSION}`,
        previousVersion: currentVersion,
        newVersion: PROTOCOL_VERSION,
    }
}
