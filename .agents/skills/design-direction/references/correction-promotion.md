# Correction promotion map

Use this map after a review. The same observation may need more than one
destination, but keep each destination narrow and explain the relationship.

| Observation                                                                       | First destination                           | Promote when                                                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Reader intent, hierarchy, tone, composition, or content emphasis                  | Project `DESIGN.md`                         | The product owner accepts the rule and it improves the relevant scenario without contradicting the contract |
| Reusable spacing, type, color role, layout, table, chart, or interaction mechanic | Project primitive, component, or stylesheet | The mechanic recurs or is clearly part of the accepted system                                               |
| Reproducible width, overflow, semantic, contrast, state, or responsive failure    | Deterministic check                         | The failure can be checked without subjective interpretation                                                |
| Screenshot, browser, fixture, or capture problem                                  | Evaluation harness                          | The problem prevents trustworthy comparisons or repeats across runs                                         |
| One model's isolated odd interpretation                                           | Worklog or issue                            | It repeats across independent runs or appears across models/surfaces                                        |
| Taste disagreement with no product or evidence basis                              | Open question                               | New content, user feedback, or a comparison makes the tradeoff concrete                                     |

## Promotion rules

- State the observed symptom, not a vague preference.
- Name the evidence and the exact scenario/run.
- Do not promote a rule after one low-impact occurrence unless the owner
  explicitly accepts it as project policy.
- Prefer the narrowest destination that can prevent recurrence.
- Rerun the affected scenario after promotion; use a holdout when practical.
- If the correction improves one surface but harms another, reopen the upstream
  decision or scope the rule honestly rather than hiding an exception.
- Keep rejected and provisional changes visible until the next calibration
  review; do not silently turn them into current guidance.

## Example

Observation: “The commercial comparison table is squeezed beside prose even
though the page has unused width.”

- `DESIGN.md`: evidence tables use the available width when comparison is the
  reader's job;
- primitive: the report table component exposes a full-width comparison mode;
- deterministic check: flag a comparison table whose rendered width is below
  the available content measure;
- calibration: rerun the renewal scenario and one unrelated report before
  accepting the change.
