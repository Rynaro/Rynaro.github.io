# Content Conventions — Post Types & Assay

Frozen by ESL change `rebrand`, Phase 0, Story 0.3 (AC-003). This document fixes the
**vocabulary** so later phases have something stable to render against — it does not
render anything itself. Badges, labels, and layout work for these fields ship in
Phase 3 (`type` badges: AC-017; `assay` labels: AC-018).

## `type:` — closed set of five

A post's front matter MAY declare a `type:` field. The permitted values are a
**closed set of exactly five** — no other value is valid:

| `type:` | Gloss |
|---|---|
| `scroll` | The handcrafted long-form essay — the site's original voice (tutorials, architecture write-ups). |
| `cantrip` | A quick, small technique or tip — short and single-purpose. |
| `log` | A cadence-anchor journal entry — feeds the "Alchemist's Log" stream (Phase 3, AC-022). |
| `distillation` | A condensed digest or summary of a broader topic. |
| `transmutation` | A research-dump / AI-assisted deep-dive — rendered visibly distinct from a handcrafted `scroll` (Phase 3, AC-021). |

A post with no `type:` field is untyped and renders with no badge.

## `assay:` — optional epistemic-status field

A post MAY additionally declare an `assay:` field stating how confident the author
is in the post's claims, independent of `type:`. The permitted values are a
**closed set of exactly three**:

| `assay:` | Gloss |
|---|---|
| `speculative` | An untested idea or hypothesis. |
| `tested` | Verified in practice, but not yet battle-hardened. |
| `proven` | Established, production-proven knowledge. |

## What this document does NOT do

- It does not render a badge, label, or any layout change — that is Phase 3
  (AC-017 for `type`, AC-018 for `assay`).
- It does not retype any existing post. The retro-labelling of the five 2019–2023
  posts and the re-typing of the 2026 LLM-routing post as `transmutation` is a
  Phase 3 story (AC-021), decided by the owner in `owner-decisions.md` #3 but not
  executed here.
- It does not define new front-matter fields beyond `type` and `assay`.
