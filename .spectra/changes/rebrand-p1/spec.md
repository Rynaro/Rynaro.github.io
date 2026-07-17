# Spec — Rebrand Phase 1: Trust & Defect Stabilization
## ESL `specify` hop — per-phase projection of the frozen umbrella plan

> **GENERATED ARTIFACT — DO NOT HAND-EDIT. REGENERATE, NEVER RETYPE.**
> Every acceptance body below is a **byte-identical slice** of the frozen source
> `.claude/rebrand/rebrand.criteria.md` (sha256 `393f1e59...`), filtered through
> `.spectra/changes/rebrand/spec.yaml` `phases[1].acceptance`. The plan
> `.claude/rebrand/rebrand-plan.md` remains **the single source of truth**; where this file
> and the plan could disagree, **THE PLAN AND THE FROZEN CRITERIA FILE GOVERN**.
> A hand-edit here is drift, and is mechanically detectable by re-rendering this file from
> the frozen source and diffing.

## Status

| field | value |
|---|---|
| change_id | `rebrand-p1` |
| phase | 1 — Trust & Defect Stabilization  |
| tier | `full` |
| status | `proposed` |
| maker | `vivi` |
| checker | `kupo` (maker != checker) |
| supersedes | `rebrand` (the umbrella change) |
| spec_ref | `.claude/rebrand/rebrand-plan.md` |
| criteria | **12** of the frozen 59 |
| criteria_sha256 | `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5` |

**Stories:** 1.1, 1.2, 1.3, 1.4
**Defects addressed:** D1, D2, D3, D4, D5, D6, D8, D9, D11, D12

## Dependencies

**Depends on Phase 0** (`depends_on: [0]`) — it consumes Phase 0's identity spine.

**This phase is itself a HARD GATE.** `EC-1`: **Phase 1 closing (AC-004..AC-011) is the hard
prerequisite for any Opal work whatsoever** — Phase 5 is barred until it closes. `RC-5`: if
Phase 1 has not closed within a period the owner considers reasonable, **EC-1 hardens from
"gate" to "no."**

**Blocking external dependency — the Formspree form-hash ID.** It is an **owner-supplied
credential**, `executor_resolvable: false`. No amount of executor effort substitutes for it;
it is not a research task. **Ship the rest of Story 1.1 without blocking on it**, keep
`mailto:hi@hlavezzo.me` as the interim fallback, and close D9 when the ID arrives. **Do not
let it hold Phase 1** — Phase 1 is the EC-1 gate, and stalling it stalls Phase 5.

**Ship order:** after Phase 0.

> **"Independently shippable" would overstate it.** Every phase depends on Phase 0, directly
> or transitively. These six changes form a **DAG shippable in dependency order** — not in an
> arbitrary one. The dependency graph itself lives in
> `.spectra/changes/rebrand/spec.yaml` (`phases[].depends_on`), because `depends_on` has no
> home in the ESL `change.v1` schema; it is restated here in prose so that an executor
> reading only this folder cannot miss it.

## Invariants — carry these verbatim; they are hard-won

1. **Ruling 2 is justified on correctness + a11y + SEO, NEVER on speed.** The heaviest page
   ships **4,778 B gzipped**; there was never a performance problem. **Do not reintroduce any
   perf residue.** "Insight" licenses craft satisfaction, not speed claims.
2. **The retracted figures must never be published as fact:** `7,862 B`, `7.9 KB`, `17.8x`,
   `18.25x`. **Correct:** per-file sum **11,028 B**, heaviest page **4,778 B**, ratios
   **30.0x** / **13.0x**. **AC-059 greps the post for exactly the retracted four and fails on
   any hit.** They are named here **only as a prohibition, in a retraction record**, so that
   they stay out of the artifact. **Note:** FORGE's own `EC-4` text carries `18.25x`; it has
   been re-anchored to **30.0x** — do not let the retracted figure back in by copying EC-4's
   original wording.
3. **The Formspree form-hash ID is an owner-supplied credential** (`executor_resolvable:
   false`) — the contact-form story (Story 1.1 / D9) cannot complete without it. It is a
   **Phase 1** dependency.
4. **Phase 5 is optional and owner-gated**, hard-gated behind Phase 1 (**EC-1**), sequenced
   after Phase 4; **AC-053 requires a dated `go` record predating any `_opal/` commit**.
   Realistic disposition: **"probably not, and that is a fine outcome."**
5. **AC-024 does NOT discharge WCAG 2.2.2** — that is AC-031. `prefers-reduced-motion` is
   **not** a 2.2.2 mechanism. Two defects, two criteria, two phases.

## Acceptance

**12 criteria** — the frozen 59 partition across the six phases as
**3 / 12 / 7 / 7 / 19 / 11**, with zero overlap and zero gaps. Bodies below are verbatim
slices of the frozen source; headings carry the phase annotation from the frozen `spec.md`.

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

---

## Provenance

- **Frozen source:** `.claude/rebrand/rebrand.criteria.md` — sha256 `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5`, **untouched** by
  this projection.
- **Phase map:** `.spectra/changes/rebrand/spec.yaml` `phases[1].acceptance`.
- **Plan of record:** `.claude/rebrand/rebrand-plan.md` v0.4.0 (frozen, APPROVE - executor-ready).
- **Umbrella:** `rebrand` — superseded by this change per `supersedes: rebrand`.
- **Projection:** mechanical filter + round-trip diff against the frozen source. No
  re-planning, no re-scoring, no new criteria.
