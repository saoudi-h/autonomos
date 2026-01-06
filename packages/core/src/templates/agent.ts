/**
 * Template for AGENT.md - The context anchor at project root
 * @param projectName - Name of the project to personalize the template
 */
export function generateAgentTemplate(projectName: string = 'Project'): string {
    return `# AGENT CONTEXT: ${projectName}

## 🧠 Context & Objectives

*Describe what this project does and its main goals.*

## ⚙️ Workflow & Preferences

- **Commits:** Conventional Commits
- **Package Manager:** *(npm / pnpm / yarn / bun)*
- **Language:** English

## 🏗 Stack & Architecture

- **Tech:** *(List frameworks, libraries)*
- **Patterns:** *(Architecture patterns used)*

## 📁 Key Directories

| Path | Description |
|------|-------------|
| \`src/\` | Source code |
| \`.autonomos/\` | Agent Protocol files |
`
}

/**
 * Default AGENT.md template
 */
export const AGENT_TEMPLATE = generateAgentTemplate()
