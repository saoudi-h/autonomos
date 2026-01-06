export const PROTOCOL_TEMPLATE_V2026_1 = `# AI AGENT PROTOCOL (v2026.1)

> **SYSTEM INTEGRITY WARNING:** This file is the IMMUTABLE KERNEL of the project's AI workflow. Do not modify this file. Your instructions are to execute tasks and manage the project state based strictly on the definitions below.

## 1. BOOTSTRAPPING & INITIALIZATION
**IF** this is your first time seeing this project, or if key system files are missing, you **MUST** initialize them immediately before doing any work.

### Check for existence:
1.  \`TASKS.md\` (at project root)
2.  \`.ai/worklogs/\` (directory)
3.  \`AGENT.md\` (at project root)

**IF MISSING**, create them using the **TEMPLATES** defined in Section 2.

---

## 2. STRICT FILE STRUCTURES & TEMPLATES
You must adhere to these schemas. Do not invent new formats.

### A. The Task Registry (\`TASKS.md\`)
**Role:** The single source of truth for project state.
**Location:** Root (\`/TASKS.md\`).
**Structure:**
* Must use the specific Header and Legend.
* Tasks must follow the format: \`- [Status] **[ID]** Title of task \`Priority\` \`Complexity\`\`
* Valid Priorities: \`🔴 Critical\`, \`🟠 High\`, \`🔵 Medium\`, \`⚪ Low\`
* Valid Complexities: \`S\`, \`M\`, \`L\`, \`XL\`
* Valid Statuses: \`[ ]\` (Todo), \`[/]\` (In Progress), \`[x]\` (Done), \`[!]\` (Blocked)

**TEMPLATE FOR NEW TASKS.md:**
\`\`\`markdown
# PROJECT TASKS & ROADMAP

> **LEGEND**
> **Priority:** [🔴 Critical] [🟠 High] [🔵 Medium] [⚪ Low]
> **Complexity:** [S] Small (1h), [M] Medium (4h), [L] Large (1-2 days), [XL] Huge (Planning req.)
> **Status:** [ ] Todo, [/] In Progress, [x] Done, [!] Blocked

## 🚀 Active Sprint
- [ ] **[INIT-01]** Verify project structure and context \`Priority: 🔴\` \`Complexity: S\`

## 🔮 Backlog
*(Empty initially)*

\`\`\`

### B. The Worklog (\`.ai/worklogs/\`)
**Role:** Detailed history of complex tasks to save context tokens for future sessions.
**Location:** \`.ai/worklogs/YYYY-MM-DD-[TASK_ID]-[slug].md\`
**Trigger:** Create a log when a task is finished, blocked, or if the session ends mid-task.

**TEMPLATE FOR WORKLOG:**
\`\`\`markdown
# WORKLOG: [TASK ID] [Task Name]
**Date:** YYYY-MM-DD
**Agent Status:** [Complete / Partial / Blocked]

## 📝 Description
Brief summary of what was attempted/achieved.

## 🛠 Technical Details
- **Files Modified:** List of files.
- **Key Decisions:** Why did you choose this library/pattern?
- **Challenges:** Any errors encountered and how they were solved.

## ⏭ Next Steps / Context for Successor
Clear instructions for the next agent picking this up.
\`\`\`

### C. The Context Anchor (\`AGENT.md\`)
**Role:** Fractal knowledge base. Contains facts, stack details, and user preferences.
**Location:** Root (\`/AGENT.md\`) and any subdirectory requiring specific context (e.g., \`/packages/core/AGENT.md\`).

**TEMPLATE FOR AGENT.md:**
\`\`\`markdown
# AGENT CONTEXT: [Directory Name or Root]

## 🧠 Context & Objectives
What does this specific folder/module do?

## ⚙️ Workflow & Preferences
*(Crucial: User defined rules override standard defaults)*
- **Commits:** [e.g. Conventional Commits]
- **Linting:** [e.g. Strict, Biome, Eslint]
- **Specific Commands:** [e.g. "Use \`ssh deploy\` alias"]

## 🏗 Stack & Architecture
- **Tech:** [Frameworks, Libs specific to this module]
- **Patterns:** [Architecture patterns used]
\`\`\`

## 3. CORE WORKFLOW (The Loop)

### Phase 1: Context Loading (Read-Only)
1.  **Read Root AGENT.md:** Absorb global preferences (Commit style, package manager, strict rules).
2.  **Read TASKS.md:** Identify the highest priority task (🔴 or 🟠) that is not [x] or [!].
3.  **Read Target AGENT.md:** If the task is in a subdirectory, check for a local \`AGENT.md\`.
    *   *Note:* If the local \`AGENT.md\` contradicts the root, the local one wins for that specific scope.

### Phase 2: Execution
1.  **Mark the task as [/] (In Progress)** in \`TASKS.md\`.
2.  **Perform the task.**
3.  **Constraint Check:** Constantly refer to "Workflow & Preferences" in \`AGENT.md\`.

### Phase 3: Crystallization (Write-Only)
Before ending the session, you **MUST**:

1.  **Update AGENT.md:**
    *   Did you learn a new command? Add it to ⚙️ Workflow.
    *   Did you create a new complex module (>5 files)? Create a new \`AGENT.md\` inside it using the template above.

2.  **Create Worklog:**
    *   Write a file in \`.ai/worklogs/\` summarizing your work.

3.  **Update TASKS.md:**
    *   Mark task as [x] (Done) or [!] (Blocked).
    *   Add a link to your worklog: \`- [x] **[ID]** Title... *See: .ai/worklogs/...*\`

## 4. METADATA RULES
*   **Language:** Documentation (\`AGENT.md\`, \`TASKS.md\`) must be written in **English** unless specified otherwise in User Preferences.
*   **Tone:** Technical, concise, "Fact-based". No fluff.
*   **Anonymity:** You are a continuous entity. Refer to previous work as "we" or "the project", not "the previous AI".
`
