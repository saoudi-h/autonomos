# Anti-default heuristics

These are diagnostic tests for interchangeable output. They are not a style
blacklist. A pattern can pass when the content, task, and system give it a
specific job.

## Signals to investigate

- a hero made from a giant headline, soft gradient, glow, and generic call to
  action before the product proposition is clear;
- the same sequence of hero, feature cards, testimonial, pricing, and CTA for
  unrelated products;
- cards, pills, badges, dividers, or floating panels used as universal grammar
  instead of meaningful grouping;
- a dark dashboard with neon accent, arbitrary metrics, and decorative charts
  where the data model is unknown;
- oversized display type or a serif/sans pairing chosen as a personality
  substitute rather than for a content or reading reason;
- subtle hover lifts, cursor effects, scroll reveals, and staggered entrances
  added as an effect quota;
- copied “premium”, “editorial”, “brutalist”, or “bento” vocabulary without a
  product-specific thesis;
- placeholder copy, fake metrics, generic testimonials, or empty states that
  hide what the interface is actually for;
- a collection of attractive components whose spacing, hierarchy, and behavior
  do not belong to one system;
- a design that would remain unchanged if the product, audience, and data were
  swapped.

## Tests

### Subject-swap test

Replace the product name and content with an unrelated subject. If the layout,
copy shape, imagery, and focal hierarchy still feel equally correct, the
direction is probably not grounded enough.

### Necessity test

For each prominent visual choice, state its job:

- Does it clarify the product or task?
- Does it organize or distinguish real content?
- Does it communicate state, continuity, or feedback?
- Does it create a deliberate memory hook tied to the domain?

If none apply, remove it and compare the render again.

### Coherence test

Inspect a page as a whole rather than collecting good fragments. Check whether
type, geometry, spacing, color roles, surfaces, motion, copy, and empty states
express the same thesis. One polished component cannot compensate for a mixed
language.

### System-purity test

The selected direction should be explainable in a few rules and should survive
new content without a new one-off treatment for every section. If every
component needs an exception, the system is not yet coherent.

### Reference-discipline test

For every external reference, record what was borrowed and why. Prefer a
mental model, constraint, interaction, or material behavior over a screenshot's
surface. Reject a reference that would make the product look like its source
without improving the user's task.

## Response when a signal is found

1. Identify the exact rendered symptom.
2. Link it to missing product truth, an unsupported choice, or a contract
   contradiction.
3. Try subtraction or a structural alternative before adding another effect.
4. Re-render the smallest meaningful comparison.
5. Record the accepted correction or unresolved preference.
