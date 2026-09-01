# Design evaluation scenario

Copy this file for a recurring artifact. The scenario freezes the conditions
needed to compare guidance changes. It is not a prompt recipe and should use
real or faithfully representative content.

```md
# Scenario — [name]

Status: baseline | candidate | holdout | retired
Scenario version: [integer or date]
Surface: [route or artifact type]
Reader: [specific audience]
Reader job: [one decision or action]

## Frozen inputs

- Prompt/request: [exact text]
- Data/content fixture: [path, source, or description]
- Model/configuration: [model and relevant settings]
- Viewport/device: [width, height, input]
- Contract version: [DESIGN.md commit/version]
- Primitives/assets: [stylesheet, components, fonts, imagery]

## Rubric

Hard gates:

- [ ] [must-pass condition]

Observable criteria:

- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] [criterion 3]

## Runs

| Run       | Contract             | Render        | Result                 | Corrections        |
| --------- | -------------------- | ------------- | ---------------------- | ------------------ |
| [date/id] | [baseline/candidate] | [path or URL] | PASS/FAIL/INCONCLUSIVE | [links or summary] |
```

Keep the prompt, inputs, model, viewport, and contract version together. A
comparison that changes several of them cannot tell you which change helped.
