import type { AgentContext, AgentSection } from '../types'

export class AgentParser {
    /**
     * Parse an AGENT.md content into a structured AgentContext
     */
    static parse(markdown: string): AgentContext {
        const lines = markdown.split(/\r?\n/)
        const sections: AgentSection[] = []
        let title = 'Unknown Agent'
        let currentSection: AgentSection | null = null
        let currentContent: string[] = []

        for (const line of lines) {
            // Parse Title
            if (line.startsWith('# ')) {
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
        }
    }
}
