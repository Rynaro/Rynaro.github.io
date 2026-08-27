---
eidolon: ramza
kind: spec
version: 0.4.0
created_at: 2026-07-16
plan: rebrand
change_id: rebrand
site: hlavezzo.me
target_repos: [Rynaro.github.io]
esl: {tier: full, maker: vivi, checker: kupo, has_code: true}
spec_ref: .claude/rebrand/rebrand-plan.md
criteria_ref: .claude/rebrand/rebrand.criteria.md
criteria_sha256: 393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5
stories_count: 33
validation_gates_count: 59
critic: {passes: 3, verdict: "APPROVE - executor-ready", blocking_open: 0}
projection_of: "rebrand-plan.md v0.4.0 (frozen, approved)"
---

# Spec — Rebrand & Augmentation, hlavezzo.me ("Code Alchemist")
## ESL `specify` hop — the machine-shaped projection of an approved, frozen plan

**This document introduces no requirement that the plan does not already carry.** It is the
ESL-shaped projection of `.claude/rebrand/rebrand-plan.md` **v0.4.0**, which is frozen at
`criteria_sha256: 393f1e59…` and was returned **APPROVE — executor-ready** by an independent
critic on its third pass. Nothing here re-plans, re-scores, or re-opens. Where this spec and the
plan could ever disagree, **the plan and the frozen criteria file govern.**

The normative text is the **59 EARS criteria**, reproduced below **byte-identical** to the frozen
criteria file (verified by diff, not by claim — see *Provenance*). The plan's own hardest-won
lesson is that *a plan whose prose is more rigorous than its criteria will ship the prose and gate
nothing*; this spec therefore restates as little prose as it can and points at the gates.

---

## Status

| | |
|---|---|
| **ESL change** | `rebrand` · status `proposed` · tier **full** |
| **Maker / checker** | `vivi` / `kupo` — distinct roles, enforced at the ESL layer |
| **Plan** | v0.4.0, frozen, `criteria_sha256: 393f1e59…`, 59 criteria, 33 stories, 6 phases, 22 defects |
| **Critic** | **3 passes: 7 blockers → 3 → 0.** Third pass: **APPROVE — executor-ready** |
| **Confidence** | author **80.0** · independent critic **81.5** — both **VALIDATE** |
| **Complexity** | **11/12 → human_loop** (scope 3, ambiguity 2, dependencies 3, risk 3) |
| **Right-size** | **full**, computed twice by independent tools: `ramza-rightsize` score 7, and ESL `right_size` from (files_touched 32, rubric_score 11, tradeoff_present true). **No override anywhere** |
| **Owner decisions** | **8 of 8 closed** (2026-07-16, binding). Nothing blocks Phases 0–4 on owner input |
| **External dependency** | **1** — the Formspree form-hash ID (see *External dependencies*) |

---

## Scope

**Intent class:** STRATEGIC (identity rebrand) composed of REQUEST/CHANGE work items.

**In:** identity & voice canon (A); content architecture, taxonomy, themed post-types, journal
mechanics (B); experience & trust plumbing (C); the 22-item defect backlog (D); the 6-phase
roadmap (E); owner decisions (F); layout, UI/UX & accessibility (G — Phase 4); the Transmutation
Circle (H — Phase 5, **optional, owner-gated**).

**Out:** post prose (this spec fixes *shapes and slots*). A visual redesign — **the skin stays**;
Phase 4 moves the *text* layer and the *boundary* layer, and **every pastel keeps its exact hex**.
Migrating off Jekyll/GitHub Pages, or `opal` in `jekyll_plugins` [EC-6]. **Opal as plumbing** —
rejected at **30.0×** the heaviest page [Ruling 1]. **A themed dark "obsidian" surface** — dropped;
its premise was dead code, and every ink token fails on it (1.26–3.59:1).

**Deferred:** analytics vendor *implementation*; webmentions/POSSE; PT-BR content; per-tag feeds;
email mirror; character-sheet dynamic numbers (D14); **AAA** beyond 2.4.13; paid audits; VPAT;
professional AT-user testing. **APCA / WCAG 3.0 — do not act on it**; design to WCAG 2.

**Declared execution scope (25 globs)** — anything changed outside this set is DRIFT:

```
_config.yml  _data/*  _layouts/*  _includes/*  _posts/*  _sass/*
assets/images/*  assets/js/*  _opal/*  .github/workflows/*
index.html  about.html  notebook.html  laboratory.html  letter.html  404.html
now.*  uses.*  start-here.*  accessibility.*
Gemfile  Gemfile.lock  package.json  .pa11yci  robots.txt
```

---

## Approach

**Selected: Hypothesis D — "Spine, then phased shippable surfaces"** (`explore` **87.5, elite**;
B 72.5, A 65.5, C 65.0).

**Accessibility shape: E5′ — "Fence the gimmick" = E2 + the CI ratchet** (**87.0, elite**; E2 86.5,
E3 70.5, E1 59.5, E4 59.0). E5 (87.5) is **retired**: its `E5 ⊃ E2` dominance was false — the
obsidian module mutates E2's declared-background set, which *is* E2's definition.

### Doctrine — persona-as-moat, substance-in-skin

Every "text-first / minimal" best practice is adopted at the **substance layer** and **renamed into
the alchemist metaphor** at the surface. The fantasy chrome is the moat.

> **The persona survives because the decoration is exempt *by spec*, not by mercy** — but that only
> works if the decoration carries no information. **The moment a rune means something, it loses its
> exemption.**

**That sentence is a gate, not a slogan:** **AC-047** binds token *usage* to classification,
**AC-048** requires a complete two-axis manifest, **AC-049** puts the palette test in CI from slice
4a onward. An executor who classifies every token as ornament — or as `logotype` — now **fails**.

### The three standing decisions

| | Ruling |
|---|---|
| **DECISION-A** | Layer split: RES-A11Y is operative for the decorative layer, RES-SITE §4 for the substance layer. §4's recommendation is **moot on its own terms, not overruled**. Does **not** license reading-path byte growth |
| **DECISION-B** | **Phase 5 sequences after Phase 4.** Disjoint blast radius is **risk-containment, not a scheduling licence** — attention does not parallelize |
| **DECISION-C** | **Ruling 2 ships as correctness + accessibility + SEO. Never as speed.** ⬅ *see below* |

### `[DECISION-C]` — the invariant that must not regress

**Binding and non-negotiable.** The measurement refutes the performance framing outright:

| Figure | Value |
|---|---|
| Heaviest page (home = `main.js` + `sigil-navigation.js` + `home.js`) | **4,778 B gzipped** |
| All eight site JS files, **each gzipped separately, as served** | **11,028 B** |
| Island artifact (proxy) | **143,453 B gz** |
| Ratio vs heaviest page / vs the 8-file sum | **30.0×** / **13.0×** |

**There was never a performance problem.** Deleting most of the site's JavaScript saves a few KB.

| Ruling 2 is justified by | Status |
|---|---|
| **Correctness** — the no-JS empty-TOC defect (D15) | Real |
| **A11y** — the missing JS-level reduced-motion guards (D16) | Real |
| **SEO / plan alignment** — AC-013's server-rendered categories | Real |
| **Performance** | **WITHDRAWN — the site was already fast** |

**Executors and copy MUST NOT sell Phase 2's JS reduction as a speed win.** The site whose persona
cites Dan Luu cannot afford a fake performance claim. An independent critic verified **zero perf
residue across 17 grep hits** — *do not reintroduce any.*

**The owner's "insight" answer [OWNER 8] does NOT reopen this.** It licenses **craft** satisfaction
— *Ruby transmutes the site at build time* — and is **not** permission to revive the withdrawn
performance justification.

### Ruling 2 is the headline deliverable, not groundwork

The owner answered the one question FORGE declined to decide: **the build-time reframe lands as
*insight*, not a substitute** — *"It's insight — that's genuinely satisfying."* Consequences, all
binding:

1. **FORGE RISK-5 is CLOSED** — *"owner rejects Ruling 2 as a substitute good and reads the verdict
   as a soft 'no'"* was live and unmitigated, and mitigable by nobody but the owner. He
   affirmatively accepted Ruling 2 **on its own terms**.
2. **Ruling 2 is promoted to headline deliverable.** Stories **2.2** (AC-013 server-rendered
   categories), **2.5** (AC-023 kramdown/generator TOC, which also kills D15's no-JS empty
   `Contents`), **2.6** (AC-024 sitewide motion guards), **2.7** (build-time nav state) and **3.5**
   (AC-025 `prefers-color-scheme`) are **the marquee** — narrate them that way.
3. **Phase 5's justification narrows to joy alone — correctly.** The island no longer carries C7
   (owner joy / craft-identity), because Ruling 2 now does.
4. **The framing discipline is unchanged.** DECISION-C stands.

---

## Phased roadmap & dependencies

| Phase | Ships (independently) | Depends on | Acceptance |
|---|---|---|---|
| **0 — Identity Spine** | Identity line, one job title, post-type/assay convention, four-era About | — | AC-001..003 |
| **1 — Trust & Defect** | Clean build, no broken assets, SEO wiring, full-text feed, UA removed, sitemap/canonical, **4 previously un-gated defects** | 0 | AC-004..011, **054..057** |
| **2 — Content Architecture** *(**+ Ruling 2 — HEADLINE**)* | Home surfacing, server-rendered categories, /now, /uses, start-here, themed 404, **server-rendered TOC**, **sitewide motion guards**, build-time nav state | 0, 1 | AC-012..016, 023, 024 |
| **3 — Journal & AI-in-Frame** *(+ Ruling 2 tail)* | Type badges, assay labels, reader contract, disclaimer, 2026 re-type, Alchemist's Log, **no-JS dark mode** | 0, 2 | AC-017..022, 025 |
| **4 — Layout, UI/UX & A11y** | **4a:** ink/ornament split + usage binding, hairlines, rarity label, finite circle + `--motionOK`, palette test in CI. **4b:** meter semantics, pips + no-JS rarity, ornament hiding, nav gloss, fluid type/reflow, focus/targets/spacing, axe ratchet, `/accessibility` | 0, 1, 2, 3 | AC-026..040, **047..049, 058** |
| **5 — The Transmutation Circle** | **OPTIONAL · OWNER-GATED.** Value-floor record, `opal-browser` probe, widget, precompile + drift gate, **the Transmutation post** | **1 (HARD — EC-1)**; **4 (by ruling)**; recommended after 2 | AC-041..046, **050..053**, **059** |

**Dependency spine.** P0 unblocks all → P1 stabilizes before P2 expands → P3 needs P0's vocabulary
+ P2's taxonomy → **P4 is craft on a stable base** → **P5 is indulgence, last, optional.**

**Phase 4 ships in two independently-deployable slices** (~15.5d total):
- **4a** — the measured contrast failures **and both live WCAG failures** (2.2.2 *and* 1.4.1).
  Stories 4.1, 4.2, 4.4a, 4.5, 4.10a → AC-026, 027, 030, 031, 047, 048, 049. **The palette test
  ships here, so 4a does not self-certify.**
- **4b** — semantics & craft. Stories 4.3, 4.4b, 4.6–4.9, 4.10b, 4.11. **AC-040 (`/accessibility`)
  ships LAST** — a conformance claim the site does not meet is worse than no page.

### Phase 5 — optional, owner-gated, and probably not

**Do not begin without an explicit owner decision.** RISK-1 (attention displacement — 18 build
commits, then one post in 16 months) is **untouched by any measurement** and remains dominant.

> **EC-1 is the whole verdict; everything else is engineering.**
> *The bytes were never the question. The hours are.*

- **Hard gate:** Phase 1 closed (AC-004..AC-011) — **EC-1**. **RC-5:** if Phase 1 has not closed in
  a period the owner considers reasonable, **EC-1 hardens from "gate" to "no."**
- **Sequenced after Phase 4** by FORGE ruling — Opal *"is strictly less important than the a11y work
  it could jeopardize."*
- **AC-053 requires a committed, dated `go` record whose timestamp precedes any `_opal/` commit.**
  A `no-go` followed by an `_opal/` commit **fails**.
- **Realistic disposition: "probably not, and that is a fine outcome."** With the reframe satisfying
  the craft desire, the island is no longer load-bearing. **RC-8 already holds:** the post is
  **writable from data in hand** — the **96.6 / 2.9 / 0.49** decomposition needs **nothing built**.
- **Numbering:** FORGE's "Phase 4 — The Transmutation Circle" is **this plan's Phase 5**.
  **AC-040 is Phase 4 only** — declining Phase 5 cannot drop `/accessibility`.
- **The budget stays 150 KiB gz — do not raise it.** The ceiling scopes to the **page total, not
  the artifact**. Net headroom **≈6,238 B** (Laboratory host) / **≈7,858 B** (bare page) — **not
  10,147**. One `require` ≈ 4,212 B, so **one more require consumes most of the budget and RC-7
  fires**. Measure the page total; never infer it.

---

## External dependencies

| # | Dependency | Owner | Blocking |
|---|---|---|---|
| **1** | **Formspree form-hash ID** — replaces the endpoint at `letter.html:98`, which currently posts to `https://formspree.io/f/hi@hlavezzo.me`, *an email where a hash ID belongs* (D9) | **The site owner only** | **The contact-form story cannot complete without it.** It is a **credential**, not a research task; **no amount of executor effort substitutes** |

**Handling — normative:** **ship the rest of Story 1.1 without blocking on it.** Keep
`mailto:hi@hlavezzo.me` as the interim fallback and close D9 when the ID arrives. **Do not let it
hold Phase 1.** This is the **only** owner-input dependency remaining in Phases 0–4.

---

## Acceptance

**59 EARS criteria.** The block below is reproduced **byte-identical** to the frozen criteria file
`.claude/rebrand/rebrand.criteria.md` (`sha256 393f1e59…`), which is the normative source. Phase
tags on the headings are the plan's annotation; **the bodies are the frozen text**.

**Distribution:** Phase 0 → 3 · 1 → 12 · 2 → 7 · 3 → 7 · 4a → 7 · 4b → 12 · 5 → 11 = **59**.

**Read the linter honestly.** `ramza-ears-lint` checks form ∈ set, one `THEN`, no literal `" AND "`,
and that a `VERIFY` exists. **It cannot see whether a VERIFY verifies its THEN, whether an AC is
falsifiable, or whether its quantifier ranges over anything real.** Every blocking finding against
v0.2 lived in that blind spot — and so did v0.3's R-1 regression, which linted green at 58/58.
**Green is necessary, not sufficient.**

### AC-001 (ubiquitous)  ·  **Phase 0**
THEN the site SHALL define the canonical compound identity line in exactly one `_data` field consumed verbatim by the homepage hero, the About page, and the meta description
VERIFY: grep finds the identity string defined once under `_data/`; index.html, about.html, `_includes/head/meta.html` each reference that field

### AC-002 (ubiquitous)  ·  **Phase 0**
THEN the site SHALL present one canonical job title identically in `_data/character_build.yml` and `_data/jobs.yaml`, replacing the Director-of-Development vs Director-of-Engineering split
VERIFY: the job title in character_build.yml equals jobs.yaml[0].title; `grep -rn "Director of" _data` yields a single distinct title

### AC-003 (ubiquitous)  ·  **Phase 0**
THEN the repository SHALL document the five themed post-types as the closed set of allowed `type` front-matter values in a committed conventions file
VERIFY: a conventions doc enumerates {scroll, cantrip, log, distillation, transmutation} as the permitted `type:` values

### AC-004 (event-driven)  ·  **Phase 1**
GIVEN the rebranded site source
WHEN `jekyll build` runs with `JEKYLL_ENV=production`
THEN the build SHALL exit 0 with no missing-layout or missing-include error in its log
VERIFY: gate: `jekyll build` exits 0; build log contains no "Could not find layout" or "Included file not found"

### AC-005 (unwanted-behavior)  ·  **Phase 1**
GIVEN favicon and social-card image references in the built output
WHEN `_site` is scanned for local image paths
THEN every referenced local image SHALL resolve to a file that exists, never a dangling path such as bottle.png or me.jpg
VERIFY: script asserts each local image reference in `_site` exists on disk; zero missing

### AC-006 (event-driven)  ·  **Phase 1**
GIVEN a post carrying a per-post summary field
WHEN the page is built with jekyll-seo-tag enabled
THEN the emitted meta description SHALL be that post's own summary rather than the generic site description
VERIFY: for a sample post, the `_site` meta description equals the post summary text, not `site.description`

### AC-007 (ubiquitous)  ·  **Phase 1**
THEN the site SHALL publish a syndication feed whose entries contain the full post body rather than a truncated excerpt
VERIFY: the first `feed.xml` entry content length is within 5% of the rendered post body length

### AC-008 (ubiquitous)  ·  **Phase 1**
THEN the site chrome SHALL surface a human-visible link to the feed in the header or footer, not only a `<link rel>` hint
VERIFY: an `<a>` whose href resolves to the feed appears in the rendered header or footer markup

### AC-009 (unwanted-behavior)  ·  **Phase 1**
GIVEN the retired Universal Analytics property
WHEN the built site is scanned for analytics identifiers
THEN no `UA-` Universal Analytics identifier SHALL remain in any emitted page
VERIFY: `grep -r "UA-135917274" _site` returns zero matches

### AC-010 (ubiquitous)  ·  **Phase 1**
THEN the build SHALL emit a `sitemap.xml` listing the published pages of the site
VERIFY: `_site/sitemap.xml` exists and lists at least the home, About, Notebook, plus each post URL

### AC-011 (ubiquitous)  ·  **Phase 1**
THEN every rendered page SHALL carry a canonical URL whose host is the served `hlavezzo.me` origin
VERIFY: each page's `<link rel="canonical">` host equals `hlavezzo.me`

### AC-012 (event-driven)  ·  **Phase 2**
GIVEN the homepage
WHEN it is rendered
THEN it SHALL surface reader-facing post content below the hero rather than a hero-only landing
VERIFY: `_site/index.html` contains a post-list region linking at least the most recent post permalink

### AC-013 (unwanted-behavior)  ·  **Phase 2**
GIVEN the Notebook category filter tabs
WHEN a reader filters by any category present in the post corpus
THEN every post SHALL be reachable through a non-"All" tab, never orphaned behind a phantom `storybook` tab
VERIFY: the set of tab `data-category` values equals the set of categories used by posts; no tab maps to zero posts

### AC-014 (ubiquitous)  ·  **Phase 2**
THEN the site SHALL publish a `/now` page that displays a visible last-updated date
VERIFY: `_site/now/` renders and contains a "last updated" date string

### AC-015 (ubiquitous)  ·  **Phase 2**
THEN the site SHALL publish a `/uses` page listing the current toolchain including the AI familiars
VERIFY: `_site/uses/` renders and lists hardware or editor plus the AI tools such as Claude or local models

### AC-016 (ubiquitous)  ·  **Phase 2**
THEN the site SHALL serve a 404 page rendered through an existing themed layout rather than the unstyled minima remnant
VERIFY: `_site/404.html` renders with the site chrome; no reference to a missing `page` layout remains

### AC-017 (event-driven)  ·  **Phase 3**
GIVEN a post declaring a `type` from the themed vocabulary
WHEN the post renders
THEN the post layout SHALL display a visible post-type badge matching that declared type
VERIFY: a post with `type: cantrip` renders a badge labeled for the cantrip type in `_site`

### AC-018 (optional-feature)  ·  **Phase 3**
GIVEN a post that sets the optional epistemic-status (`assay`) field
WHEN the post renders
THEN the layout SHALL display the declared epistemic-status label
VERIFY: a post with `assay: speculative` renders the speculative label in `_site`

### AC-019 (ubiquitous)  ·  **Phase 3**
THEN the site SHALL publish a reader-contract page stating the right-to-be-wrong or living-document terms for the journal
VERIFY: a terms or contract page renders and states the correction or revision policy

### AC-020 (ubiquitous)  ·  **Phase 3**
THEN every page SHALL carry a sitewide "opinions are my own, not my employer's" disclaimer in the global footer
VERIFY: the disclaimer string appears in the shared footer include of every rendered page

### AC-021 (event-driven)  ·  **Phase 3**
GIVEN the 2026 LLM-routing post
WHEN the research-dump ("transmutation") post-type is applied to it
THEN it SHALL render with a post-type badge visibly distinct from the handcrafted "scroll" essays
VERIFY: the post's rendered badge label differs from a scroll post's badge label

### AC-022 (ubiquitous)  ·  **Phase 3**
THEN the site SHALL provide a cadence-anchor stream ("Alchemist's Log") with its own index or tag aggregation page
VERIFY: a log index or tag page renders and lists the log-type entries

### AC-023 (event-driven)  ·  **Phase 2**
GIVEN a post whose body contains headings
WHEN the rendered page is loaded with JavaScript disabled
THEN the table-of-contents region SHALL contain server-rendered links to those headings rather than an empty "Contents" shell
VERIFY: JS-disabled fetch of a post shows `#toc-content` containing at least one anchor whose href matches a heading id

### AC-024 (unwanted-behavior)  ·  **Phase 2**
GIVEN any page of the site
WHEN the operating system reports a reduced-motion preference
THEN no script-created animated node SHALL be injected into the page DOM
VERIFY: headless run with `prefers-reduced-motion: reduce` emulated over Home, About, Notebook, Laboratory, and Letter asserts zero script-injected animated nodes; `grep -rn "style.animation" assets/js/` shows every injection site behind a `matchMedia` reduced-motion guard

### AC-025 (event-driven)  ·  **Phase 3**
GIVEN a visitor whose operating system reports a dark colour-scheme preference
WHEN any page is loaded with JavaScript disabled
THEN the page SHALL render in the dark theme via `prefers-color-scheme`
VERIFY: JS-disabled render with `prefers-color-scheme: dark` emulated shows the dark theme background token on every page, not only post pages

### AC-026 (ubiquitous)  ·  **Phase 4a**
THEN every palette token whose manifest role is `content` SHALL reach a contrast ratio of at least 4.5:1 against each declared background it is used on
VERIFY: the palette contrast unit test enumerates every (token, background) pair in which a `content`-role token is used across the declared-background set -- cream, light, parchment-dark, and the hero gradient stops `#211C30`/`#312A45` -- and asserts every pair is >= 4.5 without rounding; the test fails if the `content` set is empty

### AC-027 (ubiquitous)  ·  **Phase 4a**
THEN every meaning-bearing non-text boundary SHALL reach a contrast ratio of at least 3:1 against its adjacent colour
VERIFY: the palette contrast test asserts the stat-bar track hairline and fill-edge tokens are >= 3:1 against the adjacent surface without rounding

### AC-028 (ubiquitous)  ·  **Phase 4b**
THEN each character-sheet HP, MP, and ST bar SHALL expose `role="meter"` carrying `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`
VERIFY: axe run on the About page reports each HP/MP/ST bar with role meter and a non-empty aria-valuetext such as "85 of 100 hit points"

### AC-029 (ubiquitous)  ·  **Phase 4b**
THEN the EXP bar SHALL expose `role="progressbar"` rather than `role="meter"`
VERIFY: axe run on the About page reports the EXP bar with role progressbar and the required aria-value attributes

### AC-030 (unwanted-behavior)  ·  **Phase 4a**
GIVEN a project rendered with a rarity tier
WHEN the rarity chip is presented
THEN the tier SHALL be conveyed by a visible text label, never by chip colour alone
VERIFY: each rarity chip in `_site` contains the tier word as text; Color Oracle simulation confirms tiers remain distinguishable without hue

### AC-031 (unwanted-behavior)  ·  **Phase 4a**
GIVEN any auto-starting animation presented in parallel with other content on any page
WHEN the page is loaded with no motion preference expressed
THEN the animation SHALL complete within five seconds rather than loop indefinitely
VERIFY: `grep -rn "infinite" _sass/ assets/js/` returns zero hits outside a `--motionOK` gated block; each remaining animation declares a finite duration <= 5s and a non-infinite iteration count

### AC-032 (ubiquitous)  ·  **Phase 4b**
THEN every purely decorative SVG ornament SHALL be hidden from assistive technology by exactly one method
VERIFY: each ornament SVG root carries `aria-hidden="true"` and no ornament carries both `aria-hidden` and an empty `alt`

### AC-033 (ubiquitous)  ·  **Phase 4b**
THEN every themed navigation item SHALL expose an accessible name that contains its visible themed label
VERIFY: the accessible name for the Notebook link contains the string "Notebook"; axe reports no label-in-name violation

### AC-034 (unwanted-behavior)  ·  **Phase 4b**
GIVEN a fluid type rule expressed with `clamp()`
WHEN the rule is evaluated
THEN its maximum value SHALL be no more than 2.5 times its minimum value
VERIFY: a script parses every `clamp()` in `_sass/` and asserts max/min <= 2.5

### AC-035 (event-driven)  ·  **Phase 4b**
GIVEN any page of the site
WHEN it is viewed at a viewport width equivalent to 320 CSS pixels
THEN the content SHALL reflow without requiring scrolling in two dimensions
VERIFY: a 320px-wide render of Home, About, and one post shows no horizontal scrollbar

### AC-036 (event-driven)  ·  **Phase 4b**
GIVEN any interactive element
WHEN it receives keyboard focus
THEN its focus indicator SHALL remain visible and not be entirely obscured by the fixed sidebar or sticky chrome
VERIFY: keyboard walk of Home, About, and one post shows a visible focus ring on every interactive element with no element hidden behind the 60px sidebar

### AC-037 (ubiquitous)  ·  **Phase 4b**
THEN every pointer target SHALL present a hit area of at least 24 by 24 CSS pixels or satisfy the 24px spacing exception
VERIFY: axe target-size check reports zero violations across the sigil nav and social icon row

### AC-038 (unwanted-behavior)  ·  **Phase 4b**
GIVEN a themed chip, badge, banner, or stat row
WHEN a user overrides text spacing to the 1.4.12 values
THEN no text SHALL be clipped by a fixed height
VERIFY: `grep -rnE '(^|[^-[:alnum:]])height:[[:space:]]*[0-9]' _sass/` returns zero hits within themed chip, badge, banner, or stat-row rule blocks (this pattern excludes `min-height`/`max-height`/`line-height`); the text-spacing bookmarklet clips nothing

### AC-039 (ubiquitous)  ·  **Phase 4b**
THEN the continuous-integration pipeline SHALL fail the build when any sitemap URL reports a WCAG 2.2 AA violation
VERIFY: `pa11y-ci` with the axe runner and `standard: WCAG2AA` runs over the sitemap in GitHub Actions and exits non-zero on any violation

### AC-040 (ubiquitous)  ·  **Phase 4b**
THEN the site SHALL publish an `/accessibility` page stating the conformance target and the known gaps
VERIFY: `_site/accessibility/` renders and names WCAG 2.2 AA, the automated axe check, and a contact route for reports

### AC-041 (unwanted-behavior)  ·  **Phase 5**
GIVEN the compiled Opal island artifact
WHEN any page other than the island page is built
THEN it SHALL ship zero bytes of Opal runtime
VERIFY: a script builds the set of every page in `_site` that loads Opal runtime bytes -- resolving each page's `<script src>` references and matching those referenced payloads against `Opal` -- and asserts that set equals exactly {`_site/laboratory/transmutation-circle/index.html`}; the check inspects the referenced `.js` payloads, not the HTML text

### AC-042 (ubiquitous)  ·  **Phase 5**
THEN the island page total JavaScript SHALL be at most 150 KiB gzipped
VERIFY: gzipped byte sum of every script the island page loads is <= 153600

### AC-043 (unwanted-behavior)  ·  **Phase 5**
GIVEN the committed Opal artifact
WHEN the drift gate recompiles the source
THEN the committed output SHALL match a recompile that pins the exact flag set including `--no-source-map`
VERIFY: CI recompiles with the pinned flag list and byte-compares against the committed artifact; no `sourceMappingURL` appears in the committed output

### AC-044 (ubiquitous)  ·  **Phase 5**
THEN the island's Ruby `require` list SHALL be enumerated in a committed manifest with a measured gzipped cost recorded per require
VERIFY: a committed manifest lists each require with its measured gz delta; every entry beyond `native` carries a measurement predating its adoption

### AC-045 (event-driven)  ·  **Phase 5**
GIVEN the island page
WHEN it is loaded with JavaScript disabled
THEN it SHALL present a static inline SVG of the circle with explanatory prose
VERIFY: JS-disabled fetch of the island page shows a `<noscript>` region containing an inline `<svg>` and descriptive text

### AC-046 (ubiquitous)  ·  **Phase 5**
THEN the island SHALL ship together with a `type: transmutation` post stating, in the owner's own words, what the widget does that justifies 135 KiB of runtime to a reader
VERIFY: the post contains an explicit value-floor paragraph naming what the widget does for the reader; a reviewer can answer "would someone visit this for its own sake?" from that paragraph alone

### AC-047 (unwanted-behavior)  ·  **Phase 4a**
GIVEN a palette token referenced by a CSS `color`, `border-color`, or `fill` rule that renders body text or a meaning-bearing boundary, and whose manifest role is not `logotype`
WHEN the token classification manifest is applied
THEN that token SHALL carry manifest role `content` with obligation `ink`, resolving to an `-ink` token rather than an `-ornament` one
VERIFY: a script cross-references every token usage in `_sass/` against the manifest and asserts every non-`logotype` body-text or meaning-bearing-boundary usage resolves to a token whose role is `content` and obligation is `ink`; zero such usages resolve to an `ornament` or `exempt` token

### AC-048 (ubiquitous)  ·  **Phase 4a**
THEN the repository SHALL carry a committed manifest assigning every palette token exactly one `role` from ornament, logotype, or content together with exactly one `obligation` from ink or exempt, under the mapping in which `content` takes `ink` while `ornament` and `logotype` take `exempt`
VERIFY: a committed manifest enumerates every token declared in `_sass/_variables.scss` with exactly one role and one obligation each; zero tokens are unclassified; a script asserts that role `content` holds if and only if obligation `ink` for every row, and asserts that every `logotype`-role token is referenced only by rules inside the wordmark selector set (`.hero-subtitle` in `_home.scss` and `_about.scss`) and by no rule that renders body text

### AC-049 (ubiquitous)  ·  **Phase 4a**
THEN the palette contrast test SHALL run as a blocking continuous-integration check from the first accessibility release onward
VERIFY: the CI workflow invokes the palette contrast test and exits non-zero on any failing token; the check is present in the same release that ships the ink token split

### AC-050 (unwanted-behavior)  ·  **Phase 5**
GIVEN the Opal island's transmutation circle animation
WHEN the island page is loaded with no motion preference expressed
THEN the animation SHALL complete within five seconds rather than loop indefinitely
VERIFY: a headless run of the island page records zero transform or style mutation on the circle between t=5s and t=15s with no user input; additionally `grep -n "infinite"` over the island's compiled artifact and stylesheet returns zero hits -- the behavioural clause governs, so a `requestAnimationFrame` loop that declares no duration still fails

### AC-051 (event-driven)  ·  **Phase 5**
GIVEN the Opal island widget
WHEN a keyboard user tabs to it and operates it with arrow keys
THEN every interactive control SHALL be keyboard-operable -- reachable, showing a visible focus indicator, and releasing focus on Tab
VERIFY: keyboard walk of the island page reaches each control, shows a visible focus ring, and exits the widget by Tab without a focus trap

### AC-052 (unwanted-behavior)  ·  **Phase 5**
GIVEN the island's compiled script tag
WHEN the site is built
THEN the island's compiled script SHALL be loaded only by the island page and only with the `defer` attribute
VERIFY: the island page's script tag matches `defer`; `grep -rl "transmutation-circle" _site --include='*.html'` returns exactly the island page

### AC-053 (ubiquitous)  ·  **Phase 5**
THEN the owner's value-floor decision SHALL exist as a committed record stating a `go` verdict before any island source is written
VERIFY: given island source exists in `_opal/`, a committed decision record states a dated `go` verdict on the value floor and its commit timestamp precedes the first commit touching `_opal/`; a `no-go` record followed by any `_opal/` commit fails

### AC-054 (unwanted-behavior)  ·  **Phase 1**
GIVEN the built site's emitted markup
WHEN it is scanned for Font Awesome stylesheet references
THEN exactly one Font Awesome version SHALL be loaded
VERIFY: `grep -rho "font-awesome[^\"']*" _site | sort -u` yields exactly one version string

### AC-055 (unwanted-behavior)  ·  **Phase 1**
GIVEN the post front matter across the corpus
WHEN it is scanned for comment-system fields
THEN no post SHALL declare a `comments` field while no comment system is wired
VERIFY: `grep -rn "^comments:" _posts/` returns zero matches

### AC-056 (unwanted-behavior)  ·  **Phase 1**
GIVEN the emitted meta tags
WHEN the site declares no Portuguese content
THEN no `og:locale:alternate` value of `pt_BR` SHALL be emitted
VERIFY: `grep -rn "pt_BR" _site` returns zero matches

### AC-057 (unwanted-behavior)  ·  **Phase 1**
GIVEN the emitted meta keywords
WHEN the built site is scanned
THEN every programming language advertised in the keywords SHALL be a member of the language set backed by the skills data
VERIFY: a script builds the backed set L from `_data/skills.yml` categories["Programming Languages"].skills[].name (case-folded); splits every emitted `<meta name="keywords">` content on commas into case-folded, trimmed tokens K; and for each token matching the pinned language lexicon V = {ruby, elixir, javascript, typescript, golang, go, crystal, python, rust, clojure, java, c, c++, c#, php, perl, scala, kotlin, swift, haskell, erlang} as a whole word, asserts that language is a member of L; zero unbacked languages remain (today's unbacked set is golang, crystal, python, rust)

### AC-058 (unwanted-behavior)  ·  **Phase 4b**
GIVEN a fluid type rule expressed with `clamp()`
WHEN its middle term is inspected
THEN that middle term SHALL carry a `rem` or `px` component rather than a viewport unit alone
VERIFY: a script parses every `clamp()` in `_sass/` and asserts each middle term matches a `rem` or `px` component; zero `vw`-only middle terms remain

### AC-059 (ubiquitous)  ·  **Phase 5**
THEN the `type: transmutation` post SHALL state the shipped island artifact's re-measured gzipped size together with its runtime/require/app-code tier decomposition
VERIFY: the post states the shipped artifact's final measured gzipped bytes, equal to the artifact's own component of the CI measurement AC-042 performs on the island page (the artifact figure, not the page total -- the two differ by the page's other scripts), states the three tier percentages (runtime / require / app code) summing to 100, names the per-file-sum method for the site-JS baseline (each file gzipped separately, as served), and `grep -nE "7,?862|7\.9 ?KB|17\.8|18\.25" <post>` returns zero matches

---

## Invariants — carry these verbatim; they are hard-won

1. **Ruling 2 is justified on correctness + a11y + SEO, NEVER on speed.** The heaviest page ships
   **4,778 B gzipped**; there was never a performance problem. Zero perf residue across 17 grep
   hits — **do not reintroduce any**. "Insight" licenses craft satisfaction, not speed claims.
2. **The retracted figures must never be published as fact:** `7,862 B`, `7.9 KB`, `17.8×`,
   `18.25×`. **Correct:** per-file sum **11,028 B**, heaviest page **4,778 B**, ratios **30.0×** /
   **13.0×**. **AC-059 greps the post for exactly the retracted four and fails on any hit.** They
   are named here — and only here, in a retraction record — so that they stay out of the artifact;
   `spec.yaml` carries the same `RETRACTED` block the plan does, for the same reason.
3. **The Formspree form-hash ID is an owner-supplied credential** — the contact-form story cannot
   complete without it. See *External dependencies*.
4. **Phase 5 is optional and owner-gated**, hard-gated behind Phase 1 (EC-1), sequenced after
   Phase 4; **AC-053 requires a dated `go` record predating any `_opal/` commit**. Realistic
   disposition: **"probably not, and that is a fine outcome."**

### Traps — every one of these has already caught someone

- **AC-024 does NOT discharge WCAG 2.2.2** — that is AC-031. `prefers-reduced-motion` is **not** a
  2.2.2 mechanism. *"The most commonly-believed false thing in this whole area."* Two defects, two
  criteria, two phases.
- **Do NOT sell Ruling 2 as a performance win.** The heaviest page ships 4,778 B gz.
- **Do NOT publish the four retracted figures.** See invariant 2.
- **`opal -c` appends a source map by default** — `--no-source-map` is MANDATORY or the payload
  silently **3.5×**'s. `--no-method-missing` is free (−4,028 B gz).
- **The `require` list is the budget** (~4,212 B each), **not** the feature count (~15.6 B gz/line).
  Net headroom is ~**6,238 B**, not 10,147.
- **`home.js` is NOT an Opal migration target. Ever.** (EC-2 / EC-4)
- **AC-040 (`/accessibility`) is Phase 4 ONLY and ships LAST.**
- **D16 is a FIVE-file defect** — `home.js:29`, `about.js:110`, `letter.js:11`, `notebook.js:14`,
  `laboratory.js:12` — not `home.js` alone.
- **`--dnd-ink` is 10.43:1 on cream, NOT 12.7:1** (that is `--ink-color` `#3a2921`). **Figures from
  the research's *prose* are unreliable; figures from its *tables* reproduce exactly.**
- **EC-13 is bound by AC-059, NOT AC-046.** AC-046 = the value floor (*is it worth it?*); AC-059 =
  the measurement. v0.3 collapsed the two and **lost EC-13 entirely**.
- **The palette manifest is TWO-AXIS:** `role` {ornament, logotype, content} **and** `obligation`
  {ink, exempt}, with `content` ⇔ `ink`. **A one-axis read reopens the `logotype` hatch** that took
  4a green on an illegible site.
- **AC-057 tests SET INCLUSION against `_data/skills.yml`** — not a literal keyword string, and
  **not** `character_build.yml` (which contains **zero** language names). Reordering the same four
  words defeated the v0.3 check.
- **"One page-specific file per page" is FALSE** — About loads two (`exp-bar.js` + `about.js` =
  4,113 B). **Measure page totals; never infer them.**
- **The Formspree form ID is a credential ONLY THE OWNER CAN SUPPLY.** D9 cannot be executor-closed.

---

## Provenance chain

**scout → research → FORGE → measurement → plan → 3 critic passes → owner decisions → this spec.**

| Stage | Artifact | Contribution |
|---|---|---|
| **Scout** | `.claude/rebrand/scout-report.md` | ATLAS, **45 anchored findings**; **45/45 cited** by the plan |
| **Research** | `research-personal-site.md`, `research-blog-journal.md`, `research-ui-a11y.md` | Substance-layer best practice; journal mechanics; the **computed palette audit** (8/8 figures independently reproduced) |
| **FORGE** | `forge-opal-verdict.md` **v0.2, conf 90** | **BOUNDED-ADOPT, binding.** Ruling 1 (reject Opal as plumbing), Ruling 2 (adopt the build-time reframe), Ruling 3 (sanction exactly one gated island). **EC-1..EC-13**, **RC-1..RC-8** |
| **Measurement** | `opal-measurement.md` (corrected) | **Refuted the plan's own headline numbers.** The v0.2 figures were retracted; **11,028 / 4,778 / 30.0× / 13.0×** established. **The conclusion never moved — it strengthened** |
| **Plan** | `rebrand-plan.md` **v0.4.0**, frozen `393f1e59…` | 33 stories, 6 phases, **59 EARS criteria**, 22 defects |
| **Critic ×3** | `plan-v0.2-critique.md` | **7 blockers → 3 → 0.** Pass 1: APPROVE-WITH-FIXES (19 findings). Pass 2 (criteria layer): APPROVE-WITH-FIXES (R-1 regression + 2 residuals). **Pass 3: APPROVE — executor-ready** |
| **Owner** | `owner-decisions.md` (2026-07-16, binding) | **8 of 8 closed.** Identity line, Director of Engineering, retro labels, PT-BR dropped, Plausible, Formspree, Phase 5 decides at the gate, **the reframe lands as insight** |

### Gate log

- **RS:** `ramza-rightsize --files-est 32 --new-dep --public-api --migration --novel --stakes med`
  → **full (score 7)**, applied **full**, recorded. **Override RETIRED** — computed and applied
  agree, so the override ceases to exist rather than being re-justified. Independently corroborated
  by ESL `right_size` → **full** from (files_touched 32, rubric_score 11, tradeoff_present true).
  **Two tools, two routes, one answer. No override anywhere.**
- **Critic:** `ramza-gate critic --author ramza-author:job-ac6f42e7:v0.2 --checker
  ramza-critic:opus-4.8:rebrand-plan-v0.2-critique` → **OK, recorded**. Self-approval verified to
  **DENY** (`maker!=checker violated`). **Three passes; the third closes the cycle.**
- **Freeze:** criteria re-frozen by **hash-chained amendment**: `3b332eef…` → `62d70182…` →
  `393f1e59…`, both amendments reasoned. **The gate worked on its author:** `ramza-freeze --verify`
  **DENIED** with `DRIFT: criteria hash mismatch … 0 recorded amendment(s)` before the amendment was
  filed — tamper evidence functioning as designed. **Re-verified green at this hop.**
- **EARS:** `ramza-ears-lint` → **59/59 pass**. Re-run at this hop.
- **Byte-identity:** the 59 AC bodies inlined above were checked against the frozen criteria file
  **by diff at this hop** — 59/59, **zero normative drift**.
- **Confidence:** author **80.0 → VALIDATE**; independent critic **81.5 → VALIDATE**. *The critic
  judged the author's self-score **over-corrected downward**: "the plan is 1.5 better than it will
  say of itself."*

### Three facts this hop recorded that the plan's own handoff block predates

1. **The plan's handoff YAML says `critic.passes: 2` and `confidence.total: 78.0`.** Both are
   **snapshots taken before pass 3**. The plan's body and `rebrand.state.json` agree on **80.0**
   for v0.4; the critic's independent v0.4 reading is **81.5**. **This spec records 3 passes and
   80.0 / 81.5.** No figure was invented — the state file is the audit trail.
2. **The plan's stated open item is now closed.** v0.4 recorded: *"`constraint_compliance` 75 has
   no independent reading… the prescribed close is a targeted re-check of AC-026 / AC-047 / AC-048 /
   AC-057 / AC-059 only."* **Pass 3 performed exactly that re-check and returned APPROVE —
   executor-ready: "All five bind."** Recorded residuals are **non-blocking and need no further
   cycle**: AC-047's `body text` wording (dormant against the current palette), AC-057's pinned
   lexicon (the correct mechanization, disclosed in the AC), and AC-046's value floor
   (**irreducibly social** — the mechanism's ceiling, not a defect in it).
3. **RC-4 is defined by FORGE but carried by no part of the plan.** FORGE §5 enumerates
   **RC-1..RC-8**; the plan's handoff carries **seven**, omitting **RC-4** (*"if Pages/Actions
   changes for independent reasons, EC-6's precompile mandate relaxes"*). `spec.yaml` therefore
   binds **the plan's seven** and records RC-4 **separately, as `not_carried_by_plan`** — it is a
   *relaxation* condition, not a reversal risk, so nothing is lost by its absence. **This hop does
   not add it as a binding constraint**: that would be re-planning a frozen, approved artifact.
   **Flagged for the orchestrator, not resolved here.**

---

*RAMZA — planning artifact, ESL `specify` hop. **Read-only outside `.spectra/changes/rebrand/`.**
No repository file, no plan, no criteria file was modified: this hop **projects** an approved,
frozen plan into ESL's required shape. The plan and `rebrand.criteria.md` govern.*
