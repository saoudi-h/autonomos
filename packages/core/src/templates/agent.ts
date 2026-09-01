/**
 * Template for AGENT.md - The context anchor at project root
 * @param projectName - Name of the project to personalize the template
 */
export function generateAgentTemplate(projectName: string = 'Project'): string {
    return `---
name: "${projectName}"
type: "project"
status: "active"
---
# AGENT CONTEXT: ${projectName}

## 🧠 Context & Objectives

*Describe what this project does and its main goals.*

## ⚙️ Workflow & Preferences

- **Commits:** Conventional Commits
- **Language:** English
- **Design:** If present, read root \`DESIGN.md\` before changing a user-facing surface; use \`/design\` for new direction, critique, or design-knowledge extraction.

## 🏗 Stack & Architecture

- **Tech:** *(List frameworks, libraries)*
- **Patterns:** *(Architecture patterns used)*

## 📁 Key Directories

| Path | Description |
|------|-------------|
| \`src/\` | Source code |
| \`.autonomos/\` | Agent Protocol files |

## ⚠️ Known Constraints

*List any technical debts, missing features, or external limitations.*
`
}

/**
 * Generate a minimal local AGENT.md for subdirectories.
 * Free format by design — low friction encourages creation.
 * @param dirName - Name of the directory
 */
export function generateLocalAgentTemplate(dirName: string): string {
    return `# AGENT: ${dirName}

- **Stack:** *(frameworks, libs specific to this module)*
- **Conventions:** *(naming, exports, test patterns)*
- **Constraints:** *(known issues, tech debt)*
`
}

/**
 * Default root AGENT.md template
 */
export const AGENT_TEMPLATE = generateAgentTemplate()

/**
 * Default local AGENT.md template
 */
export const LOCAL_AGENT_TEMPLATE = generateLocalAgentTemplate('module')
