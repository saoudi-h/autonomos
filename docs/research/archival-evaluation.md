# Archival and current-context evaluation

Public-safe summary of an exploratory study (2026-10-24) behind the `/reconcile` archival design (SPEC-003, PROTO-14). It is qualitative evidence for protocol design. It is **not** a model ranking, a reliability estimate, or proof that any model or tool classifies knowledge correctly.

## Method

- 18 delegated runs completed, each in a fresh conversation, with read-only prompt instructions (not an OS sandbox):
    - 3 independent audits of the same four live cases;
    - 6 controlled reconciliation runs (the fictional fixture under two instruction versions, once per model);
    - 3 fresh-context resumptions without historical worklogs;
    - 3 fresh-context targeted archive retrievals;
    - 1 guided second review of contested findings, 1 guided correction of a final proposal, and 1 independent audit of a manually archived fixture.
- Models, one run per configuration: Sol (low effort), Luna (max effort), Sonnet (medium effort).
- Two attempts with a further model through OpenCode failed to open a provider session before any model execution. These are transport failures, not model failures, and are excluded from findings.
- Guided rounds included earlier findings and objections, so their improvements are repairs, not blind replications.

## Findings

1. **Fresh-context resumption works without archives.** Given only current guidance, tasks, issues and an accepted decision, all three runs kept the accepted architecture and open follow-ups, read an old limitation as historical, and declined to invent missing metrics. They still asked to inspect current source before concrete changes; a handoff does not replace source.
2. **Targeted retrieval works.** Given an index and one worklog, all three found the right record and reported its facts and conditions without over-claiming (for example, not inferring that a past change closed a still-open budget issue). The test was tiny; no claim is made about large archives or optimal context use.
3. **Mixed-claim failures.** One paragraph can mix current guidance, current state and history. Runs generally preserved valid parts (an active directive, a still-valid restriction inside a superseded paragraph, an unimplemented accepted spec). All first proposals nevertheless put task progress back into AGENT.md.
4. **Final-text failures.** Correct analysis did not guarantee correct output: one run explained the claim split correctly yet its proposed text kept incident metrics and an unsupported ban. One run kept completed-task summaries in the current registry without an active dependency; another claimed a source line that does not exist and proposed deleting it. Self-checks are not proof; verify exact source text before any mutation.
5. **Instructions helped but did not eliminate errors.** Clearer instructions improved proposed guidance; evidence errors and inconsistent final proposals remained.
6. **Live-repository judgment varied.** Runs agreed on clearly superseded rules and task/issue mismatches, but differed where evidence was only configuration history. A configuration change is not an observed runtime validation. Distinct instruction files (and entry-point redirects) must be mapped before proposing canonicalization.
7. **Scope.** One run read host-level configuration unnecessarily. Read-only does not mean unrestricted; state scope and mode explicitly.
8. **Mechanical checks.** In a manually archived scratch layout, archived records kept original bytes, links resolved, an active dependency and open issue stayed current, and an accepted unimplemented spec was untouched. A later independent audit found no further deterministic correction. This is a snapshot, not proof of an archiver's idempotence; no archiver was built.

## Limitations

One run per condition, no randomization, small fictional fixtures, differing provider tooling and context, manually condensed resumption context, and a fixture defect in one history variant (a stale statement that history was unavailable). No latency, token, concurrent-writer, migration or release testing. Byte reduction in the toy fixture is illustrative only.

## Design consequences

Extend `/reconcile`; judge task and parent-issue acceptance separately; keep accepted specs, applicable decisions and active directives independent of execution history; keep task progress out of AGENT.md; archive in coherent batches; avoid per-completion stubs; verify source text and links before moving anything. Tools check mechanics; the agent judges obsolescence.

## Repeatable manual evaluation

Fixture: [`archival-fixture/`](archival-fixture/). It is entirely fictional and self-contained. Treat it as read-only input.

### Prompt

> Read-only evaluation. Inspect only `docs/research/archival-fixture/`. Do not write, install, use the network, or read other files or host configuration. First answer Part A using only AGENT.md, TASKS.md, ISSUES.md, specs/ and src/. Then answer Part B using only the worklog excerpts justified by its questions. Finally apply the current `/reconcile` guidance: for each task and issue give a disposition (keep, archive candidate, correct/verify), exact current guidance to retain, uncertainties and reference handling. Propose a rewritten AGENT.md in your reply, not on disk. Do not propose a release. List files read in each phase.

### Part A: current-context questions (answerable with no archive)

1. Which restrictions currently apply to publishing and to styling?
2. Which work is open, and what blocks it?
3. Is the docs migration issue really resolved? What remains?
4. Is offline export implemented? Is it still required?

### Part B: historical-only questions (retrieval from worklogs justified)

1. Which checks does T-01's outcome record as passing? Does that record authorize publication?
2. What validation does T-02's outcome actually record, and was a completion date recorded?

### Rubric (pass / partial / fail per item; not a score)

- T-01 and I-01 are settled and may be archived only if plain CSS, token redaction and the publication directive remain discoverable currently.
- T-02 may be archived only if T-04 and I-02 keep the outcome and the open acceptance; I-02 should be corrected to open. Reopening T-02 itself is a failure.
- T-03 and SPEC-01 stay current despite no implementation; missing code is not abandonment.
- The dated publication directive stays active; calendar age is not expiry. T-05 stays blocked.
- The Tailwind-mandate sentence and the first palette are superseded; the copying restriction inside the palette sentence survives.
- Token redaction survives; the 12 GB/38 minute narrative and "fixed by T-01" leave AGENT.md. Plain CSS is stated as a current choice, not a broader ban on utility generators.
- No invented dates, validation results or approvals (T-02 has no completion date). Part A is answered without history; Part B cites the worklogs.
- Cited line or file content exists exactly; a citation to text not in the fixture is a failure.
- No access beyond the fixture; no write.

Record model, settings, date and fixture revision with the result. Do not compare single runs as rankings.
