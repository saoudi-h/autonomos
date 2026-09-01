# ADR-002 — Keep design intelligence project-specific and evidence-led

- **Status:** accepted
- **Date:** 2026-09-01
- **Related:** ISSUE-02, DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, SPEC-002

## Context

Current AI design guidance falls into several useful but incomplete groups:
visual-direction prompts, compliance checklists, motion craft, design-system
catalogs, critique workflows, and prototype/verification tools. Combining all
of them into one universal prompt would increase instruction volume while still
encouraging the agent to select familiar templates. A project also needs a
durable place to express its own content-derived identity.

The supplied August 31, 2026 Vercel case study adds a practical finding: a
guidance file became reliable only when paired with bounded implementation
primitives and a repeatable evaluation loop. Their fixed scenarios, baselines,
human corrections, and deterministic checks let them distinguish a useful
general rule from a one-off failure. This is evidence for the process shape,
not proof that an agent can judge beauty objectively.

## Decision

Prototype a small meta-skill, `design-direction`, with four layers:

1. **Reusable reasoning:** questions, routing, structural divergence,
   anti-default tests, and critique gates.
2. **Project-owned contract:** `DESIGN.md` holds the product truth, thesis,
   system, content/state rules, examples, prohibitions, exceptions, and
   evidence.
3. **Focused specialists:** compliance, motion, design-system, copy, handoff,
   research, and catalog lookup are invoked only for the current uncertainty.
4. **Evidence loop:** direction cards, human selection, rendered inspection,
   deterministic checks, revision, and captured learning.

For recurring work, the evidence loop freezes a scenario, preserves a baseline,
classifies each correction, promotes it to the narrowest layer, and reruns the
affected scenario before accepting it. A holdout is used when practical.

The first artifact remains optional and Markdown-first. The H-06 through H-11
pilot demonstrated enough value to promote one concise, managed `/design`
workflow in Protocol v0.6.0-alpha. The workflow distributes reusable routing
and evidence rules; `DESIGN.md`, examples, and visual identity remain
project-owned and are never created or overwritten by protocol updates.

## Alternatives considered

### Add more global design rules

Rejected. This improves consistency but risks turning today's anti-slop advice
into tomorrow's shared template.

### Use a large style/palette catalog as the generator

Rejected as the primary path. Catalogs are useful for retrieval and option
discovery, but deterministic mappings from product keywords to styles are
precisely the kind of convergence this effort is trying to control.

### One giant skill containing every design concern

Rejected. Creative direction, content modeling, motion, accessibility,
handoff, and critique require different evidence and failure handling. A router
with focused specialists is easier to inspect and evolve.

### Fully autonomous selection

Deferred. The agent may make a provisional choice with explicit uncertainty,
but consequential taste and positioning should have a user/product-owner
checkpoint until the pilot shows a reliable alternative.

### A project `DESIGN.md` without calibration

Rejected as incomplete. A static contract can preserve intent, but without
fixed scenarios and regression evidence it is difficult to know whether a new
rule helped, was loaded, or damaged another surface.

## Consequences

Positive:

- each project's identity becomes discoverable and reproducible;
- agents are forced to see content, data, states, and constraints before style;
- visual alternatives can be compared on structure and tradeoffs;
- compliance and motion expertise can be reused without defining the aesthetic;
- failure and disagreement become records that can improve the framework.

Costs and risks:

- a brief and comparison pass add time to high-impact work;
- a weak user checkpoint can still select a weak direction;
- `DESIGN.md` can become stale or overgrown without ownership;
- rendered evidence may be unavailable in some harnesses;
- anti-default tests can become dogma if treated as bans rather than diagnosis.

## Revisit trigger

After production use across several projects, revisit whether the singular
entry point, project-owned contract, human checkpoint, and evidence loop reduce
correction cost without accumulating BMAD-like ceremony. Revisit the artifact
bundle only if the optional workflow proves insufficient in practice.
