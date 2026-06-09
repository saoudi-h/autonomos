import { PROTOCOL_VERSION } from '../constants'

/**
 * The immutable Protocol kernel template
 * This is the core specification that defines how AI agents interact with the project
 */
export const PROTOCOL_TEMPLATE = `# AI AGENT PROTOCOL (v${PROTOCOL_VERSION})

> **SYSTEM INTEGRITY WARNING:** This file is the IMMUTABLE KERNEL of the project's AI workflow. Do not modify this file. Your instructions are to execute tasks and manage the project state based strictly on the definitions below.

## 0. ⚡ QUICK REFERENCE
| Action | File / Command |
|--------|----------------|
| **Get Context** | Read \`AGENT.md\` (Root + Local) |
| **Pick Task** | Check \`.autonomos/TASKS.md\` (Highest Priority) |
| **Track Progress** | Update \`.autonomos/TASKS.md\` to \`[/]\` |
| **Log Session** | Create \`.autonomos/worklogs/YYYY-MM-DD-[TASK_ID].md\` |
| **Finalize Task** | Update \`.autonomos/TASKS.md\` to \`[x]\` + Link Worklog |
| **Discover all AGENT.md files** | Run \`autonomos agents\` |
| **Discover AGENT.md ancestors for a path** | Run \`autonomos agents <path>\` |

---

## 1. BOOTSTRAPPING & INITIALIZATION
**IF** this is your first time seeing this project, or if key system files are missing, you **MUST** initialize them immediately before doing any work.

### Check for existence:
1.  \`.autonomos/TASKS.md\` (task registry)
2.  \`.autonomos/worklogs/\` (directory)
3.  \`AGENT.md\` (at project root)

**IF MISSING**, create them using the **TEMPLATES** defined in Section 2.

---

## 2. STRICT FILE STRUCTURES & TEMPLATES
You must adhere to these schemas. Do not invent new formats.

### A. The Task Registry (\`.autonomos/TASKS.md\`)
**Role:** The single source of truth for project state.
**Location:** \`.autonomos/TASKS.md\`
**Structure:**
* Must use the specific Header and Legend.
* Tasks must follow the format: \`- [Status] **[ID]** Title of task \`Priority\` \`Complexity\`\`
* Valid Priorities: \`🔴 Critical\`, \`🟠 High\`, \`🔵 Medium\`, \`⚪ Low\`
* Valid Complexities: \`S\`, \`M\`, \`L\`, \`XL\`
* Valid Statuses: \` [ ] \` (Todo), \`[/]\` (In Progress), \` [x] \` (Done), \` [!] \` (Blocked)

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

### B. The Worklog (\`.autonomos/worklogs/\`)
**Role:** Detailed history of complex tasks to save context tokens for future sessions.
**Location:** \`.autonomos/worklogs/YYYY-MM-DD-[TASK_ID]-[slug].md\`
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
**MUST be kept alive:** you may freely add to, edit, or correct an \`AGENT.md\` at any time. No format is imposed: one line is enough if it is clear. What matters is that the next session can use it.

**TEMPLATE FOR AGENT.md:**
\`\`\`markdown
---
name: "[Name of directory or project]"
type: "[project / package / module / script]"
status: "[active / maintenance / poc]"
---
# AGENT CONTEXT: [Directory Name or Root]

## 🧠 Context & Objectives
What does this specific folder/module do?

## ⚙️ Workflow & Preferences
- **Commits:** [e.g. Conventional Commits]
- **Language:** [English (default)]

## 🏗 Stack & Architecture
- **Tech:** [Frameworks, Libs specific to this module]
- **Patterns:** [Architecture patterns used]

## 📁 Key Directories
| Path | Description |
|------|-------------|
| \`src/\` | Source code |
| \`scripts/\` | Build or utility scripts |

## ⚠️ Known Constraints
*List any technical debts, missing features, or external limitations.*
\`\`\`

## 3. CORE WORKFLOW (The Loop)

### Phase 1: Context Loading (Read-Only)
1.  **Read Root AGENT.md:** Absorb global preferences (Commit style, package manager, strict rules).
2.  **Run \`autonomos agents\` to discover all other \`AGENT.md\` files in the project tree.** For each one relevant to the work ahead, read it too.
3.  **Read .autonomos/TASKS.md:** Identify the highest priority task (🔴 or 🟠) that is not [x] or [!].
4.  **Read Target AGENT.md:** If the task is in a subdirectory, check for a local \`AGENT.md\`.
    *   *Note:* If the local \`AGENT.md\` contradicts the root, the local one wins for that specific scope.

### Phase 2: Execution
1.  **Mark the task as [/] (In Progress)** in \`.autonomos/TASKS.md\`.
2.  **Perform the task.**
3.  **Constraint Check:** Constantly refer to "Workflow & Preferences" in \`AGENT.md\`.
4.  **In-the-moment crystallization:** Every time you learn something important (the user corrects you, you discover a convention, you make a non-trivial technical choice), write it to the relevant \`AGENT.md\` IMMEDIATELY. Do NOT defer this to end of session.

### Phase 3: Crystallization (Write-Only)
Before ending the session, you **MUST**:

1.  **Update AGENT.md:**
    *   Did you learn a new command? Add it to ⚙️ Workflow.
    *   Did you create a new complex module (>5 files)? Create a new \`AGENT.md\` inside it using the template above.
    *   Did anything you previously wrote turn out to be wrong? Append a correction note (do not erase).

2.  **Create Worklog:**
    *   Write a file in \`.autonomos/worklogs/\` summarizing your work.

3.  **Update TASKS.md:**
    *   Mark task as [x] (Done) or [!] (Blocked).
    *   Add a link to your worklog: \`- [x] **[ID]** Title... *See: .autonomos/worklogs/...*\`

## 4. HARNESS WORKFLOWS

The protocol is delivered to the agent through **workflow files** installed at the harness-specific target directory. The exact location depends on the harness (see \`autonomos init --help\`). Three workflows are available:

* **\`/session\`** (\`protocol-session.md\`) — Mandatory bootstrap at the start of every session. Loads context, identifies the next task, marks it in progress.
* **\`/task\`** (\`protocol-task.md\`) — Invoked at the start of a new task within an active session. Verifies local \`AGENT.md\`, declares a 3-5 step plan before touching code.
* **\`/crystallize\`** (\`protocol-crystallize.md\`) — Mandatory close-out before saying "session done". Worklog + 3 crystallize questions + task status + final verification line.

**You MUST invoke \`/session\` at the start of every session and \`/crystallize\` before ending it. These are not optional.** Skipping them breaks the protocol's memory loop.

If the project does not yet contain these workflow files, run \`autonomos init\` (or \`autonomos init --harness <name>\` to target a specific harness).

## 5. METADATA RULES
*   **Language:** Documentation (\`AGENT.md\`, \`TASKS.md\`) must be written in **English** unless specified otherwise in User Preferences.
*   **Tone:** Technical, concise, "Fact-based". No fluff.
*   **Anonymity:** You are a continuous entity. Refer to previous work as "we" or "the project", not "the previous AI".
`

/**
 * @deprecated Use PROTOCOL_TEMPLATE instead
 */
export const PROTOCOL_TEMPLATE_V2026_1 = PROTOCOL_TEMPLATE
