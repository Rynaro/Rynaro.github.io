---
eidolon: ramza
kind: critique
version: 1.0.0
created_at: 2026-07-16
plan_under_critique: rebrand-plan.md v0.2.0
author_id: "ramza-author:job-ac6f42e7:v0.2"
checker_id: "ramza-critic:opus-4.8:rebrand-plan-v0.2-critique"
gate: "ramza-gate critic — RECORDED (author != checker)"
verdict: APPROVE-WITH-FIXES
---

# Independent Critique — `rebrand-plan.md` v0.2

**This closes the gate the plan could not close itself.** The plan's `ramza-rightsize`
computed **full (score 7)**, which mandates an independent critic before Assemble;
`ramza-gate critic` DENYs self-approval. The authoring instance recorded a tier override
to `lite` twice, reason: *"independent critic structurally unavailable in this solo
planning session."* That reason is now false. Author identity was stripped per
`skills/critic.md` §1 before evaluation; `state.critic` was read only afterward, to
confirm both slots were `null` and that the `--checker` value being recorded is mine.

---

## 1. Verdict (tool output, verbatim)

```
ramza-lint      --plan rebrand-plan.md --state rebrand.state.json  -> ok (tier: lite)      EXIT=0
ramza-ears-lint rebrand.criteria.md                                -> ok: 46 criteria pass EXIT=0
ramza-ears-lint rebrand-plan.md                                    -> ok: 24 criteria pass EXIT=0
ramza-gate critic --author ramza-author:job-ac6f42e7:v0.2 \
                  --checker ramza-critic:opus-4.8:rebrand-plan-v0.2-critique -> OK: critic recorded
ramza-gate critic --author X --checker X                           -> DENY: maker!=checker violated
```
```json
{ "rubric": "refine", "cycle": 1, "total": 3.2, "min": 2,
  "dims": {"clarity":4,"completeness":3,"actionability":3,"efficiency":4,"testability":2},
  "verdict": "fail" }
```

**The plan's "46/46 green" claim is TRUE — and it means far less than it reads as.**
I verified it rather than trusting it. `ramza-ears-lint` checks exactly four things:
form ∈ the closed set, exactly one `THEN` line, no literal `" AND "`, and a `VERIFY:`
exists. It does **not** check that a `THEN` is atomic in substance, that a `VERIFY`
verifies its `THEN`, that an AC is falsifiable, or that its quantifier ranges over
anything real. Every blocking finding below lives in that blind spot. Note also the
second lint line: the **plan body contains 24 criteria; the criteria file contains 46**
(see C-4).

`refine` returns **fail** (`min: 2` < cycle-1 bar of 3, on `testability`). Mechanically,
the plan re-enters **R**. No finding impeaches the strategy, the doctrine, or the
sequencing — the defects are concentrated in the criteria layer and are all fixable
without re-architecting. Hence APPROVE-WITH-FIXES, not REJECT.

---

## 2. Findings

Severity: **BLOCKING** (must fix before Assemble) · **MAJOR** · **MODERATE** · **MINOR**.
Every finding carries a mechanical anchor. Findings are ranked most-severe first.

### C-1 · BLOCKING · Phase 4a is vacuously satisfiable: AC-026/027/032 quantify over an executor-defined set

**Anchor:** `rebrand.criteria.md:126` (AC-026), `:130` (AC-027), `:154` (AC-032);
Story 4.6 `rebrand-plan.md:603-609`; Story 4.10 `:637-644`.

AC-026 asserts *"every palette token **classified as `-ink`** SHALL reach ≥4.5:1."*
The classification is an artifact **the executor produces** (Story 4.6, *"classify every
visual token as ornament/logotype/content in writing"*) — and **nothing binds it to
reality.** Classify every token as `-ornament` and AC-026 passes with an empty set, on a
site that is still illegible. Identical defect in AC-027 (*"every **meaning-bearing**
non-text boundary"*) and AC-032 (*"every **purely decorative** SVG ornament"*). Three of
Phase 4's criteria — including the P0 story the plan calls *"the single highest-leverage
change in the whole rebrand"* — are self-certifying.

The plan's doctrine states the binding rule (`:161`: *"the moment a rune means something,
it loses its exemption"*). **No criterion enforces it.** The doctrine is in prose; the
gate is not.

Compounding: the only **independent** backstop — AC-039's axe ratchet, which would catch
real rendered text-contrast failures regardless of classification — is in **4b**. 4a is
the slice defined as *"the one that must not slip"* (`:561`). The plan ships its
self-certifying slice **before** the check that would falsify it.

**Remediation.** (a) Add to 4a: `GIVEN a palette token / WHEN it is referenced by any CSS
color, border-color, or fill rule on text or a meaning-bearing boundary / THEN it SHALL be
classified -ink / VERIFY: a script cross-references every token usage in _sass/ against the
classification manifest; zero text or boundary usages resolve to an -ornament token.`
(b) Move the palette-contrast-unit-test half of AC-039 into **4a**. (c) Add an AC requiring
the written classification to exist as a committed artifact — today it is load-bearing for
three criteria and required by none.

---

### C-2 · BLOCKING · EC-9 and EC-3 are declared binding and have no acceptance criterion — the island's own 2.2.2 obligation is unenforced

**Anchor:** `rebrand-plan.md:1154` (`acceptance_constraints: [… EC-3 … EC-9 …]`);
`forge-opal-verdict.md:291` (EC-9 **CHANGED**), `:282` (EC-3); Story 5.2 `:683-692`.

FORGE **changed** EC-9 specifically to inherit WCAG 2.2.2: *"① `prefers-reduced-motion`
does NOT discharge WCAG 2.2.2… FINITE animation ≤5s, or a visible pause control."* Story
5.2 restates it in prose (*"**Finite animation ≤5s** — 2.2.2 then does not apply
[EC-9①②]"*) and its ACs are **(AC-040, AC-043, AC-045)** — none of which touch animation,
keyboard operability, focus, or `forced-colors`. AC-031, the plan's 2.2.2 criterion, is
scoped `GIVEN the **homepage** alchemy circle`.

**The Opal island can therefore ship an infinite spinner and pass every Phase 5 AC.** The
plan writes the 2.2.2 trap three times for Phases 2 and 4 — and then walks into it in
Phase 5, on the one artifact whose entire premise is a rotating circle.

EC-3 (*"Widget script `defer`red, loaded only on its page, never render-blocking"*) is
likewise listed as binding and verified nowhere, despite being trivially checkable.

**Remediation.** Add **AC-047** (EC-9): island animation finite ≤5s with non-infinite
iteration count, keyboard-operable, visible focus, no focus trap — VERIFY by the same
mechanical shape as AC-031. Add **AC-048** (EC-3): island script carries `defer` and
appears in no other page's `<head>`.

---

### C-3 · BLOCKING · The token-spinner prohibition is decorative prose — a token spinner passes all six Phase 5 ACs

**Anchor:** `forge-opal-verdict.md:281` (EC-2), `:289` (EC-7d); `rebrand-plan.md:690`
(*"a token spinner is FORBIDDEN [EC-2, EC-7d]"*), `:966` (RISK-2), Story 5.0 `:668-673`
(*"No AC — this is Open Decision 7"*).

Walk a token spinner through Phase 5's entire gate:

| AC | Requires | Token spinner |
|---|---|---|
| AC-041 | 0 bytes of Opal elsewhere | ✅ passes |
| AC-042 | island page JS ≤ 150 KiB gz | ✅ passes (140.09) |
| AC-043 | drift gate, pinned flags | ✅ passes |
| AC-044 | require manifest with measured costs | ✅ passes |
| AC-045 | `<noscript>` + inline SVG + prose | ✅ passes |
| AC-046 | `type: transmutation` post w/ bytes + decomposition | ✅ passes |

**Nothing mechanically distinguishes "a real-but-modest widget" from "a token spinner."**
The prohibition is stated at least four times and enforced zero times. EC-7d is routed
entirely to Story 5.0 — a human decision with no AC.

This is not a hypothetical the critic invented: **the plan names this exact scenario as
its worst outcome** (`:966`) — *"ship a token spinner with an honest 140 KiB disclosure and
the irony lands **harder**, because you'll have proven you knew."* The plan foresees the
failure and leaves the door open.

**Remediation.** EC-7d is genuinely subjective and cannot be a byte threshold — but a
subjective gate is enforceable **as a disclosure**. (a) Extend AC-046: the post SHALL
state, in the owner's own words, what the widget does that justifies 135 KiB of runtime to
a reader. (b) Add an AC requiring Story 5.0's value-floor decision to be a **committed
record**. A value floor the owner must write down and publish is the only honest
mechanization of a preference — and it is exactly the disclosure that makes a token
spinner too embarrassing to ship, which is the enforcement FORGE actually intended.

---

### C-4 · BLOCKING · 22 of 46 acceptance criteria are absent from the deliverable; the authoritative copy is in a transient job sandbox

**Anchor:** `rebrand-plan.md:723-725`, `:729-752`; `ramza-ears-lint` on the plan = **24**
criteria vs on the criteria file = **46**.

AC-001..AC-022 appear in the plan **only as an abbreviated one-line table** — no EARS
form, no `GIVEN/WHEN/THEN`, **no `VERIFY`**. The plan points to the authoritative copy at:

```
/home/rynaro/.claude/jobs/ac6f42e7/tmp/.spectra/plans/rebrand.criteria.md
```

That is a **job temp directory** — outside the repo, outside git, and not `.spectra/`
(which does not exist in this repo; I checked). When that sandbox is reaped, the normative
text of **48% of the plan's criteria** and the referent of the freeze hash are gone.
The plan's closing line asserts *"the audit state under `.spectra/plans/` are the only
writes"* — there is no such directory here.

Against target 9 (*could a competent executor with only this plan build the right thing?*):
**for Phases 0–3, no.** Nearly half the acceptance criteria are not in the artifact.

The freeze itself is **valid** — I recomputed it: `sha256 = 7495bb01986563d5a6b78647bad83fe2c913eb0383f6e6eacf208a915d2d7c4c`,
matching `state.criteria_sha256` exactly. It is not tampered. It is merely **unpersisted**.

**Remediation.** Reproduce AC-001..AC-022 in EARS form in the plan body or a
repo-committed sibling; re-freeze; repoint. ~30 minutes of mechanical work, and the
highest-leverage item on this list.

---

### C-5 · BLOCKING · The plan's most-repeated number is a methodology error, and its headline ratio mixes units

**Anchor:** `opal-measurement.md:18-26`; re-measured against the repo.

Every per-file figure in the measurement record is **exact** — I re-gzipped all 8 files
and each one reproduces byte-for-byte. The raw total (33,596) is correct. But:

```
sum of the record's own gz column  = 11,028 B   <- what the table's rows say
the record's stated gz TOTAL       =  7,862 B   <- what the TOTAL row claims
cat assets/js/*.js | gzip -c | wc -c = 7,852 B  <- what 7,862 actually is
```

**The TOTAL row is a different methodology than the column above it.** 7,862 is the
*concatenated* gzip — one shared dictionary across all 8 files. **The site does not
bundle.** It serves 8 separate files, each gzipped independently, so a client downloading
all 8 receives **11,028 B**. And no single page loads all 8, so 7,862 is simultaneously an
*undercount* of the all-files download and an *overcount* of any real page load. **It is
not a quantity this site ships under any interpretation.**

Knock-ons:
- The island ratio is **143,453 / 11,028 = 13.0×**, not 17.8×.
- **17.8× and 18.25× are the same ratio computed twice, inconsistently.** 18.25 =
  143,453/7,862 (consistent bytes). 17.8 = 140.1 **KiB** / 7.862 **KB** — a KiB/KB unit
  slip. The plan asserts both in one breath (`:44`, `:370-374`): *"140.1 KiB gz island vs
  the whole site's 7,862 B gz = **17.8×**… RC-1 was falsifiable and missed by **18.25×**."*
  An island that is 17.8× the site cannot miss by 18.25× of the same denominator.

**The conclusion is untouched.** 13.0× ≫ 1×; RC-1 does not fire; Ruling 1 stands; and
[DECISION-C] is *strengthened*, not weakened — 11 KB is still no performance problem. The
plan is right that *"the conclusion is insensitive to measurement error."*

**Why it is still blocking:** `site_js_gz: 7862` rides the handoff YAML (`:1122`), anchors
[DECISION-A]'s ruling (`:204`), and — via **AC-046/EC-13** — is **headed for publication**
in a post whose entire thesis is measurement rigor, on a site whose persona cites Dan Luu,
whose *"brand is **measurement**, not smallness"* (the plan quotes this at `:712`).
Publishing a mis-summed byte table in **that** post is the same class of self-inflicted
wound as the performance claim [DECISION-C] correctly withdrew.

**Remediation.** Restate as *"≈11.0 KB gz across 8 files; ≈2.5–4 KB gz on a typical
page"*; recompute the ratio as **13.0×** in consistent bytes; delete 17.8×; correct
`site_js_gz`; add to AC-046's VERIFY that the post's site-JS figure be the per-file sum
with its method stated. Correct `opal-measurement.md:26` at source.

---

### C-6 · MAJOR · AC-024 and AC-031 are homepage-scoped; 7 of the site's 11 infinite animations are unguarded and outside every AC

**Anchor:** `grep -rn "infinite" _sass/` → **11** hits;
`grep -rn "prefers-reduced-motion" _sass/` → **exactly 1**, `_home.scss:505`, covering 4
selectors.

Guarded (4): `_home.scss:243,250,257` (`.alchemy-circle__ring`), `:332`
(`.alchemy-symbol, .rune`). **Unguarded (7)** — each auto-starting, infinite, and presented
in parallel with content, i.e. **all three WCAG 2.2.2 conditions**, on four pages the plan
never models:

| Location | Selector | Animation |
|---|---|---|
| `_about.scss:949` | `.ability-card` | `ultimate-glow 2s infinite` |
| `_laboratory.scss:87` | `.emblem-icon` | `pulse 3s infinite` |
| `_laboratory.scss:585` | `.item-rarity-indicator.legendary` | `legendaryGlow 1.5s infinite` |
| `_letter.scss:99` | `.letter-icon` | `letterGlow 3s infinite` |
| `_letter.scss:695` | — | `spinner 0.8s infinite` |
| `_notebook.scss:116` | `.grimoire-icon` | `glow 3s infinite` |
| `_notebook.scss:501` | `.scroll-rarity.legendary` | `legendaryGlow 1.5s infinite` |

Additionally `laboratory.js:12` injects
`particle.style.animation = 'float …s ease-in-out …s infinite alternate'` — a
**script-created infinite animation**, structurally identical to D16's `home.js` defect,
on the Laboratory page. AC-024 says *"injected into the **homepage** DOM"* → misses it.

Story 4.5 prescribes the correct fix (*"Define `--motionOK` once and gate **every
animation** through it"*) but **AC-031 verifies only the homepage circle.** A lazy executor
makes the circle finite, closes AC-031 green, and ships 7 unguarded infinite animations
plus a JS particle injector. D16's own framing understates the defect: it says the CSS
guard *"cannot suppress JS-created nodes"* — true, but it also fails to suppress most of
the **CSS** motion on the site.

**Remediation.** Rescope AC-024 (*"on any page"*) and AC-031 (*"every auto-starting
animation site-wide SHALL be finite ≤5s or expose a pause control"*). Add a mechanical
VERIFY: `grep -rn "infinite" _sass/` cross-referenced against the `--motionOK` gate, zero
ungated hits. That check is ~5 lines and catches all 7.

---

### C-7 · MAJOR · `E5 ⊃ E2` is false: the E4 module's premise is dead code, and it mutates E2's core invariant

**Anchor:** `rebrand-plan.md:248-257` (near-tie), `:930` (E4 rejected), `:932` (E4
absorbed), `rebrand.criteria.md:127` (AC-026 VERIFY).

Target 7 asks whether the dominance is real or a rationalization borrowed because it worked
once. **It is a rationalization, and it fails twice over.**

**(a) The premise is dead.** E4-scoped exists to rescue `--rarity-uncommon` `#1eff00` at
1.26:1 — *"the one hex that cannot be saved on cream"* (`:300`). But:

```
grep -rn "rarity-uncommon" _sass/ assets/js/ *.html _layouts/ _includes/
  -> _sass/_variables.scss:60:  --rarity-uncommon: #1eff00;      # its own declaration. Nothing else.
```

The token is **never consumed**. `_laboratory.scss` styles `.common/.rare/.epic/.legendary`
— there is **no `.uncommon` rule**. And `laboratory.js:19-28` maps rarity via
`if legendary / else if epic / else if rare / **else → common**`, so the three projects
declaring `rarity: "uncommon"` (`_data/projects.yaml:25,46,53`) render as **common**.
**The measured 1.26:1 failure cannot occur.** The plan builds a dark-surface component to
rescue a token that is unreachable.

**(b) It is not additive.** AC-026 binds every `-ink` token *"against **each declared
background it is used on**"*; its VERIFY enumerates cream, light, parchment-dark — relative
luminance **0.92 / 0.84 / 0.74, all light**. An obsidian surface adds a **dark** declared
background (0.010), inverting the contrast direction. Computed:

```
--dnd-ink   #4e342e on #1a1a1a =  1.54:1     --dnd-brown #8a6d3b on #1a1a1a = 3.59:1
--ink-color #3a2921 on #1a1a1a =  1.26:1     --text-dark #4A4A4A on #1a1a1a = 1.96:1
                                             (every one fails the 4.5:1 text bar)
```

**Every ink token fails catastrophically on obsidian.** E5's obsidian therefore drags an
entire second (light-ink) palette behind it — with no story, no AC, and no timebox. **The
plan rejected E4 sitewide for precisely this reason** (`:930`: *"re-opening every contrast
pair already audited against cream"*) **and then absorbed it while forgetting its own
objection.** Scoping to Laboratory reduces the *count* of re-opened pairs, not the *kind*.

The borrowed pattern doesn't transfer: FORGE's H5 ⊃ H4 works because H5's island is
severable at **zero cost** to H4 (separate page, EC-7a's 0-byte fence). E5's obsidian is
**not** severable at zero cost to E2 — it changes E2's declared-background set, which is
E2's entire definition. The plan's stated caveat (*"dominance is not strict, since E5 costs
hours E2 doesn't"*) names the wrong problem: it is not hours, it is that E4 **enlarges the
contrast matrix E2 exists to close.**

**The dominance survives if you drop the module that breaks it.** E5′ = E2 + E3 ratchet is
a *true* superset: maintainability +1, simplicity −1 → **87.0**, still > E2's 86.5. That is
the honest resolution and it costs the plan nothing it should want to keep.

**Remediation.** Drop Story 4.4's obsidian surface (−1.5d), or re-justify it as a **want**
(a themed dark-surface component) rather than a **fix**, with its own light-ink palette,
stories, ACs, and timebox. Restate the near-tie as E5′ ⊃ E2 on the ratchet alone, and
rescore via `ramza-score`.

---

### C-8 · MAJOR · Phase 5's story→AC map is scrambled; AC-040 is double-assigned across two phases

**Anchor:** `:692` (Story 5.2 → *"AC-040, AC-043, AC-045"*), `:656` (Story 4.11 → AC-040),
`:472` and `:1081` (*"Phase 5 … AC-040..046"*) vs `:1149` (YAML `acceptance: [AC-041..AC-046]`).

AC-040 is `/accessibility` (`rebrand.criteria.md:193`) — a **Phase 4** story. It is assigned
to **both** Story 4.11 and Story 5.2 ("Build the island widget"), and **three** prose sites
declare Phase 5 = AC-040..046 while the YAML says AC-041..046.

This matters because **Phase 5 is optional and owner-gated**: a reader of the prose range
who declines Phase 5 loses `/accessibility` with it. Conversely, an executor building the
island reads Story 5.2 and believes publishing `/accessibility` is part of the widget.

**AC-043 (the drift gate) is also on the wrong story** — it belongs to Story 5.3 (*"The
precompile pipeline and the drift gate"*, whose stated ACs are only AC-041, AC-042) and is
listed under Story 5.2. The YAML's phase-level arithmetic is correct
(3+8+7+7+15+6 = 46 ✓); the prose mapping is not.

**Remediation.** Story 5.2 → (AC-045) + the new EC-9/EC-3 ACs from C-2; Story 5.3 →
(AC-041, AC-042, AC-043); strike AC-040 from Phase 5 at `:472`, `:692`, `:1081`.

---

### C-9 · MAJOR · Two VERIFY commands are mechanically wrong; one can never pass

**(a) AC-038** — `rebrand.criteria.md:187`:
`VERIFY: grep -rn "height:" _sass/ shows no fixed height on themed chip, badge, banner, or stat-row rules`

`grep "height:"` **matches `min-height:`, `max-height:`, and `line-height:`.** Story 4.9
**mandates** *"`min-height`, never `height`, on every themed chip/badge/banner/stat row"*
(`:633-634`). **The VERIFY flags exactly the rules the story requires the executor to
write.** Run verbatim, it can never pass.
*Fix:* `grep -rnE '(^|[^-[:alnum:]])height:[[:space:]]*[0-9]' _sass/` scoped to the themed
selectors, or assert `min-height` presence directly.

**(b) AC-041** — `rebrand.criteria.md:201`, which the plan itself calls *"the load-bearing
half"* of the Opal fence:
`VERIFY: grep -rL "Opal" _site confirms the island page is the only emitted page referencing the Opal artifact`

**`grep -rL` lists files that do NOT contain the match** — the complement of the intended
set. To assert *"the island page is the only page referencing Opal"* you need `grep -rl`
(lowercase) and an assertion that the result set **equals** `{island page}`. As written the
check enumerates every non-Opal page and confirms nothing.
*Fix:* `test "$(grep -rl 'Opal' _site)" = "_site/<island>/index.html"`.

---

### C-10 · MAJOR · The `--dnd-ink ~12.7:1` figure is wrong (10.43:1) — and on the background the plan actually proposes, it is 6.01–8.19:1

**Anchor:** `rebrand-plan.md:288`, `:574`, `:971`; `research-ui-a11y.md:89` vs `:143`.

First, the good news, stated plainly: **I recomputed all eight headline figures from
`_sass/_variables.scss` and every one is exact** — `--ff-gold` 1.96, `--ff-green` 1.94,
`--ff-purple-light` 2.24, `--ff-blue` 2.90, `--rarity-uncommon` 1.26, `--rarity-legendary`
2.32, `--dnd-brown` 4.46, `--ff-blue-dark` 5.12, pastels 1.22–1.73. That is genuine
evidence discipline.

But `--dnd-ink` is **not** 12.7:1. Trace it:

```
research-ui-a11y.md:89  | --dnd-ink   | #4e342e | 10.43 | 9.64 | 8.55 |   <- correct
research-ui-a11y.md:90  | --ink-color | #3a2921 | 12.73 | 11.77| 10.44|   <- 12.73 belongs HERE
research-ui-a11y.md:143 | "--dnd-ink #3a2921 at 12.7:1"                    <- source MISLABELS:
                                                        one token's NAME + another's HEX
```

**The research contradicts its own table**, and the plan **inherited the error unverified
and propagated it three times** — including into a Risks *mitigation* (`:971`): *"Ship
Story 3.1's badges with `--dnd-ink` text on pastel grounds — **legal at ~12.7:1 today**."*
On pastel grounds `--dnd-ink` computes to **6.01:1 (pastel-purple) – 8.19:1 (pastel-pink)**
— a background the research never measured at all (its columns are cream/light/parchment-dark).

The conclusion holds (6.01 > 4.5, so the badges are legal and the "no forward dependency"
mitigation stands — see §3.4). But on a plan whose rallying cry is *"**1.4.11 forbids
rounding**"* and *"misses AA by **0.04**"*, asserting a figure off by up to 6.7 points, for
a token it misidentified, on a background nobody measured, is a fidelity failure by the
plan's own standard.

**The pattern is diagnostic:** the numbers the plan took from the research's **table** are
exact; the numbers it took from the research's **prose** are wrong — 12.7 (should be 10.43),
"~12:1" (`research:152`, a third figure for the same thing), and "~15:1" for `#1eff00` on
obsidian, which requires essentially **pure black** (`#1eff00` tops out at 15.36:1 on
`#000000`; a realistic obsidian gives 10.36–12.73:1).

**Remediation.** Restate: *"`--dnd-ink` #4e342e — 10.43:1 on cream, 6.0–8.5:1 on the
pastels, ≥4.5 everywhere it is used."* Correct `research-ui-a11y.md:143` at source. Drop
"~15:1" (and see C-7 — that surface may not survive at all).

---

### C-11 · MODERATE · RC-2 is dropped, silently converting FORGE's *conditional* EC-8 discharge into an unconditional one; the handoff carries 2 of 8 RCs

**Anchor:** `:1155-1156` (`discharged_constraints: [EC-8]`, `reversal_conditions: [RC-7, RC-8]`);
`forge-opal-verdict.md:290`, `:323`.

Target 3 asks whether EC-8 is correctly discharged. **The discharge is right; the retention
is missing.** FORGE wrote: *"EC-8 … **[DISCHARGED]** → **re-check only on Ruby/Opal major
upgrade**"* and retained RC-2 as exactly that re-check. The plan mentions **RC-2 zero
times** and records the discharge flat.

Not academic: Phase 5 is sequenced **last**, behind Phase 1 and Phase 4 (~17d for Phase 4
alone). A Ruby or Opal major upgrade in that window is precisely RC-2's scenario, and
*"opal 1.8.3 verified healthy"* is a **point-in-time** fact the plan carries forward as
permanent.

Also: **RC-5** (Phase 1 stalls ⇒ EC-1 hardens to "no") and **RC-6** (one boundary breach ⇒
revert to Ruling 2) appear in the plan's prose — and are named as the primary mitigations
for RISK-1 and boundary erosion (`:957`, `:962`) — but are **absent from the
machine-readable handoff**. An executor consuming the YAML loses the plan's two most
load-bearing risk controls. (RC-4's omission is *safe*: dropping a relaxation makes the plan
stricter than FORGE. RC-1's retention clause is also dropped, minor.)

**Remediation.** `reversal_conditions: [RC-1, RC-2, RC-3, RC-5, RC-6, RC-7, RC-8]`;
`discharged_constraints: [{id: EC-8, conditional_on: RC-2, recheck: "major Ruby/Opal upgrade", verified_at: "opal 1.8.3, 2026-07-16"}]`.

---

### C-12 · MODERATE · The 10,147 B headroom is overstated by ~25–40% against AC-042's own definition — and it is RC-7 decision-relevant

**Anchor:** `forge-opal-verdict.md:287` (EC-7b: *"**Island page total JS** ≤ 150 KiB gz"*);
`rebrand.criteria.md:205` (AC-042 VERIFY: *"gzipped byte sum of **every script the island
page loads**"*); `rebrand-plan.md:965`, `:1049`, `:1157`.

The plan computes headroom as 153,600 − 143,453 = **10,147** — treating 150 KiB as an
**artifact** ceiling. But EC-7b and AC-042 both scope it to the **page total**, and the
island page also loads the site's chrome JS: `main.js` 809 B gz + `sigil-navigation.js`
1,480 B gz at minimum → real headroom ≈ **7,858 B**. If the island ships as the Laboratory
entry Story 5.4 specifies, `laboratory.js` (1,620 B gz) lands too → ≈ **6,238 B**.

Decision-relevant, not cosmetic: EC-7c prices one `require` at ~4,212 B. At 10,147 B a
second require looks comfortable; at 6,238 B it consumes nearly the whole budget and
**RC-7 fires**. Story 5.1 measures `opal-browser` *against this number*, and *"10,147 B to
spare"* is quoted **to the owner** in Open Decision 7 (`:1049`) as evidence the island is
*"viable… not a consolation prize."*

**Remediation.** Restate headroom as page-total-net (≈6.2–7.9 KB, depending on host page);
name the host page; re-price RC-7's trigger against the net figure.

---

### C-13 · MODERATE · A live 1.4.1 failure sits in 4b, falsifying 4a's completeness claim

**Anchor:** `:558-561` (4a definition), `:1002` (D17 tagged Phase **4a**), Story 4.4/AC-030
assigned **4b** (`:587-592`, `:1142`); `laboratory.html:68-70`.

The rarity chip is:
```html
<div class="item-rarity-indicator" data-rarity="legendary"></div>   <!-- empty -->
```
Rarity is conveyed by a 4px colour strip and **nothing else** — a **live WCAG 1.4.1 (Use of
Color) failure today**, not a latent one. So there are at least **two** live WCAG failures
(2.2.2 and 1.4.1), and 4a — defined as *"the measured failures… Closes **every** measured
defect and **the one** live WCAG failure"* — closes only one. D17 is tagged Phase **4a** in
the defect table while its remediation set spans AC-026 (4a) + AC-027 (4a) + **AC-030 (4b)**.

**Remediation.** Move Story 4.4's label half into 4a, or restate 4a's claim honestly
(*"closes the measured contrast failures and 2.2.2; 1.4.1 lands in 4b"*). Do not leave the
slice whose purpose is *not slipping* claiming a completeness it lacks.

---

### C-14 · MODERATE · Three unlogged defects in exactly the class D15/D19 enumerate

The plan's v0.2 pride is catching the no-JS defects. The same sweep, on the same evidence,
yields three more it missed:

**(a) The entire rarity system is a no-JS dead affordance.** `_laboratory.scss:569-585`
styles `.item-rarity-indicator.common/.rare/.epic/.legendary` (**classes**);
`laboratory.html:69` emits `data-rarity="…"` (an **attribute**); **no `[data-rarity]`
selector exists in `_sass/`.** The classes are added at runtime by `laboratory.js:19-28`.
**JS off → every rarity indicator is a transparent 4px strip.** Structurally identical to
D15 and D19.

**(b) `rarity: "uncommon"` is unreachable even with JS** — `laboratory.js`'s `else` branch
maps it to `.common` (see C-7a). Three projects affected.

**(c) `scroll-behavior: smooth` already exists at `_sass/_base.scss:13`**, sitewide and
**unguarded**. Story 2.7 proposes replacing `main.js:43-59`'s smooth scroll *"with CSS
`scroll-behavior`"* (`:457`, `:532`) — **the site already has both.** Neither the plan nor
FORGE (`forge-opal-verdict.md:588`) noticed. Unguarded `scroll-behavior: smooth` is itself
a motion defect, uncovered by the single guard at `_home.scss:505`.

**Remediation.** Log as D20/D21/D22. (a) and (b) are one-liners (`[data-rarity]` selectors
+ an `.uncommon` rule, or delete the dead token — see C-7). (c) folds into Story 4.5's
`--motionOK` work and belongs in Story 2.7's scope.

---

### C-15 · MODERATE · Story 2.7 lost its rationale when [DECISION-C] withdrew performance — and is un-gated motion work shipping two phases before the motion gate exists

**Anchor:** `:529-534` (Story 2.7, *"No mechanical AC — deliberately un-gated to avoid
ceremony"*); `:428-446` ([DECISION-C]'s justification table); `:448-458` (Ruling 2 targets).

[DECISION-C] justifies Ruling 2 on exactly three grounds: correctness (D15), a11y (D16),
SEO (AC-013). Map the seven Ruling 2 targets: filter → AC-013 (SEO ✓); TOC → AC-023
(D15 ✓); particles → AC-024 (D16 ✓); dark toggle → AC-025 (D19 ✓). The remaining three —
nav active-state, smooth scroll, fade-in — are **Story 2.7**, and they map to **no defect,
no AC, and none of DECISION-C's three grounds.**

Their only stated benefit is *"the JS surface shrinks to what genuinely needs it"* (`:530`)
— **byte reduction wearing a maintainability hat**, i.e. precisely the justification
[DECISION-C] withdrew. This is the one place the performance premise survives. (My grep for
speed framing found the plan otherwise **clean** — see §3.1 — so this is a *rationale* leak,
not a *framing* leak.)

Worse: 2.7's fade-in and `scroll-behavior` work is **motion work with no AC**, shipping in
Phase 2 — two phases before `--motionOK` exists (Story 4.5, Phase 4). *"Deliberately
un-gated to avoid ceremony on a cosmetic change"* is the wrong call for the one story that
touches motion without a motion criterion.

**Remediation.** Keep 2.7 — the Liquid `page.url` active-state is genuine correctness (it
fixes a JS-dependent nav state, a real no-JS defect). Re-justify it on correctness/no-JS
grounds; delete *"the JS surface shrinks"*; gate its motion half behind `--motionOK` or
sequence that half into Phase 4.

---

### C-16 · MODERATE · Four Phase 1 defects have no AC; Story 1.1 closes green while leaving them in place

**Anchor:** `:490` (Story 1.1 → *"AC-004, AC-005"*); `:1131` (Phase 1
`defects: [D1,D2,D3,D4,D6,D8,D9,D11,D12]`); `rebrand.criteria.md:13-23`.

Story 1.1 is *"Clean the mechanical defect backlog"* with **AC-004** (`jekyll build` exits
0) and **AC-005** (every local image reference resolves). Neither detects:

| Defect | Why AC-004/005 miss it |
|---|---|
| **D4** Font Awesome loaded twice (6.4.0 + 6.4.2) | build succeeds; no image reference |
| **D6** dead `comments: true` on 5 posts | build succeeds; front-matter only |
| **D11** `og:locale:alternate pt_BR`, zero PT-BR content | build succeeds; meta tag |
| **D12** `meta` keywords stuffing unbacked langs | build succeeds; meta tag |

An executor fixes the two image defects, passes both ACs, and ships four unfixed defects.
Same family as C-1: an AC a lazy executor satisfies while defeating the intent. (D9's fix
legitimately depends on Open Decision 2 — that one is correctly routed.)

**Remediation.** Add a Phase 1 AC per uncovered defect, or one AC enumerating the D-backlog
items closed in Phase 1 with a grep-level VERIFY each.

---

### C-17 · MINOR · The RS re-run is claimed but not recorded — state says `files_est: 20`, plan says `--files-est 32`

**Anchor:** `:124-125` and `:1180` (*"Right-size note (**re-run for v0.2**)… `--files-est 32`
→ full (score 7)"*); `rebrand.state.json:17-33`.

State holds **one** rightsize record: `files_est: **20**`, `override.at:
2026-07-16T14:39:47Z` — **identical to `created_at`**, i.e. the v0.1 run. No v0.2 re-run is
recorded. P0-2: *gates are run, not role-played.*

The **conclusion is robust** — the plan is correct that the files-est band saturates at ≥10,
so 20 and 32 both yield score 7 / `full`, which is exactly why this is MINOR rather than
blocking. But *"re-run"* in the Provenance & Gate Log is an assertion the audit trail does
not support.

Also `criteria_frozen_at` (14:51:54) predates the v0.2 amendment (16:32:42) while
`criteria_sha256` matches the **amended** file — the freeze timestamp does not correspond to
its own hash. (The hash itself verifies — see C-4.)

**Remediation.** Re-run `ramza-rightsize --files-est 32 …` and let it record, or restate as
*"not re-run; the v0.1 computation is unchanged because the band saturates."* Refresh
`criteria_frozen_at` on amend.

---

### C-18 · MINOR · The tier override's stated reason is now falsified and must be retired, not carried

**Anchor:** `rebrand.state.json:29-33`; `:124-134`, `:958`.

The override to `lite` is recorded with the reason *"full's single binding prerequisite —
an **independent** critic … remains structurally unavailable in this solo planning
session."* **That reason is now false.** `ramza-gate critic` has recorded
`author: ramza-author:job-ac6f42e7:v0.2` / `checker: ramza-critic:opus-4.8:rebrand-plan-v0.2-critique`,
and I verified the gate is real: a self-approval attempt returns
`DENY: maker!=checker violated`.

The override was **instrumental** — it existed solely to let the plan enter A without the
gate that would have blocked it, and the plan reached `phase: DONE` on it. That was
honestly recorded and defensible at the time. It is not defensible to carry now.

Note `ramza-lint` passed *"(tier: lite)"* — a **weaker** check than full's, which
additionally requires Rejected Alternatives and Risks. The plan includes both anyway, so it
would pass full's structural lint unchanged. **Retiring the override costs the plan nothing
structurally; it only restores the gate.**

**Remediation.** `ramza-rightsize --override full --reason "critic now available; v0.1/v0.2
override retired"`; re-run T; re-enter A only after the blocking fixes.

---

### C-19 · MINOR · AC-034's VERIFY tests more than its THEN asserts

**Anchor:** `rebrand.criteria.md:161-165`.

THEN: *"its maximum value SHALL be no more than 2.5 times its minimum value."*
VERIFY: *"asserts max/min <= 2.5 **and that the middle term carries a rem or px
component**."*

The middle-term requirement — the F94 `vw`-only trap the plan's own prose calls out
(`:344`: *"never a `vw`-only middle term, or you fail 1.4.4"*) — is in the VERIFY but
**not in the normative THEN**. An executor satisfying the THEN literally
(`clamp(2rem, 8vw, 5rem)` — ratio 2.5 ✓, vw-only middle ✗) meets the requirement and fails
the check. `ramza-ears-lint` cannot see this: it verifies a VERIFY *exists*, never that it
matches its THEN.

Related: **AC-031's THEN is disjunctive** (*"either complete within five seconds **or**
expose a visible pause control"*) — it encodes an undecided design choice as an acceptance
criterion, though the plan has already chosen the finite circle (`:594-598`). The linter
catches `" AND "`, never `" or "`.

**Remediation.** Split AC-034a (max ≤ 2.5× min) / AC-034b (middle term carries rem|px).
Collapse AC-031 to the chosen branch, with the pause control as a recorded fallback.

---

## 3. What I checked and found genuinely sound

A critique that finds nothing is a failed critique; so is one that manufactures findings.
These were probed adversarially and held.

**3.1 · The performance-honesty trap (target 4): CLEAN.** I grepped the full plan for
`speed|faster|fast|perf|lighter|lightweight|slim|snappy|quick`. **Zero residue.** All 17
hits are prohibitions (`:45`, `:428`, `:440`, `:442`, `:505`, `:516`, `:961`, `:1126`,
`:1168` — nine distinct normative sites), the `performance` rubric dimension (a score, not
a claim), the proper noun "minimal-fast" (RES-SITE §4's hypothesis name), or RISK-2's irony
row. Phase 2/3's JS reduction is **never** framed as a speed win anywhere. This is the plan
at its best and should not be touched. (The single leak is a *rationale* gap in Story 2.7 —
C-15 — not a framing residue.)

**3.2 · The 2.2.2 trap (target 5): the plan is RIGHT, and I verified it against the code.**
All three conditions hold on the homepage today:
- **auto-start** ✓ — `_home.scss:243,250,257`: `animation: rotate 40s linear infinite`
- **>5s / infinite** ✓ — `infinite`
- **parallel with other content** ✓ — `index.html:6-16` (circle) vs `:69-87`
  (`<h1>Henrique A. Lavezzo</h1>`, `<h2>Code Alchemist</h2>`, hero-description, social row)

`home.js` has **no** reduced-motion guard (grep → zero hits across 274 lines) — **D16
confirmed**. The CSS guard is exactly where the plan says (`_home.scss:505`). And the
plan's central claim — **AC-024 does not discharge 2.2.2; AC-031 does** — is **correct**:
2.2.2 requires a mechanism available to *everyone*, `prefers-reduced-motion` is
preference-honoring. I checked all 46 criteria: **no other AC quietly assumes otherwise.**
The plan states the trap three times and never violates it. The *scope* of the ACs is the
defect (C-6), not the reasoning.

**3.3 · [DECISION-B]'s reasoning (target 6): sound, not motivated.** I probed this
specifically for rationalization and did not find it. *"Blast radius is disjoint"*
(technical) and *"after the a11y work"* (attention) genuinely are claims about **different
constraints**, and *"attention does not parallelize"* is a real asymmetry, not a rhetorical
one — it is FORGE's own EC-1 argument applied one phase out, and it lands. Sequencing Phase
5 last is **more conservative** than FORGE's *"may ride alongside Phase 3,"* and the plan
preserves the disjointness note as a risk-containment fact (why Phase 5 is safe to cancel)
rather than discarding it. Careful and honest.

**3.4 · The Story 3.1 → Phase 4 soft forward-dependency: adequately mitigated.** Ship
badges with `--dnd-ink` text on pastel grounds and the forward dependency genuinely
disappears — I verified the contrast at **6.01–8.19:1**, comfortably clear of 4.5:1. The
quoted *number* is wrong (C-10); the mitigation it supports is **sound**.

**3.5 · The 4a/4b split is NOT papering over an oversized phase (target 6).** 4a = 5.5d
(Stories 4.1+4.2+4.5); 4b = 12.5d across 8 stories that are genuinely independent of one
another. 4a is a tight, coherent, independently-shippable slice. The defects are that 4a's
*claim* is false (C-13) and its only backstop is in 4b (C-1) — the boundary is drawn one
story short, not drawn dishonestly.

**3.6 · Scout coverage: zero silent drops.** All **45/45** `FINDING-0xx` ids are cited in
the plan.

**3.7 · Palette evidence fidelity: excellent where it counts.** 8/8 headline contrast
figures reproduce **exactly** from `_sass/_variables.scss`. `--dnd-brown` really does miss
by 0.04 (4.46 vs 4.5) and *"1.4.11 forbids rounding"* is the right call. `--ff-blue` really
does fail the 3:1 non-text bar at 2.90 and therefore genuinely cannot be a border, focus
ring, or icon. `--ff-blue-dark` #306d9a really is already in the repo at 5.12
(`_variables.scss:34`). The `-ink`/`-ornament` split is correctly reasoned and is, as the
plan says, the highest-leverage change available.

**3.8 · Opal per-file measurements: exact.** All 8 files reproduce byte-for-byte; raw total
33,596 ✓; the three-tier decomposition sums correctly (138,537 + 4,212 + 704 = 143,453 ✓);
96.6/2.9/0.49 ✓; 15.6 B gz/line ✓ (704/45); ~4.2 KB/require ✓; one require ≈ 270 lines ✓;
`--no-method-missing` = 4,028 B free ✓; source-map 3.5× ✓. Only the **total row** and its
derived ratio are wrong (C-5).

**3.9 · The 150 KiB ceiling: held correctly (target 3).** FORGE said do not raise. AC-042
encodes 153,600; the YAML records `raise: FORBIDDEN`; the plan removed the ceiling from Open
Decisions with FORGE's reasoning intact. Exactly right. The *headroom arithmetic* is the
issue (C-12), not the ceiling.

**3.10 · The freeze is valid.** `sha256(rebrand.criteria.md)` recomputes to
`7495bb01986563d5a6b78647bad83fe2c913eb0383f6e6eacf208a915d2d7c4c`, matching
`state.criteria_sha256`. The v0.1→v0.2 amendment is recorded with a reason and hash-chained.
No tamper evidence. (It is merely stored somewhere that will not survive — C-4.)

---

## 4. Per-dimension findings (`ramza-score --rubric refine`, cycle 1)

- **clarity (4/5)** — Unusually clear; the `traps` block and the three named DECISIONs are
  genuine craft. Held below 5 by concrete contradictions an executor hits on day one:
  AC-040 double-assigned across two phases (C-8), Phase 5's AC range stated two ways, and
  17.8×/18.25× asserted as two facts in one sentence when they are one ratio computed twice
  (C-5).
- **completeness (3/5)** — Passes the bar, barely. EC-3/EC-9 binding but un-AC'd (C-2);
  RC-2/RC-4 dropped and RC-5/RC-6 absent from the handoff (C-11); AC-026's background set
  omits both new surfaces the plan itself introduces (C-7b); 7 unguarded infinite
  animations unmodeled (C-6); three unlogged no-JS defects (C-14); four Phase 1 defects
  with no AC (C-16); **22 of 46 criteria not in the deliverable** (C-4).
- **actionability (3/5)** — Stories carry timeboxes, executor tiers, named files and line
  numbers, and specific techniques; genuinely strong. Held to 3 because an executor running
  AC-038 or AC-041 verbatim gets nonsense (C-9), Story 5.2's AC list is wrong (C-8), and
  Phase 4a's three central ACs are self-certifying (C-1).
- **efficiency (4/5)** — Ceremony is proportionate: six phases, an optional gated Phase 5, a
  disciplined deferred list, no gold-plating. The one real inefficiency is Story 4.4's
  obsidian surface — 1.5d whose premise is dead code and which drags an unbudgeted second
  ink palette (C-7).
- **testability (2/5) — FAILS the cycle-1 bar.** The decisive dimension. 22/46 ACs have no
  VERIFY in the artifact (C-4); three ACs are vacuously satisfiable (C-1); two VERIFY
  commands are mechanically broken, one unpassable (C-9); the plan's two motion ACs are
  homepage-scoped against a sitewide defect (C-6); EC-9/EC-3 untested (C-2); and the
  EC-2/EC-7d value floor — Phase 5's *entire* governing constraint — is unenforceable as
  written (C-3).

---

## 5. Prescriptions (ordered; this is what Refine consumes)

**Blocking — must clear before Assemble:**

1. **C-4** — Reproduce AC-001..AC-022 in EARS form inside the plan (or a repo-committed
   sibling); move the criteria file + state out of `/home/rynaro/.claude/jobs/ac6f42e7/tmp/`
   into the repo; re-freeze; repoint `:725`. *Highest leverage, ~30 minutes.*
2. **C-1** — Add the classification-binding AC to 4a; move AC-039's palette-unit-test half
   into 4a; add an AC requiring the written ornament/logotype/content classification to exist.
3. **C-2** — Add AC-047 (EC-9: island animation finite ≤5s, keyboard-operable, visible
   focus, no trap) and AC-048 (EC-3: `defer`, absent elsewhere).
4. **C-3** — Extend AC-046 to require the post to state what the widget does that justifies
   135 KiB; add an AC requiring Story 5.0's value-floor decision as a committed record.
5. **C-5** — Correct the site-JS figure to ≈11,028 B (per-file sum) with the method stated;
   restate the ratio as **13.0×**; delete 17.8×; fix `site_js_gz` in the YAML; fix
   `opal-measurement.md:26`; add the method requirement to AC-046's VERIFY.
6. **C-8** — Story 5.2 → (AC-045 + the C-2 ACs); Story 5.3 → (AC-041, AC-042, AC-043);
   strike AC-040 from Phase 5 at `:472`, `:692`, `:1081`.
7. **C-9** — Fix AC-038's grep (`min-height` false positive; currently unpassable) and
   AC-041's `grep -rL` → `grep -rl` + set equality.

**Should fix:**

8. **C-6** — Rescope AC-024/AC-031 sitewide; add the `grep -rn "infinite" _sass/` ×
   `--motionOK` cross-check.
9. **C-7** — Drop Story 4.4's obsidian surface or re-justify it as a want with its own
   light-ink palette, stories, ACs, and timebox; restate the near-tie as E5′ ⊃ E2 on the
   ratchet alone; rescore.
10. **C-10** — `--dnd-ink` = 10.43:1 on cream / 6.0–8.5:1 on pastels; fix all three sites;
    correct `research-ui-a11y.md:143` at source; drop "~15:1".
11. **C-11** — Restore RC-1..RC-8 to the handoff; make EC-8's discharge conditional on RC-2.
12. **C-12** — Restate headroom as page-total-net (≈6.2–7.9 KB); name the host page;
    re-price RC-7.
13. **C-13** — Move AC-030's label half into 4a, or restate 4a's completeness claim.
14. **C-14** — Log D20 (rarity no-JS dead affordance), D21 (`uncommon` unreachable), D22
    (`scroll-behavior` already present + unguarded).
15. **C-15** — Re-justify Story 2.7 on correctness; delete "the JS surface shrinks"; gate
    its motion half.
16. **C-16** — Add Phase 1 ACs for D4, D6, D11, D12.

**Housekeeping:**

17. **C-18** — Retire the tier override (its stated reason is now false); revert to
    `computed_tier: full`; re-run T with the critic record.
18. **C-17** — Re-run `ramza-rightsize` or restate the note honestly; refresh
    `criteria_frozen_at`.
19. **C-19** — Split AC-034a/AC-034b; collapse AC-031's disjunction to the chosen branch.

---

## 6. Verdict

# APPROVE-WITH-FIXES

**Blocking: C-1, C-2, C-3, C-4, C-5, C-8, C-9.**

Not REJECT. The strategy is sound, the doctrine is coherent and genuinely well-argued, the
FORGE absorption is faithful in substance, [DECISION-A] and [DECISION-B] survive adversarial
probing, the 2.2.2 reasoning is correct and verified against the code, the
performance-honesty discipline is exemplary, and 45/45 scout findings and 8/8 measured
contrast figures reproduce exactly. **This is a strong plan.** Every blocking defect lives
in the criteria layer, and every one is fixable in hours without touching the architecture.

The pattern across all 19 findings is singular and worth naming: **the plan's prose is
consistently more rigorous than its criteria.** Its doctrine says a rune that means
something loses its exemption — no AC enforces it. Its verdict says a token spinner is
forbidden — all six Phase 5 ACs admit one. FORGE changed EC-9 to inherit 2.2.2 — no AC
carries it. The plan reasons correctly and then fails to bind the reasoning to a gate. That
is exactly the failure mode `ramza-ears-lint`'s four grep-level checks cannot see, and
exactly the gap the critic gate exists to fill.

### Is 84.25 → VALIDATE calibrated?

**Over-stated.** Walking the dimensions against the evidence:

| Dim | Plan | Critic | Why |
|---|---:|---:|---|
| pattern_match | 85 | ~78 | Exemplars real and well-applied; but the E5⊃E2 dominance is a **borrowed** pattern that does not transfer (C-7), and the 12.7 figure is an **unverified inheritance** of a source error (C-10). |
| requirement_clarity | 88 | ~75 | AC-040 double-assigned; Phase 5's range stated two ways; story→AC map scrambled; VERIFY ≠ THEN; disjunctive AC-031. |
| decomposition_stability | 84 | ~79 | Decomposition genuinely stable and 4a/4b is sound — but 4a's completeness claim is false and its only backstop is in 4b. |
| constraint_compliance | 80 | ~68 | EC-3/EC-9 binding and unenforced; EC-2/EC-7d unenforceable; RC-2 dropped; handoff carries 2 of 8 RCs. Raised +2 in v0.2 for "EC-1..EC-13 folded verbatim" — they were folded into **prose**, not **criteria**. |

**≈75 → VALIDATE.** The *routing* was right; the *number* was optimistic by ~9 points, and
it lands nearer the COLLABORATE floor than the AUTO_PROCEED ceiling.

**The most important thing in this critique is why that gap existed.** The plan wrote
(`:889-892`):

> *"Honest read: it lands just below AUTO_PROCEED (85), and that is correct. The independent
> critic is still structurally unavailable… VALIDATE is the right verdict — the
> orchestrator's critique + ESL hop is the gate that should close it."*

The plan modeled the missing critic as **the last formality standing between it and 85** —
a gate that would *ratify*. The critic ran. It found seven blocking defects, three of which
(C-1, C-2, C-3) mean the plan's two highest-risk phases can be closed **green** while
defeating their intent, and one of which (C-4) means half its criteria are not in the
deliverable and are stored where they will not survive.

**The critic gate was not the thing between the plan and 85. It was the thing that revealed
the plan was below its own estimate.** A plan cannot score its own `constraint_compliance`,
because the failures are precisely the ones its author believes it has satisfied — the
author read "EC-1..EC-13 folded verbatim" and was *right about the prose*. Only a reader
walking the ECs against the **criteria** rather than the **narrative** finds the three that
stop at prose. That asymmetry is not a deficiency of the authoring instance; it is the
structural reason `ramza-gate critic` DENYs `author == checker`, and it is why the two
recorded overrides — however honestly reasoned, and they were honest — were load-bearing in
a way that could not be seen from inside.

The override should now be retired (C-18), the plan re-entered at **R**, and Assemble
re-attempted at `tier: full` with the blocking set cleared and this critic record in place.

---

*RAMZA — Critic Skill (maker≠checker). Read-only: no plan file, source file, or repository
file was modified. Writes: this critique, and the sanctioned gate records in
`rebrand.state.json` (`critic`, `gates[]`) + `ramza-calibration.jsonl`.*

*Deviation recorded: P0-3 places outputs under `.spectra/`. No `.spectra/` exists in this
repo; the plan and its entire evidence base live in `.claude/rebrand/`, and the mission
specified this path explicitly. Written where the artifact under critique lives — see C-4,
which is the same problem seen from the other side.*

---
---

# Second Pass — v0.3 Remediation Verification

**Scope:** the criteria layer only, per the author's request — a sound request, since the
12 new ACs each *assert* they bind EC-2/EC-3/EC-7d/EC-9 or the classification doctrine, and
that assertion is the exact class of claim that was false in v0.2. Strategy, doctrine, and
architecture were approved in pass one and are not re-litigated here.

**Checker:** `ramza-critic:opus-4.8:rebrand-plan-v0.2-critique` (unchanged; I did not author
v0.3). **Author:** `ramza-author:job-ac6f42e7:v0.2`. Maker≠checker holds.

## 1. Tool output

```
ramza-ears-lint rebrand.criteria.md  -> ok: 58 criteria pass   EXIT=0
ramza-ears-lint rebrand-plan.md      -> ok: 58 criteria pass   EXIT=0
sha256(rebrand.criteria.md)          == state.criteria_sha256  (3b332eef…) MATCH
```
```json
{"rubric":"refine","cycle":2,"total":4.2,"min":4,
 "dims":{"clarity":4,"completeness":4,"actionability":4,"efficiency":5,"testability":4},
 "verdict":"pass"}
{"rubric":"confidence","total":78,
 "dims":{"pattern_match":80,"requirement_clarity":80,"decomposition_stability":80,
         "constraint_compliance":72},"verdict":"VALIDATE","label":"critic-independent-v0.3"}
```

**Coverage audit (mechanical):** 58 defined · 58 assigned to a phase · **0 duplicated · 0
unassigned · 0 undefined** · every AC claimed by exactly one story. v0.2's structural
scrambling is gone.

## 2. Disposition of the seven blockers

### C-1 · Phase 4a vacuously satisfiable → **PARTIALLY CLEARED**

The mechanism is right and the sequencing fix is complete. **AC-049** binds the palette test
to *"the same release that ships the ink token split"*, and the YAML moves it into 4a via a
new Story 4.10a — 4a's acceptance is now `[AC-026, AC-027, AC-030, AC-031, AC-047, AC-048,
AC-049]`. The self-certifying slice no longer ships before its own backstop. **AC-047** binds
token *usage* to classification, which was the core of the finding: an executor can no longer
classify a token `-ornament` and then use it in a `color:` rule.

**But my attack still succeeds, by a new door — the two ACs speak different vocabularies.**

```
AC-048: classify every palette token as exactly one of  { ornament, logotype, content }
AC-047: that token SHALL resolve to an  -ink  classification rather than an  -ornament  one
AC-026: every palette token classified as  -ink  SHALL reach 4.5:1
```

AC-048's manifest **never assigns `-ink` to anything**. So:

1. **The `logotype` escape hatch.** Classify every token `logotype`. AC-048 passes (exactly
   one classification, zero unclassified). AC-047 passes — `logotype` is not `-ornament`, and
   *"rather than an `-ornament` one"* is the only thing it forbids. AC-026's `-ink` set is
   **empty** → passes vacuously. AC-049's test runs over an empty set → passes. **4a goes
   green with every token classified `logotype` and the site still illegible.** This is C-1
   verbatim, surviving.
2. **AC-047 is simultaneously too strict.** Its GIVEN sweeps in *any* token in a `color:`
   rule *"that renders text"* — with **no logotype exception**. The plan's own doctrine
   (`:284`) exempts the wordmark: *"circle, runes, and wordmark (exempt); add
   `--ff-gold-ink` … for gold text."* WCAG 1.4.3 exempts logotypes explicitly. Followed
   literally, AC-047 forces `--ff-gold` to `-ink` and **darkens the wordmark** — flattening
   the persona that persona-as-moat exists to protect.

Both defects have one root: a **binary predicate (`-ink`/`-ornament`) bolted onto a ternary
manifest (`ornament`/`logotype`/`content`)**, with no mapping between them.

**Fix (small, precise).** Make AC-048's manifest two-axis: `role ∈ {ornament, logotype,
content}` **and** `obligation ∈ {ink, exempt}`, with the rule `content → ink`,
`ornament|logotype → exempt`. Restate AC-047: *"GIVEN a palette token referenced by a CSS
`color`/`border-color`/`fill` rule that renders body text or a meaning-bearing boundary, and
that is not classified `logotype` / THEN it SHALL be classified `content` and resolve to an
`-ink` token."* Restate AC-026's quantifier as *"every token whose manifest role is
`content`"* — a set the executor cannot empty without failing AC-047.

### C-2 · EC-9/EC-3 unbound → **CLEARED** (with one residual)

**AC-052** binds EC-3 (`defer` + island-only) and its `grep -rl "transmutation-circle" _site
--include='*.html'` set-check is correct. **AC-051** binds EC-9's keyboard/focus/no-trap half.
**AC-050** binds EC-9①② (finite ≤5s, non-infinite iteration count).

**The v0.2 attack is now blocked:** a *CSS* infinite spinner fails AC-050's
`grep -n "infinite"`.

**Residual — AC-050 repeats the scoping error one level down, in a milder form.** Its VERIFY
is *implementation-specific*: it greps for the CSS keyword `infinite` and asks the animation
to *"declare a finite duration."* The island is an **Opal/JS widget**; the measurement
record's own probe describes *"arrow-key rotation … an `innerHTML` render."* A
`requestAnimationFrame` loop contains no string `infinite` and *declares* no duration —
it would pass AC-050 while spinning forever. Same shape as the v0.2 finding (the check
matches an implementation, not the behaviour), one level down — but far narrower, and the
plan's intended design (*"inscribe → flare → settle"*) is CSS.
*Fix:* add a behavioural clause — *"a headless run of the island page records zero
transform or style mutation on the circle between t=5s and t=15s with no user input."*

*Nits:* AC-052's THEN is **compound** (`defer` **and** island-only — two assertions; the
linter only catches uppercase `" AND "`). AC-051's VERIFY tests no-focus-trap, which its THEN
never asserts — the same VERIFY>THEN pattern the author correctly fixed at AC-034/AC-058 and
reintroduced here.

### C-3 · Token-spinner prohibition unenforceable → **CLEARED, with an honest caveat about my own mechanism**

**AC-053** is exactly right and genuinely mechanical: *"a committed decision record states
the value-floor verdict with a date, and its commit timestamp precedes the first commit
touching `_opal/`"* — checkable from git history alone. **AC-046** implements my wording
verbatim.

**Does it exclude a token spinner? No — and it cannot.** The coordinator's suspicion is
correct: AC-046 requires *prose about* the value floor, not a passing grade on it. An owner
can write *"it spins a circle, it's pretty, I think that's worth it"*; the paragraph exists;
the AC passes. The VERIFY's second clause — *"a reviewer can answer 'would someone visit this
for its own sake?' from that paragraph alone"* — requires only that the question be
**answerable**, not that the answer be **yes**.

**That limitation is mine, not the author's.** I designed this mechanism and it is social,
not mechanical: it raises the cost of shipping a token spinner (you must publish a
justification your own audience reads) without forbidding it. EC-7d is irreducibly
subjective — *"is this worth 135 KiB"* has no machine-checkable answer — so forcing the
decision to be **made and recorded before work starts** (AC-053) and **published where it
can embarrass** (AC-046) is the maximum available mechanization. The author implemented what
I asked for, correctly.

*One hole worth closing:* AC-053 is satisfied by a record stating **"no-go"** followed by
building the island anyway. *Fix:* *"GIVEN island source exists in `_opal/` / THEN the
committed value-floor record SHALL state a **go** verdict dated before the first `_opal/`
commit."*

### C-4 · 22/46 ACs absent; criteria in a transient sandbox → **CLEARED** (one cosmetic defect)

I did not take the claim — I diffed it.

```
plan-inlined AC blocks : 58        criteria-file AC blocks : 58
AC bodies, normalised  : IDENTICAL — zero normative drift
sha256(criteria)       == state.criteria_sha256 (3b332eef…) MATCH
```

Every GIVEN/WHEN/THEN/VERIFY in the plan matches the frozen criteria file exactly. Criteria,
state, and calibration log now live in `.claude/rebrand/`. Nothing normative remains only in
the job temp dir (the copy there is a stale v0.2 artifact).

**One defect the diff surfaced:** every one of the **58 inlined headings reads
`· **Phase ?**`** — an unresolved generator placeholder, 58/58, zero resolved. The AC section
is the natural reading surface for an executor and it advertises no phase for any criterion.
Recoverable (the map is in the roadmap table and YAML), so cosmetic rather than blocking —
but it degrades precisely the executability C-4 was about. *Fix:* resolve the placeholder or
delete it.

### C-5 · Retracted figures → **CLEARED, and better than I prescribed**

The residual hits for `7,862` / `17.8` / `18.25` are **all retractions, not assertions** —
the changelog, DECISION-C's error narrative, a prohibition on the post's publication path
(`:624`), the traps list, and an explicit YAML block:

```yaml
site_js_gz_sum_8_files: 11028      # each gzipped separately, as served
site_js_gz_heaviest_page: 4778     # home = main.js + sigil-navigation.js + home.js
ratio_vs_heaviest_page: 30.0
ratio_vs_8_file_sum: 13.0
RETRACTED: {site_js_gz: 7862, ratios: [17.8, 18.25], reason: "concatenated gzip …"}
```

Keeping the wrong numbers **as retractions** is the right call — purging them would erase the
provenance. I verified `2,289 + 2,489 = 4,778` and both ratios (`30.02`, `13.01`)
independently.

**The upstream record also caught something I missed:** `gzip -c FILE` embeds the filename and
mtime, so the total drifts with the temp file's name (7,862 vs 7,857 vs my 7,852). That is a
better explanation of my own measurement discrepancy than I gave, and it makes the original
figure *non-reproducible* — a sharper indictment than "wrong methodology."

**One residual, upstream, not the plan's:** `opal-measurement.md:35` states the layout loads
*"plus **one** page-specific file"* and lists `about = 3,347`. **About loads two** —
`about.html:285` `exp-bar.js` **and** `:286` `about.js` → **4,113 B**, not 3,347. The
headline is unaffected (home at 4,778 is still heaviest; 30.0× stands), but the About row is
wrong by 766 B and the "one file" framing is false for that page.

### C-8 · Story→AC map scrambled; AC-040 double-assigned → **CLEARED**

AC-040 is Phase 4 only — Story 4.11 (`:574`), Phase 4's YAML acceptance, and **absent from
Phase 5's** (`[AC-041..046, 050, 051, 052, 053]`). `:1131` states it explicitly: *"declining
Phase 5 cannot drop it."* Story 5.2 → (AC-045, AC-050, AC-051); Story 5.3 → (AC-041, AC-042,
AC-043, AC-052). Prose and YAML agree. Coverage audit: zero duplicates across all six phases.

### C-9 · Broken VERIFYs → **CLEARED** (I executed both)

**AC-038 — fixed, and I ran it.** The new regex
`grep -rnE '(^|[^-[:alnum:]])height:[[:space:]]*[0-9]'` correctly excludes `min-height`,
`max-height`, `line-height`, and `height: auto`. Against a fixture and against the real
`_sass/`: **120 hits, 0 false positives.** The v0.2 version flagged every `min-height` — the
very rules Story 4.9 mandates — and was unpassable. It now passes.
*Nit:* the VERIFY says *"zero hits **within themed chip/badge/banner/stat-row rule blocks**"*,
but grep is line-based and cannot know block membership; the executor triages 120 hits by
hand. Workable, not fully mechanical.

**AC-041 — `-rL` → `-rl` fixed**, with `--include`, `sort`, `tr`, and a real set-equality
`test`. Exactly the prescription.
*Residual:* the check is scoped `--include='*.html'` and greps for the literal `Opal` — but
Story 5.3 commits the artifact to `assets/js/`, so the island page references it as
`<script src=".../transmutation-circle.js">` and **no HTML page contains the string
`Opal`**. The set comes back empty, ≠ the expected path, and **AC-041 fails on a correct
implementation.** Fail-closed (it blocks a good build rather than passing a bad one), and
AC-052 covers the fencing properly — so the *constraint* is protected. But AC-041's VERIFY
does not inspect where Opal bytes actually live. *Fix:* grep the emitted `.js` payloads, or
match the script-src reference as AC-052 does.

### C-16 · Phase 1 defects unbound → **PARTIALLY CLEARED** (I ran all four)

| AC | Defect | Verdict |
|---|---|---|
| **AC-054** | D4 Font Awesome ×2 | **CLEARED** — pattern yields exactly 2 version strings today (`6.4.0`, `6.4.2`); 1 after fix. Detects the defect. |
| **AC-055** | D6 dead `comments:` | **CLEARED** — `grep -rn "^comments:" _posts/` → 6 matches today. *(Note: the defect table says "5 posts"; there are **6** — five `true` plus one `comments: false`. The AC is more correct than the backlog.)* |
| **AC-056** | D11 `pt_BR` | **CLEARED** — `meta.html:18` confirmed. |
| **AC-057** | D12 keyword stuffing | **NOT CLEARED — a new vacuous quantifier.** |

**AC-057 fails on both clauses.**

*Clause 1* — *"every language named in the emitted meta keywords appears in
`_data/character_build.yml`"* — **names the wrong file.** `character_build.yml` contains
**zero** language names (I grepped: 0 hits for ruby/rails/javascript/golang/crystal/python/
rust). The languages live in **`_data/skills.yml`** (`categories → "Programming Languages"`:
Ruby, Elixir, JavaScript, Clojure). Read strictly, the clause can never pass; and it is given
no command, so it is not mechanized at all.

*Clause 2* — `grep -rn "golang, crystal, python, rust" _site` — is a **literal match on one
exact comma-separated sequence**. I attacked it:

```
attack: reorder the same 4 languages  -> AC-057 PASSES; unbacked langs still advertised: [golang, crystal, python, rust]
attack: add one space                 -> AC-057 PASSES; unbacked langs still advertised: [golang, crystal, python, rust]
attack: drop one word (rust)          -> AC-057 PASSES; unbacked langs still advertised: [golang, crystal, python]
```

**Reordering the same four words — changing nothing about the defect — makes the AC pass.**
This is the C-1 pattern in a new flavour: rather than quantifying over an executor-defined
*set*, it quantifies over an executor-defined *string literal*. The executor still controls
the thing the AC tests.

*Fix:* *"THEN every programming language named in the emitted meta keywords SHALL appear in
the skills data / VERIFY: a script extracts language tokens from the emitted
`<meta name="keywords">` and asserts each is a member of the set built from `_data/skills.yml`
categories["Programming Languages"].skills[].name; zero unbacked languages remain."*
(Worth noting: the real data shows **Elixir and Clojure are backed but never advertised** —
the mirror-image gap D12 never mentions.)

## 3. New finding — REGRESSION

### R-1 · BLOCKING · **EC-13 lost its criterion.** AC-046's rewrite substituted where my prescription said extend.

```
v0.2 AC-046: THEN the island SHALL ship together with a `type: transmutation` post
             RECORDING THE ARTIFACT'S MEASURED GZIPPED SIZE AND ITS RUNTIME/REQUIRE/
             APP-CODE TIER DECOMPOSITION
             VERIFY: … states the final measured gz bytes plus the three-tier percentages

v0.3 AC-046: THEN … a `type: transmutation` post stating, in the owner's own words, what
             the widget does that justifies 135 KiB of runtime to a reader
             VERIFY: … an explicit value-floor paragraph …
```

The measurement-publication requirement **was not extended — it was overwritten.** I grepped
all 58 criteria: **no AC requires the post to state the artifact's measured bytes or the tier
decomposition.** (The only `measured gz` hits are AC-044, the *require manifest* — a different
artifact.)

Meanwhile the plan **still lists EC-13 in `acceptance_constraints`** (`:1185`) and Story 5.4
still asserts it in prose (`:617`: *"Spine: the **re-measured** artifact [EC-13 — 143,453 is a
proxy] and its decomposition"*).

**EC-13 is now in exactly the state C-2 condemned: declared binding, asserted in story prose,
bound by no criterion.** The author fixed C-2 for EC-3/EC-9 and reproduced it for EC-13 in the
same revision — via my own prescription, which said *"Extend AC-046"* and was read as
*replace*. I take part of the blame for the wording; the defect is real regardless.

**It compounds C-5.** The v0.3 remediation routes the corrected figures to publication through
the post (`:624`: *"the post must not publish 7,862 B or 17.8×; the honest figures are 11,028,
4,778, 30.0×/13.0×"*) — but with EC-13's AC gone, **no criterion requires the post to publish
any figure at all.** C-5's publication-path guard was supposed to ride AC-046's VERIFY. It now
rides prose. The plan's own headline — *"the post is the product,"* *"96.6/2.9/0.49 is the
most interesting sentence in this deliberation"* — is ungated.

*Fix (trivial):* keep AC-046 as the value floor; add **AC-059** (EC-13): *"THEN the post SHALL
state the shipped artifact's re-measured gzipped size and its runtime/require/app-code tier
decomposition / VERIFY: the post states final measured gz bytes matching AC-042's CI-measured
sum, the three-tier percentages, the per-file-sum method for the site-JS baseline, and none of
the retracted figures (7,862 / 7.9 KB / 17.8× / 18.25×)."*

## 4. Adjudicating the author's two corrections to me

### It rejected my C-18 remediation — **it was right, and my prescription was destructive**

I tested it rather than conceding on argument.

```
ramza-rightsize --override full … --state <v0.2 state>            -> DENY: "state file exists (use --force)"  [inert]
ramza-rightsize --override full … --state <v0.2 state> --force
  BEFORE: critic=ramza-critic:opus-4.8:…  gates=14  amendments=1  scope=25  sha=7495bb01…
  AFTER : critic=null                     gates=0   amendments=0  scope=0   sha=null
```

My C-18 prescribed `ramza-rightsize --override full --reason "…"`. **As literally written it
is inert** — the tool DENYs on an existing state file. **The only way to execute it is
`--force`, and `--force` re-initialises from scratch** (`ramza-rightsize:77-99`,
`jq -n … gates: [], amendments: [], critic: {author: null, checker: null}`), wiping the critic
record, all 14 gates, the amendment chain, the declared scope, and the freeze hash.

**My remediation would have destroyed the critic record I had just written** — the evidence of
its own execution — and violated P0-5 (*bi-temporal: write-new, never hard-delete*) in the
course of enforcing P0-2. The author preserved v0.2 as `rebrand-v0.2.state.json` (tier lite,
phase DONE, critic intact, 14 gates) and opened a clean v0.3 state: **`tier: full`,
`rightsize.override: null`, critic carried forward, `criteria_sha256` repointed.**

That achieves **everything C-18 asked for** — override retired, computed tier restored, gate
re-armed — **while destroying nothing.** Its judgment was better than mine. Plainly: I was
wrong, and the correct fix is the one it chose.

### It says I understated C-6 — **correct: D16 is a five-file defect, not two**

```
files injecting animated nodes with NO matchMedia guard:
  about.js       3 injection sites, 0 guards   (:110 `orbit ${8+index*2}s linear infinite`)
  home.js        1 injection site,  0 guards
  laboratory.js  3 injection sites, 0 guards
  letter.js      1 injection site,  0 guards
  notebook.js    4 injection sites, 0 guards
  --> 5 files, 12 injection sites, ZERO reduced-motion guards anywhere
```

My C-6 found `laboratory.js:12` and generalized from that single example. The true JS half is
**five files and twelve injection sites.** My finding was incomplete — I under-counted by
three files and eight sites. Combined with the seven unguarded CSS animations I did find, D16
is substantially larger than either v0.2's framing (*"home.js has no guard"*) or mine.

**And v0.3's AC-024 now covers it correctly** — *"headless run … over Home, About, Notebook,
Laboratory, and Letter asserts zero script-injected animated nodes; `grep -rn "style.animation"
assets/js/` shows every injection site behind a `matchMedia` guard."* That is better than my
own prescription. AC-031 likewise now greps `_sass/ assets/js/` against a `--motionOK` gate.
**C-6: CLEARED, and the author's version of the finding is the correct one.**

### It says I missed `pastel-mint` in C-10 — **correct, and the irony is exact**

```
purple 6.01 | blue 6.77 | lavender 8.10 | pink 8.19 | mint 8.54
--> true range: 6.01 – 8.54   (max is MINT)
--> C-10 said: 6.01 – 8.19
```

My C-10's entire thesis was that the author cited a contrast figure without recomputing it.
**My own script printed `pastel-mint 8.54` and I read the range off the wrong row.** I cited a
range without reading my own output. The author is right; the range is **6.01–8.54:1**, and
v0.3 states it correctly (`:1248`). The conclusion is unchanged (6.01 ≫ 4.5), which is exactly
what I said about *its* error — and the symmetry is the point: **this is a failure mode of
readers, not of authors, which is why the gate is a second reader and not a better author.**

Both corrections accepted without reservation. A critic that cannot take a correction is not a
critic.

## 5. Calibration — is 78 right? Is `constraint_compliance` 70 honest?

**That dimension is mine to score, so I scored it through the tool rather than in prose.**

| Dim | Author v0.3 | Critic v0.3 | Note |
|---|---:|---:|---|
| pattern_match | 80 | **80** | Agree. The borrowed dominance is retired, not re-argued; E5′ rescored 87.0 via tool; the inherited `12.7` corrected *and its source identified*. |
| requirement_clarity | 82 | **80** | −2: all **58** AC headings read `Phase ?`. A defect in the executor's primary reading surface, unnoticed by the author. |
| decomposition_stability | 80 | **80** | Agree, and the author's reasoning is better than mine would have been: *"4a's boundary moved twice in one revision — a slice whose definition shifts under scrutiny is not yet stable."* Correct and self-critical. |
| constraint_compliance | 70 | **72** | +2. Genuinely bound now: EC-3 (AC-052), EC-9 keyboard (AC-051), EC-7d (AC-046+053), EC-8 conditional on RC-2, RC-1..RC-8 on the handoff — and I *executed* AC-038/041/054/055/056 rather than reading them. Held to 72 by two live holes: **EC-13 regressed to unbound (R-1)** and **AC-047/048's vocabulary gap reopens C-1**. |

```
{"rubric":"confidence","total":78.0,"verdict":"VALIDATE","label":"critic-independent-v0.3"}
```

**78 is calibrated.** I reach the identical total by a different route — docking clarity for
the placeholder and adding to constraint_compliance for real binding. Two independent readers
landing on 78.0 from different dimension vectors is itself calibration evidence.

**`constraint_compliance` 70 is honest — very slightly conservative, not too high.** The
author's instinct to hold it down was right for the right reason, and it guessed within 2
points of an independent score. Its stated rationale — *"I cannot score this dimension for
myself; that is the whole lesson"* — is the correct epistemics, and R-1 vindicates it
concretely: **it shipped a regression on exactly this dimension while believing it had fixed
it.** That is not a failure of care. It is the structural fact the gate exists for.

`refine` cycle 2 returns **pass** (`min: 4`, total 4.2). The artifact no longer needs another
full refine cycle — it needs three surgical edits.

## 6. Verdict

# APPROVE-WITH-FIXES

**Blocking (three; each ~15 minutes, all mechanically checkable):**

1. **R-1 — restore EC-13.** Add AC-059 requiring the post to state the re-measured gz bytes +
   tier decomposition + the per-file-sum method, and to contain none of the retracted figures.
   AC-046 keeps the value floor. *This is the one that must not ship — it is C-2's defect
   reintroduced, on the constraint FORGE added as NEW, in the plan's own flagship deliverable.*
2. **C-1 residual — reconcile AC-047/AC-048's vocabularies.** Two-axis manifest
   (`role` + `obligation`); close the `logotype` escape hatch; add the logotype exception so
   AC-047 stops mandating a darkened wordmark; repoint AC-026's quantifier at `role == content`.
3. **C-16 residual — rewrite AC-057.** Point it at `_data/skills.yml` (not
   `character_build.yml`, which has no languages) and make it a set-inclusion check, not a
   literal-string match defeatable by reordering.

**Non-blocking residuals** (record; fix at leisure): the `Phase ?` placeholder on all 58
headings; AC-041's VERIFY scoped to `*.html` where Opal bytes live in `.js` (fail-closed,
covered by AC-052); AC-050's CSS-only VERIFY vs a possible `requestAnimationFrame` loop;
AC-052's compound THEN; AC-051's VERIFY>THEN; AC-053 passing on "no-go + build anyway";
D6's backlog count (6 posts, not 5); and upstream, `opal-measurement.md:35`'s About row
(4,113 B — About loads `exp-bar.js` **and** `about.js`, not "one page-specific file").

**Is the criteria layer executor-ready?** **Not quite — but it is one short pass away, and it
does not need a third full critique.** Fix the three blockers and it is ready; they are
surgical, named, and verifiable in minutes. A targeted re-check of three ACs is warranted —
not another full pass, and emphatically not another rewrite. Six of seven original blockers are
genuinely cleared, several by fixes I verified **by execution** rather than by reading, and two
of the fixes (AC-024's five-file scope, the state-preservation strategy) are **better than what
I prescribed**.

**What this pass demonstrates, stated plainly.** The v0.2 diagnosis — *the plan's prose is
consistently more rigorous than its criteria* — held under remediation: R-1 is that exact
failure, committed while fixing that exact failure, by an author who had accepted the
diagnosis in full and was watching for it. That is not carelessness; it is what makes the
maker≠checker gate structural rather than procedural. Equally, this pass found **two of my
own findings incomplete and one of my prescriptions destructive** — caught by the author, not
by me. The gate runs in both directions, and it did.

---

*RAMZA — Critic Skill (maker≠checker), second pass. Read-only: no plan, criteria, source, or
repository file was modified. Writes: this section, and the sanctioned gate records in
`.claude/rebrand/rebrand.state.json` + `ramza-calibration.jsonl`.*

---
---

# Third Pass — v0.4 Targeted Re-check

**Scope, honored:** five ACs — AC-026, AC-047, AC-048, AC-057, AC-059 — plus spot-checks and
the `--ff-gold` revision. Architecture, doctrine, strategy, and DECISION-A/B/C were cleared in
pass one and are not reopened. **Checker:** `ramza-critic:opus-4.8` (did not author v0.4).

```
ramza-ears-lint rebrand.criteria.md -> ok: 59 criteria pass  EXIT=0
sha256(criteria) == state.criteria_sha256 (393f1e59…)        MATCH
amendments: 2 — second reads "v0.4 self-caught defect: AC-059's VERIFY demanded bytes equa…"
AC heading phase spread: 0→3 · 1→12 · 2→7 · 3→7 · 4a→7 · 4b→12 · 5→11  = 59
```

## The five

### AC-026 — **BINDS**
`THEN every palette token whose manifest role is content SHALL reach ≥4.5:1 against each
declared background it is used on`. Repointed off `-ink` onto `role == content`. Two things
make it bind: the **anti-vacuity clause** (*"the test fails if the `content` set is empty"*)
and the **(token, background) pair** enumeration across a declared set that now includes the
hero gradient stops `#211C30`/`#312A45`. The pair formulation has a property the author may
not have set out to buy: **classification is per-token but testing is per-pair**, so a single
body-text usage anywhere drags a token into `content` and then tests *every* background it
touches — including its heading backgrounds.

### AC-047 — **BINDS**
Gains the logotype exception (`and whose manifest role is not logotype`) and now requires
`role content` **with** `obligation ink`. The inverse defect I raised — AC-047 mandating a
darkened wordmark — is gone.

### AC-048 — **BINDS**
Two-axis (`role` × `obligation`), biconditional (`content ⇔ ink`), and — the load-bearing
part — the `logotype` hatch is closed **by usage**: *"every `logotype`-role token is
referenced only by rules inside the wordmark selector set (`.hero-subtitle` in `_home.scss`
and `_about.scss`) and by no rule that renders body text."* I verified that selector set is
exactly right: `_home.scss:88-91` and `_about.scss:66-69` are where `color: var(--ff-gold)`
lives on the wordmark.

**I re-ran my own exploits rather than taking the claim:**

```
attack: classify EVERYTHING logotype (my v0.3 exploit)
   AC-048 FAIL (logotype tokens used outside wordmark) · AC-026 FAIL (content set empty)  -> BLOCKED
attack: classify EVERYTHING ornament (my v0.2 exploit)
   AC-026 FAIL (anti-vacuity) · AC-047 FAIL                                                -> BLOCKED
attack: sneak ONE token to logotype to keep gold on the wordmark
   AC-048 FAIL · AC-026 FAIL · AC-047 FAIL                                                 -> BLOCKED
```

Both prior doors are shut, each by two independent clauses. **Double closure is real.**

**Third door, hunted and found — but not live.** AC-047's GIVEN says *"renders **body text**"*,
and WCAG 1.4.3 binds *all* text (4.5:1 normal, 3:1 large), not just body text. A token used
**only** on headings could in principle be called `ornament`, escape AC-047's GIVEN, and never
enter AC-026's `content` set. I swept the repo for it. It does not open:

```
--dnd-brown (4.46:1 — "misses AA by 0.04") also colours  _post.scss:725 .article-content th
                                                          _letter.scss:510 .form-label
                                                          _post.scss:502 .article-content h6
--ff-gold   (1.96:1 on cream)              also colours  _about.scss:442 .highlight
                                                          _about.scss:603 .attribute-value
```

Every themed token that colours a heading **also** colours body prose, which forces it to
`content` and drags all its pairs — heading backgrounds included — into AC-026. The door only
reopens if someone deliberately mints a heading-only token, and AC-039's axe ratchet catches
that in 4b. **Non-blocking; one-word fix available** (`body text` → `text of any size`). The
author disclosed this residual itself.

### AC-057 — **BINDS** (executed, not read)

```
backed set L from _data/skills.yml = ['clojure','elixir','javascript','ruby']
TODAY'S REAL KEYWORDS      -> unbacked: ['golang','crystal','python','rust']   (author's claim: MATCH)
attack reorder   -> detected ['crystal','golang','python','rust']  => FAILS (defect caught)
attack add space -> detected ['golang','crystal','python','rust']  => FAILS (defect caught)
attack drop word -> detected ['golang','crystal','python']         => FAILS (defect caught)
corrected keywords                                                  => PASSES
```

All three attacks that **v0.3 passed** now correctly fail. The author's claim to have verified
by execution before writing checks out. *Bounded residual, disclosed in the AC itself:* the
lexicon `V` is a pinned allowlist, so a language outside it (e.g. `lua`, `zig`) would escape —
but "detect any programming language" is not mechanizable without a lexicon, so this is the
correct mechanization, not a gap.

### AC-059 — **BINDS**, and the self-caught defect is genuinely repaired

The EC-7d / EC-13 split is clean and neither has fallen back to prose: **AC-046** = the value
floor (*worth it?*), **AC-059** = measured-and-published (*EC-13*). Both sit in Phase 5's
acceptance list `[AC-041…AC-046, AC-050…AC-053, AC-059]`.

The self-reported defect — VERIFY demanding AC-042's **page sum** while THEN required the
**artifact's** size — is fixed and **coherent**: THEN says *"the shipped island artifact's
re-measured gzipped size"*; VERIFY says *"the artifact's own component of the CI measurement
AC-042 performs on the island page **(the artifact figure, not the page total — the two differ
by the page's other scripts)**"*. Same quantity in both, with the distinction made explicit
rather than left to inference. It also carries C-5's publication guard mechanically:
`grep -nE "7,?862|7\.9 ?KB|17\.8|18\.25" <post>` returns zero. **R-1 is closed.**

That the defect was caught by adversarially re-reading a just-written fix, re-amended (second
freeze link), and **recorded rather than hidden**, is the discipline working — not the defect
class recurring. The distinction matters: v0.2 and v0.3's instances shipped; this one didn't.

## The `--ff-gold` revision — **verified correct, and it tightens**

This was the one that could have loosened an obligation. It does the opposite.

```
_home.scss:23   background: linear-gradient(135deg, #211C30, #312A45)   <- the gradient is real
--ff-gold #e6a553 vs #211C30 = 7.75:1      vs #312A45 = 6.38:1          <- author's 6.38-7.75: EXACT
--ff-gold #e6a553 vs cream   = 1.96:1                                    <- D17's figure, also correct
```

Both readings were right about different pairs. The hero subtitle's gold sits on the **dark
gradient at 6.38–7.75:1 and passes 4.5:1 on merit** — it does not even need the logotype
exemption, which is why the exception is narrow rather than a blanket pass. And the real
failure is where the author says it is: **`.highlight` at `_about.scss:441-442`** —
`color: var(--ff-gold)`, `display: inline-block`, inline emphasis inside About's prose, on a
light ground at **1.96:1**. A live 1.4.3 content failure that the token-level view ("gold is
1.96") would have conflated with the hero.

The obligation is genuinely per **(token, background)** pair, AC-026 now enumerates exactly
that, and the conclusion is **stricter**, not looser: `--ff-gold` is forced to `content` by
`.highlight`, and then fails AC-026 on the `light` pair — caught.

## Spot-checks (all confirmed)

`Phase ?` gone from all 59 headings (the 5 remaining hits are narrative references to the fix)
· **AC-041** repointed at referenced `.js` payloads — *"the check inspects the referenced `.js`
payloads, not the HTML text"* · **AC-050** gains the behavioural clause and names my loophole:
*"the behavioural clause governs, so a `requestAnimationFrame` loop that declares no duration
still fails"* · **AC-051** THEN now asserts what its VERIFY tests · **AC-052** single THEN ·
**AC-053** requires a dated **`go`** verdict and states *"a `no-go` record followed by any
`_opal/` commit fails"* · D6 = 6 posts · About = 4,113 B.

Every non-blocking residual I recorded in pass two is closed.

## Calibration

| Dim | Author v0.4 | Critic v0.4 | Note |
|---|---:|---:|---|
| pattern_match | 80 | **82** | The per-(token, background) insight is original, correct, and found a live defect (`.highlight`) the token-level view hid. |
| requirement_clarity | 84 | **84** | Agree. Placeholder resolved, 4a/4b broken out in the headings, AC-059's quantity disambiguated in-line. |
| decomposition_stability | 81 | **82** | The 4a/4b boundary held across a third revision — which is the evidence of stability that was missing at v0.3, when it moved twice. |
| constraint_compliance | 75 | **78** | Both v0.3 holes closed and I verified the closure **by execution**: triple-blocked exploits, AC-057 run against the real data, AC-059 coherent. Held to 78 by the dormant `body text` wording, the pinned lexicon, and AC-046's irreducibly social floor. |

```
{"rubric":"confidence","total":81.5,"verdict":"VALIDATE","label":"critic-independent-v0.4"}
```

**Is 75 honest? No — it is now under-scored by 3, and its stated reason has expired.** The
author held it at 75 because *"no independent reader has confirmed v0.4"* and because *"my
prior on this dimension is two consecutive false beliefs."* An independent reader has now
confirmed it, and **the prior — justified twice — is over-corrected here.** The two failures
it was built on are both fixed, and I verified the fixes rather than accepting them. Scoring
yourself down for a history you have since remediated is the mirror of scoring yourself up for
prose you mistook for criteria: still not a self-scorable dimension, now erring the other way.
**That is precisely why the dimension is the critic's, and it cuts both directions.**

My total lands at **81.5 → VALIDATE** (author: 80.0). Verdict unchanged; the plan is 1.5
better than it will say of itself.

## Verdict

# APPROVE — executor-ready

**All five bind.** AC-026, AC-047, AC-048 close both prior doors with double closure I
re-exploited myself and could not defeat; AC-057 catches the real defect and all three attacks
that defeated v0.3, verified by execution; AC-059 restores EC-13 with THEN and VERIFY on the
same quantity. The `--ff-gold` revision is exact and tightens the obligation. Every
non-blocking residual from pass two is closed.

**Remaining residuals are recorded, not blocking, and none needs another cycle:** AC-047's
`body text` wording (dormant against the current palette; one-word fix); AC-057's pinned
lexicon (the correct mechanization, disclosed in the AC); AC-046's value floor (irreducibly
social — my own mechanism's ceiling, not a defect in its implementation).

This closes the critic cycle. Three passes: seven blockers, then three, then none. The
criteria layer now binds what it claims to bind, and I checked the claim each time rather than
reading it. **Hand it to an executor.**

---

*RAMZA — Critic Skill (maker≠checker), third pass. Read-only: no plan, criteria, source, or
repository file modified. Writes: this section + the sanctioned gate record in
`rebrand.state.json` / `ramza-calibration.jsonl`.*
