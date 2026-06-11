---
name: protocol-task
description: 'Mandatory procedure for starting a new task within an active session. Invoked at task start, before any code is touched.'
---

# Protocol Task

**Goal:** Confirm context, declare intent, and avoid scope drift.
**Your Role:** Disciplined agent that respects local conventions.

## STEP 0 — STOP

You are about to begin a new task. DO NOT touch code before the end of Step 2.

## STEP 1 — Build the precise fractal context for this task

1. Run `autonomos agents <path-to-target-file-or-folder>` to get the **ordered list of ancestor AGENT.md files** for the file or folder you'll be working in. The output is root-first; non-existent ancestors are silently skipped.
    > **Fallback:** If `autonomos agents` is not available or fails, manually walk from the target directory up to the project root and read each `AGENT.md` you find along the way (root → target).
2. Read each returned AGENT.md **in order** (root → target). This is your precise fractal context for this task.
3. If no local `AGENT.md` exists at the target AND you have worked in that folder multiple times before, propose to the user: `This folder has no AGENT.md yet. Should we create one to crystallize the conventions we have established here?`

## STEP 2 — Declare the plan

State in 3 to 5 steps what you intend to do for this task. No more. The user must be able to say `OK` or adjust before you begin.

## STEP 3 — Execute

Mark the task `[/]` in TASKS.md, then execute your plan.

## DURING EXECUTION — three reminders

- **REMINDER 1:** For every non-trivial decision, consult the relevant AGENT.md.
- **REMINDER 2:** For every new learning, append a new line to an AGENT.md. If the new learning contradicts an existing one, replace the old entry in place and log the change in the worklog. AGENT.md stays a sharp current-state document, not a log.
- **REMINDER 3:** For the root `AGENT.md`, follow the template defined in `PROTOCOL.md` (Section 2.C). For local `AGENT.md` files (subfolders) or subsequent updates, free format is fine — one line is enough if it is clear. What matters is that the next session can use it.

## END OF TASK

When the task is complete, mark it `[x]` in TASKS.md and invoke the `protocol-crystallize` workflow.
