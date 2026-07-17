---
eidolon: vivi
kind: spec
created_at: 2026-07-17
artifact: spec
change_id: self-host-fonts
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `self-host-fonts`: replace third-party font CDNs with self-hosted assets

**Status:** `in_progress` · **ESL tier:** `full` · **maker:** `vivi` · **checker:** `kupo`
(maker != checker)

**Provenance note (honest, not fabricated):** unlike `rebrand-*`/`normalize-*`, this change
did **not** go through a separate SPECTRA/ramza `specify` hop with scout/research/critic
passes. The orchestrator handed vivi a direct, fully-scoped brief (goal, current state,
exact required work items, and an explicit acceptance gate) and routed straight to the
`in_progress` (implement) hop. This spec.md is vivi's own record of that brief plus the
verification vivi performed while implementing it — written so the tier-`full` artifact
requirement (C3) is satisfied and so `kupo` has a concrete, checkable record instead of only
a diff. No ramza score, criteria hash, or critic pass exists for this change; none is
claimed.

## Scope

**In.** `_includes/head/fonts.html`, one new `_sass/_fonts.scss` partial (imported early in
`assets/css/main.scss`), and new static assets under `assets/fonts/`.

**Out.** No color/layout/BEM change, no edit to any `_sass/` rule beyond the new `_fonts.scss`
partial and the one-line `@import` in `main.scss`. No page body/layout edit beyond
`_includes/head/fonts.html`. `scripts/visual-baseline.mjs` is not run or updated by vivi — the
orchestrator regenerates baselines after this change lands.

## Background / current state (as found)

- `_includes/head/fonts.html` loaded Google Fonts css2 (`Inter` 300/400/500/700, `Roboto`
  300/400/500, `Nothing You Could Do` 400) plus two `preconnect` hints, and Font Awesome
  6.4.2 `all.min.css` from cdnjs — three third-party origins, all render-blocking.
- `_sass/_post.scss` (x3) and `_sass/_notebook.scss` (x1) declare
  `font-family: "Font Awesome 5 Free"` at `font-weight: 900` with raw `content: "\fXXX"`
  (calendar `\f073`, clock `\f017`) — a *named* mismatch against the CDN's Font Awesome
  **6**.4.2.

## Acceptance Criteria

### AC-001 (unwanted-behavior)
GIVEN the built site
WHEN `_site/` is scanned for third-party font CDN references
THEN no `fonts.googleapis`, `fonts.gstatic`, or `cdnjs.cloudflare` substring SHALL appear anywhere in `_site/`
VERIFY: `grep -rE 'fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare' _site/` returns zero matches

### AC-002 (event-driven)
GIVEN the modified Sass source
WHEN `bundle exec jekyll build` runs
THEN the build SHALL exit 0 and introduce no new Sass error (pre-existing `darken()`/`@import` deprecation warnings in `_variables.scss` are not new and are out of scope)
VERIFY: `bundle exec jekyll build` exit code 0; diff of warning set against the pre-change baseline shows no new warning class

### AC-003 (ubiquitous)
THEN `assets/fonts/*.woff2` SHALL exist on disk and be copied into `_site/assets/fonts/` by the build
VERIFY: 7 `.woff2` files present in both `assets/fonts/` and `_site/assets/fonts/`; `_config.yml`'s `exclude:` list does not match `assets/fonts`

### AC-004 (ubiquitous)
THEN the local Font Awesome stylesheet SHALL resolve every `@font-face` `src` to a shipped local file (zero dangling references)
VERIFY: every `url(...)` in `assets/fonts/fontawesome.min.css` names a file that exists in the same directory

### AC-005 (event-driven)
GIVEN the pre-existing `font-family: "Font Awesome 5 Free"` (weight 900) usage in `_sass/_post.scss` and `_sass/_notebook.scss`
WHEN the local Font Awesome CSS is loaded instead of the cdnjs original
THEN the same v4/v5-compat family-name alias SHALL still resolve to the solid glyph set, so `\f073` (calendar) and `\f017` (clock) keep rendering exactly as they did against the CDN
VERIFY: `assets/fonts/fontawesome.min.css` contains `@font-face{font-family:"Font Awesome 5 Free";...font-weight:900;src:url(fa-solid-900.woff2)...}`; `fa-solid-900.woff2`'s cmap contains U+F073 and U+F017 (checked with fontTools)

### AC-006 (ubiquitous)
THEN 3 representative icon classes actually used in markup (`fas fa-scroll`, `fas fa-flask`, a `fab` brand icon e.g. `fab fa-github`) SHALL each have a `content:` rule in the local CSS and a glyph at that codepoint in the corresponding shipped webfont
VERIFY: CSS `.fa-scroll:before{content:"\f70e"}` / `.fa-flask:before{content:"\f0c3"}` / `.fa-github:before{content:"\f09b"}` all present; U+F70E, U+F0C3 present in `fa-solid-900.woff2` cmap, U+F09B present in `fa-brands-400.woff2` cmap

### AC-007 (ubiquitous)
THEN `npm run test:a11y-static` SHALL still exit 0 (font sourcing is colour/structure-neutral; any red here indicates an out-of-scope regression)
VERIFY: `npm run test:a11y-static` exit 0

### AC-008 (unwanted-behavior)
GIVEN the family names `Inter`, `Roboto`, `Nothing You Could Do` are referenced across `_sass/_base.scss`, `_sass/_about.scss`, `_sass/_home.scss`, `_sass/_layout.scss`, `_sass/_notebook.scss`
WHEN the self-hosted `@font-face` rules replace the CDN stylesheet
THEN every one of those family names and every referenced weight (300/400/500/700 for Inter, 300/400/500 for Roboto, 400 for Nothing You Could Do) SHALL still resolve to a registered `@font-face`
VERIFY: `grep -o '@font-face{[^}]*}' _site/assets/css/main.css` lists exactly those 8 (family, weight) pairs

## Investigation finding (AC-005's premise, verified)

The Font Awesome 6.4.2 CSS (both the original cdnjs release and this self-hosted copy,
vendored byte-identical except for local `url()` paths and the dropped `.ttf` fallback) ships
its **own** backward-compatibility `@font-face` blocks naming `"Font Awesome 5 Free"` and
`"Font Awesome 5 Brands"`, pointing at the same v6 solid/brands/regular binaries. This means
the `_sass/` usages of `font-family: "Font Awesome 5 Free"` were **already rendering
correctly** under the CDN — the family-name "mismatch" is cosmetic/nominal, not a live defect
— and self-hosting the unmodified upstream CSS preserves that behavior with zero additional
code. This was verified directly: extracted the live `@font-face` rules from the CDN
response, confirmed the alias, downloaded `fa-solid-900.woff2`, and used `fontTools` to
confirm U+F073 and U+F017 are present in its `cmap`.

## Out-of-scope / explicitly deferred

- `scripts/visual-baseline.mjs` — not run/updated by vivi (orchestrator's job after landing).
- Any hand-subsetting of the Font Awesome icon set — the full Free webfont set (solid,
  brands, regular, v4-compat) ships, per the brief's explicit tolerance for that trade-off,
  to avoid the risk of a missed selector.
- Adding `<link rel="preload">` for the new local fonts — not required by the brief and out
  of the stated scope (font-layer swap only, not a new perf feature).
