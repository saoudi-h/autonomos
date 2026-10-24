---
'@autonomos/core': minor
'@autonomos/cli': minor
---

Introduce Protocol v0.7.0-alpha with evidence-aware archival in `/reconcile`,
claim-level knowledge consolidation in `/crystallize`, scoped history discovery
and current-context continuity. Keep archives project-owned and first-use only;
installation/update never move historical records automatically.

Add `readTaskRegistry` and metadata-independent task-ID references for current
and archived registries. Add `status --history` with separate historical counts,
collision diagnostics and explicit incomplete reads. Current reporting recognizes
legacy metadata-free IDs and excludes fenced examples; the detailed task-parser
API is unchanged. Prepare both packages together so the published CLI pins the
matching Core artifact set.
