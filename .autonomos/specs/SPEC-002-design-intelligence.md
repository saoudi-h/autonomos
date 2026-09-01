# SPEC-002 — Project-specific design intelligence

- **Status:** accepted
- **Owner:** Autonomos maintainers
- **Date:** 2026-09-01
- **Related issue:** ISSUE-02
- **Related tasks:** DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04
- **Prototype:** `.agents/skills/design-direction/SKILL.md`
- **Research:** `docs/design-intelligence/source-matrix.md`

## Problem

AI-assisted UI work can produce attractive fragments while converging on a
small set of recognizable templates. Generic design guidance may improve
surface polish without recovering product-specific identity. The agent also
often sees too little of the real content, data, states, and project history to
make a coherent design decision.

## Proposal

Add a project-owned, Markdown-first design-direction workflow. The reusable
meta-skill supplies routing, questions, exploration rules, anti-default tests,
and evidence requirements. The project supplies the actual design direction in
`DESIGN.md`: product truth, thesis, system, content/state contract, examples,
prohibitions, exceptions, and rendered evidence.

The workflow is intentionally a composition of judgment modes:

```text
ground → model content → propose divergent directions → select → lock contract
       → implement → render/critique → revise → preserve learning
```

## Requirements

### R1 — Product and content grounding

Before high-impact visual decisions, the agent must identify the audience,
primary job, product objects/relationships, content density, states, platform,
and constraints. It must use real or representative content and label
assumptions. Missing information that would change composition must be
resolved, not hidden behind a style adjective.

### R2 — Explicit project direction

An accepted direction must be discoverable in `DESIGN.md` or an existing linked
project equivalent. It must include a thesis, domain anchor, deliberate
amplification, prohibitions, signature, system roles, content voice, important
states, and known exceptions. A palette or font list alone does not satisfy
this requirement.

### R3 — Structural divergence before selection

When a high-impact direction is open, the agent must produce two or three
comparable direction cards or prototypes. At least four axes must differ,
including one structural axis. A palette/font/effect variation is not a
separate direction. The same product truth and representative content must be
used across candidates.

### R4 — Human ownership of consequential taste

The user or product owner selects an open direction when practical. If the
checkpoint is unavailable, the agent may proceed provisionally only when it
records rejected alternatives, rationale, and validation status.

### R5 — Coherent implementation

The selected direction is implemented as one system. Components, copy, real
states, motion, and effects must earn their place in the product's task and
content model. The agent must not merge unrelated directions into a collage.

### R6 — Evidence-based critique

Completion requires rendered inspection at relevant widths and states, a11y
and deterministic checks relevant to the surface, at least one revision pass,
and a report of limitations. Visual validation is `INCONCLUSIVE` when no visual
observation was possible.

### R7 — Focused specialist routing

Compliance, motion, design-system, copy, handoff, research, and catalog lookup
remain separate specialist concerns. The meta-skill chooses the smallest set
needed for the uncertainty instead of invoking all available skills.

### R8 — Optional protocol promotion boundary

The capability may be promoted as one optional `/design` workflow after pilot
acceptance. It must not make `DESIGN.md` mandatory for every project or turn a
project's visual direction into a global style preset.

### R9 — Calibration and narrow correction promotion

For a recurring or high-consequence artifact, the agent must be able to freeze
the prompt, content/input fixture, model/configuration, viewport, and contract
version; save a baseline; compare a candidate; and record the result. A
correction must be routed to the narrowest effective destination: project
guidance, a primitive/component, a deterministic check, or the evaluation
harness. Isolated model-specific mistakes remain provisional until they
repeat. Accepted changes must be rerun against the affected scenario and a
holdout when practical.

### R10 — Progressive artifact boundary

The user-facing entry point remains singular. A project may begin with only a
`DESIGN.md`; scenario records and a `.design/` directory are introduced only
when recurring work makes comparison and discovery worth the extra ceremony.
The contract may be rich and evolve over time, but accepted, provisional,
rejected, and superseded decisions must remain distinguishable.

## Non-goals

- defining a universal standard for beauty or originality;
- banning specific visual techniques across all products;
- replacing designers, user research, or product judgment;
- creating a larger style/palette/template catalog;
- requiring a Figma/Penpot/browser integration for the first prototype;
- requiring a fixed number of evaluation scenarios for every project;
- treating an agent's self-rating as visual evidence;
- making `DESIGN.md` or scenario records mandatory for every project.

## Pilot acceptance criteria

Run the workflow on at least three different surface types, including one
operational/data-dense surface and one narrative or marketing surface. Record
for each:

- whether the first brief contains product-specific content and a defensible
  thesis;
- whether the alternatives differ structurally rather than cosmetically;
- number and category of human correction loops;
- generic-pattern findings from the anti-default tests;
- rendered and deterministic review results;
- whether a new agent can extend the selected direction from `DESIGN.md`;
- whether a repeated correction is prevented after being promoted to guidance,
  a primitive, or a check;
- whether a holdout surface avoids regressions;
- time and friction added by the workflow.

The prototype is worth promoting only if it reduces correction cost or improves
direction coherence without imposing unacceptable ceremony, and if failures
are legible enough to improve the rules. No numerical quality threshold is
declared before the baseline and pilot are observed.

## Pilot result and promotion decision

The H-06 through H-11 calibration sequence supplied sufficient evidence for a
lightweight protocol capability. H-10 showed that one Herald identity could
survive Calendar, Queue, and Compose without forcing one layout or density.
H-11 showed that the same roles could transfer to a non-dashboard landing
composition; the owner stopped abstract iteration once the fundamentals were
stable and identified real proof/content as the next source of distinction.

The pilot also exposed repeatable corrections: colored foundations, universal
card and border grammar, arbitrary contextual panels, uppercase wide-tracked
labels, and style decisions detached from product content. Those findings are
now project-owned Herald rules, not global visual prohibitions. The workflow is
promoted as an optional `/design` entry point in Protocol v0.6.0-alpha. It
keeps the user checkpoint, real-content grounding, structural comparison,
rendered review, narrow correction promotion, and additive knowledge
extraction, while leaving the contract's depth and artifact shape adaptable.

Remaining evidence gaps are production migration, long-term multi-surface
regression, and the final Herald public proposition. They remain explicit
follow-up work rather than hidden acceptance assumptions.

## Open questions

- Should a future project use one root `DESIGN.md` with surface overrides, or a
  structured `.design/` directory when the contract grows?
- What is the smallest useful browser/screenshot harness for reliable visual
  evidence in Autonomos?
- How should the workflow support teams that have an existing brand system but
  need a new product-specific expression?
- Which critique findings can be made deterministic without flattening taste
  into a checklist?
- What baseline projects and human rating protocol make the pilot comparable?
