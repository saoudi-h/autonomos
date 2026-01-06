import { PROTOCOL_VERSION } from '../constants'
import { ManifestSchema } from '../schemas/manifest'
import type { Manifest } from '../types'

/**
 * Creates a new manifest object with current timestamps
 */
export function createManifest(cliVersion: string): Manifest {
    const now = new Date().toISOString()
    return {
        protocolVersion: PROTOCOL_VERSION,
        cliVersion,
        initializedAt: now,
        lastUpdated: now,
    }
}

/**
 * Generates the manifest.json content as a formatted string
 */
export function generateManifestContent(manifest: Manifest): string {
    return JSON.stringify(manifest, null, 4) + '\n'
}

/**
 * Parses manifest.json content into a Manifest object with validation
 */
export function parseManifest(content: string): Manifest {
    const data = JSON.parse(content)
    return ManifestSchema.parse(data)
}
