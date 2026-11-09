---
'@autonomos/core': patch
'@autonomos/cli': patch
---

`status` reports tasks and issues removed or shortened since `HEAD` (or `--since <rev>`) whose content lands neither in the change nor in the files they link to; `--strict` fails on them. Workflows say a clean status checks structure, not completion, and never to delete content to satisfy a finding. `migrate` recognizes reworded archive index lines, no longer prints "format 2 to 2", and shows the linked-worktree note only when upgrading.
