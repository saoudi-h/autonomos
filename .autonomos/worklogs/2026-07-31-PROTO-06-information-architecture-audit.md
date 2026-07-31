# WORKLOG: [PROTO-06] Protocol information architecture audit

**Date:** 2026-07-31
**Agent Status:** [Complete]

## What was done

- Audited the shipped session, task, and crystallization workflows, their tests,
  the protocol and artifact templates, the task parser, and CLI lifecycle behavior.
- Compared the intended roles of `AGENT.md`, `TASKS.md`, and worklogs with drift
  observed while using Autonomos on a private infrastructure repository.
- Registered focused follow-up tasks PROTO-07 through PROTO-12. No shipped
  workflow, parser, template, or CLI behavior changed in this framing session.

## Confirmed findings

- Immediate and repeated crystallization turns `AGENT.md` into an append-only
  incident log because there is no durability, placement, or retirement test.
- The protocol does not own project version-control policy. The ignored worklogs
  observed in another repository came from an agent's project-specific inference,
  not from Autonomos behavior or a missing global Git policy.
- The protocol has no intake concept independent from implementation tasks, so
  untriaged problems are often expressed as predetermined solutions.
- Global priority selection can override an explicit user request, while global
  context discovery loads unrelated package guidance.
- Mandatory protocol writes and binary close-out statuses can conflict with
  read-only authority and honest partial progress.
- Version immutability needs a precise ownership boundary: consumer agents cannot
  edit installed protocol artifacts, while a new published protocol version may
  replace them through the supported CLI update path.

## Decisions

- Keep the protocol Markdown-first and tool-neutral. Any issue/proposal artifact
  should be optional and must prove useful before parser or CLI support is added.
- Design reconciliation as an evidence-aware workflow first. Consider a CLI audit
  only after real-world use demonstrates deterministic checks worth automating.
- Treat historical worklogs differently from current normative context: strategy
  changes can supersede an `AGENT.md` rule without rewriting what a past session
  actually observed or decided.
- Keep Git inclusion, exclusion, and worklog visibility outside the protocol. A
  project may state its own policy, and agents must not infer one from unrelated
  public or private repositories.

## Files modified

- `.autonomos/TASKS.md`
- `.autonomos/worklogs/2026-07-31-PROTO-06-information-architecture-audit.md`
- `AGENT.md`

## Next steps

1. Address PROTO-12 and PROTO-11 first because they govern user authority and
   task selection, including how the remaining protocol work should start.
2. Define memory semantics in PROTO-07 before implementing reconciliation in
   PROTO-08; the audit workflow needs a clear target state.
3. Specify version/content immutability (PROTO-09) and problem/task intake
   (PROTO-10) as small, independently testable protocol decisions.
