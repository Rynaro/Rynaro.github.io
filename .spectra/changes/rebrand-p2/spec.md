# Spec — Rebrand Phase 2: Content Architecture & Navigability
## ESL `specify` hop — per-phase projection of the frozen umbrella plan

> **GENERATED ARTIFACT — DO NOT HAND-EDIT. REGENERATE, NEVER RETYPE.**
> Every acceptance body below is a **byte-identical slice** of the frozen source
> `.claude/rebrand/rebrand.criteria.md` (sha256 `393f1e59...`), filtered through
> `.spectra/changes/rebrand/spec.yaml` `phases[2].acceptance`. The plan
> `.claude/rebrand/rebrand-plan.md` remains **the single source of truth**; where this file
> and the plan could disagree, **THE PLAN AND THE FROZEN CRITERIA FILE GOVERN**.
> A hand-edit here is drift, and is mechanically detectable by re-rendering this file from
> the frozen source and diffing.

## Status

| field | value |
|---|---|
| change_id | `rebrand-p2` |
| phase | 2 — Content Architecture & Navigability · **headline deliverable** |
| tier | `full` |
| status | `proposed` |
| maker | `vivi` |
| checker | `kupo` (maker != checker) |
| supersedes | `rebrand` (the umbrella change) |
| spec_ref | `.claude/rebrand/rebrand-plan.md` |
| criteria | **7** of the frozen 59 |
| criteria_sha256 | `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5` |

**Stories:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
**Defects addressed:** D5, D7, D15, D16

## Dependencies

**Depends on Phases 0 and 1** (`depends_on: [0, 1]`) — Phase 1 stabilizes the defect
backlog before Phase 2 expands the surface.

**Ship order:** after Phases 0 and 1.

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

**7 criteria** — the frozen 59 partition across the six phases as
**3 / 12 / 7 / 7 / 19 / 11**, with zero overlap and zero gaps. Bodies below are verbatim
slices of the frozen source; headings carry the phase annotation from the frozen `spec.md`.

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

---

## Provenance

- **Frozen source:** `.claude/rebrand/rebrand.criteria.md` — sha256 `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5`, **untouched** by
  this projection.
- **Phase map:** `.spectra/changes/rebrand/spec.yaml` `phases[2].acceptance`.
- **Plan of record:** `.claude/rebrand/rebrand-plan.md` v0.4.0 (frozen, APPROVE - executor-ready).
- **Umbrella:** `rebrand` — superseded by this change per `supersedes: rebrand`.
- **Projection:** mechanical filter + round-trip diff against the frozen source. No
  re-planning, no re-scoring, no new criteria.
