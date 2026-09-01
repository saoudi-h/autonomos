# PROJECT ISSUES & PROPOSALS

## [ISSUE-02] AI-assisted interfaces converge on recognizable template slop

- **Type:** proposal
- **Status:** resolved
- **Evidence:** The user reports that current AI-assisted interface generation can
  produce polished fragments while repeatedly converging on a small set of
  recognizable visual patterns. The result often ignores the product's actual
  content, lacks a coherent project-specific art direction, and requires costly
  human iteration to correct defects that the agent does not reliably notice.
- **Impact:** Autonomos has no reusable way to make an agent discover a distinct
  visual direction, connect design decisions to real product data, reject generic
  or AI-signaling patterns, and preserve the resulting design language for later
  tasks. Merely adding more generic design rules risks reproducing the same
  convergence problem at a higher level.
- **Desired outcome:** A Markdown-first, project-owned design operating system
  that begins with art-direction discovery, branches on product context, records
  decisions and examples, guides implementation and critique, and evaluates
  outputs for coherence, originality, usability, and fidelity to the source
  material. It should be possible to reuse generic principles without forcing a
  generic visual result.
- **Proposed direction:** Research existing design-oriented agent skills and
  workflows, including the supplied repositories, then extract a small
  meta-skill plus project-specific artifacts. Treat anti-template rules as
  heuristics and review gates rather than a universal visual style. Pilot the
  model before changing the core Autonomos protocol or making new artifacts
  mandatory for all projects.
- **Questions:** Which existing practices materially improve design outcomes?
  What questions and branching decisions are needed to derive a genuinely
  project-specific direction? Which rules belong in the reusable meta-skill,
  which belong in a project's art-direction record, and how can visual review
  become more reliable than subjective back-and-forth?
- **Tasks:** DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04
- **Resolution:** The H-06 through H-11 pilot produced an optional, concise
  `/design` workflow for Protocol v0.6.0-alpha. It grounds decisions in
  product content, keeps project identity in an optional `DESIGN.md`, routes
  scattered knowledge through a reviewable source → destination map, and
  requires rendered evidence without imposing a universal visual style.

## [ISSUE-01] Specifications have no first-class artifact boundary

- **Type:** proposal
- **Status:** resolved
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
- **Resolution:** Protocol v0.5.0-alpha adopts optional Markdown-first `specs/` and
  `decisions/` directories, keeps `init` and `update` non-destructive, and adds the
  explicit `/adopt` workflow for reviewable legacy-knowledge migration. No parser or
  automatic historical rewrite is included.
- **Tasks:** PROTO-13
- **Artifacts:** [SPEC-001](specs/SPEC-001-project-knowledge-artifacts.md), [ADR-001](decisions/ADR-001-project-knowledge-and-adoption.md)
