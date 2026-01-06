import { describe, expect, it } from 'vitest'
import { createManifest, parseManifest } from './manifest'

describe('Manifest Parser', () => {
    it('should validate a correct manifest correctly', () => {
        const manifest = createManifest('0.0.1')
        const json = JSON.stringify(manifest)
        const parsed = parseManifest(json)
        expect(parsed.cliVersion).toBe('0.0.1')
    })

    it('should throw error on invalid manifest', () => {
        const invalidJson = JSON.stringify({
            protocolVersion: '1.0',
            // Missing fields or invalid types
        })
        expect(() => parseManifest(invalidJson)).toThrow()
    })

    it('should throw error on invalid date format', () => {
        const manifest = createManifest('0.0.1')
        manifest.initializedAt = 'invalid-date'
        const json = JSON.stringify(manifest)
        expect(() => parseManifest(json)).toThrow()
    })
})
