# Spec — Rebrand Phase 5: The Transmutation Circle
## ESL `specify` hop — per-phase projection of the frozen umbrella plan

> **GENERATED ARTIFACT — DO NOT HAND-EDIT. REGENERATE, NEVER RETYPE.**
> Every acceptance body below is a **byte-identical slice** of the frozen source
> `.claude/rebrand/rebrand.criteria.md` (sha256 `393f1e59...`), filtered through
> `.spectra/changes/rebrand/spec.yaml` `phases[5].acceptance`. The plan
> `.claude/rebrand/rebrand-plan.md` remains **the single source of truth**; where this file
> and the plan could disagree, **THE PLAN AND THE FROZEN CRITERIA FILE GOVERN**.
> A hand-edit here is drift, and is mechanically detectable by re-rendering this file from
> the frozen source and diffing.

## Status

| field | value |
|---|---|
| change_id | `rebrand-p5` |
| phase | 5 — The Transmutation Circle · **OPTIONAL** · **OWNER-GATED** |
| tier | `full` |
| status | `proposed` |
| maker | `vivi` |
| checker | `kupo` (maker != checker) |
| supersedes | `rebrand` (the umbrella change) |
| spec_ref | `.claude/rebrand/rebrand-plan.md` |
| criteria | **11** of the frozen 59 |
| criteria_sha256 | `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5` |

**Stories:** 5.0, 5.1, 5.2, 5.3, 5.4
**Defects addressed:** D18

## Dependencies

**OPTIONAL. OWNER-GATED. HARD-GATED BEHIND PHASE 1.**

- **`depends_on: [1]` is a HARD gate — `EC-1`:** Phase 1 closing (AC-004..AC-011) is the hard
  prerequisite for **any Opal work whatsoever**. Transitively this phase also depends on
  Phase 0 (via Phase 1). **`RC-5`: if Phase 1 has not closed within a period the owner
  considers reasonable, EC-1 hardens from "gate" to "no."**
- **Entry gate — `AC-053`:** a committed, **DATED `go` record whose timestamp PRECEDES the
  first `_opal/` commit**. A `no-go` record followed by any `_opal/` commit **FAILS**. This is
  owner-only: **do not begin without an explicit owner decision.**
- **Sequenced after Phase 4** (`sequence_after: [4]`; `recommended_after: [2]`).
- **Realistic disposition: "probably not, and that is a fine outcome."** The deliverable is
  **the POST, not the widget**. Justification scope is **joy alone** — the island no longer
  carries craft-identity, because Ruling 2 now does.
- **Budget: 150 KiB gz PAGE TOTAL (not artifact).** Raising it is **FORBIDDEN**. Net headroom
  is ~**6,238 B**; one `require` costs ~**4,212 B**, so a second require consumes most of the
  budget and **RC-7 fires**. **MEASURE the page total; never infer it.**
- **`--no-source-map` is MANDATORY** (`opal -c` appends a source map by default; without the
  flag the payload silently 3.5x's).

**Ship order:** last, and only if the owner says go.

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

**11 criteria** — the frozen 59 partition across the six phases as
**3 / 12 / 7 / 7 / 19 / 11**, with zero overlap and zero gaps. Bodies below are verbatim
slices of the frozen source; headings carry the phase annotation from the frozen `spec.md`.

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

### AC-059 (ubiquitous)  ·  **Phase 5**
THEN the `type: transmutation` post SHALL state the shipped island artifact's re-measured gzipped size together with its runtime/require/app-code tier decomposition
VERIFY: the post states the shipped artifact's final measured gzipped bytes, equal to the artifact's own component of the CI measurement AC-042 performs on the island page (the artifact figure, not the page total -- the two differ by the page's other scripts), states the three tier percentages (runtime / require / app code) summing to 100, names the per-file-sum method for the site-JS baseline (each file gzipped separately, as served), and `grep -nE "7,?862|7\.9 ?KB|17\.8|18\.25" <post>` returns zero matches

---

## Provenance

- **Frozen source:** `.claude/rebrand/rebrand.criteria.md` — sha256 `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5`, **untouched** by
  this projection.
- **Phase map:** `.spectra/changes/rebrand/spec.yaml` `phases[5].acceptance`.
- **Plan of record:** `.claude/rebrand/rebrand-plan.md` v0.4.0 (frozen, APPROVE - executor-ready).
- **Umbrella:** `rebrand` — superseded by this change per `supersedes: rebrand`.
- **Projection:** mechanical filter + round-trip diff against the frozen source. No
  re-planning, no re-scoring, no new criteria.
