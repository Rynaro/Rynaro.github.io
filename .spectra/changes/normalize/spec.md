---
eidolon: ramza
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: normalize
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `normalize`: phased front-end normalization

**Status:** `proposed` · **ESL tier:** `full` (route `0->1->2->3->4`) · **RAMZA tier:** `full` (RS score 6)
**Complexity:** 12/12 → `human_loop` — four open owner decisions and an absent P0 precondition.
**Criteria:** `.spectra/changes/normalize/normalize.criteria.md` (37, EARS-linted, **frozen** `sha256 826b187d4d4d...`).
**Phases:** `normalize-p1`..`normalize-p4`. **`rebrand-p5` is unrelated and untouched.**

## Scope

**In.** P1 token consumption repair; P2 ITCSS + BEM + Sass module migration (incl. the
harness migration); P3 HTML component extraction; P4 dead code removal. Each phase is its
own ESL change, independently revertable and independently gated.

**Out.** The RPG/FF/D&D vocabulary is **ubiquitous language**: BEM *wraps* it, never renames
it (`.scroll-card -> .scroll__card`, never `.card`). The closed five post types
(`CONVENTIONS.md`, `_data/post_types.yml`) are fixed. No mass `!important` purge (34 of 38
are legitimate). `rebrand-p5` (Opal island + post, owner-gated) is not touched.

**Deferred.** The base-4 / base-5 spacing unification (see D-A) — it is the single largest
pixel-moving action available here and it is orthogonal to ITCSS/BEM.

### R1 — the load-bearing premise CHANGED MID-SESSION (P0 landed)

Binding decision 2 says *"visual-regression baselines land FIRST as P0."* When I began, it had
**not**: `scripts/visual-baseline.mjs` existed on no branch, and `test:visual` was absent from
`package.json`. **It landed while this spec was being written.** Re-verified:

- `npm run test:visual` → `node scripts/visual-baseline.mjs`; plus `test:visual:update`.
- **84 committed baselines** — 14 targets x 3 viewports (desktop/tablet/mobile) x 2 themes.
- Default tolerance **0.1%**, `--tolerance=` overridable; hand-rolled PNG diff on `node:zlib` (no new dependency).
- Dark is captured via Playwright `colorScheme: 'dark'` (= `prefers-color-scheme`) for **every** target, **plus** the `body.dark-mode` class for the post target — so it exercises **both** dark mechanisms named in D-C.

**GAP-1 is RESOLVED; the `[BLOCKED-ON-P0]` marks are lifted** (AC-103, AC-108, AC-207 are now
verifiable). Two consequences carry into P1, and they are not cosmetic:

1. **The baselines record the bug.** They were captured *before* P1, so today's dark defects are
   frozen in as "correct". P1 must `test:visual:update` and **review the diff as intentional**
   (AC-111). A rubber-stamped update would silently re-bless the defect.
2. **"Zero visual diff" is the wrong gate for P1** — see below.

> **Caveat (not verified):** `npm run test:visual` did not complete for me — it aborted with
> `EADDRINUSE` on port 4174, consistent with the concurrent P0 agent holding the port, **not**
> with a diff failure. **I did not observe a green `test:visual` run.** Confirm before relying on it.

### The finding that reshapes P1 (RE-DERIVED at R2 — the R1 figures below were RETRACTED)

> **R2 CORRECTION.** The R1 text here asserted a live AA failure of `#6d562f` on `#232323` =
> **2.26** at `.item-rarity-label`/`.scroll-seal`. That came from **per-partial** reasoning and is
> **RETRACTED — do not reuse it.** `:root` is document-scoped; `_letter.scss:820` imports last and
> flips `--dnd-brown: #e0e0e0` **sitewide**, so `.item-rarity-label` renders `#e0e0e0` on `#232323`
> = **11.91 (PASSES)**. The **real** P1 defects, re-measured on the compiled cascade with
> `scripts/lib/color-math.mjs`:

| pair | ratio | verdict | where |
|---|---|---|---|
| `#e0e0e0` on `#ffffff` | **1.32** | fails 4.5 | `/about` dark: flipped `--dnd-brown` text on `_about.scss`'s never-flipped `background: white` (`.attribute-name` `:599`, `.category-title` `:714`, `.quest-title` `:882`, `.ability-name` `:1057`) — **the primary P1 defect** |
| `#6d562f` on `#e6a553` | **3.27** | fails 4.5 | `.scroll-seal` text on `--ff-gold`, **default (light) theme, shipping today** |
| `#e0e0e0` on `#e6a553` | **1.61** | fails 4.5 | `.scroll-seal` text on `--ff-gold`, dark |
| `#e0e0e0` on `#232323` | **11.91** | passes | `.item-rarity-label` dark — **not a defect; guarded by AC-107** |

**Root cause = four conflicting `prefers-dark :root` blocks** (`_variables.scss:160`,
`_notebook.scss:800`, `_laboratory.scss:688`, `_letter.scss:820`) writing the same global `:root`;
last import wins, so `_notebook.scss:805`/`:808` and `_laboratory.scss:693` are **dead**. P1
consolidates them into ONE authoritative dark set reachable via both `prefers-color-scheme` and
`:root[data-theme="dark"]` (D-C mechanism), repairs the two real failures, and extends
`declared_backgrounds` to `#e6a553`/`#232323` so the suite can see them. See the re-authored
projection `.spectra/changes/normalize-p1/spec.md` (criteria AC-101..AC-112, frozen `12ef6d3c252a…`).

## Approach

Phase order is the owner's and is preserved. The engineering content of each phase:

**P1 — consolidate the dark cascade, then repair the real failures.** Four `prefers-dark :root`
blocks write one document-scoped `:root`; last import wins, leaving three dead declarations
(`_notebook.scss:805`/`:808`, `_laboratory.scss:693`). P1 collapses them to ONE canonical dark token
set, emitted via both `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]` (D-C
mechanism), and deletes dead per-selector literals under a computed-no-op gate (AC-101..AC-103,
AC-109). It repairs the two **real** WCAG 1.4.3 AA failures — `/about` dark (`#e0e0e0` text on
never-flipped white = 1.32) and `.scroll-seal` on `--ff-gold` (3.27 light / 1.61 dark) — and extends
`declared_backgrounds` to `#e6a553`/`#232323` via targeted theme-correct pairings so the suite can
see them (AC-105, AC-106, AC-108). `.item-rarity-label` already passes (11.91) and is guarded, not
"fixed" (AC-107). Radius/D-A is deferred; the working `body.dark-mode` post toggle is preserved (D-C
policy is P3, AC-104).

**P2 — migrate the harness before moving a byte.** The a11y suite is coupled to the *source
layout*, so an ITCSS split breaks it **by construction**:

| coupling | site | effect of a naive split |
|---|---|---|
| bidirectional token lock | `scripts/palette-manifest.test.mjs:68` (source→manifest), `:75` (manifest→source) | renaming/deleting/**moving** any token fails the suite |
| hardcoded source path | `_data/palette-manifest.yml:31` `meta.source: _sass/_variables.scss` | a split settings layer is unrepresentable |
| **flat, non-recursive scan** | `scripts/lib/scss-scan.mjs:23` `readdirSync(...).filter(...)` | partials moved to `_sass/components/` are **silently skipped** — tests pass while checking nothing |
| weak anti-vacuity guard | `scripts/token-usage.test.mjs:65` (`usages.length === 0`) | only a *total* wipeout is caught, so the silent skip above survives |
| hardcoded logotype set | `scripts/lib/scss-scan.mjs:21` `LOGOTYPE_SELECTORS = ['.hero-subtitle']` | a `.hero__subtitle` rename silently reclassifies logotype usages |

The silent-skip failure mode is the dangerous one: a green suite that measures nothing.
So AC-201..AC-205 make the harness structure-agnostic and **AC-204 gates the ordering**:
harness commit strictly precedes the first file move. The Sass module migration folds in
here rather than standing alone — `@use`/`@forward` *is* the variable/mixin hierarchy
mechanism ITCSS wants, and 16 `@import` + 18 `darken()` calls are already deprecated
(AC-208, AC-209).

> **Correction to a scout citation, verified.** The logotype lock is *not* at
> `palette-manifest.test.mjs:92` and the manifest's `logotype_selectors` key is read by **no
> test** — it is documentation. `palette-manifest.test.mjs:86` states outright that no token
> is currently `role=logotype`, so that test's logotype loop is **dead**. The live enforcement
> is `scss-scan.mjs:21` → `isLogotypeContext()` at `:110`, exercised via `token-usage.test.mjs`.
> The risk is real but **subtler than reported**: a rename degrades silently instead of
> failing loudly. AC-205 makes it fail loudly.

**P3 — split the name, don't tune the cascade.** See D-D. Extraction is ranked by collision
cost, not by line count: these are **global** selectors, so duplication is live collision.

**P4 — resolve Liquid before deleting.** Naive grep over-reports:
`post-type-badge--{{ type_key }}` (`_includes/post-type-badge.html:19`) and
`mastery-{{ skill.level }}` (`about.html:197`) are interpolated and **live** (AC-403).
`.skip-to-content` (`_sass/_utilities.scss:203`) is styled with no markup — that is a
**missing WCAG 2.4.1 feature, not dead code**; P3 installs it (AC-305), P4 retains it (AC-404).
`--dnd-red` cannot be deleted alone — its manifest row at `_data/palette-manifest.yml:148`
must go in the same commit or `palette-manifest.test.mjs:75` fires (AC-402).

### Measurement method (stated, per the rebrand retraction lesson)

Counts below are **raw `grep -roE` occurrence counts over `_sass/*.scss`**, not
usage-weighted, not deduped by rule. Contrast ratios are computed with the project's own
`scripts/lib/color-math.mjs`. Where my count diverges from the scout's, both are given.

## Stories

| # | Phase | Story | Timebox | Risk | Criteria |
|---|---|---|---|---|---|
| 1.1 | P1 | Consolidate the 4 conflicting dark `:root` blocks into one canonical set reachable via both `prefers-color-scheme` and `:root[data-theme="dark"]`; remove the 3 dead declarations | 2d | **P0** | AC-101..AC-104 |
| 1.2 | P1 | Repair the real contrast failures — `/about` dark surfaces and `.scroll-seal` on gold (both themes) — proven on the compiled cascade | 3d | **P0** | AC-105..AC-107 |
| 1.3 | P1 | Extend `declared_backgrounds` (targeted); delete dead per-selector literals (computed-no-op); visual/a11y/revert gates | 2d | P1 | AC-108..AC-112 |
| 2.1 | P2 | **Harness migration — lands first, alone** (recurse, glob `meta.source`, strengthen anti-vacuity, unlock logotype set) | 3d | P0 | AC-201..AC-205 |
| 2.2 | P2 | ITCSS layering + BEM wrap preserving the domain vocabulary | 5d | P0 | AC-206, AC-211, AC-212 |
| 2.3 | P2 | `@use`/`@forward` + `darken()` → `color.adjust()`, computed-hex-preserving | 3d | P1 | AC-208, AC-209 |
| 2.4 | P2 | Flatten `.share-button` to one definition preserving today's computed result | 1d | P1 | AC-207 |
| 3.1 | P3 | Split `.section-icon` into two blocks (**badge colour gated on D-D**) | 2d | P0 | AC-301..AC-303 |
| 3.2 | P3 | Install the skip link; `aria-hidden` the decorative TOC icon | 1d | P1 | AC-304, AC-305 |
| 3.3 | P3 | Extract the ranked duplicate components to shared includes | 4d | P1 | AC-306 |
| 4.1 | P4 | Liquid-resolving dead-code detector (**tooling before deletion**) | 2d | P0 | AC-403 |
| 4.2 | P4 | Remove the HIGH-confidence dead set (paired manifest deletion for `--dnd-red`) | 2d | P1 | AC-401, AC-402, AC-405 |
| 4.3 | P4 | MEDIUM set (**owner-elected**) | 1d | P2 | AC-406 |

Every phase additionally carries `npm run test:a11y-static` exit 0 (AC-109, AC-210, AC-307, AC-407).

## Open decisions — owner decides, this spec does not

### D-A — spacing scale

Two rival scales coexist; shared only at 20px/40px. Measured (raw occurrences):

| base-4 | n | base-5 | n |
|---|---|---|---|
| 4px | 61 | 10px | 48 |
| 8px | 51 | 15px | 27 |
| 12px | 10 | 5px | 25 |
| 32px | 10 | 30px | 13 |

Radius is **more fragmented than reported**: 11 distinct values, not 8 — 8px x20, 10px x17,
4px x10, 6px x8, 20px x8, 3px x4, 40px x2, 24px x2, 5px x1, 30px x1, 12px x1. `8px` and
`10px` are semantically the same "medium".

| option | pixels move? | trade-off |
|---|---|---|
| unify base-4 | yes, ~200 sites | industry default; the larger population (112 vs 113 — effectively a tie, so this is *not* a "follow the majority" argument); biggest blast radius |
| unify base-5 | yes, ~200 sites | matches the existing 10px/5px rhythm; unusual; same blast radius |
| keep two named scales | no | honest about the split; codifies incoherence; two tokens meaning "small" |
| **tokenize radius only** | **depends — see below** | **lowest risk; recommended** |

"Tokenize radius only" hides a sub-choice the option name conceals:

- **D-A-1 — 1:1 tokenization** (11 tokens, one per existing value): **zero pixel movement**, baseline-free, but codifies the fragmentation in token form.
- **D-A-2 — collapse to ~5 semantic tiers** (8px and 10px both become `--radius-md`): moves pixels by ≤2px at ~37 sites; **requires P0**.

**Recommendation: D-A-2 if P0 lands; D-A-1 as the baseline-free fallback.** Defer the
spacing unification entirely to a post-P4 change — it is orthogonal to ITCSS/BEM, and a
refactor whose promise is "no visual change" should not carry the largest visible change in
the program. **If** the owner later unifies, prefer base-4: 20px/40px are already shared
anchors and both scales' populations are within 1% of each other, so tie-break on convention.

### D-B — harness migration

**Recommendation: update `scss-scan.mjs` to recurse and `meta.source` to a directory glob,
as P2's first story (2.1), landing before any file move (AC-204).** Scored against three
alternatives (`ramza-score --rubric explore`): **H-B 75.5 (solid, selected)**, H-D 70.5,
H-A 65.5, H-C 62.

Forgoing the split (H-A, 65.5) forfeits P2's main deliverable to avoid ~2 lines of scanner
change; the real work is the `meta.source` glob and the strengthened anti-vacuity guard, not
the recursion. The guard matters more than the recursion: today's guard only catches a total
wipeout, so a scanner that skips one subdirectory yields a **green suite measuring nothing**.
AC-202 requires a mutation check — move a partial, prove the suite fails before AC-201 and
passes after.

### D-C — dark unification

Two mechanisms: `body.dark-mode` (JS, `_layouts/post.html:308-322`, `#toggle-dark-mode`
button at `:119`, styles at `_sass/_post.scss:1151`) vs `prefers-color-scheme`
(`@mixin dark-mode`, `_sass/_breakpoints.scss:63`). Measured: the toggle button exists **only
in `_layouts/post.html`** — all 15 standalone pages (`index`, `about`, `notebook`,
`laboratory`, `letter`, `codex`, `log`, `now`, `uses`, `start-here`, `accessibility`, `404`,
`notebook/{tech,hobby,llm}`) lack it.

**The WCAG angle, stated honestly:** there is **no WCAG AA success criterion requiring a
manual dark-mode toggle.** 1.4.3/1.4.11 apply to whatever is rendered, in either state;
1.4.8 (user control of colours) is **AAA** and scoped to text blocks. So: deleting the toggle
creates **no** violation, and keeping it satisfies **no** specific AA criterion. It is a real
UX affordance — `prefers-color-scheme` alone gives no manual override — but it should be
argued on UX, not compliance. (Compare the rebrand lesson: a claim justified on the wrong
axis had to be retracted.)

**Recommendation — separate mechanism from policy:**
1. **P1 converges the mechanism**: one dark flip block, one source of truth, applied through both selectors (`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` + `:root[data-theme="dark"] {...}`). This is what AC-101's parity requirement sets up, and it is prerequisite to *either* policy.
2. **P3 decides the policy** (toggle is markup, and markup is P3's domain): promote the toggle to the shared header include, or remove it.
3. **Interim: do not delete a working feature.** The toggle works on post pages today.

**My recommendation for the policy: promote it sitewide** via `data-theme`, because a control
present on 1 of ~16 page types is the one indefensible state — but note this **doubles the
dark surface area to maintain** unless step 1 lands first. If the owner does not want that
maintenance, **delete the toggle**; that is a legitimate choice and costs no compliance.

### D-D — the `.section-icon` badge colour *(added by mid-task correction; independently re-measured)*

**Root cause is naming, not cascade.** `.section-icon` is **two components sharing one class
name**:

- **inline icon** — `<i class="fas fa-scroll section-icon">` (`codex.html:33`, + about/notebook/laboratory/letter): class **on the icon**, styled `margin-right`/`color`. **4 definitions, 21 of 22 markup sites.** `_about.scss:1305`, `_notebook.scss:242`, `_laboratory.scss:202` are byte-identical (`margin-right: 1rem; color: var(--ff-purple-ink)`); `_letter.scss:244` differs only in `margin-right: 0.75rem`.
- **circular badge** — `<div class="section-icon"><i …></div>` (`_layouts/post.html:106`): class on a **wrapper**, styled `background`/`border-radius:50%`/`display:flex`/`color:white` by `_sass/_post.scss:314`. **1 definition, 1 site.**

The import-order collision (`main.scss:16` post, `:17` letter → letter wins at equal
specificity 0,1,0) is a **symptom**. Fix by **BEM split into two blocks** (AC-301) — not a
cascade tweak, not `!important`.

**Do not "restore the intended `color: white`."** Re-measured with `scripts/lib/color-math.mjs`
on the `--ff-purple-light` (`#b19cd9`) ground:

| foreground | ratio | note |
|---|---|---|
| intended `white` | **2.43** | the design |
| actual `--ff-purple-ink` `#783cb4` | **2.78** | the accident — **better than the design** |

Restoring intent **regresses** visibility. Neither clears 3.0. `#b19cd9` is **not** in
`declared_backgrounds`, so **no test ever measured this badge in either state** — the "intent"
was never verified.

**Severity, not inflated:** the icon is **decorative** (the adjacent
`<h3 class="toc-title">Contents</h3>` carries the meaning), so **WCAG 1.4.11 does not bite.**
This is a visual/architectural defect, **not an a11y failure**. No criterion here asserts a
3.0/4.5 threshold — that would be a fabricated requirement.

| option | measured | trade-off |
|---|---|---|
| keep the darker ink | `#783cb4` on `#b19cd9` = **2.78** | zero change; best of the two current candidates; still <3.0 |
| darken the badge ground | `darken(#b19cd9, 20%)` = `#7752bd`, white = **5.64** | clears 3.0 comfortably; changes the badge's visual identity toward `--ff-purple-ink` |
| **drop the badge; use the inline form** | inherits the 21-site treatment | **recommended** — resolves the naming defect and the colour question in one move; the only option that *removes* rather than adds; the badge is the 1-of-22 outlier |

**Recommendation: option 3**, gated on the owner (it is a visible design change to the post
TOC) and on P0. Current state: **both candidates unmeasured-and-below-3.0, decorative so
non-blocking.**

## Rejected Alternatives

- **H-A — keep `_variables.scss` monolithic, forgo the ITCSS token split (65.5, weak).** Zero harness risk, but surrenders the phase's deliverable to avoid a two-line scanner fix. Rejected — the cost is misattributed; the guard, not the recursion, is the work.
- **H-C — generate `_variables.scss` from the manifest, or vice versa (62, weak).** Kills bidirectional drift by construction, but adds a codegen step to a Jekyll site whose contributors would then edit a generated file. Rejected — cure worse than disease.
- **H-D — retarget the harness at compiled CSS rather than SCSS sources (70.5, solid; runner-up).** Structurally the *right* long-term answer: it decouples the harness from source layout permanently, so ITCSS/`@use`/file moves become invisible to it, and it measures **what actually ships**. Scored highest on correctness (9) — **it would have caught the `.section-icon` collision**, which is invisible to a per-file source scan. Rejected **for now** on cost: it needs a Jekyll build inside the test loop (performance 4) and rebuilds the a11y suite, which is the project's trust anchor, mid-refactor. **Carry the insight forward narrowly:** P3's duplicate/collision detector (AC-301, AC-306) should read the **compiled** stylesheet, where the cascade is resolved. Revisit H-D wholesale after P4.

## Risks

| id | risk | severity | mitigation |
|---|---|---|---|
| R1 | ~~P0 does not exist~~ **RESOLVED at R1** — P0 landed mid-session (84 baselines, light+dark). Residual: **the baselines record today's defects as correct** | P1 | AC-111 requires the `test:visual:update` diff to be justified per AC-110, never rubber-stamped |
| R2 | Extending `declared_backgrounds` surfaces currently-failing dark pairs mid-phase | P0 | AC-105/AC-106 pre-commit to measure→tabulate→route-to-owner; forbid silent exemption |
| R3 | Scanner silently skips moved partials → **green suite measuring nothing** | **P0** | AC-201 + AC-202 mutation check; AC-204 orders harness before moves |
| R4 | A BEM rename dissolves the domain vocabulary into generic names | P0 | AC-206; `.scroll-card -> .scroll__card`, never `.card` |
| R5 | Liquid-interpolated classes deleted as dead | P0 | AC-403 fixture asserts both known interpolated names are LIVE |
| R6 | D-A collapse moves pixels with no baseline | P1 | AC-108 forbids value changes until D-A resolves; D-A-1 fallback is baseline-free |
| R7 | `darken()` migration silently shifts a derived hex | P1 | AC-209 pins `--ff-purple-ink` = `#783cb4` |
| R8 | Phases entangle; a revert of one drags another | P1 | one ESL change per phase; AC-204-style ordering gates; per-phase a11y gate |
| R9 | `.share-button`'s *intended* design is unknown; flattening picks a winner by accident | P2 | AC-207 preserves today's **computed** result rather than choosing; GAP-5 |
| R10 | **Live WCAG 1.4.3 AA text failures ship today** — the RETRACTED R1 figure was `.item-rarity-label` 2.26 (that pair is 11.91 and PASSES); the real failures are `/about` dark (`#e0e0e0` on white = **1.32**) and `.scroll-seal` on `--ff-gold` (**3.27** light / **1.61** dark) | **P0** | AC-105/AC-106 repair and prove them on the compiled cascade; AC-108 lets the suite *see* the gold/dark grounds; AC-107 guards the false target |
| R11 | Post pages in OS-dark could land in a **mixed state** (some tokens flip, some do not) | P1 | Largely resolved by the P1 consolidation (one canonical dark set); AC-105's compiled-cascade sweep covers the post target in dark; residual GAP-7 note retained |

## GAPs — marked, not invented

- **GAP-1 — RESOLVED at R1.** P0 landed *during* this session: `test:visual` + `test:visual:update`, 84 baselines (14 targets x 3 viewports x 2 themes), 0.1% tolerance, dark via `colorScheme` for all targets + `body.dark-mode` for the post target. **Residual caveat:** I never observed a green `test:visual` run — mine aborted on `EADDRINUSE` (port 4174), consistent with the concurrent P0 agent, not a diff failure. **Confirm a clean run before relying on the gate.**
- **GAP-7 (new, R1).** Post pages in OS-dark **without** the toggle: `_post.scss` flips `--dnd-brown`/`--post-background` only under `body.dark-mode` and has no `prefers-color-scheme` block, while other partials flip `:root` globally — a mixed state I did **not** verify renders correctly. P0's post-target dark baseline can now settle it.
- **GAP-2.** The exact partition of dark hex occurrences into *flip declarations* vs *compensation literals* is uncomputed. Raw measured totals over `_sass/*.scss`: `#e0e0e0` 25, `#2c2c2c` 12, `#b0b0b0` 10, `#232323` 7, `#909090` 4 = **58**; the scout reports ~51 compensation literals across 5 hexes (24/12/10/6/4). The delta is consistent with the flip declarations themselves being counted in my raw grep, but **I did not verify that**. AC-102 requires the census script to compute the partition rather than assume it.
- **GAP-3.** Whether extending `declared_backgrounds` surfaces failing pairs, and how many, is unknown until run. AC-105/AC-106 specify the *procedure*, not the outcome.
- **GAP-4.** D-A, D-B, D-C, D-D are unresolved. Recommendations given; **the owner decides.**
- **GAP-5.** Which `.share-button` definition was intended is unknowable from the source. AC-207 sidesteps it by preserving the computed result; if the owner wants a *designed* button, that is a separate change.
- **GAP-6.** The Sass deprecation *warning* counts (scout: 35 `@import`, 15 `darken()`) are warning counts; I measured **16 `@import` statements** and **18 `darken()` call sites**. I did not run a Sass build to reconcile warnings-vs-occurrences. Direction is unambiguous (both are deprecated, both must migrate); the exact warning count is not load-bearing and is not asserted.

## Acceptance Criteria

**Canonical source: `.spectra/changes/normalize/normalize.criteria.md`** — 38 EARS-form
criteria, `ramza-ears-lint` green, frozen by `ramza-freeze` (hash rides the envelope as
`x_ramza_acceptance_criteria`). That file governs; this table is a navigational index and
**must not be edited independently of it**.

| phase | criteria | count | gate at phase end |
|---|---|---|---|
| `normalize-p1` | AC-101..AC-112 | 12 | `npm run test:a11y-static` exit 0 (AC-111) |
| `normalize-p2` | AC-201..AC-212 | 12 | `npm run test:a11y-static` exit 0 (AC-210) |
| `normalize-p3` | AC-301..AC-307 | 7 | `npm run test:a11y-static` exit 0 (AC-307) |
| `normalize-p4` | AC-401..AC-407 | 7 | `npm run test:a11y-static` exit 0 (AC-407) |

**Every phase must leave both `npm run test:a11y-static` and `npm run test:visual` green.**
`test:a11y-static` is the project's trust anchor; `test:visual` **now exists** (P0 landed
mid-session — R1), so AC-103/AC-108/AC-207 are verifiable and the `[BLOCKED-ON-P0]` marks are
lifted. **P1 is the exception by design:** it MUST produce a visual diff at the AC-110
selectors, so its gate is `test:visual:update` + an intentionality review (AC-111), not a
zero-diff assertion.

**Baseline measured at spec time:** `npm run test:a11y-static` passes today (AC-034, AC-058,
AC-038, AC-040 and the 4a suite all green). Any red in that suite during P1–P4 is caused by
the phase, not inherited.

## Confidence

Computed via `ramza-score --rubric confidence` — see `.spectra/plans/normalize.state.json`.
