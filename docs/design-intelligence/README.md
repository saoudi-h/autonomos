# Design intelligence for AI-assisted interfaces

This directory records the first Autonomos proposal for avoiding generic
AI-generated interface convergence. It is a workflow and memory system, not a
new visual preset.

## Core model

```text
product truth + real content
            ↓
direction brief and explicit constraints
            ↓
2–3 structurally different concepts (when the choice is open)
            ↓
user/product-owner selection
            ↓
project-owned DESIGN.md contract
            ↓
implementation with real states and content
            ↓
rendered critique + deterministic checks
            ↓
accepted learning and controlled exceptions
```

The reusable part is the reasoning loop. The project-specific part is the
thesis, examples, prohibitions, vocabulary, data model, design system, and
evidence recorded in `DESIGN.md`. This distinction is essential: a global list
of good-looking examples would eventually become another template library.

The practical system has three cooperating layers:

- **Guidance:** `DESIGN.md` explains the reader's job, evidence hierarchy,
  composition decisions, vocabulary, anti-patterns, and accepted exceptions.
- **Primitives:** the project stylesheet, tokens, components, assets, and
  templates enforce repeatable mechanics without asking the model to reinvent
  every spacing or table rule.
- **Evaluation:** frozen scenarios, rendered comparisons, human review, and
  deterministic checks reveal whether a correction actually holds.

Autonomos supplies the method and routing. The project owns the visual
language and its implementation primitives.

## The reusable prototype

The installed protocol entrypoint is the compact
`packages/core/src/workflows/protocol-design.md`. The repo-local
`.agents/skills/design-direction/SKILL.md` is its detailed reference
implementation and research companion. It routes a request through four
concerns:

1. **Grounding:** audience, job, content/data, states, platform, constraints.
2. **Direction:** a thesis, domain anchor, system, signature, risks, and
   prohibitions derived from the grounding.
3. **Execution:** actual content, meaningful states, and focused specialist
   skills selected only when needed.
4. **Evidence:** alternatives, user selection, rendered inspection, hard gates,
   and a revision record.

The reference files keep the entrypoint small:

- `design-brief-template.md` — the project-owned contract to copy to
  `DESIGN.md`;
- `decision-tree.md` — questions and branches that determine workflow depth;
- `anti-defaults.md` — tests for interchangeable or unsupported output;
- `critique-rubric.md` — rendered evidence, hard gates, and reporting;
- `calibration-loop.md` — baseline/candidate/holdout evaluation procedure;
- `correction-promotion.md` — where a repeated correction should live;
- `scenario-template.md` — the frozen input and rubric record.

For a project with a real `DESIGN.md`, the bundled
`scripts/validate-design-contract.mjs` can check the contract's structural
completeness. It deliberately does not score visual quality.

## Relationship to existing skills

The supplied and researched skills should be composed, not stacked blindly:

- frontend-design practices contribute subject grounding, a visual thesis,
  signature, and explicit self-critique;
- Vercel's web-interface guidelines are a compliance and quality floor, not an
  art-direction engine;
- UI UX Pro Max is useful as a searchable catalog and stack-aware lookup, but
  its deterministic style/reasoning catalog must not be allowed to choose a
  project's identity;
- Emil Kowalski's design-engineering guidance strengthens motion, interaction,
  performance, and detail review after the direction exists;
- Cursor's design-space, prototype, verification, and decision-log patterns
  contribute comparison and evidence discipline;
- design-critique, design-system, handoff, UX-copy, accessibility, and research
  are separate judgment modes and should stay routable rather than becoming a
  single giant prompt.
- Vercel's calibration approach adds the missing feedback discipline: freeze
  scenarios, preserve baselines, encode corrections in the narrowest layer,
  and rerun before accepting a rule.

The source comparison and provenance are in `source-matrix.md`.

## Protocol v0.6 integration

The pilot is now exposed through one optional managed `/design` workflow in
Protocol v0.6.0-alpha. It carries the routing, grounding, human checkpoint,
rendered-review, correction-promotion, and additive-extraction rules. It does
not create or overwrite `DESIGN.md`, and it does not distribute a visual
preset. Existing projects can update their managed workflows, then use
`/design` to extract stable design knowledge into a project-owned contract and
reference area.

## What this does not claim yet

No source reviewed here proves that an agent can judge beauty objectively or
consistently produce original work. The prototype makes disagreement visible,
forces product-specific evidence, and narrows the human checkpoint; it does
not eliminate taste or guarantee novelty.

The H-06 through H-11 pilot covered operational, data-dense, and narrative
surfaces. It demonstrated identity continuity and exposed repeatable
anti-template corrections without making them universal bans. The remaining
validation is long-term use across real projects: production migration,
multi-surface regression, and whether the singular entry point stays easier to
learn than a larger workflow catalog.
