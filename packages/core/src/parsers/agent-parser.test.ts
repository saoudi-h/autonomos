import { describe, expect, it } from 'vitest'
import { AgentParser } from './agent-parser'

describe('AgentParser', () => {
    it('should parse an AGENT.md with standard title correctly', () => {
        const markdown = '# AGENT CONTEXT: My Project\n\n## Section 1\nHello'
        const context = AgentParser.parse(markdown)
        expect(context.title).toBe('My Project')
        expect(context.sections).toHaveLength(1)
        expect(context.sections[0].title).toBe('Section 1')
        expect(context.sections[0].content).toBe('Hello')
    })

    it('should parse multiple sections correctly', () => {
        const markdown = `
# AGENT CONTEXT: Test
## Context & Objectives
Objective 1
## Workflow & Preferences
Strict Linting
        `
        const context = AgentParser.parse(markdown)
        expect(context.sections).toHaveLength(2)
        expect(context.sections[0].title).toBe('Context & Objectives')
        expect(context.sections[0].content).toBe('Objective 1')
        expect(context.sections[1].title).toBe('Workflow & Preferences')
        expect(context.sections[1].content).toBe('Strict Linting')
    })

    it('should handle alternative title format', () => {
        const markdown = '# Simple Title\n## Content'
        const context = AgentParser.parse(markdown)
        expect(context.title).toBe('Simple Title')
    })

    it('should return default title if missing', () => {
        const markdown = '## No Title'
        const context = AgentParser.parse(markdown)
        expect(context.title).toBe('Unknown Agent')
    })
})
