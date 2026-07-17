---
eidolon: ramza
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: normalize-p1
tier: full
version: 0.2.0
maker: vivi
checker: kupo
---

# Spec — `normalize-p1`: Phase 1 — Dark-cascade consolidation + contrast defect repair

**Umbrella:** `normalize` (`.spectra/changes/normalize/spec.md`) — **that spec governs**; this is
its phase projection. **Canonical criteria:** `.spectra/changes/normalize/normalize.criteria.md`
(frozen via `ramza-freeze --amend`, `sha256 12ef6d3c252a…`). **`rebrand-p5` is unrelated and untouched.**

| field | value |
|---|---|
| change_id | `normalize-p1` |
| phase | 1 — Dark-cascade consolidation + contrast defect repair |
| tier | `full` |
| status | `proposed` (re-authored, R2) |
| maker / checker | `vivi` / `kupo` (maker != checker) |
| complexity | 10/12 → `human_loop` |
| depends_on | P0 (LANDED at R1 — `test:visual` + 84 baselines) |
| stories | 1.1, 1.2, 1.3 (re-scoped) |
| criteria | AC-101..AC-112 (12) |

## Why R1 was rejected — the error this re-derivation does not repeat

An independent critic scored the R1 P1 spec **45/100**. Its central claim was **false**
because it reasoned **per-partial** about `:root` custom-property blocks. `:root` is
**document-scoped**: all `_sass/` partials compile into one `assets/css/main.css`, and the
**last-imported** dark `:root` block wins **globally** per property. `_sass/_letter.scss:820-831`
imports last (`assets/css/main.scss:17`) and flips `--dnd-brown: #e0e0e0` **sitewide**. So R1's
anchor — `.item-rarity-label` renders `--dnd-brown` `#6d562f` on `#2c2c2c` = **2.01**, a live AA
failure — is wrong. Verified against the compiled snapshot and re-measured with the project's own
`scripts/lib/color-math.mjs`, it renders **`#e0e0e0` on `#232323` = 11.91 (PASSES)**.

**Consequences, carried into every criterion below:**

- The retracted R1 **AC-101** (a proven no-op — the critic sandboxed the prescribed "add `--dnd-brown`
  to every dark block" fix and measured zero pixels moved) is **not restated**.
- The retracted R1 **AC-110** (inverted/self-contradictory — asserted a 2.26→4.5 transition that
  cannot be observed on an already-11.91 pair, and required an "empty set of selectors lacking a
  per-selector override" while its sibling deleted those very overrides) is **not restated**.
- **Every contrast claim here is derived from the COMPILED CASCADE** (`getComputedStyle` on the
  built `_site`, or the compiled `main.css`), never from a single source partial.

## Scope

**In.** P1 does three things, all anchored on the compiled cascade:

**(a) Consolidate the four conflicting dark `:root` blocks into one.** Four `prefers-dark :root`
blocks — `_variables.scss:160`, `_notebook.scss:800`, `_laboratory.scss:688`, `_letter.scss:820` —
write the same global `:root`. Because they all target `:root` at equal specificity inside
`@media (prefers-color-scheme: dark)`, resolution is **per-property last-import-wins**. Confirmed
against the compiled snapshot: `--dnd-parchment` = `#2c2c2c` (notebook), `#2c2c2c` (laboratory),
`#232323` (letter) → **`#232323` wins**, the two `#2c2c2c` are **dead**; `--dnd-ink` = `#d0d0d0`
(notebook) then `#e0e0e0` (letter) → **`#e0e0e0` wins**, `#d0d0d0` is **dead**. P1 collapses these
to ONE authoritative dark token set (AC-101, AC-102), emitted through **both**
`@media (prefers-color-scheme: dark)` **and** `:root[data-theme="dark"]` so the OS preference and
the future toggle share one source of truth (D-C mechanism; AC-103). The compiled CSS has **zero**
`data-theme` selectors today — this is a P1 deliverable.

**(b) Fix the REAL contrast failures.**
- **`/about` dark (the primary P1 defect).** `_sass/_about.scss` has **zero** dark handling (grep
  the whole file: no `prefers-color-scheme`, no `@include dark-mode`, no `data-theme`) yet hardcodes
  `background: white` at `:556,844,861,951,1099,1235,1312`. The `--dnd-brown` **text** token flips
  globally to `#e0e0e0`; the **surface** never flips. `.attribute-name` (`:599`), `.category-title`
  (`:714`), `.quest-title` (`:882`), `.ability-name` (`:1057`) therefore render `#e0e0e0` on
  `#ffffff` = **1.32**. Fix: `_about.scss` gains dark handling for its hardcoded light surfaces
  (AC-106, backstopped by AC-105).
- **`.scroll-seal` (fails in the DEFAULT theme, shipping today).** `_notebook.scss:674`
  `background: var(--ff-gold)` (`#e6a553`, never flipped in any dark block); `:675`/`:693`
  `color: var(--dnd-brown)`. Light: `#6d562f` on `#e6a553` = **3.27**. Dark: `#e0e0e0` on `#e6a553`
  = **1.61**. Both fail `content_threshold: 4.5`. `.scroll-seal` renders real text
  (`<span>Latest</span>`, `notebook.html:56`), so this is a live WCAG 1.4.3 AA failure for **every**
  visitor, in **both** themes. Fix: repair the seal's text pairing on gold in both themes (AC-106).

**(c) Delete the provably-dead per-selector dark literal compensations** that the consolidated flip
already resolves — but gated on a **computed no-op**: a per-selector dark literal may be removed only
when `getComputedStyle` of that selector in dark is unchanged by the removal (AC-109). This is the
disciplined inverse of R1's mistake: deletion is proven safe against the compiled cascade, not
assumed from a per-partial reading.

**Measurement hole closed.** `_data/palette-manifest.yml:32` `declared_backgrounds` lists only
cream/light/parchment-dark + 2 hero-gradients — it cannot see the gold ground `#e6a553` where
`.scroll-seal` fails, nor the dark canvas `#232323`. P1 **extends** `declared_backgrounds` to
`#e6a553`/`#232323`, measured through **targeted, theme-correct pairings** (the existing
hero-gradient pattern, `palette-contrast.test.mjs:69-94`), **not** a blanket cross-product — a
blanket cross-product would false-positive every light `-ink` token against `#232323` (nothing
renders a light `-ink` on the dark canvas; in dark those tokens are themselves flipped). AC-108.

**Out of scope.** **D-A** — radius/spacing tokenization is **not** P1 (AC-110 forbids any
`margin`/`padding`/`border-radius` computed-value change). **D-C policy** — whether to promote the
toggle sitewide or delete it is **P3**; P1 converges the mechanism only and does **not** delete the
working `body.dark-mode` post toggle (AC-104). No BEM renames, no `!important` purge (those are P2).
The RPG/FF/D&D vocabulary is ubiquitous language. No edit to `rebrand-p5`.

## Approach

1. **Consolidate first (no visual change).** Author one canonical dark token set (the last-import
   winners: `--dnd-parchment #232323`, `--dnd-ink #e0e0e0`, `--dnd-brown #e0e0e0`,
   `--text-primary/secondary/light`, `--parchment-light/dark`, `--border-light`, shadows, etc.),
   emit it under both `@media (prefers-color-scheme: dark) :root` and `:root[data-theme="dark"]`,
   and delete the three dead declarations. Because consolidation keeps the winning values, it is a
   **compiled-cascade no-op** — zero visual diff (AC-101, AC-102, AC-103; guarded by AC-110).
2. **Repair the two real defects.** Give `_about.scss` dark handling for its hardcoded white
   surfaces; repair `.scroll-seal`'s text pairing on gold for both themes. These are the intended
   pixel movers (AC-105, AC-106).
3. **Extend the harness to see the grounds** (`#e6a553`, `#232323`) via targeted pairings (AC-108),
   so the suite can no longer stay green over a real failure.
4. **Delete dead literals** under the computed-no-op gate (AC-109).
5. **Verify.** Compiled-cascade contrast sweep (AC-105/106/107), visual intentionality against the
   regenerated authoritative baselines (AC-110), a11y-static green (AC-111), revertable (AC-112).

**D-C (dark unification) and D-A (spacing/radius) are owner decisions and are honored, not
re-opened:** P1 converges the dark MECHANISM only; radius is deferred.

## Stories

| # | Story | Timebox | Risk | Criteria |
|---|---|---|---|---|
| 1.1 | Consolidate the 4 conflicting dark `:root` blocks into one canonical set reachable via both `prefers-color-scheme` and `:root[data-theme="dark"]`; remove the 3 dead declarations | 2d | **P0** | AC-101, AC-102, AC-103, AC-104 |
| 1.2 | Repair the real contrast failures — `/about` dark surfaces and `.scroll-seal` on gold (both themes) — and prove them on the compiled cascade | 3d | **P0** | AC-105, AC-106, AC-107 |
| 1.3 | Extend `declared_backgrounds` (targeted, theme-correct); delete dead per-selector literals under a computed-no-op gate; visual + a11y + revert gates | 2d | P1 | AC-108, AC-109, AC-110, AC-111, AC-112 |

## Acceptance Criteria

**12 criteria: AC-101..AC-112** — canonical source is
`.spectra/changes/normalize/normalize.criteria.md` (frozen `sha256 12ef6d3c252a…`), mirrored
verbatim in `change.json` (`acceptance_checks`), each with complete `given`/`when`/`then`/`verify_method`
(ESL C7). **This folder must not diverge from the canonical criteria.** Every contrast criterion
verifies against the compiled cascade (`getComputedStyle` on built `_site` or compiled `main.css`),
never source-partial inspection.

### Gate this phase must leave green

`npm run test:a11y-static` exit 0 (AC-111). **P1 MUST produce a visual diff** at the repaired
selectors, so its visual gate is `test:visual` **compare** against the **authoritative
(regenerated) baselines** with an **intentionality review** (AC-110) — every over-tolerance target
must map to an enumerated expected-diff page (`about` dark; `notebook` light+dark); an unexpected
diff, or any `margin`/`padding`/`border-radius` change, fails. This is **not** a zero-diff gate and
**not** a `test:visual:update` rubber-stamp.

**Revertability (AC-112).** Reverting P1's merge commit must leave `bundle exec jekyll build` and
`npm run test:a11y-static` green.

## Rejected Alternatives

- **R1's own approach — "one missing `--dnd-brown` flip generates the whole literal population; add
  it to every dark block, delete the literals" — REJECTED (independent critic, 45/100).** It reasoned
  per-partial about a document-scoped token; the last-imported dark block already flips `--dnd-brown`
  globally, so the prescribed fix was a measured no-op and the anchor defect (`.item-rarity-label`)
  was never failing. Superseded by the consolidation + compiled-cascade approach here.
- **Add `#e6a553`/`#232323` to `declared_backgrounds` as ordinary blanket-cross-product grounds —
  REJECTED.** The static contrast suite pairs each content token's *light* hex against every declared
  background; a dark canvas or a decorative gold ground would false-positive light `-ink` tokens that
  never render there. Adopted instead: targeted, theme-correct pairings (the hero-gradient pattern).
- **Repair `/about` by stopping the text token from flipping — REJECTED.** The owner (D-C) wants the
  dark mechanism converged, not suppressed; the surface must flip, not the text un-flip. Also see the
  umbrella § Rejected Alternatives (H-A 65.5 / H-C 62 / H-D 70.5 runner-up; H-B 75.5 selected) for
  the program-level harness decision.

## Risks

See the umbrella § Risks (R1–R11). The ones that bind hardest here:

| id | risk | mitigation |
|---|---|---|
| R10 | A live WCAG 1.4.3 AA text failure ships today — but at `.scroll-seal` on gold (3.27 light / 1.61 dark) and `/about` dark surfaces (1.32), **not** at `.item-rarity-label` (which passes at 11.91) | AC-105/AC-106 repair and prove the real pairs on the compiled cascade; AC-107 guards the false target from a spurious "fix" |
| R-consolidation | Collapsing four blocks silently changes a resolved value | AC-101 (no conflicting values) + AC-102 keep the last-import winners; AC-110 catches any unintended pixel move |
| R2 | Extending `declared_backgrounds` surfaces failing pairs or false positives | AC-108 uses targeted theme-correct pairings, not a blanket cross-product |
| R-literals | Deleting a per-selector literal that was actually load-bearing | AC-109 gates each deletion on a `getComputedStyle` no-op |

## Confidence

Computed via `ramza-score --rubric confidence`; see `.spectra/plans/normalize.state.json`.
Author-scored, **pre-critic** — this phase stops at Test for an independent checker (maker != checker;
`ramza-gate critic` DENIES self-approval).
