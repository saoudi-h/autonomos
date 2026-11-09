---
'@autonomos/core': patch
'@autonomos/cli': patch
---

`migrate` ends with numbered next steps (follow-ups, remaining findings to resolve with `/reconcile` in the same task, recording the upgrade, `status --strict`). `status` notes a change since `HEAD` (or `--since <rev>`) that adds or moves no task, writes no worklog and closes nothing.
