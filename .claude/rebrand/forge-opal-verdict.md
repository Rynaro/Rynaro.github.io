---
eidolon: forge
kind: reasoning-report
version: 0.2.0
created_at: 2026-07-16
revised_at: 2026-07-16
methodology: FORGE
methodology_version: "1.10.0"
decision_type: TRADE-OFF (with embedded FEASIBILITY sub-question)
depth: standard (score 7) → 2 passes (v0.1) + 1 measurement-triggered REFORGE (v0.2)
plan: rebrand
site: hlavezzo.me
hypotheses_count: 5
passes_used: 3
requires_checker: false
performative: PROPOSE
assertion_grade: self-attested
supersedes: v0.1.0 (preserved in full, from "v0.1 REASONING TRAIL" onward)
confidence: 90
---

# FORGE Verdict — Opal (Ruby → JavaScript) as the JS layer of hlavezzo.me
## v0.2 — measurement-anchored revision

**[VERDICT] BOUNDED-ADOPT — unchanged in structure, refined in shape.** Sanction Opal as **exactly
one lazy-loaded, off-reading-path island whose product is the POST, not the widget** — never as
plumbing. Adopt the build-time-transmutation reframe for the plumbing, **now on correctness/a11y
grounds rather than performance grounds** (see the honesty correction, §2.3). Sequencing: **after
Phase 1 closes, ideally after Phase 2.** **Confidence: 90%** (was 80%).

**The verdict structure held under measurement.** All three gaps resolved in the direction that
confirms Rulings 1 and 2 and passes Ruling 3's gate. Two refinements, one self-correction, one
reversal of my own EC-7 instinct, and one correction to the coordinator's read.

---

## 0. CHANGELOG v0.1 → v0.2 — what RAMZA needs

| Item | v0.1 | v0.2 | Why |
|---|---|---|---|
| **Confidence** | 80% | **90%** | [GAP-1/2/3] closed with measured numbers; structure survived the test |
| **Ruling 1** (reject as plumbing) | Structural argument only | **CONFIRMED empirically — 18.25x.** RC-1 tested, did **not** fire | Measurement |
| **Ruling 2** (build-time reframe) | Justified partly on performance | **Rationale CORRECTED: correctness + a11y + SEO, NOT bytes.** The site's JS was already 7,862 B gz — there was never a perf problem to solve | §2.3 self-correction |
| **Ruling 3** (sanction island) | Gated on unmeasured budget | **Gate PASSES.** Island viable at 143,453 B gz | Measurement |
| **EC-1** sequencing | Hard gate | **UNCHANGED — now the single load-bearing constraint in the verdict** | RISK-1 untouched by measurement |
| **EC-2** scope | "exactly one widget" | **CHANGED — adds a value floor; the product is the POST, not widget complexity.** A token spinner is now explicitly forbidden | §2.2 asymmetry |
| **EC-3** lazy/defer | — | UNCHANGED | — |
| **EC-4** no plumbing | Structural | UNCHANGED — **now empirically anchored** | Measurement |
| **EC-5** noscript | — | **STRENGTHENED** — a 143 KB payload failing to load is now a measured scenario, not hypothetical | Measurement |
| **EC-6** build path | precompile + commit | **CHANGED — `--no-source-map` is now MANDATORY** (source map was ~3.5x); `--no-method-missing` recommended (free 4,028 B gz) | Coordinator's methodology correction |
| **EC-7** budget | Single 150 KB ceiling | **RESTRUCTURED into 7a/7b/7c/7d. Ceiling NOT raised — I reverse the coordinator's premise here (§2.4)** | Require-decomposition |
| **EC-8** Opal health | Hard gate | **DISCHARGED** — opal 1.8.3 healthy. Demoted to a re-check condition | [GAP-2] closed |
| **EC-9** a11y | prefers-reduced-motion | **CHANGED — inherits WCAG 2.2.2: FINITE animation ≤5s, or a visible pause control. `prefers-reduced-motion` does NOT discharge 2.2.2** | research-ui-a11y §3.2 |
| **EC-10** drift | — | **STRENGTHENED** — must now pin the exact flag set | EC-6 change |
| **EC-11** ratchet | — | UNCHANGED | — |
| **EC-12** Ruling 2 independence | — | UNCHANGED, rationale corrected | §2.3 |
| **EC-13** | — | **NEW — re-measure the real artifact before commit.** 143,453 is a proxy | Prudence |
| **RISK-2** (perf irony) | Headline risk | **DOWNGRADED to managed** — measurement + disclosure largely defuses it (§2.5) | (c) |
| **RISK-1** (attention) | Dominant | **STILL DOMINANT — and now unambiguously so** (§2.6) | Measurement touched none of it |

---

## 1. MEASUREMENT — the closed gaps

All figures gzipped; KiB = /1024. Source: coordinator's bounded probe, opal 1.8.3, sandboxed
`GEM_HOME`, project Ruby. **Reliability: H — measured, not modeled.**

| Artifact | Raw B | **Gz B** | KiB gz |
|---|---|---|---|
| Current site JS (`assets/js/*.js`, 8 files) | 33,596 | **7,862** | 7.68 |
| Opal hello-world (runtime+corelib) | 753,957 | **138,537** | 135.29 |
| …with `--no-method-missing` | 743,704 | **134,509** | 131.36 |
| `--no-opal` (runtime excluded) | 315 | **183** | 0.18 |
| + `require 'native'` (minimal DOM) | 778,922 | **142,749** | 139.40 |
| **Realistic widget (~45 lines Ruby)** | 782,196 | **143,453** | **140.09** |

**Two methodological corrections belong in the provenance:**

1. **The coordinator's own** — the first probe (489 KB gz) included an appended source map and was
   unfair to Opal by ~3.5x. Caught and corrected with `--no-source-map`. **This correction cuts in
   Opal's favour and is preserved here precisely because it does.** A verdict whose evidence base
   only ever gets corrected against the thing it is skeptical of is not a verdict, it is a prior.
2. **Mine, below (§2.1)** — the coordinator's "fixed runtime + free app code" binary omits a middle
   tier that is the actual budget risk, and that omission propagates into a wrong recommendation on (d).

### 1.1 [GAP-2] CLOSED — Opal is healthy
opal 1.8.3 installs and compiles under the project's Ruby. **RC-2 does not fire. EC-8 discharged.**

### 1.2 [GAP-3] CLOSED — and it corrects me
The entire site ships **7,862 B gz** of JavaScript. My line-count baseline was sound; the byte
reality is that **this site never had a JavaScript performance problem.** This is a *correction to my
own v0.1 framing* — see §2.3.

*(Precision note: 7,862 B covers `assets/js/*.js` only. The ~150-line inline block in
`_layouts/post.html:213-363` is additional and gzips with the page. Immaterial to every conclusion.)*

### 1.3 [GAP-1] CLOSED — RC-1 tested and did not fire

> **RC-1 (v0.1):** *"If runtime+corelib+app fits within the current total JS byte budget, H1 becomes
> live and Ruling 1 is void."*

**143,453 vs 7,862 = 18.25x.** Does not fit. **RC-1 does not fire. Ruling 1 survives** — now
empirically anchored rather than structural-only. The margin is not close (18x, not 1.2x), so the
conclusion is insensitive to measurement error.

**The runtime alone (138,537) is 17.62x the entire site's JavaScript.** That is the headline number.

---

## 2. THE ANALYSIS THE MEASUREMENT ENABLES

### 2.1 The decomposition the coordinator's framing misses

The coordinator reports the 45-line widget's marginal cost as **4,916 B gz** (143,453 − 138,537) and
concludes "app code is nearly free." **That figure conflates two different things**, and the
conflation matters. Decomposing against the probe's own `require 'native'` datapoint:

| Tier | Δ gz B | Share of 143,453 | Scales with |
|---|---|---|---|
| **1. Runtime + corelib** | 138,537 | **96.6%** | nothing — **fixed floor, pay once** |
| **2. stdlib `require`s** (`native`) | **+4,212** | **2.9%** | **ambition — ~4.2 KB *per require*** |
| **3. App code (45 Ruby lines)** | **+704** | **0.49%** | lines — **15.6 B gz/line** |
| **Total** | 143,453 | 100% | |

*(138,537 + 4,212 + 704 = 143,453 ✓)*

**So 45 lines of Ruby cost 704 bytes gzipped, not 4,916.** The coordinator attributed the `native`
require's cost to the app code, inflating the per-line rate by **7x** (109 B/line → **15.6 B/line**).

**Three consequences, running in opposite directions:**

1. **The asymmetry is even more extreme than reported.** App code is *genuinely* nearly free —
   **15.6 B gz/line, only ~1.9x hand-written JS's own density** (7,862/933 non-blank = 8.4 B gz/line).
   Opal-generated code is **not** meaningfully bloated at the margin. This **strengthens** (b).
2. **But the budget risk is tier 2, not tier 3.** A `require` costs ~**270 lines of Ruby** in bytes
   (4,212 / 15.6). What breaches a ceiling is **`opal-browser`, `json`, `promise`, `set` — not
   features.** This **reverses** (d).
3. **The publishable number:** on the realistic widget, **96.6% of the payload is runtime, 2.9% is
   one stdlib require, and 0.49% is the Ruby you actually wrote.** That is the most interesting
   sentence in this entire deliberation, and it is the post.

`[ASSUMPTION — M]` Tier-3 linearity is extrapolated from **one** 45-line datapoint. Gzip's shared
dictionary should make it *sub*-linear (more similar generated code compresses better), so ~15.6
B/line is likely an **over**estimate — the conclusion is robust in the safe direction. Tier 2 is
measured for `native` **only**; `opal-browser` is **unmeasured** and is the live unknown. → **EC-7c.**

### 2.2 (b) ANSWERED — the shape changes, but not along the axis proposed

**The coordinator is right that a token island is the worst byte-per-value point, and the corrected
numbers make the case *stronger*:** a 45-line token costs 140.09 KiB; a 450-line ambitious widget
costs ~146.9 KiB. **10x the functionality for 4.6% more bytes.** Paying 135 KiB of runtime to spin a
circle is indefensible *because the alternative was nearly free*.

**But "therefore build a maximal lab" does not follow, and I decline it.** Ambition is free in
*bytes* and expensive in *hours* — and hours are the binding constraint (§3.3, v0.1; RISK-1). (b)
optimizes the axis the measurement illuminated while ignoring the axis that actually binds.

**The correct maximand is the POST, not the widget.** Three converging reasons:

1. **The value floor is already cleared by writing, not by code.** The 96.6% / 2.9% / 0.49%
   decomposition is a *complete, publishable, generalizable insight* — "this is what a language
   runtime costs, measured" — and producing it took **~45 lines**. The insight is already in hand.
2. **[RES-SITE §3] says so explicitly.** Willison: *"the write-up about building it IS the project
   page"*; *"writing about something is the cost I have to pay for building it."* The widget is the
   **pretext**; the post is the **product**.
3. **§3.3 says writing is the goal and building is the failure mode.** Maximizing widget complexity
   optimizes for exactly the behaviour that produced 18 build commits and 1 post.

**So: the island must be substantive enough to be *honest* — genuinely interactive, keyboard-operable,
not a token spinner — and no more.** The scarce hours go to the post. **This resolves (b) and (e)
together**: the byte data says "don't build a token," the attention data says "don't build a lab,"
and the intersection is *a real-but-modest widget carrying a deep post.* → **EC-2 revised.**

### 2.3 SELF-CORRECTION — Ruling 2's rationale was partly wrong

v0.1 justified the build-time reframe partly on the performance budget (C4). **The measurement
refutes that.** The whole site ships **7,862 B gz** of JS. Deleting "most of it" saves perhaps 5 KB
gz — **that is not a performance argument. There was never a performance problem.**

**Ruling 2 survives, but its justification is now narrower and I state it plainly:**

| Ruling 2 is justified by | Status |
|---|---|
| **Correctness** — the no-JS empty-TOC defect (§2.3, v0.1) | ✅ Real |
| **A11y** — `home.js`'s missing reduced-motion guard; WCAG 2.2.2 exposure | ✅ Real, corroborated by research-ui-a11y §3.2 |
| **SEO / plan alignment** — AC-013 already demands server-rendered categories | ✅ Real |
| **Performance** | ❌ **WITHDRAWN — the site was already fast** |

This matters for RAMZA: **do not sell Phase 2's JS reduction as a speed win.** It is a
correctness-and-accessibility win. Overselling it would be the same disclosure failure this verdict
warns about elsewhere. (It also means Ruling 2 is *less* urgent than v0.1 implied — but it costs no
new phase, so it rides.)

### 2.4 (d) ANSWERED — do NOT raise the ceiling. I reverse the coordinator's premise.

> Coordinator: *"140.1 KB leaves almost no room for growth; a second feature on the island likely breaches 150."*

**This is incorrect, and it follows directly from the tier-2/tier-3 conflation (§2.1).** At the
corrected marginal rate, a "second feature" of ~60 Ruby lines costs **~940 bytes gz** — not 10 KB.
**Features do not breach 150. Requires do.**

Headroom under a 150 KiB (153,600 B) ceiling, above hello-world + `native` (142,749):
**10,851 B gz — which buys ~694 more lines of Ruby, or ~2.5 more stdlib requires.**
Six hundred and ninety-four lines is **3x `home.js`**, the largest JS file on the site. The budget is
not tight for features. It is tight for exactly the thing that *should* be tight.

**Recommendation to the owner: keep 150 KiB gz. Do not inflate a budget merely because measurement
proved you can hit it** — that is how budgets stop being budgets. Restructure it instead so it
constrains the real vector:

- **EC-7a — 0 bytes on every page except the island.** Unchanged, and still the load-bearing half.
- **EC-7b — island page total JS ≤ 150 KiB gz.** **Number unchanged.** Validated as achievable
  (140.09 measured). ~3.6 KiB spare against a 450-line widget.
- **EC-7c — NEW: the `require` list is the budget.** Enumerate and cap it. `native` (+4,212)
  pre-authorized. **Every other require — `opal-browser` especially, which is unmeasured — must be
  measured before adoption and re-checked against 7b.** This is where the money goes.
- **EC-7d — NEW: the value floor** (§2.2).

Free wins to bank: **`--no-method-missing` saves 4,028 B gz (2.9%)** at zero cost if the widget does
not need `method_missing` — a 45-line widget almost certainly does not. **`--no-source-map` is
mandatory regardless** (§1, correction 1).

### 2.5 (c) ANSWERED — measurement largely defuses RISK-2, but conditionally

**Yes — substantially. Three arguments, and one firm limit.**

1. **Dan Luu's brand is *measurement*, not smallness.** [RES-SITE §4] cites him for
   `danluu.com/web-bloat` and `slow-device` — both are *measurement* papers. He measured, published,
   and *then* stripped his own Octopress setup. A measured, disclosed, opt-in 140 KiB is
   **methodologically aligned with Luu even where it is numerically opposed to him.** The hypocrisy
   charge requires the cost to be **hidden**. Disclosure is the whole defense, and it is a real one.
2. **The Luu citation is scoped to article pages and slow devices.** EC-2/EC-4 keep the island off
   both. An explicitly-labeled, opt-in interactive demo with a `<noscript>` fallback is a **different
   reader contract** than an article page. v0.1 over-weighted this risk by not distinguishing them.
3. **Corroborated independently:** research-ui-a11y §6 documents **Lynn Fisher's "fence the gimmick"**
   discipline — *"the decoration is never removed; it is **fenced** — to a viewport range, to a
   non-navigational layer, or to a described equivalent."* **That is precisely EC-2/EC-4/EC-5**,
   arrived at independently in v0.1 and now validated against a named exemplar. The island is a
   fenced gimmick; fenced gimmicks are a recognized, defensible pattern.

**The limit — and it is firm:** *disclosure does not launder a bad artifact.* "I measured it, it's
indefensible, I shipped it anyway" is **worse** than never measuring — it converts a mistake into a
documented one. **RISK-2's mitigation is therefore CONDITIONAL on EC-7d (the value floor).** Ship a
token spinner with an honest 140 KiB disclosure and the irony lands *harder*, not softer, because you
will have proven you knew.

→ **RISK-2 downgraded from headline to managed.**

### 2.6 (e) ANSWERED — RISK-1 still dominates, and measurement *strengthened* the finding

**Yes. Unambiguously, and more than in v0.1 — for a reason worth stating precisely:**

> **All three gaps were about bytes and health. None of them touched attention. The measurement
> resolved everything except the binding constraint.**

That is not a neutral outcome — it is **confirming evidence for §3.3**. The technical objection to
Opal was always *available* to be resolved by measurement, and it was, in an afternoon. The real
objection was never technical, which is exactly what §3.3 argued from the git history: 18 build
commits, 1 post, 16 months [FINDING-026, **H**]. **A decision that looked like an engineering
question and dissolved on contact with a `wc -c` was an identity question wearing engineering
clothes.** The mission framing ("more a 'lustful desire'") said so at the outset; the measurement
proved it.

**EC-1 is therefore now the single load-bearing constraint in this verdict.** Every other EC governs
an artifact that may never exist. EC-1 governs whether the *site* does.

And §2.2 sharpens the stakes: **the measurement removed the "cheap little fun thing" option from the
menu.** There is no cheap Opal island — the runtime floor means the *minimum viable* Opal artifact
costs 135 KiB, so the *minimum justifiable* one must be substantive. **The choice is now binary: a
real thing, or nothing.** That is a cleaner decision than v0.1 could offer, and a *harder* one.

---

## 3. REVISED CONSTRAINTS — EC-1..EC-13

Marked for RAMZA: **[UNCHANGED]** / **[CHANGED]** / **[NEW]** / **[DISCHARGED]**.

| ID | Constraint | Status |
|---|---|---|
| **EC-1** | **No Opal work begins until Phase 1 (AC-004..AC-011) is closed.** Recommended: after Phase 2. | **[UNCHANGED]** — *now the single load-bearing constraint (§2.6)* |
| **EC-2** | Opal output loads on **exactly one dedicated page**. **0 bytes** on `/` and article pages. `home.js` is **not** a migration target. **CHANGED: the island's product is the POST, not widget complexity. The widget must be genuinely interactive and honest; a token spinner is FORBIDDEN (§2.2). Scarce hours go to the write-up.** | **[CHANGED]** |
| **EC-3** | Widget script `defer`red, loaded only on its page, never render-blocking. | **[UNCHANGED]** |
| **EC-4** | Opal owns **none** of: dark toggle, TOC, notebook filter/search, nav active-state, progress bar, share links. | **[UNCHANGED]** — *now anchored at 18.25x* |
| **EC-5** | Widget page **must remain meaningful with JS disabled**: `<noscript>` + a static inline SVG of the circle + prose. **STRENGTHENED: a 143 KB payload failing on a slow link is now a measured scenario.** | **[UNCHANGED, strengthened]** |
| **EC-6** | Precompile locally; commit output to `assets/js/`; commit `.rb` source (e.g. `_opal/`) excluded from Jekyll output. **No change to the Pages build source. No `opal` in `jekyll_plugins`.** **CHANGED: `--no-source-map` is MANDATORY** (inline source maps ship to every visitor — the 3.5x error). **`--no-method-missing` recommended: free 4,028 B gz.** If a map is wanted, emit a **separate** `.map` file, never inline. | **[CHANGED]** |
| **EC-7a** | **0 bytes of Opal on every page except the island.** | **[UNCHANGED]** — *load-bearing half* |
| **EC-7b** | **Island page total JS ≤ 150 KiB gz. Number NOT raised** (§2.4). Measured baseline: 140.09. | **[CHANGED — restructured, value held]** |
| **EC-7c** | **NEW: the `require` list IS the budget.** Enumerate and cap it. `native` (+4,212 B gz) pre-authorized. **Every other require — `opal-browser` especially (UNMEASURED) — must be measured before adoption and re-checked against EC-7b.** Requires cost ~270 Ruby lines each; features are ~free. | **[NEW]** |
| **EC-7d** | **NEW: value floor.** The island must be worth 135 KiB of runtime to a reader. **A token/decorative circle FAILS this gate.** If the island cannot clear it, **do not build it** → fall back to Ruling 2. **This gate is what makes EC-7b's disclosure honest rather than incriminating (§2.5).** | **[NEW]** |
| **EC-8** | Opal health/compat. **opal 1.8.3 verified healthy under project Ruby.** | **[DISCHARGED]** → re-check only on Ruby/Opal major upgrade |
| **EC-9** | **A11y — CHANGED, inherits research-ui-a11y §3.2:** ① **`prefers-reduced-motion` does NOT discharge WCAG 2.2.2** — "the most commonly-believed false thing in this whole area." ② **Prefer a FINITE animation ≤5s** (inscribe → flare → settle): 2.2.2 then **does not apply at all** and you owe no pause control. ③ If an infinite loop is non-negotiable, **a visible themed pause control is mandatory** — budget it as a persona feature. ④ **No-motion-first** (Tatiana Mac): default `animation: none`, enable under `@media (prefers-reduced-motion: no-preference)` / Argyle's `--motionOK` token. ⑤ **Substitute, don't delete** under `reduce` — rotation → static sigil + opacity breath (Val Head: opacity/colour/blur "unlikely to be problematic"; rotation-in-place is already near the benign end). ⑥ **Build it as inline SVG, not canvas** — "SVG has a DOM, which allows it to be made nice and accessible" (Cassie Evans, principle only — site archived); survives `forced-colors`. ⑦ Keyboard-operable (the probe's ArrowLeft/ArrowRight is the right shape); visible focus; no focus trap; `aria-hidden="true"` on pure ornament, **one method, never stacked with `alt=""`**. | **[CHANGED]** |
| **EC-10** | **Drift gate:** CI/pre-commit asserts committed JS matches compiled source. **STRENGTHENED: must pin the exact flag set** (`--no-source-map`, `--no-method-missing`, require list) — a drift check that doesn't pin flags cannot detect a source map creeping back in. | **[UNCHANGED, strengthened]** |
| **EC-11** | **The ratchet is explicit:** any expansion beyond one island — including "just the toggle too" — is a **new decision requiring a new verdict**, not an increment. | **[UNCHANGED]** |
| **EC-12** | Ruling 2's work is **plan-internal** (Phase 2/3, AC-013) and proceeds **independently** of any Opal decision. **Now also: sell it as correctness/a11y, NOT performance (§2.3).** | **[UNCHANGED, rationale corrected]** |
| **EC-13** | **NEW: re-measure the real artifact before commit.** 143,453 is a **proxy** built for the probe, not the shipped widget. Record final gz bytes + the tier decomposition. **That number is the post's spine (§2.5).** | **[NEW]** |

---

## 4. REVISED CONFIDENCE — 90%

| Factor (25% each) | v0.1 | v0.2 | Justification |
|---|---|---|---|
| Evidence quality | 70 | **95** | All three gaps closed with measured numbers; **two** methodology corrections applied (coordinator's source-map 3.5x error; my require-decomposition 7x error). Residual: `opal-browser` unmeasured; tier-3 linearity from one datapoint. |
| Logical coherence | 90 | **90** | **Structure held under measurement** — the strongest available validation. Offset: I withdrew part of Ruling 2's rationale (§2.3) and the (b)/(e) tension is *resolved*, not *eliminated*. |
| Constraint coverage | 85 | **92** | All 7 constraints pass/fail; EC-7 restructured onto the real vector; EC-9 now WCAG-2.2.2-correct. |
| Sensitivity | 80 | **85** | **RC-1 tested at 18.25x — not close**, so Ruling 1 is insensitive to measurement error. Held back by RISK-1 being *unmeasurable* and dominant. |

**= 90% → "Act on verdict" (≥85%).**

**Why not higher:** the dominant risk (RISK-1, attention) is **not a measurement question and cannot
be closed by one.** No probe will ever raise this above ~90.
**Why the jump from 80:** the gaps resolved **in the confirming direction** — Ruling 1 stronger,
Ruling 3's gate passed, Ruling 2 intact-but-narrowed. Being *tested* and surviving is worth more than
never having been tested; had RC-1 fired, this document would now say "adopt fully."

---

## 5. REVISED REVERSAL CONDITIONS

- **[RC-1] — TESTED, DID NOT FIRE.** 18.25x. Ruling 1 stands. *Retained as:* if a future Opal
  (tree-shaking, a minimal corelib profile) brings runtime+app within ~2x of hand-written JS,
  **re-open H1.**
- **[RC-2] — DID NOT FIRE.** opal 1.8.3 healthy. *Retained as:* re-check on major Ruby/Opal upgrade.
- **[RC-3]** If the owner drops the alchemist metaphor, the island loses its content rationale →
  **H2/H4 win outright.** *Unchanged.*
- **[RC-4]** If Pages/Actions changes for **independent** reasons, EC-6's precompile mandate relaxes.
  **The reverse does not hold — do not move to Actions for Opal.** *Unchanged.*
- **[RC-5]** If Phase 1 has not closed within a period the owner considers reasonable, **EC-1 hardens
  from "gate" to "no."** *Unchanged — and §2.6 makes this the one to watch.*
- **[RC-6]** If the boundary is breached once (Opal on `/` or in `post.html`), the gate has failed →
  **revert to Ruling 2.** *Unchanged.*
- **[RC-7] — NEW.** If `opal-browser` (or any second require) is measured and pushes the island past
  **EC-7b's 150 KiB**, the island ships **without it** or **not at all**. The require list is not
  negotiable upward after the fact — that is what EC-7c exists to prevent.
- **[RC-8] — NEW.** If the widget cannot clear **EC-7d's value floor** — if the honest answer to
  "would a reader visit this for its own sake?" is no — **do not build it.** Fall back to Ruling 2.
  **The post can still be written from the probe data already in hand** (§2.2): the measurement is
  publishable *whether or not the widget ever ships.*

---

## 6. REVISED RISK REGISTER

| ID | Risk | v0.2 status |
|---|---|---|
| **[RISK-1]** | **Attention displacement** — the Mar-2025 pattern (18 build commits → 1 post/16 months) repeating [FINDING-026, **H**]. | **DOMINANT — and strengthened (§2.6). Untouched by measurement.** Mitigated by EC-1 only; **cannot be eliminated** |
| **[RISK-2]** | Perf/reputational irony at 140 KiB. | **DOWNGRADED → managed.** Measurement + disclosure + fencing defuse it — **conditional on EC-7d** (§2.5) |
| **[RISK-3]** | Boundary erosion (H5 → H1 by increments). | **Live.** EC-4 + EC-11 + RC-6. *Note: §2.2's "app code is nearly free" is itself an erosion pressure — "we've paid the runtime, why not the toggle too?" **Answer: the toggle isn't on the island page, so it would re-pay the full 135 KiB floor on the reading path.** EC-4 holds and the economics now defend it* |
| **[RISK-4]** | Committed-artifact drift. | **Live, sharpened** — EC-10 must now pin flags, or a source map creeps back and silently 3.5x's the payload |
| **[RISK-5]** | Owner reads Ruling 2 as a soft "no". | **Live.** Ruling 3 is a **genuine, gate-passed yes**: the island is **VIABLE at 140.09 KiB**. Not a consolation prize |
| **[RISK-6] NEW** | **`opal-browser` unmeasured.** If the ergonomic path to DOM work pulls it in, tier 2 could dominate and breach EC-7b. | **Open** → EC-7c + RC-7. **Measure before designing** |
| **[GAP-4] NEW** | Tier-3 linearity extrapolated from **one** 45-line datapoint. Gzip's shared dictionary suggests sub-linear → **over**estimate → safe direction. | Open, low impact |
| **[ASSUMPTION]** | The "lustful desire" is durable. **Now partly testable: EC-1 is itself the test.** If it survives Phases 0–2, it was real. | Self-resolving |
| **[ASSUMPTION]** | Kramdown's built-in TOC can replace the JS TOC at acceptable fidelity. | → APIVR to verify in Phase 2 |
| **[NOTE]** | Two v0.1 mission-premise corrections stand: **share buttons and reading time are not JS.** | Corrected |

---

## 7. REVISED HANDOFF

- **→ SPECTRA (RAMZA)** — **primary.** Fold in:
  1. **Ruling 2 into Phase 2/3** — but **sell it as correctness + a11y + SEO, NOT performance
     (§2.3).** Add: the TOC server-rendering story (fixes the no-JS empty-TOC defect) and the
     reduced-motion story (fixes `home.js`, now with **WCAG 2.2.2 teeth** per EC-9 — note
     `home.js`'s circle is an infinite loop presented in parallel with the hero text, i.e. **all
     three 2.2.2 conditions currently hold on the homepage today**; the finite-animation fix
     discharges it for free).
  2. **Optional "Phase 4 — The Transmutation Circle"**, `depends_on: [1]` (hard), recommended after
     2, may ride alongside 3. Ships as one Laboratory entry + one **`type: transmutation, assay:
     speculative`** post. Carry **EC-1..EC-13**.
  3. **Plan Assumption 2 NOT invalidated** — EC-6 keeps Opal off the Pages build.
  4. **The post is the deliverable, not the widget** (§2.2) — size the story accordingly.
- **→ human (owner)** — three decisions:
  1. **The ceiling: I recommend keeping 150 KiB gz, not raising it** (§2.4). The "almost no room"
     read is based on a 7x-inflated per-line rate; you have room for ~694 more Ruby lines. What you
     do not have room for is a second `require`.
  2. **The value floor (EC-7d)** — the one genuinely subjective call: *is a Ruby-compiled alchemy
     widget worth 135 KiB of runtime to someone who visits your site?* **If no, don't build it — and
     write the post anyway from the numbers already measured.**
  3. **Confirm Ruling 2 isn't a bait-and-switch.** Ruling 3 is a real yes; the gate passed.
- **→ ATLAS** — **one remaining probe, much smaller than the last:** measure `opal-browser`'s gz cost
  (and any second require the widget shape implies) against EC-7b. **[RISK-6] is now the only open
  byte question.**
- **`requires_checker: false`** — unchanged.

---

## 8. WHAT DID NOT CHANGE, AND WHY THAT MATTERS

The measurement was a genuine test: **RC-1 was written in v0.1 specifically to be falsifiable, and it
could have fired.** It didn't — by 18x, not by 1.2x. Ruling 3's gate was written before the number
existed and the number passed it with 10,147 bytes to spare. **A verdict that survives its own
pre-registered falsification test at both ends is worth more than one that was never tested.**

What the measurement could *not* touch is what v0.1 already identified as the real argument, and what
this revision states more sharply:

> **The bytes were never the question. The hours are.**
> Opal is affordable, healthy, and viable. The island passes every gate a compiler can be held to.
> Whether it should be built is a question about **what the owner does with a finite Saturday**, and
> no `wc -c` will ever answer it. **EC-1 is the whole verdict; everything else is engineering.**

---
---

# v0.1 REASONING TRAIL (preserved — superseded where §0 says so)

*Retained per provenance requirement. Where v0.2 above conflicts, **v0.2 governs**. GAP sections are
annotated `[CLOSED]` but the original reasoning is left standing so the trail shows what was believed
before measurement, and why.*

---

## v0.1 §0. Provenance note (P0-1 deviation, declared)

FORGE is nominally reasoning-only (`agent.md` P0-1). The mission explicitly pre-authorized
`Read`/`Grep` for evidence grounding and forbade modification. I used them for **Observe-phase
evidence inventory only** — 12 bounded reads/greps against named files, zero mutations, no
exploration beyond the JS surface the decision turns on. Declared, bounded deviation; not scope
expansion. CRYSTALIUM recall returned **0 records** → proceeded without memory per the graceful-skip
contract.

---

## v0.1 §1. FRAME

### 1.1 The decision (specificity test applied)

> Given (a) a 5-page custom Jekyll 4.4.1 site on GitHub Pages whose entire JavaScript surface is
> ~1,083 non-blank hand-written lines of DOM glue, mostly decorative; (b) a plan doctrine requiring
> article pages to be readable with CSS alone and JS to be enhancement-only; (c) a hard GitHub-Pages
> build constraint that forbids non-whitelisted build plugins; and (d) an owner whose stated
> motivation is explicitly **joy and craft-identity, not technical need** — should Opal compile some,
> all, or none of this site's JavaScript; where exactly is the boundary; on which build path; and at
> which phase of the existing rebrand plan?

**Type:** `TRADE-OFF`, with an embedded `FEASIBILITY` sub-question and an embedded
**objective-function conflict** (craft-joy vs. performance doctrine — both real, both the owner's).

**Depth:** Ambiguity 3 + Reversibility 2 + Blast radius 2 = **7 → Standard, 2 passes.** G2/TRANCE does
**not** fire. Correct at standard tier.

### 1.2 Constraint map

| ID | Constraint | Hard/Soft | Source | Risk if violated |
|----|-----------|-----------|--------|------------------|
| C1 | Build must be legal on GitHub Pages — no arbitrary build plugins in the Pages Jekyll build | **Hard** | rebrand-plan Assumption 2; [RES-SITE §5] | Site stops building/deploying |
| C2 | `jekyll build` exits 0, no missing layout/include | **Hard** | rebrand-plan AC-004 | Phase 1 gate fails |
| C3 | Article pages readable with CSS alone; JS enhancement-only | **Hard** | [RES-SITE §4]; Surface C | Core doctrine void |
| C4 | Performance budget — text-first/minimal is the prestige aesthetic | **Soft (doctrinal, owner-relaxable)** | [RES-SITE §4] Dan Luu | Brand claims performance-literacy while shipping bloat |
| C5 | WCAG 4.5:1 both themes, semantic landmarks, visible focus, reduced-motion | **Hard** | Surface C; [RES-SITE §4] | Accessibility regression |
| C6 | Layout/UI/UX/a11y work sequenced *after* priority items | **Soft** | Owner statement | Priorities inverted |
| C7 | **Owner joy / craft-identity must be served** | **Soft — but load-bearing** | Owner: "more a 'lustful desire'" | Maintenance motivation decays; site abandoned again |

**C7 is not decoration.** The evidence base independently corroborates that motivation — not
capability — is this site's binding constraint (§3.3). *(v0.2 §2.6 confirms this decisively.)*

---

## v0.1 §2. OBSERVE — evidence inventory

| ID | Source | Reliability |
|----|--------|-------------|
| E1 | `.claude/rebrand/scout-report.md` (45 anchored findings) | **H** |
| E2 | `.claude/rebrand/research-personal-site.md` §3, §4, §5, §6 | **H** doctrine |
| E3 | `.claude/rebrand/rebrand-plan.md` (22 ACs) | **H** |
| E4 | `_layouts/post.html` (363 lines) | **H** |
| E5 | `_layouts/default.html` (68 lines) | **H** |
| E6 | `assets/js/*.js` — 8 files, **933 non-blank lines** | **H** |
| E7 | `Gemfile` — jekyll 4.4.1, jekyll-feed, jemoji only | **H** |
| E8 | `grep -i opal` → **no matches** | **H** |
| E9 | `grep prefers-reduced-motion\|prefers-color-scheme` → `sigil-navigation.js:18`, `_home.scss:505`, `_breakpoints.scss:64`, `_notebook.scss:799` | **H** |
| E10 | Owner statement: "more a 'lustful desire'" | **H** preference / **M** inference |
| E11 | Opal runtime size | **[GAP-1]** → **[CLOSED v0.2 §1.3]** |
| E12 | Opal project health | **[GAP-2]** → **[CLOSED v0.2 §1.1]** |
| E13 | CRYSTALIUM recall | 0 records |

### 2.1 Two mission premises are factually wrong — this shrinks the problem

- **Share buttons are pure HTML.** `post.html:84-111` — four plain Liquid-interpolated anchors. Zero
  JS. They already work with JS disabled. [E4, H]
- **Reading time is computed in Liquid at build time.** `post.html:20-27`:
  `{% assign words = content | number_of_words %}`. Zero JS. **Ruby already computes it at build
  time.** [E4, H]

The real post-layout JS is only: TOC + scrollspy, the dark-mode toggle, the reading-progress bar, and
heading hover-particles. **The "real JS need" is even tinier than the brief assumed** — which
strengthens the runtime-dwarfs-payload hazard and independently proves the H4 thesis.

### 2.2 The actual JS surface (ground truth)

| File | Non-blank lines | Character |
|---|---|---|
| `assets/js/home.js` | 224 | **Pure decoration** — homepage only |
| `assets/js/notebook.js` | 151 | **Only genuine app-logic on the site** |
| `assets/js/laboratory.js` | 133 | Decoration/UI |
| `assets/js/sigil-navigation.js` | 125 | Mostly decoration; **active-state is Liquid-computable** |
| `assets/js/about.js` | 99 | Decoration/UI |
| `assets/js/letter.js` | 82 | Form UX |
| `assets/js/main.js` | 70 | **Replaceable by CSS** |
| `assets/js/exp-bar.js` | 49 | Decoration |
| `_layouts/post.html` inline | ~150 (`:213-363`) | Mixed |
| **Total** | **≈1,083** | **Majority decorative or build-time-replaceable** |

*(v0.2: bytes now measured — 33,596 raw / **7,862 gz**. Line baseline sound.)*

### 2.3 No-JS reading path — current status (verified)

| Surface | Without JS | Verdict |
|---|---|---|
| Article body | Server-rendered `{{ content }}` (`post.html:126`) | ✅ **Fully readable** |
| Reading time / share / prev-next / related / tags | Liquid | ✅ Work |
| Nav | Plain anchors (active-state lost) | ✅ Works, cosmetic loss |
| Notebook list | Items render unhidden; tabs inert | ⚠️ Degrades acceptably |
| **TOC** | `#toc-content` empty, `.toc-scroll` header still renders | ❌ **Pre-existing defect: empty "Contents" widget** |
| Dark toggle | Renders, does nothing | ⚠️ Pre-existing dead affordance |
| Progress bar | width 0 | ✅ Benign |

**Key finding: the reading path does not currently depend on JS.** A genuine asset, and the single
most important thing any Opal decision must not break.

### 2.4 Accessibility ground truth (verified)

- `sigil-navigation.js:18` **does** guard on `prefers-reduced-motion` [E9, H].
- `home.js` — 224 lines of drag/particle/ripple animation — has **no JS-level reduced-motion guard**;
  only `_sass/_home.scss:505` guards at the CSS layer, which cannot suppress JS-created nodes
  [E6, E9, H]. *(v0.2: corroborated by research-ui-a11y; **and it is a live WCAG 2.2.2 exposure** —
  see v0.2 §7.)*
- CSS dark mode partially exists (`_breakpoints.scss:64`) while the toggle is JS+localStorage and
  **only on post pages** [E4, E9, H].

### 2.5 [GAP-1] Opal runtime cost — NOT VERIFIED **[CLOSED in v0.2 §1.3]**

*v0.1 text preserved:* Opal is absent from the repo, `Gemfile`, and any lockfile [E7, E8, H]. No
network access, no local Opal. **I cannot source a current runtime size, and per the mission I will
not guess one.**

What survives the gap is a **structural argument that does not need the number**: Opal must ship a
Ruby object model, corelib, and method-dispatch machinery **before line 1 of application code runs**.
The code it would replace is ~1,083 lines of DOM glue. **The ratio is unfavourable by construction
for plumbing.** This argument is robust to [GAP-1] and is sufficient to reject H1 without measurement.

`[ASSUMPTION — L]` Prior: tens-to-low-hundreds of KB minified before app code — plausibly an order of
magnitude above the entire current JS surface. **Unverified; MUST be measured.**

> **v0.2 annotation:** the prior was **correct** — 138,537 B gz runtime, **17.62x** the entire site's
> JS. The structural argument was load-bearing and held. **The refusal to guess was the right call:
> the coordinator's first measurement was itself wrong by 3.5x in Opal's *disfavour*, and a guessed
> number here would have been unfalsifiable rather than merely wrong.**

---

## v0.1 §3. REASON — hypotheses

### H1 — Full adoption
**Position:** All site JS in Ruby via Opal, replacing all 8 files + the inline block.
**Opposing:** [RES-SITE §4] (**H**); §2.2 payload is tiny and mostly decorative (**H**); §2.5
structural ratio (**H**); C6 (**H**).
**Second-order:** a compiler enters the critical path of a phase whose gate is literally "build exits
0"; the alchemy-circle rewrite lands on `/`; `home.js`'s reduced-motion gap gets carried forward.
**Falsification:** wrong if measured runtime+corelib+app ≤ current total JS bytes. *(v0.2: **tested —
18.25x. Not wrong.**)*

### H2 — Rejection
**Position:** Keep vanilla JS; satisfy the Ruby desire via Jekyll plugins/generators.
**Opposing:** E10 (**H**) — answers a question the owner didn't ask; §3.3 (**H**).
**Second-order:** the verdict most likely to be ignored; an unmet craft desire re-surfaces unbounded.

### H3 — Bounded-adopt: Opal as **content island**
**Position:** One self-contained widget on its own page; the widget *is* the demo *and* the post's
subject.
**Supporting:** [RES-SITE §3] Willison — *"the write-up about building it IS the project page"*
(**H**). Plan slots pre-cut: `post_types` includes **`transmutation`**; `assay: speculative` exists;
**Laboratory** is the projects page (**H**, E3).
**Opposing:** [RES-SITE §4/§6] "skip Comeau-style interactivity" (**H**) — though §6's own reasoning
partially licenses a bounded, on-message exception.

### H4 — Reframe: **build-time transmutation**
**Position:** Honour "Ruby handles my JS" by **deleting most of the JS because Ruby already did the
work at build time.** Zero runtime shipped.

| Current JS | Build-time / CSS replacement | Evidence |
|---|---|---|
| `sigil-navigation.js:3-15` active-state | Liquid `page.url` | E6, H |
| `notebook.js:18-29` rarity classes | Liquid at build | E6, H |
| `notebook.js:32-60` filter | **Server-rendered category pages — AC-013 already demands this** | E3, E6, H |
| `post.html:216-247` TOC | kramdown TOC / Ruby generator — **fixes the no-JS defect** | E1, E4, H |
| `main.js:43-59` smooth scroll | CSS `scroll-behavior` | E6, H |
| `main.js:64-83` fade-in | CSS, or delete | E6, H |
| particles/sparks | CSS, or delete — **fixes the `home.js` reduced-motion gap** | E6, E9, H |
| dark toggle | CSS `prefers-color-scheme` (**already partially present**) + ~15 lines vanilla | E9, H |

*(v0.2: **rationale corrected — §2.3.** These are correctness/a11y/SEO wins, not perf wins.)*

### H5 — Synthesis: H4 **+** a gated H3 island ⭐
**Position:** H4 as plumbing doctrine (inside Phase 2/3) **and** one Opal content island as a
late-phase, budgeted, boundaried, reversible experiment shipping with its Transmutation post.
**Second-order:** **the island's fallback is H4, which is the plan anyway.**

### 3.3 The decisive evidence nobody framed: **abandonment, not bloat, is this site's failure mode**

- **FOR C7:** cadence is 2019×2, 2020×1, 2023×2, 2026×1 — **two separate 3-year gaps**, 6 posts in 7
  years [FINDING-024, **H**]. A site that isn't fun doesn't get maintained.
- **AGAINST full adoption — sharper:** the site was built in a **Mar–Apr 2025 burst of 18 commits**;
  in the ~16 months since, **exactly one post** [FINDING-010, FINDING-026, **H**]. The owner's
  *revealed* preference is **building the site over writing in it**.

The thing that gets abandoned is **writing**; Opal-as-plumbing is **not writing**. **The pre-mortem
for H1 already happened once, in Mar 2025.**

**This is why H3/H5 is the elegant resolution rather than a compromise.** If the owner will yak-shave
anyway (revealed preference, **H**), don't forbid it — **route it into publishable content**.
Willison: *"writing about something is the cost I have to pay for building it."* H5 makes the
indulgence **pay rent in the site's actual currency.** *(v0.2 §2.6: measurement **confirmed** this was
always the real axis.)*

### 3.4 [FEASIBILITY] The GitHub Pages build path — C1 is satisfiable

| Path | Legal? | Cost |
|---|---|---|
| **(a) Precompile locally, commit JS** | ✅ | Committed artifacts; drift risk. **Culturally native** — Docker + JEX [FINDING-009]; owner builds tools (Potions, JEX, drun, Fluxus — FINDING-034) |
| **(b) Actions → build → deploy** | ✅ | **Unlocks arbitrary plugins → invalidates plan Assumption 2 for the whole plan** |
| **(c) Opal as a Jekyll plugin in the Pages build** | ❌ | **Violates C1** |

**C1 PASSES via (a) or (b). Opal is feasible. The question was never feasibility.** But (b) is a large
lever for a small reason, and front-loads a failure mode onto **Phase 1**. **(a) is
boundary-preserving** — precompiled output is **inert with respect to the plan**. → **EC-6.**

### 3.5 Scoring (Evidence 30 / Constraints 25 / Risk 20 / Reversibility 15 / 2nd-order 10)

| Hypothesis | Ev | Con | Risk | Rev | 2nd | **Composite** |
|---|---|---|---|---|---|---|
| **H1 Full adoption** | 2 | 2 | 2 | 3 | 2 | **2.15** |
| **H2 Rejection** | 4 | 3 | 4 | 5 | 4 | **3.90** |
| **H3 Island only** | 4 | 4 | 4 | 5 | 4 | **4.15** |
| **H4 Build-time reframe** | 5 | 4 | 4 | 4 | 5 | **4.40** |
| **H5 Synthesis** ⭐ | 5 | 5 | 4 | 5 | 4 | **4.70** |

**Sensitivity:** H5 vs H4 = **0.30 — at the ambiguity threshold.** Resolved **structurally**:

> **H5 ⊃ H4.** H5 contains H4 plus one **optional, gated, reversible** module. If the island fails any
> gate, **the fallback is H4, which is already the plan.** H5's downside is bounded below by H4's.

**Honest caveat:** dominance is not *strict* — H5 costs attention H4 doesn't.

---

## v0.1 §4. STRESS TESTS (applied to H5)

**Inversion:** I'd expect no track record of finishing bounded artifacts → ❌ contradicted: 11
Laboratory projects [FINDING-034, **H**]. I'd expect no home for a widget → ❌ contradicted:
Laboratory + `transmutation` post-type exist [E3, **H**]. **Counter-evidence I cannot explain away:**
the 1-post/16-months rate. → confidence −5.

**Boundary:** ① **The homepage temptation** — the natural target is `home.js`, on `/`, the front door.
**EC-2 forbids it by name.** ② Byte blow-out → EC-7. ③ Drift → EC-10. ④ A11y of a drag/particle
widget → EC-9.

**Pre-Mortem:** **[RISK-1]** the island started before Phase 1 closed and consumed the hobby budget —
**the Mar-2025 pattern repeating** [**H**]. **[RISK-2]** the "Code Alchemist who cites Dan Luu" ships
a Ruby VM to spin a circle. **[RISK-3]** boundary erodes by increments until H5 is H1.

**Dependency:** Opal maintained **[GAP-2 → closed]**; Pages serves committed assets [**H**]; metaphor
stays [**H**]; **Phases 0–2 actually execute [uncertain]**; runtime cost stable **[GAP-1 → closed]**.

---

## v0.1 §5. VERDICT (structure retained in v0.2)

**Ruling 1 — REJECT Opal as plumbing** (H1, 2.15). *(v0.2: confirmed at 18.25x.)*
**Ruling 2 — ADOPT the reframe (H4) as plumbing doctrine, unconditionally.** *(v0.2: rationale
corrected — correctness/a11y/SEO, not perf.)*
**Ruling 3 — SANCTION one Opal island** (H3 within H5, 4.70). *(v0.2: gate PASSES at 140.09 KiB.)*

### 5.1 The exact boundary (v0.1)
**MAY:** one self-contained widget on its own dedicated page (natural home: a Laboratory entry);
precompiled, committed, loaded only there, `defer`red.
**MUST NOT:** appear on `/`, `post.html`, `default.html`, or any reading-path page — **`home.js` MUST
NOT be rewritten in Opal**; own the toggle, TOC, filter, active-state, progress bar, or share
affordances; enter `jekyll_plugins`.

### 5.2 Sequencing (**unchanged in v0.2**)

| Phase | Opal? | Why |
|---|---|---|
| **0 — Identity Spine** | ❌ | Copy/data only |
| **1 — Trust & Defects** | ❌ **hard gate** | Doctrine is *"stabilize before expanding."* Adding a compiler to the phase gated on **AC-004: build exits 0** is counter-doctrinal |
| **2 — Content Architecture** | ⚠️ Ruling 2 only | AC-013 already demands server-rendered categories. **No Opal** |
| **3 — Journal Mechanics** | ⚠️ Ruling 2 tail | **No Opal** |
| **4 (new) — "The Transmutation Circle"** *optional* | ✅ | Disjoint blast radius → **may ride alongside Phase 3** once Phase 1 closes |

**Opal is a late-phase, bounded experiment — not a never, and not a now.**

### 5.3 Does Opal regress a11y or the no-JS reading path?
**No-JS: NOT regressed — iff the boundary holds.** The reading path is server-rendered Liquid
(`post.html:126`). Under Ruling 2 it **improves**. **A11y: Opal is neutral at the language level** —
the emitted DOM decides. Two second-order regressions: payload → TTI on low-end devices (an a11y issue
in the Luu sense); animation code inherits `home.js`'s reduced-motion gap. *(v0.2 EC-9 supersedes with
WCAG 2.2.2 specifics.)*

---

## v0.1 §6–§10 — superseded

- v0.1 EC-1..EC-12 → **v0.2 §3 (EC-1..EC-13)**
- v0.1 confidence **80%** → **v0.2 §4: 90%**
- v0.1 RC-1..RC-6 → **v0.2 §5 (RC-1..RC-8)**
- v0.1 RISK-1..RISK-5, GAP-1..GAP-3 → **v0.2 §6**
- v0.1 handoff → **v0.2 §7**

## v0.1 §11. REJECTED ALTERNATIVES (unchanged)

| # | Rejected | Score | Reason |
|---|---|---|---|
| H1 | Full adoption | 2.15 | Runtime tax against ~1,083 lines of mostly-decorative glue; contradicts [RES-SITE §4]; violates C4/C6; **repeats the Mar-2025 build-instead-of-write pattern**. *(v0.2: confirmed at 18.25x)* |
| H2 | Flat rejection | 3.90 | Technically clean, **strategically naive**: treats C7 as noise when the evidence says motivation is the binding constraint [FINDING-024, **H**] |
| H3 | Island only, no reframe | 4.15 | Forfeits the AC-013/no-JS-TOC/a11y wins that come free. Strictly improved by H5 |
| H4 | Reframe only, no island | **4.40** | **The strongest single-ruling answer and the fallback if any gate fails.** Rejected as the *whole* verdict only because it substitutes for C7 rather than serving it |

---

*FORGE v0.2 — reasoning-only artifact. Read-only deliberation; no repository files were modified (this
report excepted, per mission). Gate: **PASS** (logical soundness ✅ — near-tie resolved structurally;
one self-correction applied (§2.3) and one coordinator premise reversed with evidence (§2.4); evidence
coverage ✅ — [GAP-1/2/3] CLOSED, [GAP-4]/[RISK-6] newly marked and not reasoned past; decision
completeness ✅). Passes: 2 (v0.1) + 1 measurement-triggered REFORGE (v0.2) = 3 of 3. Budget
exhausted; no further passes available.*
