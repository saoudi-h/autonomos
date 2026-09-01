# Design-direction decision tree

Use this tree before generating a design or asking another design skill to do
so. The branches select the depth of work; they do not select a visual style.

## Living state

Record important answers with one of four states: **known** (observed in the
project), **assumed** (a reversible choice), **tested** (checked against a
render or scenario), or **rejected** (considered and intentionally dropped).
Early project work may move backwards. If a tested choice conflicts with new
content, a user correction, or a failed scenario, reopen the earliest affected
node instead of adding a local exception.

## Entry questions

1. Is the request about a user-facing visual, interaction, content, or layout
   decision?
    - No: use the normal engineering workflow.
    - Yes: continue.

2. Is there an accepted project `DESIGN.md` or equivalent contract?
    - Yes: does the request preserve its audience, job, content model, and
      visual grammar?
        - Yes: make the smallest compatible change and run the relevant critique.
        - No or unclear: reopen only the affected decisions; do not silently
          fork the visual language.
    - No: continue to grounding.

3. Is this a local adjustment, a new surface, or a product-level redesign?
    - Local adjustment: infer the nearest existing pattern and verify it.
    - New surface: run the full brief and direction selection if impact is high.
    - Product redesign: inventory current content, behavior, and failure modes
      before proposing a new system.

## Grounding questions

Answer these from the repository or user; do not replace them with style
adjectives:

- Who is using this, in what situation, and what must they accomplish first?
- What is the most specific product truth a generic competitor would not have?
- Which objects, relationships, statuses, and quantities are real?
- What must be scanned, compared, edited, remembered, or trusted?
- What does the content look like at its shortest, longest, emptiest, and most
  failed states?
- What are the platform, input, responsive, accessibility, and performance
  constraints?
- What existing brand or interface decisions are authoritative?
- Which uncertainty would change the composition rather than only a token?

If the last answer has a material unknown, pause and resolve it before visual
exploration.

## Surface route

Classify the surface by its dominant job. Use the route to change the questions
and evidence, not to load a preset:

- **Operational product/workspace:** optimize scan order, density, continuity,
  keyboard flow, and state visibility. Empty space must clarify priority.
- **Data-heavy/dashboard:** define comparison and decision tasks first. Avoid
  charts, metrics, and grids that do not answer a named question.
- **Marketing/brand:** establish a proposition, audience tension, proof, and
  conversion path. The hero is a thesis, not a decorative billboard.
- **Editorial/content:** design reading rhythm, hierarchy, metadata, and long
  content. Do not force every section into a card.
- **Commerce/service:** expose trust, choice, price/availability, progress, and
  recovery. Treat transactional and error states as part of the experience.
- **Immersive/experimental:** define the sensory idea and a usable fallback;
  preserve orientation, input alternatives, performance, and reduced motion.

If two routes compete, choose the route that explains the primary job and
record the secondary needs as constraints.

## Divergence gate

When the direction is open and the surface is consequential, make two or three
direction cards. Every candidate must vary at least four axes, one of which is
structural:

- composition or information architecture;
- navigation or interaction model;
- density and spatial rhythm;
- type/geometry relationship;
- material, image, or illustration language;
- motion behavior;
- color and contrast strategy.

Reject the set and explore again if the candidates differ only by palette,
font, border radius, icon set, or gradient. Use the same real content in every
candidate so the comparison is about the experience.

## Selection gate

- If the user/product owner can compare: show the alternatives, tradeoffs, and
  failure risks, then record the selected direction.
- If they cannot compare: make one provisional choice, keep the rejected cards
  and rationale, and label the result unvalidated.
- If references are supplied: borrow a constraint-output pair or mental model;
  do not copy a screenshot's surface treatment without product justification.

## Critique route

After implementation, inspect the rendered result. Route findings by type:

- deterministic issue: semantics, contrast, keyboard, focus, overflow,
  responsive, performance, URL/state, or reduced motion;
- product issue: wrong task, missing data, poor state, unclear recovery, or
  content mismatch;
- direction issue: incoherent hierarchy, unsupported decoration, generic
  composition, or drift from the accepted contract;
- preference: a taste disagreement that is not yet grounded in the product or
  evidence.

Fix gates in that order. Do not use a preference to mask an accessibility or
product failure, and do not use compliance to avoid making a clear creative
decision.

## Calibration route

If the same type of artifact will be produced again, read
`calibration-loop.md`:

1. freeze one prompt, input set, model configuration, and viewport;
2. save a baseline before changing design guidance;
3. write three to six observable criteria and separate hard gates;
4. compare the changed guidance against the baseline with the same inputs;
5. promote only corrections that have an appropriate destination and survive
   an affected rerun, plus a holdout when practical.

The calibration route is optional for local edits and mandatory only when the
project explicitly adopts it for a recurring or high-impact artifact.
