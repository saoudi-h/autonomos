import yaml from 'js-yaml'
import type { AgentContext, AgentSection } from '../types'

export class AgentParser {
    /**
     * Parse an AGENT.md content into a structured AgentContext
     */
    static parse(markdown: string): AgentContext {
        let content = markdown
        let metadata: Record<string, any> = {}

        // Parse Frontmatter
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/
        const match = markdown.match(frontmatterRegex)
        if (match) {
            try {
                metadata = yaml.load(match[1]) as Record<string, any>
                content = markdown.slice(match[0].length).trim()
            } catch (e) {
                console.error('Failed to parse Agent frontmatter:', e)
            }
        }

        const lines = content.split(/\r?\n/)
        const sections: AgentSection[] = []
        let title = metadata.name ?? 'Unknown Agent'
        let currentSection: AgentSection | null = null
        let currentContent: string[] = []

        for (const line of lines) {
            // Parse Title (Only if not already set by frontmatter)
            if (line.startsWith('# ') && !metadata.name) {
                const rawTitle = line.replace('# ', '').trim()
                // Handle "AGENT CONTEXT: [Name]" format
                if (rawTitle.toUpperCase().startsWith('AGENT CONTEXT:')) {
                    title = rawTitle
                        .slice(14)
                        .replace(/^[:\s-]+/, '')
                        .trim()
                } else {
                    title = rawTitle
                }
                continue
            }

            // Parse Sections
            if (line.startsWith('## ')) {
                // Save previous section
                if (currentSection) {
                    currentSection.content = currentContent.join('\n').trim()
                    sections.push(currentSection)
                }

                currentSection = {
                    title: line.replace('## ', '').trim(),
                    content: '',
                }
                currentContent = []
                continue
            }

            // Collect content
            if (currentSection) {
                currentContent.push(line)
            }
        }

        // Save last section
        if (currentSection) {
            currentSection.content = currentContent.join('\n').trim()
            sections.push(currentSection)
        }

        return {
            title,
            sections,
            metadata,
        }
    }
}
