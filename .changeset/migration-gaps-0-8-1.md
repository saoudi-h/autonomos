---
'@autonomos/core': patch
'@autonomos/cli': patch
---

Close the gaps found when agents migrated real projects to format 2: `migrate` moves checked items without an ID tag, keeps git-ignored worklogs ignored, quarantines legacy worklogs merged in later from other checkouts and lists closed records that still mention unfinished work; `close` groups same-day closures under one `Closed <date>` heading instead of appending under the last migration batch; workflows tell agents to use the project's own CLI and to proceed on delegated plans.
