import { z } from 'zod'

/**
 * Manifest Schema for .autonomos/manifest.json
 */
export const ManifestSchema = z.object({
    protocolVersion: z.string().describe('Version of the Agent Protocol specification'),
    cliVersion: z.string().describe('Version of the CLI that last updated this project'),
    initializedAt: z.string().datetime().describe('ISO timestamp of project initialization'),
    lastUpdated: z.string().datetime().describe('ISO timestamp of last protocol update'),
})

export type Manifest = z.infer<typeof ManifestSchema>
