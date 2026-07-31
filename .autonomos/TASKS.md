# PROJECT TASKS & ROADMAP

> **LEGEND**
> **Priority:** [🔴 Critical] [🟠 High] [🔵 Medium] [⚪ Low]
> **Complexity:** [S] Small (1h), [M] Medium (4h), [L] Large (1-2 days), [XL] Huge (Planning req.)
> **Status:** [ ] Todo, [/] In Progress, [x] Done, [!] Blocked

## 🚀 Active Sprint

### CLI Improvements

- [x] **[CLI-01]** Add `--help` / `-h` flag with detailed usage info `Priority: 🔴` `Complexity: S`
- [x] **[CLI-02]** Implement `autonomos agents` command (list AGENT.md files) `Priority: 🟠` `Complexity: M`
    - Tree-like output showing AGENT.md hierarchy
    - `--all` flag: list from project root
    - `--local` flag (default): list from current directory
- [x] **[CLI-03]** Add `--dry-run` flag to `init` (preview without writing) `Priority: 🔵` `Complexity: S`
- [x] **[CLI-04]** Implement `autonomos status` command (show protocol version, tasks summary) `Priority: 🔵` `Complexity: M`
- [x] **[CLI-05]** Add colorized output with chalk/picocolors `Priority: ⚪` `Complexity: S`

### Core Enhancements

- [x] **[CORE-01]** Add AGENT.md parser (extract sections, metadata) `Priority: 🟠` `Complexity: M`
- [x] **[CORE-02]** Create worklog template and generator function `Priority: 🔵` `Complexity: S`
- [x] **[CORE-03]** Add JSON Schema validation for manifest.json `Priority: ⚪` `Complexity: S`
- [x] **[META-01]** Improve NPM metadata and LICENSE inclusion `Priority: 🟠` `Complexity: S`

### Protocol Refinements

- [x] **[RELEASE-01]** Validate and publish Protocol v0.4 with coordinated Core and CLI releases `Priority: 🔴` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-RELEASE-01-v0.4.md*
- [x] **[PROTO-06]** Audit protocol information architecture and register focused remediation tasks `Priority: 🟠` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-06-information-architecture-audit.md*
    - Examine memory placement, artifact ownership, drift correction, and the distinction between reported problems and implementation tasks.
    - Produce scoped follow-up tasks without changing the shipped protocol behavior in the same session.
- [x] **[PROTO-07]** Define durable-memory admission, placement, and retirement rules `Priority: 🔴` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-07-durable-memory.md*
    - **Observed problem:** `session.md`, `task.md`, and `crystallize.md` instruct agents to write every new learning to an `AGENT.md`, sometimes twice in the same session. They do not distinguish durable project guidance from incident evidence, transient measurements, completed actions, or component documentation.
    - **Impact:** root context files grow into chronological logs, duplicate worklogs, consume context on every session, and preserve obsolete facts as if they were current rules.
    - **Expected behavior:** define a small admission test for durable memory, require the narrowest applicable scope, prefer existing component documentation for operational knowledge, and treat worklogs as historical evidence. Crystallization must replace, consolidate, or retire obsolete guidance rather than append indefinitely.
    - **Constraint:** keep the workflow concise and neutral; do not require metadata on every memory entry or introduce a database.
- [x] **[PROTO-08]** Add an evidence-aware protocol reconciliation workflow `Priority: 🟠` `Complexity: L` *See: .autonomos/worklogs/2026-07-31-PROTO-08-reconciliation.md*
    - **Need:** protocol artifacts accumulate duplicates, misplaced knowledge, stale paths, ambiguous wording, broken references, and contradictions after architecture or strategy changes.
    - **Expected behavior:** introduce an explicit maintenance workflow that audits current-state artifacts, distinguishes historical records from normative guidance, verifies claims against authoritative repository evidence, and checks referential consistency across context, reports, tasks, worklogs, and protocol metadata.
    - **Correction policy:** automatically correct only deterministic findings with sufficient evidence. Preserve history, explain every material correction, and report uncertain semantic conflicts to the user for joint resolution instead of guessing.
    - **Artifact boundary:** distinguish project-owned current state, historical records, and version-pinned protocol artifacts. A consumer agent must not edit installed protocol files; a mismatch against the published content for the declared version is deterministic drift that reconciliation may repair through the supported update path.
    - **Quality bar:** make the workflow idempotent, bounded, and safe by default; avoid turning it into a general-purpose governance engine. Consider a later `autonomos audit` command only if the workflow proves useful in practice.
- [x] **[PROTO-09]** Enforce immutable protocol artifacts per published version `Priority: 🟠` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-09-artifact-integrity.md*
    - **Invariant:** for one protocol version, `PROTOCOL.md` and every distributed harness workflow have canonical content published by Autonomos. Agents using the protocol in consumer projects treat those files as read-only.
    - **Evolution path:** protocol development occurs in this repository. A content change creates a new protocol version and coordinated Core/CLI releases; `autonomos update` may then replace the managed copies in consumer projects with that canonical artifact set.
    - **Expected behavior:** define and test version/content parity, make ownership explicit in the documentation, and detect local edits or mixed-version workflow sets without treating supported CLI replacement as a violation of immutability.
    - **Out of scope:** Autonomos does not decide which project artifacts belong in Git. Worklog visibility and version-control policy remain project-owned concerns.
- [x] **[PROTO-10]** Separate problem and proposal intake from implementation tasks `Priority: 🟠` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-10-issue-intake.md*
    - **Observed problem:** `TASKS.md` is simultaneously used to report a problem, choose a solution, track execution, and preserve rationale. Creating a task too early frames an untriaged issue as a predetermined implementation.
    - **Design question:** evaluate a lightweight issue/proposal artifact that records the observed or desired state independently from the chosen intervention. One issue may lead to zero, one, or several tasks; direct and obvious user requests must still be allowed to become tasks without ceremony.
    - **Expected behavior:** tasks describe an accepted course of action and completion criteria, while issues describe evidence, impact, and desired outcome without prescribing a solution. Define simple links and lifecycle rules before adding parser or CLI support.
    - **Constraint:** the artifact should remain optional and plain Markdown so small projects keep the current low-friction workflow.
- [x] **[PROTO-11]** Align session startup with user intent and scoped context loading `Priority: 🔴` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-11-intent-first-session.md*
    - **Observed problem:** `/session` always selects the globally highest-priority unfinished task and reads every `AGENT.md`, even when the user supplied a different explicit request. `/task` already uses the more scalable ancestor chain but is not consistently composed with session startup.
    - **Impact:** an agent can mutate an unrelated task merely to satisfy the protocol, announce work it will not perform, and load irrelevant or contradictory context from distant packages.
    - **Expected behavior:** an explicit user request takes precedence and is matched to an existing task or captured through the intake model; backlog priority is used only when the user asks for the next task or provides no scoped objective. Load root context first, then the ancestor chain for the selected scope.
    - **Validation:** specify the session/task composition once and add regression scenarios for explicit requests, resumed tasks, new reports, and an empty backlog.
- [x] **[PROTO-12]** Respect interaction authority and represent partial outcomes honestly `Priority: 🔴` `Complexity: M` *See: .autonomos/worklogs/2026-07-31-PROTO-12-user-authority.md*
    - **Observed problem:** mandatory startup and crystallization writes can conflict with a user who requested analysis or read-only work. Close-out currently requires `[x]` or `[!]`, although a legitimate session may leave a task in progress without being blocked.
    - **Impact:** following the protocol literally can broaden authorization, create artificial tasks, modify unrelated state, or report completion/blockage inaccurately.
    - **Expected behavior:** user authorization and requested interaction mode always bound protocol side effects. Permit read-only sessions without repository mutation, preserve `[/]` for honest partial progress, and reserve `[!]` for a concrete dependency that prevents progress.
    - **Validation:** cover answer-only requests, diagnostics without fixes, interrupted implementation, genuine blockage, and completed work.
- [x] **[PROTO-01]** Define AGENT.md frontmatter spec (YAML metadata) `Priority: 🟠` `Complexity: M`
- [x] **[PROTO-02]** Add "Quick Reference" section to PROTOCOL.md `Priority: 🔵` `Complexity: S`
- [x] **[PROTO-03]** Define standard sections for package-level AGENT.md `Priority: ⚪` `Complexity: S`
- [x] **[PROTO-04]** Protocol v0.3 refactoring: shorten workflows, remove duplication, fix paths `Priority: 🔴` `Complexity: L` *See: .autonomos/worklogs/2026-06-13-PROTO-04-v03-refactoring.md*
- [x] **[PROTO-05]** Preserve the substantive user-facing result when crystallizing a session `Priority: 🟠` `Complexity: S`
    - **Observed failure:** the mandatory `RESPOND with exactly` three-line report in `crystallize.md` can replace the answer to the user's original request. The user receives only a task status, a worklog path, and AGENT.md status after the agent has completed investigation or implementation.
    - **Why this is poor UX:** worklogs are durable context for successor agents, not the primary handoff for the user who initiated the work. Depending on the client, the path may not be clickable, requiring manual navigation and several extra actions before the user can learn the outcome.
    - **Expected behavior:** the agent must first deliver a self-contained answer to the original request (outcome, evidence, relevant limitations and next action). Crystallization status may remain available as a concise supplementary handoff, but must not displace that answer.
    - **Scope:** revise the executable workflow wording and its tests/templates as needed; retain autonomous worklog and AGENT.md capture. Decide explicitly whether the status handoff is appended, emitted through a separate channel, or otherwise structured without creating contradictory terminal-response instructions.

### Testing & Quality

- [x] **[TEST-01]** Add unit tests for TaskParser `Priority: 🟠` `Complexity: M`
- [ ] **[TEST-02]** Add integration tests for CLI commands `Priority: 🔵` `Complexity: L`
- [ ] **[TEST-03]** Add E2E test: init → update → status workflow `Priority: ⚪` `Complexity: L`

### CLI Bugfixes (2026-06-18)

- [x] **[BUG-01]** Fix `init` git detection from subdirectories + fix `bin` name + `update` devDependency refresh `Priority: 🔴` `Complexity: M` *See: .autonomos/worklogs/2026-06-18-BUG-01-init-fixes.md*
    - `init` only checked `.git` in cwd → silently installed in monorepo subpackages
    - `bin: { cli: ... }` in cli package.json → `pnpm autonomos` failed
    - Older CLIs (v0.2.0) pinned `^0.2.0` in devDep which is not on the registry
- [x] **[BUG-02]** Publish patch releases for `@autonomos/cli` and `@autonomos/core` via changesets `Priority: 🔴` `Complexity: S` *Published: 0.3.1 on npm*

### Documentation

- [x] **[DOC-01]** Create README.md for @autonomos/core `Priority: 🟠` `Complexity: S`
- [x] **[DOC-02]** Create README.md for @autonomos/cli `Priority: 🟠` `Complexity: S`
- [x] **[DOC-03]** Add CLI usage examples to root README.md `Priority: 🔵` `Complexity: S`

## 🔮 Backlog

### Future Ideas

- [ ] **[FUTURE-01]** MCP Server package (@autonomos/mcp-server) `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-02]** VSCode extension for AGENT.md navigation `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-03]** Web dashboard for project task visualization `Priority: ⚪` `Complexity: XL`
- [ ] **[FUTURE-04]** GitHub Action for protocol validation `Priority: ⚪` `Complexity: L`
