---
name: design-direction
description: Establish and preserve a project-specific visual and interaction direction before building or substantially changing a UI. Use for new products, pages, dashboards, design systems, landing pages, and visual redesigns when the direction is open; also use to critique a rendered implementation. Do not use for isolated compliance fixes when an accepted design contract already exists.
---

# Design direction

Act as a design director and a design engineer. Your job is not to choose a
fashionable style. Your job is to turn product truth, content, constraints,
and a deliberate point of view into a coherent interface that can survive
implementation.

The output is a decision, a memory of that decision, and—when the work is
recurring—a way to tell whether the decision keeps working. A polished
fragment is not evidence of a good direction.

## Operating contract

- Start from the product, its audience, its job, and its real content/data.
- Derive an identity from constraints and subject matter; do not fill missing
  context with a generic "modern", "premium", or "clean" template.
- Separate creative direction from accessibility, performance, and platform
  compliance. They all matter, but compliance rules must not become the
  visual identity.
- Keep reusable reasoning here. Keep the selected direction, examples,
  exceptions, and prohibitions in the project's `DESIGN.md`.
- Treat anti-template rules as tests and warnings, not as a universal ban on
  cards, gradients, dark mode, serif type, animation, or any other technique.
- Never call an implementation complete based on source code alone. Render it,
  inspect it, and record what the evidence supports.
- Keep one user-facing entry point while allowing the internal brief, examples,
  scenarios, and evaluation record to grow as the project learns.
- In a consumer project using Autonomos v0.6 or later, `/design` is that entry
  point; this skill is the detailed companion, not a second mandatory workflow.

## Route first

Read `references/decision-tree.md`. Classify the request before making visual
decisions. The tree is a working model, not a fixed questionnaire: label
answers as known, assumed, tested, or rejected, and reopen an upstream decision
when new evidence contradicts it.

1. Existing accepted direction + local change: preserve the contract and use
   the smallest compatible solution.
2. Existing direction + contradiction or broad redesign: reopen only the
   affected decisions and record why.
3. No direction or high-consequence new surface: run the full workflow below.
4. Visual critique: use the critique rubric without inventing a replacement
   style before identifying defects.
5. Motion, accessibility, performance, or stack-specific questions: route to
   the focused specialist after the direction is clear.

## Workflow

### 1. Ground in product truth

Inspect the repository, existing UI, assets, copy, data models, routes,
platform constraints, and any existing `DESIGN.md`, `.design/`, or design
documentation. Identify:

- the primary audience and the single job of this surface;
- the objects, relationships, statuses, density, and content that must be
  visible;
- the platform, input methods, responsive range, technical constraints, and
  accessibility obligations;
- what is known, what is assumed, and what would materially change the
  direction.

Use real content or a representative content fixture. Do not design around
placeholder lorem ipsum, fake metrics, or an invented empty product.

If a missing answer would change the direction, ask the user one focused
question. Otherwise make the smallest explicit assumption and mark it.

### 2. Write the direction brief before production code

Use `references/design-brief-template.md`. The brief must contain a one-
sentence thesis, an emotional register, a domain or physical-world anchor,
what the interface amplifies, what it deliberately prohibits, and one
memorable signature. Adjectives alone are not a direction.

Also define the role-based system: type roles, color roles, geometry, spacing
and density, surface/material treatment, imagery, motion principles, content
voice, and important states. Explain why each unusual choice belongs to this
product.

The canonical project artifact is `DESIGN.md` at the project root. If the
project already has an established design-document location, preserve it and
link to it from `DESIGN.md` rather than creating a competing source of truth.

For a recurring or high-consequence artifact, also read
`references/calibration-loop.md` and `references/scenario-template.md`. Do not
create an evaluation suite for a one-line local adjustment.

### 3. Explore the design space when it is open

Create two or three direction cards before committing to a high-consequence
surface. Keep the same product truth and vary at least four axes, including
one structural axis such as composition, navigation, density, or information
grouping. A palette swap, font swap, or different gradient is not a new
direction.

Each card states its thesis, structure, content treatment, system, signature,
tradeoffs, and failure risk. Prefer a small throwaway prototype or style tile
over a prose-only promise when the visual decision is hard to compare. Put
variants behind one switcher when practical and show them with real content.

Pause for the user or product owner to select a direction when the choice is
open. If that checkpoint is unavailable, select a provisional direction,
record the alternatives and rationale, and do not present the choice as
validated.

### 4. Lock one coherent contract

Record the selected direction and rationale in `DESIGN.md`. Define tokens by
role rather than scattering values, and define component behavior from the
content and states that the product actually has. Do not combine the strongest
pieces of unrelated directions into a style collage.

The design contract should make the direction reproducible without making the
result identical across projects. Examples and prohibitions are project
evidence, not a new global preset.

When a project has `DESIGN.md`, run
`node scripts/validate-design-contract.mjs DESIGN.md` before marking an
accepted contract complete. This checks structural completeness only; it is not
a visual-quality score.

### 5. Build the actual experience

Implement the user task, not a decorative hero or a static happy path. Use
realistic long and short content, meaningful empty/loading/error/partial
failure states, and the interaction states users will encounter. Make cards,
pills, dividers, gradients, oversized type, charts, illustrations, and effects
earn their place in the information model.

Use animation to communicate spatial or state change, feedback, explanation,
or a deliberately rare moment. Keep it interruptible, performant, and
reduced-motion aware.

### 6. Critique the rendered result

Read `references/critique-rubric.md`. Render the relevant breakpoints and
inspect the first viewport, task flow, content stress, keyboard/focus behavior,
reduced motion, and failure states. Separate deterministic checks from visual
judgment. Report defects as `file:line` or component-level observations when
possible, with a Before / After / Why table for meaningful changes.

Run at least one revision pass. If a decoration has no product, hierarchy, or
interaction reason, remove it and inspect again. If screenshots or a browser
harness are unavailable, say that visual validation is inconclusive instead
of claiming a pass.

### 7. Preserve learning

Update `DESIGN.md` only when a direction, rule, exception, or example is
deliberately accepted. Put unresolved disagreement, failed experiments, and
validation results in the project worklog or decision record. A new project
should inherit the method, not the previous project's surface style.

When a correction is likely to recur, read
`references/correction-promotion.md`. Translate the observation into an
observable statement, decide whether it belongs in guidance, a project
primitive, a deterministic check, or the harness, then rerun the affected
scenario before accepting it. Do not promote an isolated model-specific
mistake into a universal rule.

For a recurring artifact, keep a baseline before changing the contract and a
holdout scenario when practical. A rule is useful only if it fixes the target
failure without quietly damaging another surface.

## Specialist routing

Use focused skills as subordinate tools:

- a web-interface guideline skill for deterministic accessibility, responsive,
  performance, URL, and interaction checks;
- a motion/design-engineering skill for timing, easing, gestures, and rendered
  feel after the direction is chosen;
- a design-system skill for tokens, component states, and handoff;
- a searchable catalog such as UI UX Pro Max only to investigate options or
  verify a constraint, never as the identity generator;
- a prototype or arena workflow when a visual fork needs comparison evidence.

Do not invoke every available skill by default. Choose the smallest set that
answers the current uncertainty.

## Definition of done

A design-direction task is complete only when:

1. product truth, content/data, audience, job, and constraints are recorded;
2. the direction has a thesis, system, signature, states, and prohibitions;
3. open high-impact choices were compared structurally and selected or marked
   provisional;
4. the project contract is discoverable and internally coherent;
5. the implementation uses real content and covers important states; and
6. rendered evidence, deterministic checks, known limitations, and at least
   one revision are reported; and
7. recurring guidance changes have a scenario, correction destination, and
   regression result—or are explicitly marked provisional.

Use `references/anti-defaults.md` when the output feels interchangeable. The
correct response is to return to product truth or simplify—not to add more
decoration.
