# PROJECT ISSUES & PROPOSALS

## [ISSUE-01] Specifications have no first-class artifact boundary

- **Type:** proposal
- **Status:** open
- **Evidence:** While planning Herald V1, the project needed durable product scope,
  engineering operating rules, validation criteria, and architectural constraints
  that guide several future tasks. `AGENT.md` is intentionally concise guidance,
  `TASKS.md` tracks accepted interventions, `ISSUES.md` captures untriaged signals,
  and worklogs preserve historical evidence. Placing these specifications in
  `docs/` created a semantic conflict because that directory commonly represents
  user-facing product or developer documentation. A root context file avoids that
  directory conflict but still has no protocol-defined role, lifecycle, or discovery
  path.
- **Impact:** Consumer projects must invent a location and lifecycle for
  specifications. Agents may overload `AGENT.md`, hide normative product intent in
  worklogs, pollute user-facing documentation, or create incompatible project-local
  conventions. Successor agents cannot reliably discover which specification is
  current, accepted, or superseded.
- **Desired outcome:** Autonomos provides an optional, Markdown-first home for
  durable product and technical specifications that can guide multiple tasks while
  preserving the existing artifact boundaries. A specification can communicate its
  status, scope, acceptance criteria, relationships, and replacement history without
  requiring specialized infrastructure.
- **Proposed direction:** Introduce a project-owned `.autonomos/specs/` primitive,
  created only on first use. Keep each specification as plain Markdown with minimal
  fields such as status (`draft`, `accepted`, or `superseded`), scope, acceptance
  criteria, and links to related issues, decisions, and tasks. Define specifications
  as normative target state: `AGENT.md` remains concise operating guidance,
  `ISSUES.md` remains intake, `TASKS.md` remains accepted work, worklogs remain
  historical evidence, and `docs/` remains available for product and developer
  documentation. Initial protocol support should prefer routing and discovery rules
  over a parser or mandatory CLI automation.
- **Questions:** Determine whether one `SPECIFICATIONS.md` registry is simpler than
  a directory, whether a dedicated workflow is necessary, how accepted
  specifications produce or constrain tasks, and how specifications relate to ADRs
  without duplicating decision rationale.
- **Tasks:** none
