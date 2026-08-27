---
eidolon: ramza
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: normalize-p3
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `normalize-p3`: Phase 3 — HTML component extraction

**Umbrella:** `normalize` (`.spectra/changes/normalize/spec.md`) — **that spec governs**; this is
its phase projection. **Canonical criteria:** `.spectra/changes/normalize/normalize.criteria.md`
(frozen, `sha256 826b187d4d4d...`). **`rebrand-p5` is unrelated and untouched.**

| field | value |
|---|---|
| change_id | `normalize-p3` |
| phase | 3 — HTML component extraction |
| tier | `full` |
| status | `proposed` |
| maker / checker | `vivi` / `kupo` (maker != checker) |
| complexity | 9/12 → `extended` |
| depends_on | normalize-p2 |
| stories | 3.1, 3.2, 3.3 |
| criteria | AC-301..AC-307 (7) |

## Scope

**`.section-icon` is two components sharing one class name** — that is the root cause,
not the cascade order. `codex.html:33` puts the class **on the icon** (`<i class="fas fa-scroll
section-icon">`, an inline icon: `margin-right`, `color`); `_layouts/post.html:106` puts it on a
**wrapper** (`<div class="section-icon">`, a circular badge: `background`, `border-radius:50%`,
`display:flex`, `color:white`). The import-order collision (`main.scss:16` post, `:17` letter —
letter wins at equal specificity `(0,1,0)`) is a **symptom of one name serving two structural
roles**. Repair is a **BEM split into two blocks** (AC-301) — never a cascade tweak, never
`!important`.

**Do not restore the "intended" `color: white`.** Measured on the `--ff-purple-light` (`#b19cd9`)
ground with `scripts/lib/color-math.mjs`: `white` = **2.43**, the accidental `--ff-purple-ink`
(`#783cb4`) = **2.78**. **The accident beats the design**; neither clears 3.0. The badge ground is
not in `declared_backgrounds`, so **no test ever measured it in either state** — the intent was
never verified. The icon is **decorative** (`<h3 class="toc-title">Contents</h3>` carries the
meaning), so **WCAG 1.4.11 does not bite**: this is a visual/architectural defect, **not an a11y
failure**, and **no ratio threshold is asserted** for it.

Extraction is ranked by **collision cost**: these are **global** selectors, so duplication is live
collision, not redundancy.

**Out of scope.** The RPG/FF/D&D vocabulary is ubiquitous language — BEM **wraps** it, never
renames it (`.scroll-card -> .scroll__card`, never `.card`). No mass `!important` purge. No edit to
`rebrand-p5`.

## Approach

See the umbrella spec's Approach; this phase implements stories 3.1, 3.2, 3.3.

**D-D (badge colour) blocks story 3.1's colour choice** — owner-gated; the structural split (AC-301) proceeds regardless. Recommendation: drop the badge, adopt the inline form (the badge is the 1-of-22 outlier).

## Stories

See `.spectra/changes/normalize/spec.md` § Stories — rows 3.1, 3.2, 3.3.

## Acceptance Criteria

**7 criteria: AC-301..AC-307** — bodies are carried verbatim in `change.json`
(`acceptance_checks`), each with complete `given`/`when`/`then`/`verify_method` (ESL C7). The
frozen canonical source is `.spectra/changes/normalize/normalize.criteria.md`; **this folder must
not diverge from it**.

### Gates this phase must leave green

`npm run test:a11y-static` exit 0 (AC-307); `npm run test:axe` exit 0 for AC-304/AC-305.

**Revertability (AC-002).** This phase is its own ESL change: reverting its merge commit must leave
`bundle exec jekyll build` and `npm run test:a11y-static` green.

## Rejected Alternatives

See the umbrella spec § Rejected Alternatives (H-A 65.5 / H-C 62 / H-D 70.5 runner-up; H-B 75.5
selected).

## Risks

See the umbrella spec § Risks (R1–R9). The one that binds hardest here: **R1 — P0 does not exist**,
so every `[BLOCKED-ON-P0]` criterion in this phase is currently unverifiable.

## Confidence

Computed for the program as a whole via `ramza-score --rubric confidence`; see
`.spectra/plans/normalize.state.json`.
