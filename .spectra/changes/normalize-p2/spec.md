---
eidolon: ramza
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: normalize-p2
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `normalize-p2`: Phase 2 — ITCSS + BEM + Sass module migration

**Umbrella:** `normalize` (`.spectra/changes/normalize/spec.md`) — **that spec governs**; this is
its phase projection. **Canonical criteria:** `.spectra/changes/normalize/normalize.criteria.md`
(frozen, `sha256 826b187d4d4d...`). **`rebrand-p5` is unrelated and untouched.**

| field | value |
|---|---|
| change_id | `normalize-p2` |
| phase | 2 — ITCSS + BEM + Sass module migration |
| tier | `full` |
| status | `proposed` |
| maker / checker | `vivi` / `kupo` (maker != checker) |
| complexity | 11/12 → `human_loop` |
| depends_on | normalize-p1 |
| stories | 2.1, 2.2, 2.3, 2.4 |
| criteria | AC-201..AC-212 (12) |

## Scope

**The harness migration is a deliverable of this phase, not fallout of it.** The a11y
suite is coupled to the *source layout*, so an ITCSS split breaks it **by construction**:
`scripts/palette-manifest.test.mjs:68` fails if a token in `_variables.scss` is missing from the
manifest and `:75` fails on manifest rows not in `_variables.scss` — a bidirectional lock, so
renaming, deleting or **moving** any token breaks the suite; `_data/palette-manifest.yml:31`
hardcodes `meta.source: _sass/_variables.scss`.

**The dangerous one is quieter.** `scripts/lib/scss-scan.mjs:23` does a **flat, non-recursive**
`readdirSync(_sass).filter(.scss)`, so moving partials into `_sass/components/` makes the scanner
**silently skip them** — the tests pass while checking nothing. The anti-vacuity guard at
`scripts/token-usage.test.mjs:65` only catches a *total* wipeout. So AC-201 recurses the scanner,
AC-202 strengthens the guard **with a mutation check**, AC-203 globs `meta.source`, and **AC-204
orders the harness commit strictly before the first file move**.

The Sass module migration folds in here rather than standing alone: `@use`/`@forward` **is** the
variable/mixin hierarchy mechanism ITCSS asks for, and 16 `@import` + 18 `darken()` sites are
already deprecated and on a clock.

**Out of scope.** The RPG/FF/D&D vocabulary is ubiquitous language — BEM **wraps** it, never
renames it (`.scroll-card -> .scroll__card`, never `.card`). No mass `!important` purge. No edit to
`rebrand-p5`.

## Approach

See the umbrella spec's Approach; this phase implements stories 2.1, 2.2, 2.3, 2.4.

**D-B is answered here.** Recommendation: migrate the harness (recurse + glob) as story 2.1, landing alone and first. Rejected: keeping `_variables.scss` monolithic (H-A, 65.5 weak).

## Stories

See `.spectra/changes/normalize/spec.md` § Stories — rows 2.1, 2.2, 2.3, 2.4.

## Acceptance Criteria

**12 criteria: AC-201..AC-212** — bodies are carried verbatim in `change.json`
(`acceptance_checks`), each with complete `given`/`when`/`then`/`verify_method` (ESL C7). The
frozen canonical source is `.spectra/changes/normalize/normalize.criteria.md`; **this folder must
not diverge from it**.

### Gates this phase must leave green

`npm run test:a11y-static` exit 0 (AC-210) — and it must be **meaningfully** green, which is exactly what AC-202's mutation check protects. `[BLOCKED-ON-P0]`: AC-207.

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
