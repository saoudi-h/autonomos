---
'@autonomos/core': patch
'@autonomos/cli': patch
---

Context-budget findings are agent work: `migrate` next steps and the reconcile workflow no longer suggest escalating them to the owner; a finding the task cannot finish becomes an open task saying what remains.

`status` also counts a `close` into an existing same-day group as recorded work (it adds no new heading).
