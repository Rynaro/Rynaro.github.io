# Opal Measurement Record — closing FORGE's [GAP-1], [GAP-2], [GAP-3]

**Date:** 2026-07-16
**Purpose:** FORGE's Opal verdict (v0.1) was gated at 80% confidence on three unmeasured gaps. This record closes all three with real numbers from a sandboxed probe. Method is reproducible; every figure below came from the commands shown.

**Probe environment:** `opal-1.8.3` installed into a throwaway `GEM_HOME` (`$CLAUDE_JOB_DIR/tmp/opal-probe`). No system gems touched, no repo files modified. Compiled with the project's current Ruby.

---

## [GAP-2] CLOSED — Opal is healthy

`opal-1.8.3` installs cleanly and compiles under the project's current Ruby. No maintenance or compatibility problem. FORGE's **RC-2 does not fire.**

## [GAP-3] CLOSED — the current JS surface, in bytes

> **CORRECTION v0.3 (critic finding C-5).** The first version of this table reported a **TOTAL gzipped of 7,862 B** and claimed "the entire site ships 7.9 KB gzipped of JavaScript." **That number was wrong in method and meaning, and must not be published.** Three defects:
> 1. **It used a different methodology than the column above it.** 7,862 was `cat assets/js/*.js | gzip` — the *concatenated* gzip. The site **does not bundle**; it serves 8 separate files, each gzipped independently. Concatenation lets gzip compress across file boundaries that do not exist in production.
> 2. **It was not even reproducible.** The original used `gzip -c FILE`, which embeds the filename and mtime in the header — so the value drifts with the temp filename (7,862 vs 7,857 vs 7,852 via stdin). A number whose value depends on a temp file's name has no business in a post about measurement.
> 3. **It described a quantity no visitor ever receives.** No page loads all 8 files.

| File | raw | gzipped |
|---|---:|---:|
| `assets/js/home.js` | 8,504 | 2,489 |
| `assets/js/notebook.js` | 5,917 | 1,743 |
| `assets/js/laboratory.js` | 5,214 | 1,620 |
| `assets/js/sigil-navigation.js` | 4,045 | 1,480 |
| `assets/js/about.js` | 3,147 | 1,058 |
| `assets/js/letter.js` | 2,893 | 1,063 |
| `assets/js/main.js` | 2,037 | 809 |
| `assets/js/exp-bar.js` | 1,839 | 766 |
| **Sum, each gzipped separately (8 files, ~1,083 lines)** | **33,596** | **11,028** |

### What the site actually ships — per page (the only honest framing)

`_layouts/default.html` loads `main.js` + `sigil-navigation.js` sitewide, plus **one** page-specific file:

| Page | JS shipped (gzipped) |
|---|---:|
| sitewide baseline (`main` + `sigil-navigation`) | 2,289 B |
| **home** (heaviest) | **4,778 B** |
| about | 4,113 B |
| notebook | 4,032 B |
| laboratory | 3,909 B |
| letter | 3,352 B |

> **Correction (critic, second pass):** about was first listed at 3,347 B on the assumption of one page-specific file. `about.html:285-286` loads **two** (`exp-bar.js` + `about.js`), making it 4,113 B. Home remains heaviest, so the headline is unaffected — but the assumption "one page file per page" was wrong and is not safe to reuse.

**The heaviest page on the site ships 4,778 B gzipped of JavaScript.** The 11,028 B sum is only meaningful for a visitor who loads every page uncached; it is a ceiling, not a payload.

## [GAP-1] CLOSED — Opal's real cost

### Methodological correction (important)

`opal -c` **appends a source map by default.** A first measurement that included it reported 489 KB gzipped for hello-world — **unfair to Opal by ~3.5×**. All figures below use `--no-source-map`. Any downstream artifact citing ~478–489 KB is working from the erroneous first pass and must be corrected.

### Measurements (`--no-source-map`)

| Compile | raw | gzipped |
|---|---:|---:|
| `puts "hello"` (runtime + corelib) | 753,957 | **138,537** (135.3 KB) |
| + `--no-method-missing` | 743,704 | 134,509 (131.4 KB) |
| `--no-opal` (runtime excluded — proves the floor is the runtime) | 315 | 183 |
| minimal DOM touch (`require "native"`) | 778,922 | 142,749 (139.4 KB) |
| **realistic widget, ~45 lines Ruby** | **782,196** | **143,453 (140.1 KB)** |

The realistic widget was a genuine `TransmutationCircle` class — `pointerdown`/`pointerup`/`keydown` handlers, arrow-key rotation, a `prefers-reduced-motion` guard via `matchMedia`, a runes constant, an `innerHTML` render — i.e. roughly the shape FORGE's EC-5/EC-9 island would actually take.

---

## The decisive structure

> **CORRECTION (FORGE v0.2).** An earlier version of this section reported a two-tier model — "fixed runtime + 4,916 B of app code" — and was **wrong**. It attributed the `require "native"` cost to the application code, inflating the per-line rate **7×** (109 → 15.6 B gz/line). The cost decomposes into **three** tiers, and the middle one is the entire budget story.

**1. Three tiers, not two:**

| Tier | Δ bytes gz | Share of 143,453 | Scales with |
|---|---:|---:|---|
| Runtime + corelib | 138,537 | **96.6%** | nothing — fixed floor |
| stdlib `require`s (`native`) | +4,212 | **2.9%** | **ambition — ~4.2 KB _per require_** |
| App code (45 Ruby lines) | **+704** | **0.49%** | lines — **15.6 B gz/line** |

(138,537 + 4,212 + 704 = 143,453 ✓)

**The Ruby you actually write is nearly free** — 15.6 B gz/line is only ~1.9× hand-written JS's own density (8.4 B gz/line). At the margin, Opal output is genuinely not bloated. The `--no-opal` row (183 B) proves the floor is the runtime itself, not the compilation.

**2. Features never breach the ceiling — `require`s do.** One `require` ≈ 270 Ruby lines in bytes. Headroom above hello-world+native is 10,851 B ≈ **694 more Ruby lines (3× `home.js`)**. The budget is not tight for functionality; it is tight for exactly the thing that should be tight. → FORGE **EC-7c: the require list _is_ the budget.**

**3. The publishable number:** **96.6% runtime, 2.9% one require, 0.49% the Ruby actually written.** That decomposition is itself a complete, publishable insight — and it took 45 lines to obtain.

**2. Against FORGE's EC-7 ceiling** (≤150 KB gz on the widget page, 0 bytes elsewhere):
> realistic widget = **140.1 KB gz → PASSES**, 10,147 bytes headroom. **Ruling 3's gate does not fail; the island is viable.**

**3. Against FORGE's RC-1** ("if runtime+corelib+app fits within the *current* total JS byte budget, H1 becomes live and Ruling 1 is void"):

> **CORRECTED (critic finding C-5).** The ratio was published as **17.8× and 18.25× in the same breath — those were never two facts.** They are one ratio computed twice: 18.25 = 143,453 / 7,862 (consistent bytes); 17.8 = 140.1 **KiB** / 7.862 **KB** (mixed units). Both rested on the fictional 7,862 total.

Against the honest baselines:

| Comparison | ratio |
|---|---:|
| island (143,453 B gz) **vs the heaviest page** (home, 4,778 B gz) | **30.0×** |
| island vs the sum of all 8 files (11,028 B gz) | **13.0×** |

> **Does not fit under any reading. RC-1 does not fire. Ruling 1 (reject-as-plumbing) survives — and is *more* strongly anchored than the erroneous figure suggested**, since the real per-page ratio (30×) is worse than the 17.8× originally claimed.

FORGE's §2.5 structural argument ("the ratio is unfavourable by construction for plumbing") predicted this without any number. Measurement confirmed it — and survived its own correction, which is the better test.

## Consequence: a token island is the worst deal on the curve

A minimal widget pays exactly the same 135 KB runtime tax as an ambitious one: a 45-line token = 140.1 KiB; a 450-line widget ≈ 146.9 KiB — **10× the functionality for 4.6% more bytes.** So the island must clear a *value floor* (FORGE **EC-7d**); a token spinner is forbidden (**EC-2**).

But "therefore build a maximal lab" does **not** follow. Ambition is free in *bytes* and expensive in *hours* — and hours are the binding constraint. FORGE's resolution: **the correct maximand is the POST, not the widget.** The 96.6/2.9/0.49 decomposition is already a complete publishable insight, obtained in 45 lines. The widget is the pretext; the post is the product. Bytes say "don't build a token"; attention says "don't build a lab"; the intersection is **a real-but-modest widget carrying a deep post.**

## What measurement does NOT touch — and this is the verdict

FORGE's **RISK-1 (attention displacement)** — the Mar-2025 pattern of 18 build commits followed by one post in 16 months — is untouched by any of this. All three gaps were about bytes and health; **none touched attention. The measurement resolved everything except the binding constraint.**

That is itself confirming evidence: a decision that looked like an engineering question and dissolved on contact with a `wc -c` was an identity question wearing engineering clothes. **EC-1's sequencing gate (no Opal until Phase 1 closes) stands regardless of these numbers.**

> **The bytes were never the question. The hours are.**

## Correction propagated to Ruling 2

FORGE v0.1 partly justified Ruling 2 (delete JS via build-time Ruby) on **performance**. The measurement **refutes that**: the heaviest page ships **4,778 B gzipped** of JS — there was never a performance problem. Ruling 2 survives on **correctness** (the no-JS empty-TOC defect), **accessibility** (`home.js`'s missing reduced-motion guard), and **SEO** (AC-013's server-rendered categories) — *not* speed. Phase 2's JS reduction must **not** be sold as a speed win.

## Provenance of the corrections

This record has been wrong twice, in opposite directions, and both corrections came from a reader who was not its author:

1. **489 KB → 138.5 KB** (self-caught): `opal -c` appends a source map by default. The first pass was unfair to Opal by 3.5× and would have wrongly killed the island.
2. **"4,916 B of app code" → 704 B** (caught by FORGE v0.2): `require "native"` was charged to the application code, inflating the per-line rate 7×.
3. **"7,862 B site JS / 17.8×" → 4,778 B heaviest page / 30×** (caught by the independent critic, C-5): a concatenated-gzip total describing a payload no visitor receives, computed by a method that drifted with a temp filename, and a ratio published twice in mixed units.

Every headline number in this record has now been corrected by someone other than the person who produced it. **That is the finding, and it is the post.** A record whose thesis is measurement rigor, on a site whose persona cites Dan Luu — whose brand *is* measurement — cannot ship the erroneous figures. The conclusion never moved; only the author's confidence in their own arithmetic did.

## Reproduce

```sh
export GEM_HOME=/tmp/opal-probe && export PATH="$GEM_HOME/bin:$PATH"
gem install opal --no-document                        # -> opal-1.8.3
printf 'puts "hello"\n' > hello.rb
opal -c --no-source-map hello.rb | gzip -c | wc -c    # -> 138537   (WITHOUT --no-source-map: 489230)

# per-file, gzipped independently — as the site actually serves them.
# do NOT `cat` them together: the site does not bundle, and `gzip -c FILE`
# embeds the filename+mtime, so the total drifts with the temp file's name.
for f in assets/js/*.js; do printf '%s %s\n' "$(gzip -c "$f" | wc -c)" "$f"; done

# what a page actually ships = main.js + sigil-navigation.js + one page file
```
