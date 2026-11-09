---
'@autonomos/core': patch
'@autonomos/cli': patch
---

Record loss counts text kept in an archived record with the same ID or a worklog named for that ID, and no longer treats an untracked moved file as new text, so `status` gives the same verdict before and after commit. `migrate` prints every follow-up ID and `status --history` lists closed records that still mention unfinished work. Next steps say to mark the task `[x]` before `close` and to track findings that need an owner decision in an open task.
