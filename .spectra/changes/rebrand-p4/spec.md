# Spec — Rebrand Phase 4: Layout, UI/UX & Accessibility
## ESL `specify` hop — per-phase projection of the frozen umbrella plan

> **GENERATED ARTIFACT — DO NOT HAND-EDIT. REGENERATE, NEVER RETYPE.**
> Every acceptance body below is a **byte-identical slice** of the frozen source
> `.claude/rebrand/rebrand.criteria.md` (sha256 `393f1e59...`), filtered through
> `.spectra/changes/rebrand/spec.yaml` `phases[4].acceptance`. The plan
> `.claude/rebrand/rebrand-plan.md` remains **the single source of truth**; where this file
> and the plan could disagree, **THE PLAN AND THE FROZEN CRITERIA FILE GOVERN**.
> A hand-edit here is drift, and is mechanically detectable by re-rendering this file from
> the frozen source and diffing.

## Status

| field | value |
|---|---|
| change_id | `rebrand-p4` |
| phase | 4 — Layout, UI/UX & Accessibility  |
| tier | `full` |
| status | `proposed` |
| maker | `vivi` |
| checker | `kupo` (maker != checker) |
| supersedes | `rebrand` (the umbrella change) |
| spec_ref | `.claude/rebrand/rebrand-plan.md` |
| criteria | **19** of the frozen 59 |
| criteria_sha256 | `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5` |

**Stories:** 4.1, 4.2, 4.3, 4.4a, 4.4b, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10a, 4.10b, 4.11
**Defects addressed:** D16, D17, D20, D21, D22

## Dependencies

**Depends on Phases 0, 1, 2 and 3** (`depends_on: [0, 1, 2, 3]`) — craft on a stable
base. It is the most dependent phase in the graph.

**Internal order is load-bearing.** Slice **4a** (AC-026, AC-027, AC-030, AC-031, AC-047,
AC-048, AC-049) carries the measured contrast failures and **both** live WCAG failures
(2.2.2 and 1.4.1); the palette contrast test ships **in 4a** (AC-049) so that **4a does not
self-certify**. Slice **4b** is semantics and craft. **AC-040 (`/accessibility`) ships LAST**,
after 4a and both CI checks are green: it converts a private quality bar into a public claim,
and a conformance claim the site does not meet is worse than no page.

**Ship order:** after Phases 0-3; 4a before 4b; AC-040 last.

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

**19 criteria** — the frozen 59 partition across the six phases as
**3 / 12 / 7 / 7 / 19 / 11**, with zero overlap and zero gaps. Bodies below are verbatim
slices of the frozen source; headings carry the phase annotation from the frozen `spec.md`.

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

### AC-058 (unwanted-behavior)  ·  **Phase 4b**
GIVEN a fluid type rule expressed with `clamp()`
WHEN its middle term is inspected
THEN that middle term SHALL carry a `rem` or `px` component rather than a viewport unit alone
VERIFY: a script parses every `clamp()` in `_sass/` and asserts each middle term matches a `rem` or `px` component; zero `vw`-only middle terms remain

---

## Provenance

- **Frozen source:** `.claude/rebrand/rebrand.criteria.md` — sha256 `393f1e5948ef9e55a9b3ca812c11034942d1c2b9b2e8a9f1655f0a3408335fe5`, **untouched** by
  this projection.
- **Phase map:** `.spectra/changes/rebrand/spec.yaml` `phases[4].acceptance`.
- **Plan of record:** `.claude/rebrand/rebrand-plan.md` v0.4.0 (frozen, APPROVE - executor-ready).
- **Umbrella:** `rebrand` — superseded by this change per `supersedes: rebrand`.
- **Projection:** mechanical filter + round-trip diff against the frozen source. No
  re-planning, no re-scoring, no new criteria.
