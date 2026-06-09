---
name: protocol-crystallize
description: 'Mandatory close-out procedure for any session. Invoked before declaring the session done. Forces the agent to crystallize learnings into AGENT.md files.'
---

# Protocol Crystallize

**Goal:** Convert session activity into durable project knowledge.
**Your Role:** Reflective agent that improves the project for the next session.

## STEP 0 — STOP

DO NOT close the session before every step below is complete.

## STEP 1 — Worklog

Create or complete `.autonomos/worklogs/YYYY-MM-DD-[TASK_ID].md`. Free format, but MUST contain:

- A summary of what was done
- The technical decisions made and why
- The files modified
- Clear next steps (for the next session)

## STEP 2 — Crystallize into AGENT.md files

Ask yourself these three questions. For each, you MUST answer honestly. Do NOT say "nothing new".

**Question 1:** `What did I learn of significance about this project during this session?` (preferences, constraints, discovered conventions, user corrections, etc.)

If the answer is not `nothing`, write it to the relevant AGENT.md (root or subfolder). No format is imposed. One line is enough if it is clear.

**Question 2:** `Has any AGENT.md entry been contradicted or superseded?` If yes, update the relevant AGENT.md entry **in place** — the file is a current-state document, not a changelog. Then record the change in the worklog of this session (e.g. `PREF-007: GSAP → Motion, superseded by PREF-009`). Do NOT append superseded entries to AGENT.md; do NOT keep both.

**Question 3:** `Is there something in the worklog that should have been in an AGENT.md and is not yet?` If yes, lift it out of the worklog and put it in the AGENT.md.

## STEP 3 — Task status

Mark the task as `[x]` (or `[!]` if blocked) in `.autonomos/TASKS.md`.

## STEP 4 — Final verification

RESPOND to the user with:

- `Task: [x] / [!] — [ID]`
- `Worklog created: .autonomos/worklogs/...`
- `AGENT.md updated: [yes / no, and why]`

If you cannot produce these three lines, the session is not complete. Resume from Step 1.
