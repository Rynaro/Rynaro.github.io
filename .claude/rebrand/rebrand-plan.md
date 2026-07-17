---
eidolon: ramza
kind: spec
version: 0.4.0
created_at: 2026-07-16
revised_at: 2026-07-16
plan: rebrand
target_repos: [Rynaro.github.io]
tier: full   # computed full (score 7); override RETIRED at v0.3 and NOT re-issued at v0.4 — critic gate closed (C-18)
stories_count: 33
validation_gates_count: 59
site: hlavezzo.me
persona: "Code Alchemist (Henrique A. Lavezzo / Rynaro)"
supersedes: v0.3.0
critic: {author: "ramza-author:job-ac6f42e7:v0.2", checker: "ramza-critic:opus-4.8:rebrand-plan-v0.2-critique", verdict: APPROVE-WITH-FIXES, passes: 2, blocking_cleared: "7/7 (pass 1) + 3/3 (pass 2, incl. R-1 regression)"}
absorbs: [forge-opal-verdict.md v0.2 (conf 90), opal-measurement.md (v0.3 corrected), research-ui-a11y.md, plan-v0.2-critique.md (both passes), owner-decisions.md (2026-07-16, binding, 8/8 closed)]
---

# Rebrand & Augmentation Plan — hlavezzo.me ("Code Alchemist")
## v0.4 — criteria-bound; critic-remediated; owner-decided

A decision-ready plan to **solidify and enhance** the fantasy-RPG "Code Alchemist" persona
while grafting substance-level personal-site best practices *inside the skin*
(persona-as-moat), running the blog explicitly as a **public alchemist's journal**, and
integrating the emerging **AI-practitioner** identity into the alchemist frame rather than
beside it. Planning-only: this document is the deliverable; no repository files are touched.

**Evidence base:** the ATLAS scout-report (45 anchored findings), the personal-site research
report, the blog-as-journal research report, the **FORGE Opal verdict v0.2** (BOUNDED-ADOPT,
conf 90, binding on the Opal question), the **corrected Opal measurement record**, the
**UI/UX/a11y research report**, and the **independent critique of v0.2**
(APPROVE-WITH-FIXES, 19 findings), the **second critic pass over the criteria layer**
(APPROVE-WITH-FIXES, 3 blocking + 1 regression), and the **owner's decisions of 2026-07-16**
(binding; 8 of 8 closed). Cited as [SCOUT FINDING-0xx], [RES-SITE §x], [RES-JOURNAL §x],
[FORGE §x / EC-x / RC-x], [MEAS], [RES-A11Y §x], [CRITIC C-x], [CRITIC2 R-1/C-x], [OWNER n].

---

## Changelog — v0.3 → v0.4

**Closes the cycle.** The second critic pass returned **APPROVE-WITH-FIXES** on the criteria
layer with three blocking items and, separately, the owner closed **8 of 8** open decisions.
v0.4 is those two inputs and nothing else — the architecture, doctrine, strategy, and
DECISION-A/B/C were approved in pass one and are **not re-litigated**.

**The three blocking fixes**

- **[R-1 — the regression that must not ship] EC-13 has its criterion back.** v0.3 *replaced*
  AC-046's measurement-publication duty when the prescription said *extend* — leaving EC-13
  declared in `acceptance_constraints`, asserted in Story 5.4's prose, and **bound by no
  criterion**, while the corrected C-5 figures were routed to publication *through* the very
  VERIFY that had been deleted. The plan's own headline — *"the post is the product"* — was
  ungated. **New AC-059** requires the post to state the re-measured artifact bytes, the
  runtime/require/app-code decomposition, the per-file-sum method, and **none** of the
  retracted figures. **AC-046 keeps the value floor.** The two ACs now split EC-7d (worth it?)
  from EC-13 (measured, and published).
- **[C-1 residual] AC-047/AC-048's vocabularies reconciled — the `logotype` hatch is closed.**
  v0.3 bolted a **binary predicate** (`-ink`/`-ornament`) onto a **ternary manifest**
  (`ornament`/`logotype`/`content`) with no mapping between them, so classifying every token
  `logotype` passed AC-048, passed AC-047, **emptied AC-026's set**, and took 4a green on an
  illegible site. AC-048 is now **two-axis** — `role` ∈ {ornament, logotype, content} **and**
  `obligation` ∈ {ink, exempt}, with `content` ⇔ `ink` — and the hatch is shut by **usage**:
  a `logotype`-role token must appear *only* inside the wordmark selector set and in no rule
  that renders body text. AC-047 gains the **logotype exception** it lacked (it would otherwise
  have forced `--ff-gold` to `-ink` and darkened the wordmark, contradicting the doctrine at
  `:284` and WCAG 1.4.3). AC-026 now quantifies over **`role == content`** — a set the executor
  cannot empty without failing AC-047.
- **[C-16 residual] AC-057 rewritten as a set-inclusion check, and executed.** v0.3 named
  `character_build.yml`, which contains **zero language names**, and matched the *literal string*
  `"golang, crystal, python, rust"` — so reordering the same four words passed while advertising
  the identical defect. It now builds the backed set **L** from `_data/skills.yml`
  `categories["Programming Languages"]` and asserts every advertised language is a member.
  **Verified by execution** against the real data: it fails on today's keywords catching exactly
  `[golang, crystal, python, rust]`, **fails all three of the critic's attacks** (reorder, add a
  space, drop a word — each of which v0.3 *passed*), and passes a corrected keyword set.

**Non-blocking residuals fixed** (all mechanically re-checked)

- **The `Phase ?` placeholder is gone from all 59 AC headings** — resolved to the real phase
  (including the **4a/4b** slice), not deleted. Distribution: 0→3, 1→12, 2→7, 3→7, 4a→7,
  4b→12, 5→11 = 59.
- **AC-041** no longer greps `--include='*.html'` for `Opal` (the artifact is `.js`, so **no
  HTML contains the string** and the check failed a *correct* implementation). It now resolves
  each page's `<script src>` references and inspects the **referenced payloads**.
- **AC-050** gains a **behavioural** clause — zero transform/style mutation between t=5s and
  t=15s — so an Opal/JS `requestAnimationFrame` loop can no longer spin forever while passing
  a grep for the CSS keyword `infinite`. The behavioural clause governs.
- **AC-051**'s THEN now asserts what its VERIFY tests (focus release on Tab); **AC-052**'s
  compound THEN is restated as one loading-discipline requirement; **AC-053** now requires a
  **`go`** verdict, closing "no-go + build anyway".
- **D6 is 6 posts, not 5** (five `comments: true` + one `comments: false` — verified).
- **Upstream [C-5]:** the About page is **4,113 B** (it loads `exp-bar.js` **and** `about.js`),
  not 3,347 — the *"one page file per page"* assumption is **void**. Home remains heaviest at
  4,778 B; the 30.0×/13.0× headline is unaffected. C-12's headroom arithmetic is re-stated
  against the page total, not a per-page file count.

**The owner's 8 decisions, folded in** — see **Open Decisions**, now *Decisions Resolved*.
The identity line is **chosen** (and its two-line hero risk recorded as a Phase 4 layout
input); the canonical title is **Director of Engineering**; retro labels **yes**; PT-BR
**dropped**; analytics **Plausible**; the contact form takes a **real Formspree hash** — *a
credential only the owner can supply, recorded as a hard dependency*; Phase 5 **decides at the
gate**; and **the reframe lands as *insight*, not a substitute** — which **closes FORGE
RISK-5** and **promotes Ruling 2 from groundwork to headline deliverable**. Phase 5's
justification narrows to **joy alone**, correctly: *"probably not, and that is a fine outcome."*

**What did not change, deliberately:** **DECISION-C stands.** "Insight" licenses *craft*
satisfaction, **not** the withdrawn performance justification. Ruling 2 is sold on
**correctness + accessibility + SEO, never speed**. The heaviest page ships **4,778 B gz**;
there was never a performance problem. The critic verified **zero** perf residue across 17
grep hits — **not regressed here**.

**59 criteria; +1 new (AC-059), 8 rewritten.**

---

## Changelog — v0.2 → v0.3

**The critic's central diagnosis, accepted in full:** *"The plan's prose is consistently more
rigorous than its criteria… You reason correctly, then fail to bind the reasoning to a gate."*
Every blocking finding lived in the criteria layer, in exactly the blind spot
`ramza-ears-lint` cannot see — it checks form ∈ set, one `THEN`, no literal `" AND "`, and
that a `VERIFY` exists. **Nothing about substance.** v0.2's "46/46 green" was true and meant
far less than it read as. v0.3 fixes the binding, not the prose. **58 criteria; +12 new, 6
rewritten.**

### Blocking — all 7 cleared

| # | Finding | Disposition |
|---|---|---|
| **C-1** | Phase 4a vacuously satisfiable — AC-026/027/032 quantify over a classification the executor produces | **FIXED.** **AC-047** binds token **usage** → classification: its quantifier now ranges over *actual CSS rules in `_sass/`*, not over the executor's own set. **AC-048** requires the manifest to exist with **zero unclassified tokens**. **AC-049** moves the palette test into **4a** as a blocking CI check, so 4a no longer ships before its own backstop. Classify everything `-ornament` now **fails AC-047**. |
| **C-2** | EC-3/EC-9 declared binding, no AC — the island could ship an infinite spinner | **FIXED.** **AC-050** (finite ≤5s, non-infinite iteration count), **AC-051** (keyboard-operable, visible focus, no trap), **AC-052** (`defer` + island-only). I wrote the 2.2.2 trap three times for Phases 2/4 and then walked into it in Phase 5, on the one artifact whose premise is a rotating circle. |
| **C-3** | Token-spinner prohibition stated 4×, enforced 0× — all six Phase 5 ACs admit one | **FIXED, via the critic's mechanism.** A subjective gate is enforceable **as a disclosure**: **AC-046** now requires the post to state, *in the owner's own words*, what the widget does that justifies 135 KiB. **AC-053** requires Story 5.0's go/no-go as a **committed record predating any `_opal/` commit**. A value floor the owner must write down and publish is the only honest mechanization of a preference. |
| **C-4** | 22 of 46 ACs absent from the deliverable; authoritative copy in a job sandbox that will be reaped | **FIXED — highest leverage.** **All 58 ACs are now inlined below in full EARS form**, generated *directly from the frozen criteria file* so the two cannot drift. Criteria + state + calibration log persisted to `.claude/rebrand/`. The v0.2 state is preserved as `rebrand-v0.2.state.json` (history is never destroyed). |
| **C-5** | The most-repeated number is a methodology error; the headline ratio mixes units | **FIXED, and I verified it myself.** Re-measured: per-file sum **11,028 B**; `cat|gzip` **7,852 B** — so `7,862` was not even reproducible (it drifts with the temp filename `gzip -c` embeds). Heaviest page (home) = `main`+`sigil-nav`+`home` = **4,778 B gz**. Ratios recomputed in consistent bytes: **30.0× vs the heaviest page**, **13.0× vs the 11,028 sum**. `17.8×`/`18.25×`/`7,862`/`7.9 KB` **purged everywhere**, incl. the handoff YAML. **Conclusion unchanged and strengthened** — RC-1 still does not fire, and the real ratio is *worse* than claimed. |
| **C-8** | Phase 5's story→AC map scrambled; AC-040 double-assigned across two phases | **FIXED.** AC-040 (`/accessibility`) is **Phase 4 only** — struck from Phase 5 at all three prose sites. Story 5.2 → AC-045, AC-050, AC-051; Story 5.3 → AC-041, AC-042, AC-043, AC-052. Phase 5 = **AC-041..046 + AC-050..053**. Declining the optional phase can no longer drop `/accessibility`. |
| **C-9** | Two VERIFYs mechanically wrong; one unpassable | **FIXED, both verified in a scratch dir.** (a) `grep "height:"` **does** match `min-height:` — which Story 4.9 *mandates* — so AC-038 could never pass; now `grep -rnE '(^\|[^-[:alnum:]])height:[[:space:]]*[0-9]'`, confirmed to match `height: 30px` and not `min-height: 2rem`. (b) `grep -rL` lists files **without** the match; AC-041 now uses set equality on `grep -rl`. |

### Major — 5 findings

| # | Finding | Disposition |
|---|---|---|
| **C-6** | AC-024/031 homepage-scoped; 7 unguarded infinite animations | **FIXED — and the critic understated it.** I re-ran the sweep: 11 `infinite` hits in `_sass/`, **1** guard (`_home.scss:505`). But `grep -rn "infinite" assets/js/` returns **five** JS injectors, not the one (`laboratory.js:12`) the critic found: **`about.js:110`, `letter.js:11`, `notebook.js:14`, `laboratory.js:12`, `home.js:29`**. So D16 is a **five-file** defect. AC-024 and AC-031 are now **sitewide**, with a mechanical `grep -rn "infinite" _sass/ assets/js/` × `--motionOK` cross-check. |
| **C-7** | `E5 ⊃ E2` is false: E4's premise is dead code and it mutates E2's invariant | **ACCEPTED — the critic is right and the finding is well-made.** Verified: `grep -rn "rarity-uncommon"` returns **exactly one hit, its own declaration**; there is **no `.uncommon` rule**; `laboratory.js:19-28` falls through to `common`, so the 3 projects declaring `uncommon` render as common. **The 1.26:1 failure I built a dark surface to rescue cannot occur.** And I computed the obsidian case: **every ink token fails on it** (`--dnd-ink` 1.54, `--ink-color` 1.26, `--text-dark` 1.96, `--dnd-brown` 3.59). **I rejected E4 sitewide for exactly this reason, then absorbed it while forgetting my own objection.** Obsidian **dropped** (−1.5d). Adopted **E5′ = E2 + ratchet**, a *true* superset — rescored via tool: **87.0 elite**, still > E2's 86.5. |
| **C-10** | `--dnd-ink ~12.7:1` is wrong (10.43); propagated 3× incl. a Risks mitigation | **FIXED — and refined.** Recomputed: `--dnd-ink` #4e342e = **10.43:1** on cream; **12.73 belongs to `--ink-color` #3a2921**. The research mislabels one token's *name* with another's *hex* (`research-ui-a11y.md:143`) and I inherited it unverified. On the pastels I actually propose: **6.01–8.54:1** — *the critic said 6.01–8.19; it missed `pastel-mint` at 8.54*. Conclusion holds (6.01 > 4.5 → badges legal, mitigation stands). "~15:1" dropped: `#1eff00` needs **pure black** for 15.36; realistic obsidian gives 12.73. **Diagnostic accepted: figures from the research's *tables* are exact; figures from its *prose* are wrong.** |
| **C-8/C-9** | *(above)* | — |
| **C-11** | RC-2 dropped; handoff carries 2 of 8 RCs | **FIXED.** `reversal_conditions: [RC-1, RC-2, RC-3, RC-5, RC-6, RC-7, RC-8]`; EC-8's discharge is now **conditional on RC-2** (`recheck: major Ruby/Opal upgrade`). Phase 5 is sequenced **last** — precisely RC-2's scenario — and "opal 1.8.3 healthy" is a **point-in-time** fact I was carrying forward as permanent. |

### Moderate / Minor — 7 findings

| # | Finding | Disposition |
|---|---|---|
| **C-12** | Headroom overstated 25–40%; RC-7 decision-relevant | **FIXED.** EC-7b scopes the ceiling to the **page**, not the artifact. Island page also loads `main.js` (809) + `sigil-navigation.js` (1,480) = 2,289; as a Laboratory entry, + `laboratory.js` (1,620) = 3,909. Net headroom **≈6,238 B** (Laboratory host) / **≈7,858 B** (bare page) — not 10,147. **Decision-relevant:** one require ≈4,212 B, so at 6,238 a second require consumes most of the budget and **RC-7 fires**. Corrected in Open Decision 7, where I had quoted "10,147 B to spare" **to the owner**. **v0.4 [CRITIC2 C-5 upstream]:** the *"one page-specific file per page"* premise that grounds this arithmetic is **falsified** — **About loads two** (`exp-bar.js` + `about.js` = **4,113 B**, not 3,347). **The island's arithmetic survives** (verified: Laboratory loads exactly one page file, so baseline 3,909 → headroom ≈6,238 B), **but it survives by luck, not by rule.** Treat the baseline as **measured, not inferred** — which is what **AC-042 already does** (it sums *every* script the island page loads). *Independent re-measure at v0.4 reproduces the record to within ~8 B (home 4,771 vs 4,778; headroom 6,246 vs 6,238) — the residual is the **known `gzip` filename/mtime artifact**, not a new error. Ordering and ratios unaffected; **home remains heaviest**; 30.0× stands.* |
| **C-13** | A live 1.4.1 failure sits in 4b, falsifying 4a's completeness claim | **FIXED.** Verified `laboratory.html:68-70` emits an **empty** `<div class="item-rarity-indicator" data-rarity="…">` — rarity conveyed by a 4px colour strip and nothing else: a **live 1.4.1 failure today**. There are **two** live WCAG failures, not one. AC-030's label half moved into **4a**; 4a's claim restated honestly. |
| **C-14** | Three unlogged defects in the class D15/D19 enumerate | **FIXED — all three verified.** **D20:** `_sass/` styles `.item-rarity-indicator.common/.rare/.epic/.legendary` (**classes**), `laboratory.html:69` emits `data-rarity` (an **attribute**), and **no `[data-rarity]` selector exists** — classes are added by `laboratory.js:19-28`, so **JS off → every rarity indicator is a transparent 4px strip**. **D21:** `uncommon` unreachable even with JS (`else` → `common`); 3 projects affected. **D22:** `scroll-behavior: smooth` **already exists** at `_sass/_base.scss:13`, sitewide and unguarded — Story 2.7 proposed migrating *to the thing already there*. Neither I nor FORGE noticed. |
| **C-15** | Story 2.7 lost its rationale when DECISION-C withdrew performance | **FIXED.** *"The JS surface shrinks"* is **byte reduction wearing a maintainability hat** — the one place the withdrawn premise survived. Deleted. Story 2.7 re-justified on **correctness** (Liquid `page.url` active-state fixes a real no-JS defect); its motion half (fade-in, `scroll-behavior`/D22) **moved to Phase 4** behind `--motionOK`, since un-gated motion work two phases before the motion gate exists was the wrong call. |
| **C-16** | Four Phase 1 defects (D4, D6, D11, D12) have no AC | **FIXED.** AC-004 (build exits 0) and AC-005 (images resolve) detect none of them — an executor could ship four defects green. Added **AC-054** (single Font Awesome version), **AC-055** (no dead `comments:`), **AC-056** (no `pt_BR`), **AC-057** (no unbacked keyword stuffing). |
| **C-17** | RS re-run claimed but not recorded (`files_est: 20`, timestamp == v0.1) | **FIXED.** P0-2 is right: I *ran* the tool but without `--state`, so nothing recorded — the claim outran the audit trail. v0.3's state records `files_est: 32`, score 7, `full`, with a fresh timestamp. |
| **C-18** | The override's stated reason is now false | **FIXED — override RETIRED, not re-issued.** `computed_tier: full` now **equals** the applied tier, so the override simply vanishes rather than being re-justified. Note the tooling hazard: `ramza-rightsize --force` **re-initialises** state (`gates: []`, `critic: null`) — using it would have destroyed the very critic record that closed the gate. Instead the v0.2 state is **preserved** as `rebrand-v0.2.state.json` and v0.3 opens a clean full-tier walk. Write-new, never hard-delete. |
| **C-19** | AC-034's VERIFY tests more than its THEN; AC-031 disjunctive | **FIXED.** Split: **AC-034** (max ≤ 2.5× min) / **AC-058** (middle term carries `rem`\|`px` — the F94 trap now normative, not buried in a VERIFY). **AC-031** collapsed to the chosen branch (finite ≤5s); the pause control survives as a recorded fallback in Story 4.5, not as an undecided disjunction in a gate. |

### Confirmed by the critic — deliberately untouched

The performance-honesty discipline (**zero residue across 17 hits**, all prohibitions); the
2.2.2 reasoning (**verified against the code**: all three conditions hold on the homepage
today; no AC assumes `prefers-reduced-motion` discharges 2.2.2); `[DECISION-B]` (**sound, not
motivated**); the 4a/4b split (**not papering**); **45/45 scout findings cited**; the 150 KiB
ceiling (**held correctly**); the freeze (**valid, untampered**); 8/8 headline contrast
figures and every Opal per-file measurement (**reproduce exactly**).

### Re-calibration

v0.2 self-scored **84.25**. The critic scored **≈75**. **The critic is right, and its
reasoning about *why* matters more than the number:** v0.2 modeled the missing critic as
*"the last formality standing between it and 85"* — a gate that would **ratify**. It found 7
blocking defects instead. **A plan cannot score its own `constraint_compliance`, because the
failures are precisely the ones its author believes it satisfied.** I read "EC-1..EC-13
folded verbatim" and was *right about the prose*; only a reader walking the ECs against the
**criteria** finds the three that stop there. v0.3 is re-scored against the remediated
artifact **with no anchor on 84.25** — see Confidence.

---

## Scope

**Intent class:** STRATEGIC (identity rebrand) composed of REQUEST/CHANGE work items.

**In:** Identity & voice canon (A); content architecture, taxonomy, themed post-types,
journal mechanics (B); experience & trust plumbing (C); the defect backlog (D — **22 items**);
the phased roadmap (E — **6 phases**); open human decisions (F); **Layout, UI/UX &
Accessibility (G — Phase 4)**; **The Transmutation Circle (H — Phase 5, optional,
owner-gated)**.

**Out:** any implementation, file edit, build, or deploy — planning only. Post prose (the plan
specifies *shapes and slots*). A visual redesign of the design system — **the skin stays**;
Phase 4 changes the *text* layer and the *boundary* layer, and **every pastel keeps its exact
hex**. Migrating off Jekyll/GitHub Pages, or `opal` in `jekyll_plugins` [EC-6]. **Opal as
plumbing** — rejected at **30.0×** the heaviest page [Ruling 1; MEAS]. **A themed dark
"obsidian" surface** — dropped at v0.3; its premise was dead code [CRITIC C-7], and it may
return only as a *want* with its own light-ink palette, stories, ACs, and timebox.

**Deferred:** analytics vendor *implementation*; webmentions/POSSE; PT-BR content; per-tag
feeds; email mirror; character-sheet dynamic numbers (D14). **AAA** beyond 2.4.13; paid
audits; VPAT; professional AT-user testing [RES-A11Y §7.4]. **APCA / WCAG 3.0 — do not act on
it**; design to WCAG 2 [RES-A11Y §2.4].

**Assumptions (risk-if-wrong):**
1. The custom theme, `_data`-driven About, and dated permalinks are retained. *Risk:* phase
   boundaries shift; "inside the skin" is void.
2. GitHub Pages persists → only whitelisted plugins. **NOT invalidated by Phase 5** — EC-6
   keeps Opal precompiled and off the Pages build. *Risk:* Phase 1's SEO wiring changes.
3. The fantasy metaphor is a hard requirement. *Risk:* the lexicon is discardable **and Phase
   5 loses its content rationale entirely** [RC-3].
4. The 2026 post's analyst register is intentional going forward. *Risk:* the `transmutation`
   stream is over-built for one post.
5. Kramdown's TOC can replace the JS TOC at acceptable fidelity [FORGE §6]. *Risk:* Story 2.5
   needs a small Ruby generator (+0.5d). **APIVR verifies in Phase 2.**
6. Tier-3 byte linearity (~15.6 B gz/line) is extrapolated from **one** 45-line datapoint
   [GAP-4]. Gzip's shared dictionary makes it likely *sub*-linear → **safe direction**.

**Complexity:** **11/12 → human_loop** (scope 3, ambiguity 2, dependencies 3, risk 3). The
routing is honest: the plan carries an owner-gated phase and three owner decisions.

**Right-size (v0.3, recorded).** `ramza-rightsize --files-est 32 --new-dep --public-api
--migration --novel --stakes med --plan rebrand --state .claude/rebrand/rebrand.state.json`
→ **full (score 7)**, applied **full**. **The v0.1/v0.2 override is retired [C-18]** — its
stated reason ("an independent critic remains structurally unavailable") is now false: the
gate is closed and recorded, and a self-approval attempt returns
`DENY: maker!=checker violated`. Computed tier and applied tier now agree, so the override
does not need re-justifying — **it ceases to exist**.

---

## Approach

**Selected: Hypothesis D — "Spine, then phased shippable surfaces"** (`explore` **87.5,
elite**; B 72.5, A 65.5, C 65.0). Unchanged — the critic impeached no part of the strategy,
doctrine, or sequencing.

### Doctrine: persona-as-moat, substance-in-skin

Every "text-first / minimal" best practice is adopted at the **substance layer** and
**renamed into the alchemist metaphor** at the surface. The fantasy chrome is the moat.

> **The persona survives because the decoration is exempt *by spec*, not by mercy** — but that
> only works if the decoration carries no information. **The moment a rune means something, it
> loses its exemption.** [RES-A11Y §1]

**v0.3 note: that sentence is now a gate, not a slogan.** The critic's sharpest finding was
that this doctrine had **no criterion enforcing it** — so an executor could classify every
token as ornament and pass Phase 4a green on an illegible site. **AC-047** now binds token
*usage* to classification, **AC-048** requires the manifest to be complete, and **AC-049**
puts the palette test in CI from 4a onward. The doctrine and the gate now say the same thing.

Three consequences, each making the persona *stronger* under accessibility pressure:

- **`aria-hidden` ornament is also contrast-exempt — one decision, two wins.**
- **`aria-valuetext` makes the character sheet *narrate as a character sheet*** — "85 of 100
  hit points", not "85 percent". The RPG conceit becomes something a screen-reader user
  *experiences* rather than is excluded from [RES-A11Y §4.4].
- **A published `/accessibility` page is persona content.** D&D Beyond — the genre's canonical
  web character sheet — is a documented accessibility failure. **Beating it on purpose** is a
  compliance artifact, a differentiator, and on-brand craft. The research reports honestly
  that **no fantasy-themed website with a published WCAG stance was found**: an unoccupied
  niche [RES-A11Y §6].

### `[DECISION-A]` — Reconciling RES-SITE §4 with RES-A11Y *(critic: survives adversarial probing)*

[RES-SITE §4] recommends **minimal-fast over maximal-whimsy**. [RES-A11Y] contests this and
claims operative authority for the decorative layer. **They do not actually contradict once
the layers are separated:**

1. **§4's recommendation is moot on its own terms, not overruled.** It advised on a *choice*.
   The owner has closed that choice — the persona is a hard given. Recording it as "overruled"
   would misrepresent it.
2. **The layer split is clean and both reports agree on it.** RES-A11Y cedes feeds, dark-mode
   plumbing, and landmarks back to §4.
3. **The measurement dissolves the residual empirical claim.** §4's case rests on Dan Luu's
   byte argument. **The heaviest page on this site ships 4,778 B gz of JavaScript** [MEAS,
   corrected]. **The persona is not costing bytes** — the skin is CSS, and CSS is not what Luu
   measured.
4. **Where they *would* collide is Phase 5** (140.1 KiB), already adjudicated: fenced, opt-in,
   off the reading path, disclosed, value-floored. **This does not license byte growth on the
   reading path** — EC-7a holds the island to 0 bytes elsewhere, and §4's Luu citation remains
   **fully operative for article pages**, which is precisely the scope Luu wrote about.

### `[DECISION-B]` — Phase 5 sequences after Phase 4 *(critic: "sound, not motivated")*

- **"Blast radius is disjoint"** is a **technical** claim, and true: Phase 5 can be *inserted
  without reworking anything* and cancelled at zero cost.
- **"After the a11y work"** is an **attention** claim, and attention is the binding constraint
  [FORGE §2.6; RISK-1]. **Attention does not parallelize.** Two disjoint blast radii still
  compete for the same finite Saturday.

**Phase 5 sequences after Phase 4 closes.** The disjointness note is preserved as
*risk-containment*, never as a licence to start early — FORGE's own EC-1 argument, one phase
further out.

### `[DECISION-C]` — Ruling 2 ships as correctness + a11y + SEO. **Never as speed.**

**Binding, and FORGE self-corrected here** [FORGE §2.3; MEAS]. The measurement refutes the
performance framing: **the heaviest page ships 4,778 B gz; all eight files together are
11,028 B gz.** Deleting most of it saves a few KB. **There was never a performance problem.**

| Ruling 2 is justified by | Status |
|---|---|
| **Correctness** — the no-JS empty-TOC defect (D15) | ✅ Real |
| **A11y** — the missing JS-level reduced-motion guards (D16) | ✅ Real |
| **SEO / plan alignment** — AC-013's server-rendered categories | ✅ Real |
| **Performance** | ❌ **WITHDRAWN — the site was already fast** |

**Executors and copy MUST NOT sell Phase 2's JS reduction as a speed win.** The site whose
persona cites Dan Luu cannot afford a fake performance claim. *(v0.3: the critic found the one
surviving leak — Story 2.7's "the JS surface shrinks" — byte reduction wearing a
maintainability hat. Deleted; see C-15.)*

**Two v0.1 mission-premise corrections stand:** **share buttons are pure HTML**
(`post.html:84-111`) and **reading time is computed in Liquid at build time**
(`post.html:20-27`). **Ruby already computes it.** Neither is a migration target.

### Surface G — Layout, UI/UX & Accessibility (Phase 4)

**Selected: Hypothesis E5′ — "Fence the gimmick" = E2 + the CI ratchet** (`ramza-score`
**87.0, elite**; E2 86.5, E3 70.5, E1 59.5, E4 59.0).

**v0.3 correction [CRITIC C-7]: v0.2's `E5 ⊃ E2` was false and I accept the finding.** E5
bundled a dark "obsidian" Laboratory surface. Two independent kills, both of which I verified:

- **(a) Its premise is dead code.** `grep -rn "rarity-uncommon"` → **exactly one hit, its own
  declaration in `_variables.scss:60`**. No `.uncommon` rule exists; `laboratory.js:19-28`
  falls through to `common`. **The 1.26:1 failure the obsidian surface existed to rescue
  cannot occur.**
- **(b) It is not additive.** Obsidian adds a **dark** declared background, inverting the
  contrast direction. Computed: `--dnd-ink` **1.54**, `--ink-color` **1.26**, `--text-dark`
  **1.96**, `--dnd-brown` **3.59** — **every ink token fails.** It drags a second light-ink
  palette behind it with no story, no AC, no timebox. **I rejected E4 sitewide for exactly
  this reason and then absorbed it while forgetting my own objection.**

FORGE's H5 ⊃ H4 transfers only because the island is severable at **zero cost**. Obsidian is
**not** severable from E2 — it **mutates E2's declared-background set, which is E2's
definition**. **E5′ = E2 + ratchet is a true superset** and scores 87.0 > 86.5. The dominance
survives by dropping the module that broke it.

**Governing rule — Lynn Fisher's fence discipline:** *"the decoration is never removed; it is
**fenced** — to a viewport range, to a non-navigational layer, or to a described equivalent."*

**The measured problem** [RES-A11Y §2 — computed audit of `_sass/_variables.scss:5-63`;
**8/8 figures independently reproduced**]:

| Token | Hex | vs cream `#F8F5F2` | Verdict |
|---|---|---|---|
| `--ff-gold` | `#e6a553` | **1.96:1** | off by >2× |
| `--ff-green` | `#2ecc71` | **1.94:1** | off by >2× |
| `--ff-purple-light` | `#b19cd9` | **2.24:1** | ornament only |
| `--ff-blue` | `#4499cb` | **2.90:1** | **fails even the non-text 3:1 bar** — cannot legally be a border, focus ring, or icon |
| `--rarity-uncommon` | `#1eff00` | **1.26:1** | **dead token — never consumed (D21)** |
| `--rarity-legendary` | `#ff8000` | **2.32:1** | fails non-text |
| `--dnd-brown` | `#8a6d3b` | **4.46:1** | **misses AA by 0.04** — 1.4.11 forbids rounding |
| all five pastels as fills | — | **1.22–1.73** | fail 1.4.11 as fills |

**The cheapest reconciliations — none touching a pastel:**

- **Split every themed hue into `-ink` and `-ornament`.** `--ff-gold` stays `#e6a553` for the
  circle, runes, and wordmark (exempt); add `--ff-gold-ink` at ≥4.5:1 for gold *text*.
  `--ff-blue` (2.90) → `--ff-blue-dark` `#306d9a` (**5.12 — already in the repo**). Darken
  `--dnd-brown` one step. *"The palette reads identical; only the text layer moves"* — the
  single highest-leverage change in the rebrand. **Now enforced by AC-047/048/049, not just
  asserted.**
- **Outline, don't desaturate.** 1.4.11 binds *"parts of graphics required to understand the
  content"* — on a stat bar that is **the fill/track boundary**, not the pastel. A 1px
  `--dnd-ink` hairline carries the 3:1 obligation at **10.43:1 on cream** *(v0.3: **corrected
  from "~12.7:1" — that figure belongs to `--ink-color` #3a2921; the research mislabels one
  token's name with another's hex, and I inherited it unverified [C-10]**)*. Every pastel stays
  as-is. XAG 102's *For Honor* / *Outer Worlds* technique.
- **Rarity: keep the WoW hexes — as glow, border, and pip, never as the chip's ground.** Ink
  label on parchment + tier colour as border/glow + pip count (◆/◆◆/◆◆◆◆◆). G14 is satisfied —
  the word "Legendary" is right there. *"The MMO loot feel survives intact — arguably
  strengthens, since pip-counts are more game-native than colour-only."* Appleton's
  seedling/budding/evergreen is the same pattern, **word-first, 1.4.1-compliant by
  construction** — already this plan's `assay` scale.
- **Motion: make the circle finite.** All three 2.2.2 conditions **hold on the homepage today**
  — auto-start ✅, infinite ✅, parallel with the hero text ✅ — so only condition (2) is
  negotiable. A circle that **inscribes → flares → settles** in ≤5s means **2.2.2 does not
  apply at all**. Cheaper than a pause control, legally clean by construction, and **better
  theater than an infinite idle spin — the circle completes, which is what a circle is for.**
  *(Recorded fallback: if the infinite spin is ever non-negotiable, the price is one visible
  themed pause affordance — a persona feature, not a compliance tax. AC-031 encodes the
  **chosen** branch only [C-19].)*
- **`prefers-reduced-motion` does NOT discharge 2.2.2** — *"the most commonly-believed false
  thing in this whole area."* **AC-024 (guards) and AC-031 (2.2.2) are two criteria, in two
  phases, by construction.** Fixing the guards does not close 2.2.2.
- **No-motion-first; substitute, don't delete.** Default `animation: none`; enable under
  `@media (--motionOK)`. Under `reduce`: rotation → static sigil + opacity breath. Per Val
  Head, opacity/colour/blur are *"unlikely to be problematic"*; rotation-in-place is already
  near the benign end. **The persona never needed parallax; don't let it in through the back
  door.**
- **Themed nav is *not* mystery meat — and the fix is additive.** MMN is about *unlabeled
  icons*. "Notebook" is a visible label that happens to be a metaphor: a *findability*
  question. **2.5.3 Label in Name** means "rename Notebook to Blog for screen readers" would
  **create** a failure while flattening the persona. Keep the word; add a gloss.
- **Typography: XAG already ruled.** *"If stylistic fonts are used… provide a non-stylized font
  option"* — note it never says don't use the stylized font. Applied by *zone*: display face on
  H1/H2/nav/wordmark, hyperlegible body at ~66ch. **That produces the classic RPG-manual look
  anyway: ornate headers, clean body.**
- **Fluid type has a ceiling:** `clamp()` max ≤ **2.5×** min **and** never a `vw`-only middle
  term. *"The heading is still huge and still theatrical — it just can't be quite as huge at
  1920px. That is the entire cost."* **Both halves are now normative (AC-034 + AC-058)** — v0.2
  buried the F94 trap in a VERIFY [C-19].
- **Reflow, a named conflict:** the two-column sheet *is* the visual joke. Two columns to
  ~600px, then single column with frame and bars intact. **You lose the silhouette at 320px,
  not the identity.** Do **not** claim the 2D-layout exception.
- **The audit bar, sized for a solo maintainer:** automation catches **30–40%** of WCAG issues
  — but *for this site the split is unusually favourable*, since the contrast failures are
  exactly the class it nails. **Blocking in CI:** `pa11y-ci` + axe at `WCAG2AA` over the
  sitemap, plus the **palette contrast unit test**, which *encodes the persona's own bargain*:
  ornament is exempt and untested; ink is tested and must pass — making the fantasy palette
  **safe to extend later instead of a permanent liability**.

### Surface H — The Transmutation Circle (Phase 5, optional, owner-gated)

**Binding input: [FORGE v0.2, conf 90]. A peer Eidolon verdict, not a suggestion.**

**Ruling 1 — REJECT Opal as plumbing.** *(v0.3 figures [MEAS, corrected; C-5]:)* the island is
**143,453 B gz** against a **heaviest page of 4,778 B gz** = **30.0×**, or **13.0×** against
all eight files summed (11,028 B). RC-1 was written to be falsifiable — *"if runtime+corelib+app
fits within the current total JS byte budget, Ruling 1 is void"* — and **it does not fit under
any honest reading**. The margin is not close, so the conclusion is insensitive to measurement
error. *(v0.2 published `7,862 B` / `17.8×` / `18.25×`. All three were wrong: 7,862 was a
**concatenated** gzip of files the site never bundles, produced by a method that **drifted with
the temp filename**, describing a payload **no visitor receives**; and 17.8/18.25 were **one
ratio computed twice**, once in mixed KiB/KB units. **The conclusion never moved — it
strengthened.**)*

**Ruling 2 — ADOPT the build-time reframe, unconditionally.** See `[DECISION-C]`.

**Ruling 3 — SANCTION exactly one Opal content island, gated.** Never plumbing, never the
reading path, **`home.js` explicitly NOT a migration target**. EC-1..EC-13 are its acceptance
constraints (**EC-8 DISCHARGED, conditional on RC-2** — re-check on any major Ruby/Opal
upgrade, which Phase 5's last-place sequencing makes a live scenario [C-11]). **Budget stays
150 KiB gz — do not raise it.**

**The shape ruling — a token spinner is FORBIDDEN, but so is a lab.** A minimal widget pays the
*identical* runtime tax: 45-line token = 140.09 KiB; 450-line widget ≈ 146.9 KiB — **10× the
functionality for 4.6% more bytes.** But ambition is free in *bytes* and expensive in *hours*,
and **hours are the binding constraint.**

> **The maximand is the POST, not the widget.** Bytes say *don't build a token*; attention says
> *don't build a lab*; the intersection is **a real-but-modest widget carrying a deep post.**

**v0.3: this is now enforced, not merely repeated.** The critic walked a token spinner through
all six v0.2 Phase 5 ACs and it **passed every one** — stated 4×, enforced 0×, on the scenario
the plan itself named as its worst outcome. EC-7d is genuinely subjective and cannot be a byte
threshold, **but a subjective gate is enforceable as a disclosure**: **AC-046** requires the
post to state, *in the owner's own words*, what the widget does that justifies 135 KiB;
**AC-053** requires the go/no-go as a committed record predating any `_opal/` commit. A value
floor the owner must **write down and publish** is the only honest mechanization of a
preference — and it is exactly what makes a token spinner too embarrassing to ship.

**EC-7c — the `require` list IS the budget** [MEAS; FORGE §2.1]:

| Tier | Δ gz B | Share | Scales with |
|---|---|---|---|
| Runtime + corelib | 138,537 | **96.6%** | nothing — fixed floor |
| stdlib `require`s (`native`) | +4,212 | **2.9%** | **ambition — ~4.2 KB per require** |
| App code (45 Ruby lines) | **+704** | **0.49%** | lines — **15.6 B gz/line** |

**Features never breach the ceiling; requires do.** One `require` ≈ **270 Ruby lines**.
**v0.3 headroom correction [C-12]: EC-7b scopes the ceiling to the *page*, not the artifact.**
The island page also loads `main.js` (809) + `sigil-navigation.js` (1,480); as a Laboratory
entry, + `laboratory.js` (1,620). **Net headroom ≈ 6,238 B** (Laboratory host) / **≈ 7,858 B**
(bare page) — **not the 10,147 v0.2 quoted to the owner.** *v0.4: the "one page file per page"
premise behind these numbers is **void** — About loads two (4,113 B). Laboratory loads one, so
the island figure holds; **measure it, do not infer it** (AC-042).* This is decision-relevant: at 6,238,
**one more require consumes most of the budget and RC-7 fires.**

**The publishable number — the post's spine:** *96.6% runtime, 2.9% one require, 0.49% the Ruby
you actually wrote* — **already a complete, publishable insight, obtained in 45 lines.** So
**RC-8 has a real fallback: the post can be written from the probe data in hand even if the
widget never ships.**

**Why this stays optional and owner-gated.** RISK-1 (attention displacement — 18 build commits,
then one post in 16 months) is **untouched by any measurement** and remains dominant.

> **EC-1 is the whole verdict; everything else is engineering.**
> *The bytes were never the question. The hours are.*

The measurement also **removed the cheap option from the menu**: the runtime floor means the
*minimum viable* artifact costs 135 KiB, so the *minimum justifiable* one must be substantive.
**The choice is binary: a real thing, or nothing.**

### Phase overview

- **Phase 0 — Identity Spine & Canon** (A). AC-001..003.
- **Phase 1 — Trust & Defect Stabilization** (C+D). AC-004..011, **054..057**.
- **Phase 2 — Content Architecture & Navigability** (B) **+ Ruling 2**. AC-012..016, 023, 024.
- **Phase 3 — Journal Mechanics & AI-in-Frame** (B) **+ Ruling 2 tail**. AC-017..022, 025.
- **Phase 4 — Layout, UI/UX & Accessibility** (G) — **after the priority items per R2.** AC-026..040, **047..049, 058**.
- **Phase 5 — The Transmutation Circle** (H) — **optional, owner-gated.** AC-041..046, **050..053**.

---

## Stories

Each story carries a user story, timebox (never points), risk tag, and an executor-tier hint.

### Phase 0 — Identity Spine & Canon

**Story 0.1 — Canonical identity line as single source of truth.** 1d. P1. mid. (AC-001.)
  *v0.4 [OWNER 1] — the line is **chosen**, no longer a copy exercise:* **"An engineering lead
  who never stopped shipping — a Code Alchemist transmuting chaos into scalable systems, now
  conducting AI familiars in the open."** Store **once** under `_data/`; consume verbatim in the
  hero (`index.html:72`), the About lead, and `_includes/head/meta.html`. **It lands in
  `.hero-description`, NOT `.hero-subtitle`** — the latter is the 2rem gold cursive wordmark
  ("Code Alchemist") and is not a prose slot. **Executor is now `mid`, not `frontier`** — the
  copy decision is made; this is plumbing.
**Story 0.2 — Resolve the job-title contradiction.** 0.5d. P2. micro. (AC-002.)
  *v0.4 [OWNER 2]:* canonical title is **"Director of Engineering"**. `_data/character_build.yml:5`
  **already reads this** (verified) — so the fix is **one edit to `_data/jobs.yaml:1`**, not a
  negotiation. Closes D10.
**Story 0.3 — Author the post-type + assay convention.** 1d. P1. mid. (AC-003.) Feeds Phase 3.
**Story 0.4 — Rewrite About as the four-era arc.** 2d. P2. frontier — persona voice is load-bearing. (Review-validated.)

### Phase 1 — Trust & Defect Stabilization

**Story 1.1 — Clean the mechanical defect backlog.** 1.5d. P1. micro.
(AC-004, AC-005, **AC-054, AC-055, AC-056, AC-057**.)
  *v0.3 [C-16]: AC-004 (build exits 0) and AC-005 (images resolve) detect **none** of D4, D6,
  D11, D12 — an executor could fix the two image defects, pass both ACs, and ship four defects
  green. Each now has its own grep-level gate.*
  *v0.4 [OWNER 4/6; CRITIC2 C-16]:* **D11 → drop `pt_BR`** from `_includes/head/meta.html:18`
  (AC-056, decided). **D12 → AC-057 is now a set-inclusion check against `_data/skills.yml`**,
  not a literal-string match; note the mirror-image gap the backlog never mentioned —
  **Elixir and Clojure are backed but never advertised.** **D6 is 6 posts, not 5** (verified:
  five `comments: true` + one `comments: false`).
  **⚠ BLOCKING DEPENDENCY — D9 (Formspree) [OWNER 6]:** the fix needs a **real form-hash ID,
  which is a credential only the owner can supply.** This story **cannot fully complete without
  it**; it is not a research task. **Ship the rest of Story 1.1 without blocking on it**, keep
  `mailto:hi@hlavezzo.me` as the interim fallback, and close D9 when the ID arrives. *This is
  the only owner-input dependency remaining in Phases 0–4.*
**Story 1.2 — Wire SEO (seo-tag + sitemap + per-post description).** 1.5d. P1. mid. (AC-006, AC-010, AC-011.)
  *`jekyll-sitemap` is doubly load-bearing — Phase 4's `pa11y-ci` drives off the sitemap.*
**Story 1.3 — Full-text feed, surfaced.** 0.5d. P2. micro. (AC-007, AC-008.)
**Story 1.4 — Retire Universal Analytics.** 0.5d. P2. micro. (AC-009.)
  *v0.4 [OWNER 5]:* replacement is **Plausible** (cookie-free, no consent banner, ~1 KB).
  **Do not couple the two:** AC-009 is the **removal** of `UA-135917274-1` and ships in Phase 1
  **independently** — wiring Plausible does not gate it, and an unwired Plausible does not block
  the retirement.

> **EC-1 gate:** Phase 1 closing (AC-004..AC-011) is the **hard prerequisite for any Opal work
> whatsoever.** **RC-5: if Phase 1 has not closed within a period the owner considers
> reasonable, EC-1 hardens from "gate" to "no."**

### Phase 2 — Content Architecture & Navigability *(+ **Ruling 2 — the headline deliverable**)*

> **v0.4 [OWNER 8] — read this before sequencing Phase 2.** The owner has answered the one
> question FORGE routed to them: **the reframe lands as *insight*, not a substitute** — *"It's
> insight — that's genuinely satisfying."* **Ruling 2 is therefore the main event, not the
> groundwork.** Stories **2.5** (server-rendered TOC, AC-023 — also kills D15), **2.6**
> (sitewide motion guards, AC-024), **2.7** (build-time nav state), Story **2.2** (AC-013,
> server-rendered categories) and Story **3.5** (`prefers-color-scheme`, AC-025) are **what the
> owner actually wants**: *Ruby transmutes the site at build time.* Narrate them that way.
> **The discipline is unchanged:** this is **craft** satisfaction, **not** licence to
> reintroduce the withdrawn performance claim. **[DECISION-C] stands — correctness + a11y +
> SEO, never speed.**

**Story 2.1 — Home surfaces content.** 1.5d. P1. mid. (AC-012.)
**Story 2.2 — Repair the taxonomy + tabs.** 1d. P1. mid. (AC-013.)
  *Ruling 2's flagship: the filter becomes real server-rendered category pages. Correctness + SEO, **not speed**.*
**Story 2.3 — Ship /now and /uses.** 1d. P2. mid. (AC-014, AC-015.)
**Story 2.4 — Start-here page + on-brand 404.** 1d. P2. mid. (AC-016.)

**Story 2.5 — Server-render the table of contents. [Ruling 2]**
As a reader with JavaScript disabled, I want a working Contents list, so the post's navigation
is not an empty shell. Today `#toc-content` renders **empty** while the `.toc-scroll` "Contents"
header still renders (D15). Timebox: 1.5d. Risk: P1. Executor: mid — kramdown's TOC or a small
Ruby generator; retire `post.html:216-247`. (AC-023.)
  *Assumption 5 — kramdown fidelity unverified. **APIVR verifies in Phase 2**; fallback is a Ruby generator (+0.5d).*

**Story 2.6 — Guard every script-injected animation. [Ruling 2]**
As a motion-sensitive visitor, I want my reduced-motion preference honored, so decorative
particle/drag/ripple layers do not animate at me. Timebox: 1.5d *(was 1d — the defect is five
files, not one)*. Risk: P1. Executor: mid — a `matchMedia` guard before every injection, or
CSS gated on `--motionOK`. (AC-024.)
  *v0.3 [C-6, extended]: D16 is **not** a `home.js`-only defect. `grep -rn "infinite" assets/js/`
  returns **five** injectors — `home.js:29`, `about.js:110`, `letter.js:11`, `notebook.js:14`,
  `laboratory.js:12` — against **one** CSS guard (`_home.scss:505`). The critic found one of the
  four non-home cases; the sweep finds all four. AC-024 is now **sitewide**.*
  *⚠️ **This does NOT discharge WCAG 2.2.2** — see AC-031, Phase 4. Two defects, two criteria, two phases.*

**Story 2.7 — Build-time nav active-state. [Ruling 2 — re-justified at v0.3]**
As a reader with JavaScript disabled, I want the nav to show where I am, so the active state is
not a JS-only affordance. Timebox: 0.5d *(was 1d — the motion half moved out)*. Risk: P2.
Executor: mid — Liquid `page.url` replaces `sigil-navigation.js:3-15`. (Covered by AC-004 + review.)
  *v0.3 [C-15]: v0.2 justified this story as **"the JS surface shrinks to what genuinely needs
  it"** — **byte reduction wearing a maintainability hat**, i.e. precisely the premise
  `[DECISION-C]` withdrew. It was the one place the performance rationale survived. **Deleted.**
  The story survives on **correctness** alone (a real no-JS defect). Its **motion half** —
  fade-in and `scroll-behavior` — **moved to Phase 4 (Story 4.5)**: un-gated motion work two
  phases before `--motionOK` exists was the wrong call.*

### Phase 3 — Journal Mechanics & AI-in-Frame

**Story 3.1 — Render post-type badges + assay labels.** 2d. P1. mid. (AC-017, AC-018.)
  *Ship badges with `--dnd-ink` text on pastel grounds — **verified 6.01–8.54:1**, comfortably
  legal — and the forward dependency on Phase 4's `-ink` tokens disappears.*
**Story 3.2 — Reader contract + sitewide disclaimer.** 1d. P1. mid. (AC-019, AC-020.)
**Story 3.3 — Re-type the 2026 post as a branded Transmutation.** 0.5d. P2. micro. (AC-021.)
  *v0.4 [OWNER 3] — retro labels approved, lightweight:* 2019-12-12 (SFTP), 2020-01-13 (Clojure),
  2023-02-10 (use cases), 2023-02-16 (domains) → `type: scroll`; **2026-02-18 (LLM routing) →
  `type: transmutation` + `assay`** (AC-021); 2019-03-06 ("My notebook !") → `type: log`
  (candidate — the launch/meta post). Near-zero cost; makes the voice split **deliberate**.
**Story 3.4 — Establish the "Alchemist's Log" cadence anchor.** 1d. P2. mid. (AC-022.)
**Story 3.5 — Dark mode without JavaScript. [Ruling 2]**
As a dark-preference visitor, I want the site dark on arrival with JS disabled, so the toggle is
an enhancement rather than the mechanism. Today the toggle is JS + localStorage, **only on post
pages**, and **renders-but-does-nothing** with JS off (D19); CSS dark mode **already partially
exists** at `_breakpoints.scss:64`. Timebox: 1d. Risk: P2. Executor: mid. (AC-025.)

### Phase 4 — Layout, UI/UX & Accessibility *(R2: after the priority items)*

> **Ships in two independently-deployable slices** (~15.5d total, −1.5d from v0.2: obsidian dropped):
> **4a — the measured failures + both live WCAG failures** (Stories 4.1, 4.2, 4.4a, 4.5, 4.10a).
> **4b — semantics & craft** (Stories 4.3, 4.4b, 4.6–4.9, 4.10b, 4.11).
>
> **v0.3 [C-13]: 4a's claim is restated honestly.** v0.2 said 4a *"closes every measured defect
> and **the one** live WCAG failure."* **False — there are two.** `laboratory.html:68-70` emits
> an **empty** `<div class="item-rarity-indicator" data-rarity="…">`: rarity is conveyed by a
> 4px colour strip and nothing else — a **live 1.4.1 failure today**. 4a now closes **the
> measured contrast failures, 2.2.2, and 1.4.1's label half**; the pip/glow craft lands in 4b.
> **v0.3 [C-1]: 4a no longer self-certifies** — AC-049 puts the palette test in CI *in 4a*,
> rather than leaving 4a's only independent backstop in 4b.

**Story 4.1 — Split the palette into `-ink` and `-ornament` tokens. [4a]**
Add `-ink` variants at ≥4.5:1 for every themed hue used as text; reclassify the rest as ornament.
`--ff-blue-dark` #306d9a (5.12) **already exists**. Darken `--dnd-brown` one step (4.46 → ≥4.5).
**Every pastel keeps its exact hex.** Timebox: 2d. Risk: **P0**. Executor: mid.
(AC-026, **AC-047, AC-048**.) Fixes D17.
  *[C-1] AC-047 binds **usage** → classification and AC-048 forbids unclassified tokens, so
  "classify everything ornament" now **fails**. The doctrine is the gate.*

**Story 4.2 — Ink-hairline the stat bars and rarity chips. [4a]**
1px `--dnd-ink` hairline on track + fill edge → **10.43:1 on cream** *(corrected from "~12.7:1" —
that is `--ink-color`'s figure [C-10])* on the boundary 1.4.11 actually binds. Timebox: 1.5d.
Risk: P1. Executor: mid. (AC-027.) Fixes D17.

**Story 4.3 — Character-sheet meter semantics. [4b]**
`role="meter"` for HP/MP/ST, `role="progressbar"` for EXP — *"not pedantry; it changes what the
screen reader announces."* `aria-valuetext="85 of 100 hit points"`. **Styled `<div>`s, not native
`<meter>`** (a cross-browser styling swamp). Timebox: 2d. Risk: P1. Executor: mid. (AC-028, AC-029.)

**Story 4.4a — Rarity carries a text label. [4a — moved from 4b per C-13]**
Give the empty rarity div a visible tier word. Closes the **live 1.4.1 failure**. Timebox: 0.5d.
Risk: **P0**. Executor: mid. (AC-030.) Fixes D13-adjacent + D20.
**Story 4.4b — Rarity pips, glow, and the no-JS fix. [4b]**
Pip count (◆/◆◆/◆◆◆◆◆), tier colour as border/glow, and `[data-rarity]` CSS selectors so rarity
survives with JS off. Timebox: 1d. Risk: P1. Executor: mid. Fixes D20, D21.
  *v0.3: the **obsidian surface is dropped** [C-7] — its premise (`--rarity-uncommon` at 1.26:1)
  is **dead code**, and it would have failed every ink token at 1.26–3.59:1. `uncommon` gets a
  real rule or the token is deleted (D21).*

**Story 4.5 — WCAG 2.2.2: finite circle + the `--motionOK` token. [4a]**
Make the circle **inscribe → flare → settle in ≤5s** → **2.2.2 does not apply at all**;
re-trigger on nav, not a timer. Define `--motionOK` once; gate **every** animation through it —
**11 `infinite` hits in `_sass/` against 1 guard**, plus 5 JS injectors, plus **`scroll-behavior:
smooth` already sitewide and unguarded at `_base.scss:13` (D22)**. **Substitute, don't delete**
under `reduce`. Timebox: 2.5d *(was 2d — absorbs Story 2.7's motion half and D22)*. Risk: **P0** —
a **live** defect. Executor: mid. (AC-031.) Fixes D16, D22.

**Story 4.6 — Hide the ornament, correctly and once. [4b]**
`aria-hidden="true"` on every ornament SVG root — **one method, never stacked with `alt=""`**.
Timebox: 1d. Risk: P1. Executor: micro. (AC-032.)
**Story 4.7 — Themed nav: keep the word, add the gloss. [4b]**
**Do not rename the themed words** — that creates a 2.5.3 failure *and* flattens the persona.
Label the *button*; `aria-hidden` + `focusable="false"` on the icon. **Never `aria-label` on the
`<svg>`.** Timebox: 1d. Risk: P1. Executor: mid. (AC-033.)
**Story 4.8 — Fluid type, measure, and reflow. [4b]**
`clamp()` max ≤ 2.5× min **with a rem/px middle term**. Body ~66ch; display face confined to
H1/H2/nav/wordmark. Two-column sheet to ~600px, then single column. Container-query the rarity
cards. Timebox: 2d. Risk: P1. Executor: mid. (AC-034, **AC-058**, AC-035.)
**Story 4.9 — Focus, targets, and text-spacing hygiene. [4b]**
Audit `$sidebar-width: 60px` + sticky chrome against F110 (cheapest fix: `scroll-margin`).
`outline` + `outline-offset` + layered `box-shadow`. 24×24 hit areas via C42 — **decoration size
and target size are decoupled**. `min-height`, never `height`. Timebox: 2d. Risk: P1. Executor:
mid. (AC-036, AC-037, AC-038.)
**Story 4.10a — The palette contrast test in CI. [4a — moved from 4b per C-1]**
~30 lines asserting every `-ink` ≥4.5:1 and every meaning-bearing non-text token ≥3:1 against each
declared background, **blocking, shipping with the token split**. Timebox: 1d. Risk: **P0**.
Executor: mid. (**AC-049**.)
**Story 4.10b — The axe/pa11y ratchet. [4b]**
`pa11y-ci` + axe at `WCAG2AA` over the sitemap in GitHub Actions. Timebox: 1d. Risk: P1. Executor:
mid. (AC-039.)
  *Automation buys **30–40%**. This is not "we're compliant"; it is "we can't regress what we measured."*
**Story 4.11 — Publish `/accessibility` — and beat D&D Beyond on purpose. [4b]**
State the target (WCAG 2.2 AA), the method, **what is known to be imperfect**, and a contact route.
Timebox: 1d. Risk: P2. Executor: frontier. (AC-040.)
  *⚠️ **Ships LAST in Phase 4**, after 4a + both CI checks are green: it converts a private quality
  bar into a **public claim**, and a conformance claim the site does not meet is worse than no page.*

### Phase 5 — The Transmutation Circle *(OPTIONAL, OWNER-GATED)*

> **Do not begin without an explicit owner decision.** RISK-1 is untouched by measurement and
> remains dominant. **EC-1 is the whole verdict; everything else is engineering.**

**Story 5.0 — The owner gate. [decision + committed record]**
Decide **(a) EC-7d's value floor** — *is a Ruby-compiled alchemy widget worth 135 KiB of runtime
to someone who visits your site?* If no, **don't build it** [RC-8] — **and write the post anyway
from the numbers already measured**; and **(b)** confirm Phase 1 closed and Phase 4 is green.
Timebox: 0d (decision) + 0.5d (record). Risk: **P0**. Executor: human only. (**AC-053**.)
  *v0.3 [C-3]: v0.2 routed EC-7d entirely to this story **with no AC** — so a token spinner passed
  all six Phase 5 gates. The decision is now a **committed record whose timestamp must precede the
  first `_opal/` commit**.*

**Story 5.1 — Measure `opal-browser` before designing.**
`opal-browser` is **UNMEASURED** — *"the only open byte question"* [RISK-6]. One `require` ≈ 4,212 B
≈ 270 Ruby lines, against **net page headroom ≈6,238 B** [C-12]. **If it pushes past EC-7b, the
island ships without it or not at all** [RC-7]. Timebox: 0.5d. Risk: P1. Executor: micro. (AC-044.)

**Story 5.2 — Build the island widget.**
**Inline SVG, not canvas** — *"SVG has a DOM, which allows it to be made nice and accessible"*;
survives `forced-colors`. Keyboard-operable, visible focus, no trap. **Finite animation ≤5s.**
`<noscript>` + static inline SVG + prose — *a 143 KB payload failing on a slow link is a measured
scenario*. **Genuinely interactive and honest; a token spinner is FORBIDDEN — and no more than
that: the scarce hours go to the post.** Timebox: 3d. Risk: P1. Executor: frontier.
(AC-045, **AC-050, AC-051**.)
  *v0.3 [C-2/C-8]: v0.2 assigned this story AC-040 (`/accessibility` — a **Phase 4** story!),
  AC-043 (the drift gate — Story 5.3's), and AC-045. EC-9 and EC-3 were declared **binding** and
  had **no AC at all**, so the island could ship an infinite spinner and pass. Map corrected;
  AC-050/051 added.*

**Story 5.3 — The precompile pipeline and the drift gate.**
Precompile with **`--no-source-map` (MANDATORY — without it the payload silently 3.5×'s)** and
`--no-method-missing` (**free 4,028 B gz**). Commit output; `.rb` in `_opal/`, excluded from Jekyll
output. **No `opal` in `jekyll_plugins`.** The drift gate **must pin the exact flag set** — *a drift
check that doesn't pin flags cannot detect a source map creeping back*. Timebox: 1.5d. Risk: P1.
Executor: mid. (AC-041, AC-042, AC-043, **AC-052**.) Fixes D18.

**Story 5.4 — Write the Transmutation post. [this is the deliverable]**
Spine: the **re-measured** artifact [EC-13 — *143,453 is a proxy*] and its decomposition —
**96.6% runtime / 2.9% one require / 0.49% the Ruby you actually wrote**. Disclose the 140 KiB
honestly: *"Dan Luu's brand is **measurement**, not smallness"* — a measured, disclosed, opt-in
island is **methodologically aligned with Luu even where it is numerically opposed to him**,
because the hypocrisy charge requires the cost to be **hidden**. **But disclosure does not launder
a bad artifact.** Timebox: 3d. Risk: **P0** — **the post is the product; the widget is the pretext.**
Executor: frontier. (AC-046, **AC-059**.)
  *v0.3 [C-5]: the post **must not** publish `7,862 B` or `17.8×`. The honest figures are
  **11,028 B** (8 files summed, each gzipped separately), **4,778 B** (heaviest page), **30.0×** /
  **13.0×**. This record has now been corrected **three times, always by someone other than its
  author** — and **that is the post.***
  *v0.4 [CRITIC2 R-1] — **EC-13 has a criterion again.*** v0.3 asserted the re-measured artifact
  and its decomposition **in this prose and nowhere else**: AC-046's rewrite *replaced* the
  measurement-publication duty instead of extending it, so **no criterion required the post to
  state any figure at all** — while C-5's corrected numbers were routed to publication *through
  that deleted VERIFY*. **The plan's flagship deliverable was ungated.** Now split:
  **AC-046 = the value floor** (*is it worth 135 KiB?*); **AC-059 = the measurement**
  (re-measured gz bytes matching AC-042's CI sum, the **96.6 / 2.9 / 0.49** tier decomposition,
  the **per-file-sum method** named explicitly, and **none** of the retracted figures).
  *The lesson is the post's spine: a plan whose prose is more rigorous than its criteria will
  ship the prose and gate nothing — and it did this twice, the second time while fixing the
  first.*

---

## Acceptance Criteria

**59 criteria, all inlined here in full EARS form.** This section is **generated directly from
the frozen criteria file** (`.claude/rebrand/rebrand.criteria.md`, sha256 recorded in
`.claude/rebrand/rebrand.state.json`) — so the plan and the normative text **cannot drift**.

**v0.3 [C-4 — the highest-leverage fix]:** v0.2 carried AC-001..AC-022 as an abbreviated table
with **no EARS form and no VERIFY**, and pointed at an authoritative copy inside a **job temp
sandbox** (`/home/rynaro/.claude/jobs/…/tmp/`) that would be **reaped**, taking the normative
text of 48% of the criteria and the referent of the freeze hash with it. A competent executor
holding only the plan **could not have built Phases 0–3.** All criteria, state, and the
calibration log now live in `.claude/rebrand/`; the v0.2 state is preserved as
`rebrand-v0.2.state.json`.

**Read the linter honestly:** `ramza-ears-lint` checks form ∈ set, one `THEN`, no literal
`" AND "`, and that a `VERIFY` exists. It cannot see whether a `VERIFY` verifies its `THEN`,
whether an AC is falsifiable, or whether its quantifier ranges over anything real. **Every
blocking finding against v0.2 lived in that blind spot — and so did v0.3's R-1 regression and
its two vacuous quantifiers, all three of which linted green at 58/58.** Green is necessary,
not sufficient.

**v0.4 [R-1 / C-1 / C-16]:** the three surviving criteria defects are fixed above the linter's
reach, and **each fix was executed, not asserted** — AC-057's set-inclusion was run against
`_data/skills.yml` and against the critic's three attacks before being written down. The
`Phase ?` placeholder that stood on all 58 headings is resolved. **AC bodies here are
byte-identical to the frozen criteria file** — verified by diff, not by claim [C-4].


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

## Confidence

`ramza-score --rubric confidence`: **80.0% → VALIDATE** (pattern_match 80, requirement_clarity
84, decomposition_stability 81, constraint_compliance **75**).

**+2.0 over v0.3's 78.0. The verdict does not move: still VALIDATE.** That is the honest
outcome — three surgical fixes and eight owner decisions do not make a plan
`AUTO_PROCEED`-grade, and the one thing that would (an independent reader confirming the new
criteria bind what they claim) has not happened for v0.4.

**Calibration context.** Two independent readers landed on **78.0** for v0.3 by *different
routes* — the critic docked `requirement_clarity` to 80 for the `Phase ?` placeholder and
raised `constraint_compliance` to **72** against my 70, calling my refusal to self-score it
*"honest, very slightly conservative."* **R-1 vindicated that refusal concretely: I shipped a
regression on exactly that dimension while believing I had fixed it.** That prior governs the
scoring below.

| Dim | v0.3 self | Critic v0.3 | **v0.4** | Why |
|---|---:|---:|---:|---|
| pattern_match | 80 | 80 | **80** | **Unchanged — no pattern work happened in v0.4.** Nothing was learned or borrowed; the retired E5 dominance stays retired. Moving this number would be motion without evidence. |
| requirement_clarity | 82 | **80** | **84** | The critic's **−2 was for the `Phase ?` placeholder standing on all 58 headings** — the executor's primary reading surface. **Verified gone: 0 placeholders, 59/59 resolved to real phases including the 4a/4b slice.** v0.3 additionally **held itself below 85 "because Open Decisions 7 and 8 are genuinely open and owner-only"** — **both are now closed** [OWNER 7/8], along with the other six. Both named hold-downs are genuinely retired, so this rises. **Not 85+:** v0.4 adds prose at volume, and the identity line's own decision text conflated `.hero-subtitle` with `.hero-description` — the surface still misreads. |
| decomposition_stability | 80 | 80 | **81** | The critic's 80 was for *"4a's boundary moved twice in one revision — a slice whose definition shifts under scrutiny is not yet stable."* **In v0.4 it did not move** (AC-059 lands in Phase 5; no story restructuring). **But that is one revision of evidence, so it buys one point, not three** — and three of 4a's criteria (AC-026/047/048) changed *semantics* even though membership held. |
| constraint_compliance | 70 | **72** | **75** | **The honest one, and the one I am structurally worst at scoring.** The critic held 72 against **two named live holes — EC-13 unbound (R-1) and AC-047/048's vocabulary gap.** Both are closed, plus C-16's. **AC-057 was verified BY EXECUTION** against the real data and the critic's three attacks *before* being written — the strongest evidence class available to an author. **+3, and no more, for four reasons:** (1) **no independent reader has confirmed v0.4's fixes**, and that assertion is the exact class that was false in v0.2 *and* v0.3; (2) **C-1's *shape* survives one level down** — AC-047's *"renders body text"* is still an **executor-interpreted predicate**, though the empty-set attack is dead because manifest membership is now bounded by **usage**, not declaration; (3) **AC-046's value floor is irreducibly social** — the critic's own admission, not a defect I can fix; (4) my prior on this dimension is **two consecutive false beliefs.** |

**Why not higher, stated plainly.** The temptation is to read "three blocking fixes cleared,
8/8 decisions closed, RISK-5 closed" as a mandate to jump. It is not. **The v0.2 diagnosis —
*the plan's prose is consistently more rigorous than its criteria* — has now held under
remediation twice**, the second time (R-1) committed by an author who had accepted the
diagnosis in full and was actively watching for it. **A third clean self-assessment is worth
less than one targeted re-check**, which is exactly what the critic prescribed and exactly what
this artifact still needs.

**What would move it.** A targeted re-check of **AC-026 / AC-047 / AC-048 / AC-057 / AC-059**
only — the critic stated explicitly that **a third full critique is not required, and
emphatically not another rewrite.** Confirm the two-axis manifest closes the `logotype` hatch,
that AC-059 binds EC-13, and that AC-057's set-inclusion survives attack; `constraint_compliance`
then has an independent reading for the first time and this lands where it truly sits.

---

## Rejected Alternatives

### Strategy *(carried; critic impeached none of it)*
- **A — "Defect-first stabilize"** (**65.5, weak**). Alignment 5: treats the rebrand as a bug-sweep. Survives *inside* D as Phase 1.
- **B — "Exemplar-mapped surface build"** (**72.5, solid**). Ships every surface atop unstabilized plumbing. D keeps B's surface set behind Phases 0–1.
- **C — "Persona-system-first"** (**65.0, weak**). Over-invests in narrative scaffolding before substance. D takes its best idea — a *cheap* spine — as Phase 0.

### Accessibility phase shape *(revised at v0.3)*
- **E1 — "Perceptual palette rewrite"** (**59.5, weak**). Leonardo/OKLCH generation *from* a contrast target. Elegant, but **alignment 4**: it moves the pastels, which is the flattening persona-as-moat exists to prevent. The tools stay useful **inside E2** for deriving `-ink` variants.
- **E2 — "Ink/ornament split + boundary technique"** (**86.5, elite**). **Absorbed as E5′'s core**, and E5′'s fallback.
- **E3 — "Compliance-by-CI"** (**70.5, solid**). Cannot be the strategy: automation catches **30–40%**, and the `role="meter"` / `aria-valuetext` work — the part that makes the persona *stronger* — is invisible to axe. Absorbed as the **ratchet**.
- **E4 — "Dark-surface pivot"** (**59.0, weak**). **REJECTED, and at v0.3 rejected a second time in its scoped form** [C-7]. Rejecting it sitewide for "re-opening every contrast pair" and then absorbing it scoped was **forgetting my own objection**: scoping reduces the *count* of re-opened pairs, not the *kind*. Verified — every ink token fails on obsidian (1.26–3.59:1) — and its premise is **dead code**. May return only as a **want**, with its own light-ink palette, stories, ACs, and timebox.
- **E5 — "Fence the gimmick (E2 + ratchet + obsidian)"** (**87.5**) — **RETIRED at v0.3.** Its `E5 ⊃ E2` dominance was **false**: obsidian is not severable from E2 at zero cost because it **mutates E2's declared-background set, which is E2's definition**. The FORGE H5⊃H4 pattern was **borrowed where it does not transfer**.
- **E5′ — "Fence the gimmick (E2 + ratchet)"** ⭐ (**87.0, elite**). A *true* superset of E2, still > 86.5. The dominance survives by dropping the module that broke it.

### Opal *(adjudicated by FORGE — binding, not re-litigated)*

| # | Rejected | Score | Reason |
|---|---|---|---|
| H1 | **Full adoption (plumbing)** | 2.15 | **30.0× the heaviest page** (13.0× vs all 8 files). RC-1 does not fire under any honest reading. Repeats the Mar-2025 build-instead-of-write pattern |
| H2 | **Flat rejection** | 3.90 | Technically clean, **strategically naive**: treats owner motivation as noise when the evidence says motivation is the binding constraint |
| H3 | **Island only, no reframe** | 4.15 | Forfeits the AC-013 / no-JS-TOC / a11y wins that come free |
| H4 | **Reframe only, no island** | **4.40** | **The strongest single-ruling answer and the fallback if any gate fails** |
| H5 | **Synthesis** ⭐ | **4.70** | Selected. **H5 ⊃ H4** — here the dominance is real: the island **is** severable at zero cost (separate page, EC-7a's 0-byte fence). *Contrast E5/E2 above, where I borrowed this pattern and it did not transfer.* |

---

## Risks

| Risk | Tag | Mitigation |
|---|---|---|
| **[RISK-1 — DOMINANT]** Attention displacement: Phase 5 consumes the hobby budget; the Mar-2025 pattern repeats (18 build commits → 1 post / 16 months) | **P0** | **Untouched by measurement; cannot be eliminated.** Mitigated by **EC-1 only**: Phase 5 optional, owner-gated, sequenced last. **RC-5:** if Phase 1 stalls, EC-1 hardens to "no". Self-resolving — *EC-1 is itself the test.* |
| **The new ACs assert a binding they may not achieve** — the same class of claim that was false in v0.2 | **P1 — new** | Named, not mitigated away. Confidence held at 78 and `constraint_compliance` at 70 **for this reason**. **A second critic pass over the criteria layer is the correct gate**, not another self-assessment. |
| **`/accessibility` publishes a claim the site does not meet** | P1 | Story 4.11 **ships last in Phase 4**, gated on 4a + both CI checks green. The page states known gaps **by design**. |
| **AC-024 mistaken for closing WCAG 2.2.2** | P1 | Stated three times (Story 2.6, AC-024's phase tag, AC-031). Two ACs, two phases, by construction. *Critic verified no AC assumes otherwise.* |
| **Ruling 2 sold as a performance win** | P1 | `[DECISION-C]` is normative. *Critic grep: **zero residue** across 17 hits. The one rationale leak (Story 2.7) is deleted at v0.3.* |
| **Boundary erosion (Phase 5 → plumbing by increments)** | P1 | EC-4 + **EC-11 (any expansion is a NEW verdict)** + **RC-6** (one breach ⇒ revert to Ruling 2). **The economics defend it:** the toggle isn't on the island page, so it would **re-pay the full 135 KiB floor on the reading path**. |
| **Source map creeps back** — silently 3.5×'s the payload | P1 | **EC-10 pins the exact flag set**; AC-043 byte-compares a pinned recompile. |
| **`opal-browser` unmeasured** | P1 | Story 5.1 measures **before designing**; **RC-7** — the require list is not negotiable upward after the fact. **Sharpened at v0.3:** net headroom is **≈6,238 B**, not 10,147 [C-12], so one require nearly exhausts it. |
| **EC-8's discharge treated as permanent** | **P2 — new** | *"opal 1.8.3 healthy"* is **point-in-time**. **RC-2 restored** as the re-check on any major Ruby/Opal upgrade — live, because Phase 5 is sequenced last [C-11]. |
| ~~**Owner reads Ruling 2 as a soft "no"** (FORGE **RISK-5**)~~ | ~~P1~~ **CLOSED** | **CLOSED 2026-07-16 by the owner** [OWNER 8]: *"It's insight — that's genuinely satisfying."* RISK-5 was *"owner rejects Ruling 2 as a substitute good and reads the verdict as a soft 'no'"* — **live and unmitigated** through v0.3, and mitigable by nobody but the owner. **Affirmatively accepted on its own terms.** Consequence: Ruling 2 is **promoted to headline deliverable** (Phase 2 header) and Phase 5's justification **narrows to joy alone**. |
| **"Insight" misread as licence to revive the performance claim** | **P1 — new at v0.4** | The reframe is satisfying as **craft**, not as speed. **[DECISION-C] is normative and unchanged**; the heaviest page ships **4,778 B gz**; there was never a performance problem. *Critic verified **zero** perf residue across 17 v0.2 hits — v0.4 does not regress it.* **RC-8** independently holds: the post is writable from data in hand. |
| **The Formspree form ID never arrives** (D9) | **P2 — new at v0.4** | **A credential only the owner can supply** [OWNER 6] — the sole owner-input dependency left in Phases 0–4. Story 1.1 ships its other fixes regardless; `mailto:` fallback is the interim. Cannot be executor-resolved; do not let it hold Phase 1. |
| **Perf/reputational irony at 140 KiB** | P2 | **DOWNGRADED → managed**, conditional on EC-7d. *Disclosure does not launder a bad artifact.* |
| The " copy" post rename changes a live URL | P1 | Phase 1 adds a redirect; CHANGE-with-migration. |
| Persona metaphor stretched thin | P2 | Ship post-types only when there is content. |
| Analytics/contact-form choices block Phase 1 | P2 | Framed as Open Decisions; Phase 1 ships UA *removal* + a mailto fallback regardless. |
| **Phase 4 (~15.5d) breaks "independently shippable"** | P1 | 4a / 4b slices, each independently deployable. *Critic: the split is genuine, not papering.* |
| Story 3.1 badges vs Phase 4's `-ink` tokens | P2 | `--dnd-ink` on pastels = **6.01–8.54:1**, verified — no forward dependency. |
| Kramdown TOC fidelity unverified | P2 | **APIVR verifies in Phase 2**; fallback +0.5d. |
| **Chosen identity line wraps the hero to two lines** | **P2 — new at v0.4** | **Accepted trade-off** [OWNER 1] — the longest candidate was chosen deliberately. Phase 4 layout input (Story 4.8). *Verified: it lands in `.hero-description` (`index.html:72`), **not** `.hero-subtitle`; `$pastel-blue` on the hero gradient is **8.12–9.86:1**, so **contrast is not at issue** — this is purely wrap/measure.* |

---

## Defect Backlog (Surface D) — 22 items

**micro** = economy/Haiku single-file mechanical; **feature** = mid/Sonnet template logic.

| # | Defect | Evidence | Fix | Executor | Phase |
|---|---|---|---|---|---|
| D1 | Post filename contains literal " copy" | [FINDING-035] | Rename **+ redirect** | feature | 1 |
| D2 | Favicon `bottle.png` referenced ×2, absent | `default.html:13` [FINDING-036] | Add or repoint | micro | 1 |
| D3 | `twitter:image` → `me.jpg`, only `me.png` exists | `meta.html:25` [FINDING-036] | Repoint | micro | 1 |
| D4 | Font Awesome loaded twice (6.4.0 + 6.4.2) | `default.html:10`, `fonts.html:7` [FINDING-037] | Keep one version (**AC-054**) | micro | 1 |
| D5 | Missing `page` / `project` layouts | `404.html:3` [FINDING-004] | Create/rewire (AC-016) | feature | 1→2 |
| D6 | Dead `comments:` front matter | **6 posts** — five `comments: true` + one `comments: false` [FINDING-042; **corrected v0.4, CRITIC2 C-16** — the backlog said 5; AC-055's `grep -rn "^comments:" _posts/` returns **6**, so the AC was more correct than the backlog] | Remove (**AC-055**) | micro | 1 |
| D7 | Phantom `storybook` tab; `llm` post unreachable | `notebook.html:51` [FINDING-039] | Generate tabs from real categories (AC-013) | feature | 2 |
| D8 | UA analytics `UA-135917274-1` | `_config.yml:10` [FINDING-038] | Remove (AC-009) | micro | 1 |
| D9 | Formspree action posts to an email, not a form ID | `letter.html:98` [FINDING-041] | **Real hash ID — DECIDED** [OWNER 6]. **⚠ Needs a credential only the owner can supply; Story 1.1 cannot close D9 without it.** Interim: `mailto:` fallback | micro | 1 |
| D10 | Title contradiction | `jobs.yaml:1` vs `character_build.yml:5` [FINDING-033] | One title (AC-002) | micro | 0 |
| D11 | `og:locale:alternate pt_BR`, zero PT-BR content | `meta.html:18` [FINDING-018,045] | **Drop — DECIDED** [OWNER 4] (**AC-056**) | micro | 1 |
| D12 | `meta` keywords stuff unbacked langs — `golang, crystal, python, rust` **advertised, none backed**; inversely **Elixir and Clojure are backed but never advertised** (the mirror-image gap D12 never mentioned) | `meta.html:9` [FINDING-040,044; **v0.4 verified against `_data/skills.yml`** = Ruby, Elixir, JavaScript, Clojure] | Replace (**AC-057** — set-inclusion vs `_data/skills.yml`, **not** `character_build.yml`, which contains **zero** language names) | micro | 1 |
| D13 | 2026 post duplicates its H1 in-body | [FINDING-021] | Remove (Story 3.3) | micro | 3 |
| D14 | Static character-sheet numbers | `character_build.yml:21` [FINDING-045] | Cosmetic; optional | micro | deferred |
| **D15** | **Empty `#toc-content` "Contents" shell with JS disabled** | `post.html:216-247` [FORGE §2.3, verified] | Server-render the TOC (AC-023) | feature | 2 |
| **D16** | **Script-injected animations with NO JS-level reduced-motion guard.** *v0.3: **five** injectors, not one — `home.js:29`, `about.js:110`, `letter.js:11`, `notebook.js:14`, `laboratory.js:12` — against **one** CSS guard (`_home.scss:505`), which cannot suppress JS-created nodes. **All three 2.2.2 conditions hold on the homepage today.*** | verified: `grep -rn "infinite" assets/js/` → 5; `grep -rn "prefers-reduced-motion" _sass/` → 1 | **Two fixes, two phases:** guards sitewide (AC-024, Phase 2) **and** finite ≤5s (AC-031, Phase 4). **The first does not close the second** | **feature** | **2 + 4a** |
| **D17** | **Measured palette contrast failures** — `--ff-gold` 1.96, `--ff-green` 1.94, `--ff-purple-light` 2.24, **`--ff-blue` 2.90 (fails even non-text 3:1 → cannot be a border, focus ring, or icon)**, `--rarity-legendary` 2.32, pastels 1.22–1.73 as fills, **`--dnd-brown` 4.46 — misses AA by 0.04, and 1.4.11 forbids rounding** | [RES-A11Y §2, **8/8 independently reproduced**] | `-ink`/`-ornament` split (AC-026/047/048) + hairline boundary (AC-027) + label/pip (AC-030) | feature | **4a** |
| **D18** | **`opal -c` appends a source map by default** → payload silently **3.5×'s** (489 KB gz vs 138.5 KB) | [MEAS] | **`--no-source-map` MANDATORY**; drift gate **pins the flag set** (AC-043) | feature | 5 |
| **D19** | **Dark-mode toggle is a dead affordance with JS disabled**; only on post pages | `_breakpoints.scss:64` [FORGE §2.3, verified] | Build on `prefers-color-scheme` (AC-025) | feature | 3 |
| **D20** ⭐ | **The entire rarity system is a no-JS dead affordance.** `_sass/` styles `.item-rarity-indicator.common/.rare/.epic/.legendary` (**classes**); `laboratory.html:69` emits `data-rarity` (an **attribute**); **no `[data-rarity]` selector exists** — classes are added by `laboratory.js:19-28`. **JS off → every rarity indicator is a transparent 4px strip.** Structurally identical to D15/D19. *Also a **live 1.4.1 failure with JS on**: `laboratory.html:68-70` renders an **empty** div — rarity is colour and nothing else.* | verified [CRITIC C-13, C-14a] | `[data-rarity]` selectors + a visible tier word (AC-030) | feature | **4a + 4b** |
| **D21** ⭐ | **`rarity: "uncommon"` is unreachable even with JS** — `laboratory.js:19-28` falls through `else → common`; 3 projects affected (`projects.yaml:25,46,53`). **`--rarity-uncommon` #1eff00 is declared once and never consumed.** | verified: `grep -rn "rarity-uncommon"` → 1 hit, its own declaration | Add an `.uncommon` rule **or delete the dead token** | micro | 4b |
| **D22** ⭐ | **`scroll-behavior: smooth` already exists** at `_sass/_base.scss:13`, **sitewide and unguarded** — a motion defect uncovered by the single guard. **Story 2.7 (v0.2) proposed migrating *to the thing already there*.** Neither the plan nor FORGE noticed. | verified [CRITIC C-14c] | Gate behind `--motionOK` (Story 4.5) | micro | 4a |

> ⭐ = new at v0.3, surfaced by the independent critique. **D20/D21/D22 are in exactly the class
> D15/D19 enumerate — the v0.2 sweep that found the no-JS TOC and the dead dark toggle should
> have found them, and did not.**

---

## Decisions — RESOLVED (Surface F)

**8 of 8 closed by the owner on 2026-07-16** (`.claude/rebrand/owner-decisions.md`, binding).
**Nothing blocks Phases 0–4 on owner input.** The decisions and their rationale are retained
below as **provenance** — a resolved decision whose reasoning is deleted is a decision that
gets re-litigated.

### Previously resolved

- ~~**Raise the Opal byte ceiling above 150 KiB?**~~ **RESOLVED — keep 150 KiB gz; do not
  raise.** The "no room for growth" read followed from a **7×-inflated per-line rate**. At the
  corrected rate a ~60-line second feature costs **~940 B**, not 10 KB. **What you do not have
  room for is a second `require`.** *"Do not inflate a budget merely because measurement proved
  you can hit it — that is how budgets stop being budgets."* [FORGE v0.2 §2.4]

### Resolved 2026-07-16 by the owner

1. **Identity line — CHOSEN** [OWNER 1]:
   > *"An engineering lead who never stopped shipping — a Code Alchemist transmuting chaos into
   > scalable systems, now conducting AI familiars in the open."*

   Carries all three hats in one sentence; *"never stopped shipping"* supplies IC credibility;
   the metaphor survives while the AI era is foregrounded. Stored **once** in `_data` and
   consumed verbatim by the hero, the About lead, the meta/OG description, and social bios
   (**AC-001**). **Trade-off accepted, and it is a real one:** this is the longest candidate and
   **the hero may need two lines** → recorded as a **Phase 4 layout input** (Story 4.8).
   *v0.4 verification:* its target element is **`index.html:72` `.hero-description`** — *not*
   `.hero-subtitle` (`:71`, "Code Alchemist", gold cursive). The line-number reading is right;
   the element name in the decision text is loose, and an executor who put 24 words of prose
   into `.hero-subtitle` would render them at **2rem cursive gold**. Contrast is **not** a
   blocker here — `$pastel-blue #B9C9E6` on the hero gradient measures **8.12–9.86:1**
   (recomputed) — so this is **purely** a wrap/layout question, exactly as the owner framed it.
2. **Canonical job title — "Director of Engineering"** [OWNER 2]. `_data/jobs.yaml:1` updates
   to match `_data/character_build.yml:5` (which already reads *"Director of Engineering"* —
   verified). Closes **D10** / **AC-002**. Story 0.2.
3. **Retro post-type labels — YES, lightweight** [OWNER 3]. 2019-12-12 (SFTP), 2020-01-13
   (Clojure), 2023-02-10 (use cases), 2023-02-16 (domains) → `type: scroll`; 2026-02-18 (LLM
   routing) → `type: transmutation` + `assay` (**AC-021**); 2019-03-06 ("My notebook !") →
   `type: log` (candidate — it is the launch/meta post). *Makes the voice split deliberate
   rather than accidental, at near-zero cost.* Story 3.3.
4. **PT-BR — DROP** [OWNER 4]. Remove `og:locale:alternate pt_BR` from
   `_includes/head/meta.html:18`; no PT-BR content is planned. Closes **D11** / **AC-056**.
5. **Analytics — Plausible** [OWNER 5]. Replaces the dead UA property `UA-135917274-1`;
   cookie-free, no consent banner, ~1 KB — consistent with the text-first substance layer.
   **Sequencing preserved:** UA *removal* (**AC-009** / D8) ships in **Phase 1 independently**
   and is **not blocked** on Plausible being wired.
6. **Contact form — real Formspree form-hash ID** [OWNER 6]. Replace the endpoint at
   `letter.html:98` (it currently posts to `https://formspree.io/f/hi@hlavezzo.me` — an email
   where a hash belongs). Keeps the themed "Magical Correspondence" UX. Closes **D9**.
   **⚠ HARD DEPENDENCY — the one thing in Phases 0–4 an executor cannot self-serve:** the form
   ID is a **credential only the owner can produce**. Story 1.1 **cannot complete without it**;
   it is not a research task and no amount of executor effort substitutes. Sequence the rest of
   Story 1.1 around it and **block only this fix**, with the `mailto:hi@hlavezzo.me` fallback
   as the interim.
7. **Opal island (Phase 5) — DECIDE AT THE PHASE 5 GATE, not now** [OWNER 7]. Phase 5 stays
   **optional and owner-gated**. It is hard-gated behind Phase 1 (**EC-1**) and sequenced after
   Phase 4 regardless; **Story 5.0 already requires a committed go/no-go record predating any
   `_opal/` commit (AC-053**, which at v0.4 requires a **`go`** verdict**)**. *Deciding now buys
   nothing and forecloses information the owner will have later.*
8. **The reframe — IT LANDS AS *INSIGHT*, NOT A SUBSTITUTE** ⭐ [OWNER 8]. FORGE declined to
   recommend and routed this to the owner as the one genuinely un-analysable question. The
   answer — *"It's insight — that's genuinely satisfying"* — **is the highest-signal input in
   the set, and it moves the plan's centre of gravity.** Four consequences, all folded in:
   - **FORGE RISK-5 is CLOSED** — *"Owner rejects Ruling 2 as a substitute good and reads the
     verdict as a soft 'no'."* It was **live and unmitigated**; the owner has **affirmatively
     accepted Ruling 2 on its own terms** [OWNER 8]. See Risks.
   - **Ruling 2 is promoted from groundwork to HEADLINE DELIVERABLE.** The build-time
     transmutation work — **AC-013** server-rendered categories, **AC-023** kramdown/generator
     TOC (which also kills D15's no-JS empty `Contents`), CSS smooth-scroll, and the
     `prefers-color-scheme` foundation (**AC-025**) — **is what the owner actually wants.**
     Framed and sequenced as such: Stories **2.5 / 2.6 / 2.7 / 3.5** are the marquee, not the
     plumbing.
   - **Phase 5's justification narrows to joy alone — correctly.** With the reframe satisfying
     the craft desire, the island **no longer carries C7** (owner joy / craft-identity).
     Combined with decision 7, the realistic disposition is **"probably not, and that is a fine
     outcome."** **FORGE's RC-8 holds:** the post is **writable from data already in hand** —
     the **96.6 / 2.9 / 0.49** decomposition is a complete, publishable insight that requires
     **building nothing**.
   - **The framing discipline is UNCHANGED and non-negotiable.** *"Insight"* is about **craft**
     satisfaction — Ruby transmutes the site at build time — and is **not** licence to
     reintroduce the withdrawn performance justification. **DECISION-C stands: correctness +
     a11y + SEO, never speed.** The heaviest page ships **4,778 B gz**. The critic verified
     **zero** perf residue across 17 grep hits in v0.2; **v0.4 does not regress it.**

---

## Phased Roadmap & Dependencies (Surface E)

| Phase | Ships (independently) | Depends on | Acceptance |
|---|---|---|---|
| **0 — Identity Spine** | Identity line, one job title, post-type/assay convention, eras About | — | AC-001..003 |
| **1 — Trust & Defect** | Clean build, no broken assets, SEO wiring, full-text feed, UA removed, sitemap/canonical, **4 previously un-gated defects** | 0 | AC-004..011, **054..057** |
| **2 — Content Architecture** *(**+ Ruling 2 — HEADLINE DELIVERABLE** [OWNER 8])* | Home surfacing, server-rendered categories, /now, /uses, start-here, themed 404, **server-rendered TOC**, **sitewide motion guards**, build-time nav state | 0, 1 | AC-012..016, 023, 024 |
| **3 — Journal & AI-in-Frame** *(+ Ruling 2 tail)* | Type badges, assay labels, reader contract, disclaimer, 2026 re-type, Alchemist's Log, **no-JS dark mode** | 0, 2 | AC-017..022, 025 |
| **4 — Layout, UI/UX & A11y** | **4a:** ink/ornament split + usage binding, hairlines, rarity label, finite circle + `--motionOK`, palette test in CI. **4b:** meter semantics, pips + no-JS rarity, ornament hiding, nav gloss, fluid type/reflow, focus/targets/spacing, axe ratchet, `/accessibility` | 0, 1, 2, 3 | AC-026..040, **047..049, 058** |
| **5 — The Transmutation Circle** | **OPTIONAL · OWNER-GATED — and at v0.4 the realistic disposition is "probably not, and that is a fine outcome"** [OWNER 7/8]. Value-floor record, `opal-browser` probe, widget, precompile + drift gate, **the Transmutation post** | **1 (HARD — EC-1)**; **4 (by ruling)**; recommended after 2 | AC-041..046, **050..053**, **059** |

**Dependency spine.** P0 unblocks all → P1 stabilizes before P2 expands → P3 needs P0's
vocabulary + P2's taxonomy → **P4 is craft on a stable base, per R2** → **P5 is indulgence,
last, optional.**

**v0.4 [OWNER 8] — the centre of gravity moved.** With the reframe accepted as **insight**,
**Phase 2 is the headline** and **Phase 5's justification narrows to joy alone** — the island no
longer carries **C7** (owner joy / craft-identity), because Ruling 2 now does. Combined with the
owner's decision to **decide at the gate** [OWNER 7], the honest disposition is **"probably not,
and that is a fine outcome."** **RC-8 is the fallback and it is already satisfied:** the post is
**writable from data in hand** — 96.6 / 2.9 / 0.49 needs **nothing built**.

**Phase 5's dependency, precisely** (see `[DECISION-B]`):
- **Hard:** Phase 1 closed — **EC-1**, *"the whole verdict; everything else is engineering."*
- **Recommended:** after Phase 2. **By ruling:** after **Phase 4** — Opal *"is strictly less
  important than the a11y work it could jeopardize."*
- **Blast radius:** disjoint from Phases 2/3 — why Phase 5 is safe to **insert late and cancel
  at zero cost**. **A risk-containment fact, not a scheduling licence:** attention does not
  parallelize.
- **Numbering:** FORGE's "Phase 4 — The Transmutation Circle" is **this plan's Phase 5**.
  **`/accessibility` (AC-040) is Phase 4 only** — declining Phase 5 cannot drop it [C-8].

---

## Handoff (agent-executable)

```yaml
plan: rebrand
version: 0.4.0
site: hlavezzo.me
tier: {computed: full, applied: full, override: RETIRED_AT_V0.3, note: "critic gate closed; the v0.1/v0.2 override reason (critic unavailable) is falsified"}
critic:
  author: "ramza-author:job-ac6f42e7:v0.2"
  checker: "ramza-critic:opus-4.8:rebrand-plan-v0.2-critique"
  pass_1: {verdict: APPROVE-WITH-FIXES, findings: 19, blocking: 7, cleared: [C-1, C-2, C-3, C-4, C-5, C-8, C-9]}
  pass_2: {verdict: APPROVE-WITH-FIXES, scope: criteria_layer, blocking: [R-1, C-1_residual, C-16_residual], all_cleared_at: v0.4, note: "critic states a third full critique is NOT required -- a targeted re-check of the three ACs only"}
complexity: {total: 11, verdict: human_loop}
confidence: {total: 78.0, verdict: VALIDATE}
selected_hypothesis: {id: D, label: "spine-then-phased-surfaces", explore_score: 87.5}
a11y_hypothesis: {id: E5prime, label: "fence-the-gimmick (E2 + ratchet)", explore_score: 87.0, supersedes: {id: E5, score: 87.5, retired_because: "E5 superset-of E2 was FALSE — the obsidian module mutates E2's declared-background set"}}
doctrine: "persona-as-moat; substance-in-skin; blog-as-alchemist-journal; AI-into-the-frame; fence-the-gimmick"
binding_inputs:
  forge_opal_verdict: {version: 0.2.0, confidence: 90, verdict: BOUNDED-ADOPT, binding: true}
  opal_measurement:
    version: "0.3 (corrected)"
    site_js_gz_sum_8_files: 11028      # each gzipped separately, as served
    site_js_gz_heaviest_page: 4778     # home = main.js + sigil-navigation.js + home.js
    sitewide_baseline_gz: 2289         # main.js + sigil-navigation.js
    island_gz: 143453
    ratio_vs_heaviest_page: 30.0
    ratio_vs_8_file_sum: 13.0
    RETRACTED: {site_js_gz: 7862, ratios: [17.8, 18.25], reason: "concatenated gzip of files the site never bundles; method drifted with temp filename; ratios were one number computed twice, once in mixed KiB/KB units"}
decisions:
  - {id: DECISION-A, ruling: "layer split: A11Y operative for the decorative layer, RES-SITE s4 for the substance layer; s4's recommendation moot-not-overruled; does NOT license reading-path byte growth"}
  - {id: DECISION-B, ruling: "Phase 5 after Phase 4; disjoint blast radius is risk-containment, not a scheduling licence; attention does not parallelize"}
  - {id: DECISION-C, ruling: "Ruling 2 = correctness + a11y + SEO ONLY; performance claim WITHDRAWN; heaviest page ships 4,778 B gz", reaffirmed_at: v0.4, note: "OWNER 8's 'insight' answer does NOT reopen this -- craft satisfaction, not speed"}
phases:
  - {id: 0, stories: [0.1, 0.2, 0.3, 0.4], acceptance: [AC-001, AC-002, AC-003], depends_on: []}
  - {id: 1, stories: [1.1, 1.2, 1.3, 1.4], acceptance: [AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-054, AC-055, AC-056, AC-057], depends_on: [0], defects: [D1, D2, D3, D4, D5, D6, D8, D9, D11, D12]}
  - {id: 2, stories: [2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7], acceptance: [AC-012, AC-013, AC-014, AC-015, AC-016, AC-023, AC-024], depends_on: [0, 1], defects: [D5, D7, D15, D16]}
  - {id: 3, stories: [3.1, 3.2, 3.3, 3.4, 3.5], acceptance: [AC-017, AC-018, AC-019, AC-020, AC-021, AC-022, AC-025], depends_on: [0, 2], defects: [D13, D19]}
  - id: 4
    stories: [4.1, 4.2, 4.3, 4.4a, 4.4b, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10a, 4.10b, 4.11]
    acceptance: [AC-026, AC-027, AC-028, AC-029, AC-030, AC-031, AC-032, AC-033, AC-034, AC-035, AC-036, AC-037, AC-038, AC-039, AC-040, AC-047, AC-048, AC-049, AC-058]
    depends_on: [0, 1, 2, 3]
    defects: [D16, D17, D20, D21, D22]
    slices:
      "4a": {stories: [4.1, 4.2, 4.4a, 4.5, 4.10a], acceptance: [AC-026, AC-027, AC-030, AC-031, AC-047, AC-048, AC-049], note: "measured contrast failures + BOTH live WCAG failures (2.2.2 and 1.4.1); palette test ships here so 4a does not self-certify"}
      "4b": {stories: [4.3, 4.4b, 4.6, 4.7, 4.8, 4.9, 4.10b, 4.11], note: "semantics & craft; AC-040 ships LAST"}
  - id: 5
    optional: true
    owner_gated: true
    stories: [5.0, 5.1, 5.2, 5.3, 5.4]
    acceptance: [AC-041, AC-042, AC-043, AC-044, AC-045, AC-046, AC-050, AC-051, AC-052, AC-053, AC-059]
    realistic_disposition: "probably not, and that is a fine outcome"   # OWNER 7 + OWNER 8
    depends_on: [1]           # HARD -- EC-1
    sequence_after: [4]       # by FORGE ruling
    recommended_after: [2]
    defects: [D18]
    acceptance_constraints: [EC-1, EC-2, EC-3, EC-4, EC-5, EC-6, EC-7a, EC-7b, EC-7c, EC-7d, EC-9, EC-10, EC-11, EC-12, EC-13]
    discharged_constraints:
      - {id: EC-8, conditional_on: RC-2, recheck: "any major Ruby/Opal upgrade", verified_at: "opal 1.8.3, 2026-07-16", note: "point-in-time; Phase 5 is sequenced last, which makes RC-2 live"}
    reversal_conditions: [RC-1, RC-2, RC-3, RC-5, RC-6, RC-7, RC-8]
    budget: {ceiling_gz_kib: 150, scope: PAGE_TOTAL_not_artifact, measured_artifact_gz_b: 143453, net_headroom_b: {laboratory_host: 6238, bare_page: 7858}, raise: FORBIDDEN}
    mandatory_flags: ["--no-source-map"]
    recommended_flags: ["--no-method-missing"]
    deliverable: "the POST, not the widget"
reversal_conditions_detail:
  RC-1: "if a future Opal brings runtime+app within ~2x of hand-written JS, re-open H1"
  RC-2: "re-check Opal/Ruby health on any major upgrade (EC-8's discharge is conditional on this)"
  RC-3: "if the owner drops the alchemist metaphor, the island loses its content rationale -> H2/H4 win outright"
  RC-5: "if Phase 1 has not closed in a period the owner considers reasonable, EC-1 hardens from gate to NO"
  RC-6: "if the boundary is breached once (Opal on / or in post.html), the gate has failed -> revert to Ruling 2"
  RC-7: "if opal-browser or any second require pushes past EC-7b, the island ships without it or not at all"
  RC-8: "if the widget cannot clear EC-7d's value floor, do not build it -- write the post from the probe data in hand"
human_decisions:
  open: []                    # 8/8 CLOSED 2026-07-16 -- nothing blocks Phases 0-4 on owner input
  resolved:
    - {id: opal_byte_ceiling, ruling: "keep 150 KiB gz; do not raise", by: "FORGE v0.2 s2.4"}
    - {id: identity_line_wording, by: OWNER, at: "2026-07-16", ruling: "An engineering lead who never stopped shipping -- a Code Alchemist transmuting chaos into scalable systems, now conducting AI familiars in the open.", accepted_tradeoff: "longest candidate; hero may need two lines", layout_input: {phase: 4, story: 4.8, element: ".hero-description at index.html:72", not_element: ".hero-subtitle -- 2rem gold cursive wordmark", contrast_checked: "8.12-9.86:1 pastel-blue on hero gradient -- NOT a blocker"}}
    - {id: canonical_title, by: OWNER, at: "2026-07-16", ruling: "Director of Engineering", action: "_data/jobs.yaml:1 updates to match _data/character_build.yml:5 (already correct)", closes: [D10, AC-002]}
    - {id: retro_post_type_labels, by: OWNER, at: "2026-07-16", ruling: "yes, lightweight", mapping: {scroll: ["2019-12-12 sftp", "2020-01-13 clojure", "2023-02-10 use-cases", "2023-02-16 domains"], transmutation_plus_assay: ["2026-02-18 llm-routing"], log_candidate: ["2019-03-06 my-notebook"]}, closes: [AC-021]}
    - {id: pt_br_locale, by: OWNER, at: "2026-07-16", ruling: "DROP og:locale:alternate pt_BR at _includes/head/meta.html:18", closes: [D11, AC-056]}
    - {id: analytics_vendor, by: OWNER, at: "2026-07-16", ruling: "Plausible", note: "UA removal (AC-009/D8) ships in Phase 1 INDEPENDENTLY -- not blocked on wiring Plausible"}
    - {id: contact_form_endpoint, by: OWNER, at: "2026-07-16", ruling: "real Formspree form-hash ID at letter.html:98", closes: [D9], BLOCKING_DEPENDENCY: "the form ID is a credential ONLY THE OWNER can supply; Story 1.1 cannot complete D9 without it; ship the rest of 1.1 regardless; mailto fallback interim"}
    - {id: ec7d_value_floor_and_phase5_gate, by: OWNER, at: "2026-07-16", ruling: "DECIDE AT THE PHASE 5 GATE, not now", note: "Phase 5 stays optional + owner-gated; AC-053's committed go verdict governs; deciding now buys nothing and forecloses later information"}
    - {id: ruling2_bait_and_switch_framing, by: OWNER, at: "2026-07-16", ruling: "IT LANDS AS INSIGHT, NOT A SUBSTITUTE", quote: "It's insight -- that's genuinely satisfying.", consequences: ["FORGE RISK-5 CLOSED -- owner affirmatively accepts Ruling 2 on its own terms", "Ruling 2 PROMOTED from groundwork to HEADLINE DELIVERABLE (AC-013, AC-023, CSS smooth-scroll, prefers-color-scheme)", "Phase 5's justification narrows to JOY ALONE -- island no longer carries C7; RC-8 holds (post writable from data in hand)", "FRAMING DISCIPLINE UNCHANGED: DECISION-C stands -- correctness + a11y + SEO, NEVER speed; do not regress the zero-perf-residue result"]}
deferred: [analytics_impl, webmentions_posse, pt_br_content, per_tag_feeds, email_mirror, character_sheet_dynamic_numbers, aaa_conformance, paid_audits, vpat, apca, obsidian_dark_surface]
executor_hint: "micro=economy/Haiku single-file mechanical; feature/mid=Sonnet template logic; frontier for persona copy (About eras, identity line, /accessibility, the Transmutation post)"
traps:
  - "AC-024 does NOT discharge WCAG 2.2.2 -- that is AC-031. prefers-reduced-motion is not a 2.2.2 mechanism."
  - "Do NOT sell Ruling 2 (Phase 2 JS reduction) as a performance win. The heaviest page ships 4,778 B gz."
  - "Do NOT publish 7,862 B / 7.9 KB / 17.8x / 18.25x. Retracted -- see opal_measurement.RETRACTED."
  - "opal -c appends a source map by default -- --no-source-map or the payload 3.5x's silently."
  - "The require list is the budget (~4,212 B each), not the feature count (~15.6 B gz/line). Net headroom is ~6,238 B, not 10,147."
  - "home.js is NOT an Opal migration target. Ever. (EC-2/EC-4)"
  - "AC-040 (/accessibility) is Phase 4 ONLY and ships LAST -- a claim the site doesn't meet is worse than no page."
  - "D16 is a FIVE-file defect (home, about, letter, notebook, laboratory), not home.js alone."
  - "--dnd-ink is 10.43:1 on cream, NOT 12.7:1 (that is --ink-color #3a2921). Figures from the research's PROSE are unreliable; figures from its TABLES reproduce exactly."
  - "EC-13 is bound by AC-059, NOT AC-046. AC-046 = the value floor (is it worth it?); AC-059 = the measurement (bytes + 96.6/2.9/0.49 + per-file-sum method + none of the retracted figures). v0.3 collapsed the two and LOST EC-13 entirely."
  - "The palette manifest is TWO-AXIS: role {ornament,logotype,content} + obligation {ink,exempt}, content <-> ink. A one-axis read reopens the logotype hatch that took 4a green on an illegible site."
  - "AC-057 tests SET INCLUSION against _data/skills.yml -- NOT a literal keyword string, and NOT character_build.yml (which has zero language names). Reordering the same four words defeated the v0.3 check."
  - "'One page-specific file per page' is FALSE -- About loads two (exp-bar.js + about.js = 4,113 B). Measure page totals; never infer them."
  - "The reframe landing as 'insight' [OWNER 8] licenses CRAFT satisfaction ONLY. It is NOT permission to revive the withdrawn performance claim. DECISION-C stands."
  - "The Formspree form ID is a CREDENTIAL ONLY THE OWNER CAN SUPPLY. D9 cannot be executor-closed. Do not let it block the rest of Story 1.1."
downstream: "ESL propose/specify hop; the SECOND critic pass is DONE (APPROVE-WITH-FIXES; 3 blocking, all cleared at v0.4) and the critic states a third full critique is NOT required -- a TARGETED RE-CHECK of AC-026/047/048/057/059 only; ATLAS owes one probe: opal-browser gz cost (RISK-6)"
```

---

## Provenance & Gate Log

- **RS:** `ramza-rightsize --files-est 32 --new-dep --public-api --migration --novel --stakes med
  --plan rebrand --state .claude/rebrand/rebrand.state.json` → **full (score 7)**, applied
  **full**, **recorded** (fixes C-17: v0.2 ran the tool without `--state`, so the claim outran
  the audit trail). **Override RETIRED** (C-18) — computed and applied now agree.
- **Critic:** `ramza-gate critic --author ramza-author:job-ac6f42e7:v0.2 --checker
  ramza-critic:opus-4.8:rebrand-plan-v0.2-critique` → **OK, recorded**. Self-approval verified to
  **DENY** (`maker!=checker violated`). **Full tier's binding prerequisite is satisfied for the
  first time.**
- **Scope:** intent STRATEGIC; complexity **11/12 → human_loop**.
- **Pattern:** CRYSTALIUM recall = 0 records → graceful skip *(v0.3; the MCP was absent)*.
  **v0.4: the MCP responds, and the recall found a hazard.** `crystalium.recall` initially
  returned 0 — `explain=true` showed the canonical project key is **`rynaro-github-io`**, not
  `Rynaro.github.io`, and my scope had filtered the only candidate out. Re-queried: the store's
  **one** crystal is the **v0.2 record, and it propagates the retracted figures** — *"17.8×
  measured … the site's entire 7,862 B gz of JS"* — plus the stale self-score **84.25** (never
  independently confirmed; the critic scored v0.2 ≈75) and the **retired `lite` override**.
  **Any future recall would have re-injected all three errors into a downstream artifact** —
  including the exact numbers **AC-059 greps for to keep out of the post.** Corrected
  **bi-temporally** (`crystalium.update`, write-new/never-delete, P0-5): `fa058ecc…` →
  `e98e231a…`, the error's provenance preserved because *the error's history is the post*.
  v0.4's outcome committed as `677ca110…`. *`mcp__tonberry__*` is **not exposed** to this
  agent; the **orchestrator owns the ESL hop** — not called.
- **Pattern (inherited):** Patterns from research exemplars +
  three peer artifacts (FORGE v0.2 @ 90; the computed palette audit; the independent critique) +
  XAG 101/102/112, Lynn Fisher, Argyle/Open Props, Appleton, Soueidan.
- **Explore:** strategy D **87.5** carried. A11y: **E5′ 87.0 elite** selected; **E5 87.5
  RETIRED** (its dominance claim was false — C-7); E2 86.5, E3 70.5, E1 59.5, E4 59.0 rejected.
  Opal **not re-litigated** — FORGE binding at 90.
- **Construct:** **33 stories across 6 phases**; **59 EARS criteria** (**v0.4: +1 new — AC-059;
  8 rewritten**); **22-item defect backlog** (+3 from the critique; **D6 corrected 5 → 6**);
  **decisions 9/9 resolved — 8 by the owner on 2026-07-16, 1 by FORGE.** *Every AC heading now
  carries its real phase (0→3, 1→12, 2→7, 3→7, 4a→7, 4b→12, 5→11 = **59**); the `Phase ?`
  placeholder that stood on all 58 v0.3 headings is **gone**.*
- **Test / Refine:** critic **pass 1** — **APPROVE-WITH-FIXES**, 19 findings, 7 blocking →
  `ramza-gate refine` **T→R (cycle 1/3)**; all 7 cleared; `ramza-lint --tier full` (Rejected
  Alternatives + Risks now **required**, not merely present); `ramza-ears-lint` 58/58.
  **Critic pass 2 (criteria layer only)** — **APPROVE-WITH-FIXES**: **3 blocking** (R-1
  regression, C-1 residual, C-16 residual) + 8 non-blocking residuals. **v0.4 clears all 3 and
  all 8**, at `ramza-score --rubric refine --cycle 3` → **4.4 pass** (clarity 5, completeness 4,
  actionability 4, efficiency 5, testability 4). **`--override` NOT re-issued** — the tier is
  computed `full` and the override stays retired [C-18].
- **Assemble (v0.4):** confidence **80.0 → VALIDATE** (v0.3: 78.0 — *two independent readers,
  different dimension vectors, identical total*). **+2.0, verdict unchanged.** Scope re-declared
  (**25 globs, unchanged** — AC-059 targets a post, already inside `_posts/*`). Criteria
  **re-frozen by hash-chained amendment**:
  **`3b332eef…` → `62d70182…` → `393f1e59…`** (two amendments, both reasoned), `--verify` green. *The gate worked on me:
  `ramza-freeze --verify` **DENIED** with `DRIFT: criteria hash mismatch … 0 recorded
  amendment(s)` before the amendment was filed — tamper evidence functioning as designed.*
  `ramza-verify-emit` green.
- **One defect self-caught after the first freeze, and re-amended rather than quietly fixed
  [second amendment]:** **AC-059's VERIFY did not verify its own THEN.** The THEN required the
  **artifact's** re-measured gz size (143,453); the VERIFY demanded bytes *"equal to AC-042's
  CI-measured **page sum**"* — a **different number** (the page also loads 3,909 B of other
  scripts). An executor stating the honest artifact figure would have **failed** the AC.
  **This is the exact defect class the critic named at AC-051 (VERIFY > THEN), reproduced by me
  while fixing R-1** — the same pattern as R-1 itself, one revision later, caught this time only
  because I re-read the criterion adversarially instead of trusting that a fix I had just
  written was correct. Restated to the artifact's **own component** of AC-042's CI measurement,
  with the tier percentages required to **sum to 100**. *Recorded, not hidden: the freeze chain
  shows both amendments.*
- **Verification performed for v0.4** (executed, not asserted — R-1 is what asserting costs):
  the **C-1 attack was re-executed against the v0.4 text** — classifying every token `logotype`
  now **fails AC-048** (a `logotype`-role token is referenced outside the wordmark selector set)
  **and fails AC-026** (the `content` set is empty), so **4a cannot go green on an illegible
  site**; the inverse attack confirms **AC-047 no longer darkens the wordmark**.
  **AC-057's set-inclusion was run before it was written** — against `_data/skills.yml`
  (L = Ruby, Elixir, JavaScript, Clojure) and against the critic's three attacks: it **fails**
  today's real keywords catching exactly `[golang, crystal, python, rust]`, **fails all three
  attacks** (reorder / add a space / drop a word — v0.3 **passed** all three), and **passes** a
  corrected keyword set. *My first draft of it also failed a **correct** implementation by
  flagging `rails` from "ruby on rails" — a framework, not a language — the AC-041 defect class,
  caught by running it.* Confirmed `character_build.yml` contains **zero** language names (the
  file v0.3's AC-057 named) and that its `job:` **already reads "Director of Engineering"**
  [OWNER 2]. Confirmed **D6 = 6** posts. Confirmed **About loads two page files**
  (`exp-bar.js` + `about.js`) and that **Laboratory loads one** — so C-12's headroom arithmetic
  **survives, by luck rather than by rule**. Independently re-gzipped all 8 JS files: home
  **4,771** / about **4,108** / baseline **2,284** / headroom **6,246** — reproducing the record
  to within **~8 B**, the residual being the **known `gzip` filename/mtime artifact**; **home is
  still heaviest and 30.0× stands**, so the figures were **confirmed, not corrected**.
  Recomputed the identity line's landing zone: `$pastel-blue` on the hero gradient =
  **8.12–9.86:1** → **contrast is not a blocker; it is purely a wrap question**. Recomputed
  `--ff-gold` on the hero gradient = **6.38–7.75:1** — *the D17 figure of 1.96 is gold **on
  cream**, which is why the obligation is per **(token, background) pair** and why AC-047's
  logotype exception is narrow rather than a blanket pass.* Verified **AC bodies in this plan
  are byte-identical to the frozen criteria file** (59/59, zero normative drift) [C-4].
- **Verification inherited from v0.3** (not re-run): re-gzipped all 8 JS files
  (sum 11,028; `cat|gzip` 7,852 — confirming the 7,862 drift); recomputed the home page total
  (4,778) and both ratios (30.02, 13.00); recomputed `--dnd-ink` (10.43 cream, 6.01–8.54
  pastels) and the obsidian failure set (1.26–3.59); confirmed `--rarity-uncommon` has exactly
  one hit; confirmed `grep "height:"` matches `min-height:` and `grep -rL` is the complement of
  `-rl`; swept `infinite` across `_sass/` (11) and `assets/js/` (**5 injectors — one more than
  the critic reported**).
- **Artifacts persisted to `.claude/rebrand/`** (C-4): `rebrand-plan.md`, `rebrand.criteria.md`,
  `rebrand.state.json`, `rebrand-v0.2.state.json` (history), `ramza-calibration.jsonl`.

**Open at v0.4 (named, not hidden):** `constraint_compliance` **75** has **no independent
reading** — v0.4's three fixes assert bindings, and that is the exact class of claim that was
false in v0.2 and again in v0.3 (R-1). The prescribed close is a **targeted re-check of
AC-026 / AC-047 / AC-048 / AC-057 / AC-059 only** — the critic stated a third full critique is
**not** required and another rewrite emphatically is not. **One executor dependency remains and
it is not resolvable by any executor:** the **Formspree form ID** [OWNER 6].

*RAMZA — planning artifact. Read-only. **No repository file was modified** — every `_sass/`,
`_data/`, `assets/js/`, and `*.html` path above was **read and measured, never written.** The
plan, criteria, state, and calibration log under `.claude/rebrand/` are the only writes.*
