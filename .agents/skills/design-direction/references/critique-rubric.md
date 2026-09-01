# Rendered design critique rubric

Use this after implementation or when comparing direction prototypes. Score
each dimension from 0 to 3, but do not average away a hard failure.

| Dimension                | 0                            | 1                        | 2                              | 3                                             |
| ------------------------ | ---------------------------- | ------------------------ | ------------------------------ | --------------------------------------------- |
| Product fit              | Interchangeable or wrong job | Job is implied           | Job is clear                   | Product truth shapes the experience           |
| Content fidelity         | Placeholder or invented data | Happy path only          | Real content and common states | Stress and failure states are designed        |
| Task hierarchy           | First action unclear         | Competing focal points   | Primary path is legible        | Hierarchy makes the task feel inevitable      |
| System coherence         | Mixed visual languages       | Local consistency only   | Shared roles and grammar       | New content fits without special pleading     |
| Distinction              | Generic template             | Minor surface difference | Recognizable thesis            | Memorable and defensible signature            |
| Responsive resilience    | Breaks or hides content      | Narrow fixes are ad hoc  | Relevant widths work           | Composition adapts intentionally              |
| Interaction quality      | Unclear or inaccessible      | Works with friction      | States and feedback are clear  | Motion/feedback has purpose and restraint     |
| Accessibility/compliance | Hard gate failure            | Several violations       | Baseline passes                | Baseline passes under stress and alternatives |
| Implementation fidelity  | Render contradicts brief     | Major drift              | Direction is recognizable      | System and exceptions match the contract      |

## Hard gates

The result cannot be called ready when any of these is true:

- the primary task or real product content is missing;
- keyboard, focus, contrast, semantic, or reduced-motion requirements fail in a
  way relevant to the surface;
- essential empty, loading, error, destructive, or partial-failure states are
  absent;
- a high-impact open direction was never selected or is presented as validated
  without a user checkpoint;
- the result has not been rendered at the relevant viewport(s), or visual
  validation is being claimed without an available visual observation.

## Minimum review pass

1. Read the brief and state the claim being tested, such as “the first-time
   user can understand the workspace in five seconds.”
2. Inspect the first viewport for focal point, proposition, density, and visual
   noise before reading the implementation.
3. Drive the primary task with realistic short, long, empty, loading, error,
   and populated content.
4. Inspect at the relevant wide and narrow widths; use 375/768/1280 as a
   fallback for a web surface when no product-specific sizes exist.
5. Check keyboard navigation, focus visibility, semantic structure, contrast,
   reduced motion, touch targets, overflow, and text scaling.
6. Classify each finding as deterministic, product, direction, or preference.
7. Make at least one revision pass. Remove one unsupported accessory before
   the final inspection.

## Reporting format

Use a compact table for material changes:

| Before             | After                 | Why                        | Evidence                 |
| ------------------ | --------------------- | -------------------------- | ------------------------ |
| [specific symptom] | [specific correction] | [product/direction reason] | [viewport, state, check] |

Report `PASS`, `FAIL`, or `INCONCLUSIVE` per gate. “Inconclusive” is the right
answer when the browser, screenshot, user checkpoint, or required content is
unavailable.
