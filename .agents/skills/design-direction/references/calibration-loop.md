# Design calibration loop

This is the operational loop for turning repeated design feedback into
reliable project guidance. It is intentionally optional: use it for a
recurring artifact, a high-consequence surface, or a failure that keeps coming
back. Do not turn every small UI edit into an evaluation project.

## State model

```text
seed → baseline → candidate → compare → promote → regress → active
                         ↘ inconclusive / reject
```

The state is allowed to move backwards. A rule that helps one scenario but
harms a holdout is a candidate again, not an accepted rule with an exception
hidden somewhere else.

## Procedure

### 1. Pick one repeated artifact

Choose a real task with a real reader and realistic inputs: a report, proposal,
dashboard, planning page, or other repeated surface. Start from one recurring
failure or one decision the reader must make. Avoid “make everything better”.

### 2. Freeze the comparison

Save the prompt, input data, model/configuration, viewport, relevant route, and
first render. Keep the baseline even when it is rough. The guidance or
primitive under investigation should be the only intentional variable.

Add a holdout scenario when practical: similar enough to expose regressions,
different enough not to be the exact example used to write the rule.

### 3. State the rubric

Write three to six observable criteria. Examples:

- the reader can state the recommendation after the first viewport;
- comparable values share a scale and enough width to be read;
- supplied facts survive without invented claims;
- the primary control is visible before supporting detail;
- empty, error, and long-content states remain understandable.

Keep hard gates separate from taste. A page can be visually appealing and
still fail because its keyboard path, data, or recovery state is missing.

### 4. Make one candidate change

Change the narrowest relevant layer: project guidance, primitive/component,
deterministic check, or harness. Do not rewrite the whole contract to fix one
local symptom. Record the candidate rule and its intended failure mode.

### 5. Compare and review blind when possible

Generate a fresh first attempt with the same frozen inputs. Compare baseline
and candidate without relying on the file names or generation order. Humans
judge hierarchy, composition, fit, and usefulness; deterministic checks judge
mechanical behavior. A model critique may assist, but it is not the final
authority for subjective quality.

### 6. Promote or reject

Use `correction-promotion.md` to choose the destination. Accept the change only
when the target failure improves, the artifact remains coherent, and the
holdout does not reveal a new failure. Otherwise revise, reject, or keep the
rule provisional.

### 7. Keep the loop current

After several real tasks, cluster repeated complaints and propose changes in
one review. A person accepts, revises, or rejects each proposal. Add a new
scenario when the project encounters a genuinely new content shape or reader
job. Track the frequency of the complaint after the change; a rule that never
reduces the complaint is not working yet.

## Minimum record

For each calibration run, preserve:

- scenario name and version;
- prompt, inputs, model/configuration, viewport, and contract version;
- baseline and candidate render paths or URLs;
- rubric and hard-gate result;
- human corrections and their destinations;
- accepted/rejected/provisional status;
- regression and limitation notes.

The record can remain in a project worklog at first. Create a dedicated
`.design/` directory only when repeated work makes discovery worth the extra
artifact boundary.
