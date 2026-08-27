# Spec — Rebrand Phase 3: Journal Mechanics & AI-in-Frame
## ESL `specify` hop — per-phase projection of the frozen umbrella plan

> **GENERATED ARTIFACT — DO NOT HAND-EDIT. REGENERATE, NEVER RETYPE.**
> Every acceptance body below is a **byte-identical slice** of the frozen source
> `.claude/rebrand/rebrand.criteria.md` (sha256 `393f1e59...`), filtered through
> `.spectra/changes/rebrand/spec.yaml` `phases[3].acceptance`. The plan
> `.claude/rebrand/rebrand-plan.md` remains **the single source of truth**; where this file
> and the plan could disagree, **THE PLAN AND THE FROZEN CRITERIA FILE GOVERN**.
> A hand-edit here is drift, and is mechanically detectable by re-rendering this file from
> the frozen source and diffing.

## Status

| field | value |
|---|---|
| change_id | `rebrand-p3` |
| phase | 3 — Journal Mechanics & AI-in-Frame  |
| tier | `full` |
| status | `proposed` |
| maker | `vivi` |
| checker | `kupo` (maker != checker) |
| supersedes | `rebrand` (the umbrella change) |
| spec_ref | `.claude/rebrand/rebrand-plan.md` |
| criteria | **7** of the frozen 59 |
| criteria_sha256 | `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5` |

**Stories:** 3.1, 3.2, 3.3, 3.4, 3.5
**Defects addressed:** D13, D19

## Dependencies

**Depends on Phases 0 and 2** (`depends_on: [0, 2]`) — it needs Phase 0's post-type
vocabulary and Phase 2's taxonomy. Transitively it also depends on Phase 1 (via Phase 2).

**Ship order:** after Phases 0, 1 and 2.

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

### AC-025 (event-driven)  ·  **Phase 3**
GIVEN a visitor whose operating system reports a dark colour-scheme preference
WHEN any page is loaded with JavaScript disabled
THEN the page SHALL render in the dark theme via `prefers-color-scheme`
VERIFY: JS-disabled render with `prefers-color-scheme: dark` emulated shows the dark theme background token on every page, not only post pages

---

## Provenance

- **Frozen source:** `.claude/rebrand/rebrand.criteria.md` — sha256 `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5`, **untouched** by
  this projection.
- **Phase map:** `.spectra/changes/rebrand/spec.yaml` `phases[3].acceptance`.
- **Plan of record:** `.claude/rebrand/rebrand-plan.md` v0.4.0 (frozen, APPROVE - executor-ready).
- **Umbrella:** `rebrand` — superseded by this change per `supersedes: rebrand`.
- **Projection:** mechanical filter + round-trip diff against the frozen source. No
  re-planning, no re-scoring, no new criteria.
