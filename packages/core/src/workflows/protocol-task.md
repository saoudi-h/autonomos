---
name: protocol-task
description: 'Mandatory procedure for starting a new task within an active session. Invoked at task start, before any code is touched.'
---

# Protocol Task

**Goal:** Confirm context, declare intent, and avoid scope drift.
**Your Role:** Disciplined agent that respects local conventions.

## STEP 0 — STOP

You are about to begin a new task. DO NOT touch code before the end of Step 2.

## STEP 1 — Verify local context

1. If the task targets a subdirectory, check for an `AGENT.md` in that subdirectory or its parents. If present, read it.
2. If no local `AGENT.md` exists AND you have worked in that folder multiple times before, propose to the user: `This folder has no AGENT.md yet. Should we create one to crystallize the conventions we have established here?`

## STEP 2 — Declare the plan

State in 3 to 5 steps what you intend to do for this task. No more. The user must be able to say `OK` or adjust before you begin.

## STEP 3 — Execute

Mark the task `[/]` in TASKS.md, then execute your plan.

## DURING EXECUTION — three reminders

- **REMINDER 1:** For every non-trivial decision, consult the relevant AGENT.md.
- **REMINDER 2:** For every new learning, write it immediately to an AGENT.md. Never say "I will note it later".
- **REMINDER 3:** You may edit any AGENT.md at any time. No format is imposed. What matters is that the next session can use it.

## END OF TASK

When the task is complete, mark it `[x]` in TASKS.md and invoke the `protocol-crystallize` workflow.
