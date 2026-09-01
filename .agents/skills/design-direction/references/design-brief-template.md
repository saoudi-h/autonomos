# Project design contract

Copy this template to the target project's `DESIGN.md`. Keep it short enough
to be read before implementation and specific enough to constrain a new agent.
Replace every bracketed value. Do not leave a section as a generic moodboard.

```md
# Design direction — [project or product]

Status: draft | accepted | superseded
Scope: [product-wide | surface/route]
Owner: [person or team]
Last accepted: [YYYY-MM-DD]

## Product truth

- Audience: [specific people and situation]
- Primary job: [one verb + object + desired outcome]
- Product objects and relationships: [what the interface actually represents]
- Content/data shape: [density, length, freshness, status, source]
- Platform and input: [browser/device, pointer/touch/keyboard, constraints]
- Known constraints: [brand, stack, performance, accessibility, legal]
- Assumptions to validate: [explicit list]

## Direction thesis

- Thesis: [one sentence explaining what this interface should feel like and why]
- Emotional register: [a narrow, concrete range]
- Domain anchor: [physical place, tool, material, ritual, or behavior from the product world]
- Amplify: [one or two qualities that deserve disproportionate attention]
- Deliberately prohibit: [patterns that conflict with this product and why]
- Signature: [one memorable, reusable move tied to the product]
- Deliberate risk: [what is unusual, its upside, and its failure condition]

## System contract

- Composition and hierarchy: [layout grammar, focal order, navigation model]
- Geometry: [radius, edge, border, alignment, rhythm]
- Density: [sparse/compact/variable and how it changes by surface]
- Type roles: [display, heading, body, label, numeric/data; include rationale]
- Color roles: [background, surface, text, muted, accent, semantic states]
- Surface/material: [texture, depth, imagery, illustration, or deliberate absence]
- Motion principles: [what moves, why, duration/easing character, reduced-motion fallback]
- Component rules: [which primitives are meaningful and which are not]

## Content and state contract

- Vocabulary and voice: [specific words, grammar, tone, forbidden clichés]
- Required content: [real fields, examples, and hierarchy]
- Empty/loading/error/partial-failure states: [meaningful treatment]
- Long-content and high-density behavior: [wrapping, overflow, truncation]
- User feedback and destructive actions: [confirmation, undo, status feedback]

## Anti-default tests

- Subject-swap test: [what would look wrong if the product name changed?]
- Necessity test: [which visual choices would be removed if they had to be justified?]
- Distinction test: [what would a generic competitor likely do instead?]
- System-purity test: [which rules must remain true across every surface?]
- Known exceptions: [approved deviations and their reason]

## Evidence and change record

- Reference surfaces or artifacts: [links/paths and the constraint borrowed from each]
- Rendered checks: [viewports, states, devices, browser/harness]
- Open visual questions: [what remains inconclusive]
- Accepted changes: [date — change — reason — evidence]

## Calibration (only for recurring or high-impact work)

- Scenario(s): [path to frozen scenario records]
- Baseline: [prompt, inputs, model/configuration, viewport, render]
- Current candidate: [contract/primitive/check version and render]
- Observable rubric: [three to six criteria]
- Known corrections: [symptom — destination — status]
- Holdout result: [what changed, what held, what regressed]
- Next experiment: [one smallest uncertainty to test]
```

For a product with multiple surfaces, keep invariants here and place narrow
overrides in `docs/design/<surface>.md`. An override must name the invariant it
breaks and why the surface's content or task requires the break.
