---
eidolon: ramza
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: normalize-p4
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `normalize-p4`: Phase 4 — Dead code removal

**Umbrella:** `normalize` (`.spectra/changes/normalize/spec.md`) — **that spec governs**; this is
its phase projection. **Canonical criteria:** `.spectra/changes/normalize/normalize.criteria.md`
(frozen, `sha256 826b187d4d4d...`). **`rebrand-p5` is unrelated and untouched.**

| field | value |
|---|---|
| change_id | `normalize-p4` |
| phase | 4 — Dead code removal |
| tier | `full` |
| status | `proposed` |
| maker / checker | `vivi` / `kupo` (maker != checker) |
| complexity | 7/12 → `extended` |
| depends_on | normalize-p3 |
| stories | 4.1, 4.2, 4.3 |
| criteria | AC-401..AC-407 (7) |

## Scope

**Tooling before deletion.** Naive grep over-reports: `post-type-badge--{{ type_key }}`
(`_includes/post-type-badge.html:19`) and `mastery-{{ skill.level }}` (`about.html:197`) are
**Liquid-interpolated and live**. Any dead-code tooling **must resolve `{{ }}`** or it deletes live
styles (AC-403 pins both as fixtures).

**Two traps.** `--dnd-red` (`_sass/_variables.scss:94`) **cannot be deleted alone** — its manifest
row at `_data/palette-manifest.yml:148` must go in the same commit or
`palette-manifest.test.mjs:75` fires (AC-402). And `.skip-to-content` (`_sass/_utilities.scss:203`)
is styled with **no markup**: that is a **missing WCAG 2.4.1 feature, not dead code** — P3 installs
it (AC-305), P4 **retains** it (AC-404).

**No mass `!important` purge**: 34 of 38 are legitimate (22 print-layer, 11 the required
`.visually-hidden` clip idiom, 1 in dead `.hljs`). Only the 4 at `_sass/_about.scss:404-412` are
real specificity fights, and **P2's BEM erases those exactly** (AC-211).

**Out of scope.** The RPG/FF/D&D vocabulary is ubiquitous language — BEM **wraps** it, never
renames it (`.scroll-card -> .scroll__card`, never `.card`). No mass `!important` purge. No edit to
`rebrand-p5`.

## Approach

See the umbrella spec's Approach; this phase implements stories 4.1, 4.2, 4.3.

**AC-406 is owner-elected** (the MEDIUM-confidence set). `.visually-hidden`/`.sr-only` must not *both* be deleted.

## Stories

See `.spectra/changes/normalize/spec.md` § Stories — rows 4.1, 4.2, 4.3.

## Acceptance Criteria

**7 criteria: AC-401..AC-407** — bodies are carried verbatim in `change.json`
(`acceptance_checks`), each with complete `given`/`when`/`then`/`verify_method` (ESL C7). The
frozen canonical source is `.spectra/changes/normalize/normalize.criteria.md`; **this folder must
not diverge from it**.

### Gates this phase must leave green

`npm run test:a11y-static` exit 0 (AC-407); `npm run test:manifest` exit 0 after the paired `--dnd-red` deletion (AC-402).

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
