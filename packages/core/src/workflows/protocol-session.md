---
name: protocol-session
description: 'Mandatory bootstrap for any new session on a project following the Autonomos protocol. Invoked at the start of every session, before any work begins.'
---

# Protocol Session

**Goal:** Load all project context, identify the next task, and establish a clean working state.
**Your Role:** Disciplined agent that respects the project's accumulated knowledge.

## STEP 0 — STOP

You are starting a new session. You MUST complete Steps 1, 2, and 3 before any other action.

DO NOT skip steps. DO NOT begin work before Step 3 is complete.

## STEP 1 — Load context (three mandatory reads)

1. Read the root `AGENT.md`. This is your project identity.
2. Run `autonomos agents` (no argument) to get the **full tree of all AGENT.md files in the project**. Read each one. This is your full fractal context — it lets you discover shared packages, cross-cutting conventions, and traps before starting any work.
3. Read the most recent file in `.autonomos/worklogs/`. This is the memory of the previous session — read it to avoid repeating the same mistakes.

RESPOND to the user with a 5-line maximum summary of what you have retained. You are FORBIDDEN to continue without this response.

## STEP 2 — Identify the next task

Open `.autonomos/TASKS.md`. Identify the highest-priority task that is not yet `[x]`. If none qualify, ask the user what to work on.

RESPOND with: `Task selected: [ID] — [title]. Starting.`

## STEP 3 — Mark the task and begin

- Edit `.autonomos/TASKS.md` to change this task's status from `[ ]` to `[/]`.
- NOW you may begin working.

## REMINDER — applies to the entire session

- **RAPPEL 1:** For every non-trivial decision (library choice, naming, structure, framework), STOP and ask: "Does an AGENT.md say something about this?" If yes, apply it. If no, propose the decision to the user.
- **RAPPEL 2:** Every time you learn something important (the user corrects you, you discover a convention, you make a technical choice), STOP. Write it immediately to an AGENT.md (root or subfolder, depending on scope). Do NOT say "I'll note it later". It is NOW.
- **RAPPEL 3:** No format is imposed on AGENT.md content. One line is enough if it's clear. What matters is that the next session can use it.

## FINAL STEP (MANDATORY before saying "session done")

You CANNOT end a session without all three of the following. DO NOT say "done" until each box is checked.

- [ ] Task status in TASKS.md is `[x]` (or `[!]` if blocked)
- [ ] A worklog exists at `.autonomos/worklogs/YYYY-MM-DD-[TASK_ID].md` containing: what was done, decisions made, files modified, and clear next steps
- [ ] You have asked the user the following question and recorded the answer in the worklog: `What did this session learn about this project that deserves to live in an AGENT.md?`

When all three boxes are checked, you may say `session complete`.
