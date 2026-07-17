---
artifact: acceptance-criteria
change_id: normalize
version: 0.1.0
---

# Acceptance Criteria — `normalize` (front-end normalization, P1..P4)

Every block is EARS-form and mechanically verifiable. `VERIFY:` names an existing
script, a specified script, or a gate. Criteria are grouped by phase; each phase is
independently revertable and independently gated.

**Convention used by every VERIFY below:** "the a11y suite" = `npm run test:a11y-static`
(= `test:4a` + `test:4b`, package.json). "the visual suite" = `npm run test:visual`.

> **RE-DERIVED at refine cycle 2 (R2).** The R1 Phase-1 criteria were REJECTED by
> an independent critic (45/100) for a methodology error: they reasoned
> PER-PARTIAL about `:root` custom-property blocks. `:root` is DOCUMENT-scoped —
> all `_sass/` partials compile into one `assets/css/main.css`, and the
> LAST-imported dark `:root` block wins GLOBALLY. `_sass/_letter.scss:820-831`
> imports last (`assets/css/main.scss:17`) and flips `--dnd-brown: #e0e0e0`
> sitewide. So the R1 claim — `.item-rarity-label` renders `#6d562f` on `#2c2c2c`
> = 2.01, a live AA failure — is FALSE: it renders `#e0e0e0` on `#232323` =
> **11.91** (PASSES; confirmed against the compiled cascade). Every contrast
> figure below is derived from the COMPILED CASCADE (`getComputedStyle` on the
> built `_site`, or the compiled `main.css`) with the project's own
> `scripts/lib/color-math.mjs`, never from a single source partial. The retracted
> R1 AC-101 (proven no-op) and AC-110 (inverted/self-contradictory) are NOT
> restated.
>
> **The real P1 defects, re-measured against the compiled cascade:**
> **(1) `/about` in dark mode — the primary defect.** `_sass/_about.scss` has ZERO
> dark handling (no `prefers-color-scheme`, no `@include dark-mode`) yet hardcodes
> `background: white` (`:556,844,861,951,1099,1235,1312`). The `--dnd-brown` TEXT
> token flips globally to `#e0e0e0`, but the SURFACE never flips, so
> `.attribute-name`/`.category-title`/`.quest-title`/`.ability-name` render
> `#e0e0e0` on `#ffffff` = **1.32**. Mechanism = "text flipped globally, surface
> never flipped" — the INVERSE of the rejected claim.
> **(2) `.scroll-seal` — fails in the DEFAULT (light) theme, shipping today.**
> `_sass/_notebook.scss:674` sets `background: var(--ff-gold)` (`#e6a553`, never
> flipped); `:675`/`:693` set `color: var(--dnd-brown)`. Light: `#6d562f` on
> `#e6a553` = **3.27**. Dark: `#e0e0e0` on `#e6a553` = **1.61**. Broken for every
> visitor now.
> **(3) Architectural root cause.** Four `prefers-dark :root` blocks
> (`_variables.scss:160`, `_notebook.scss:800`, `_laboratory.scss:688`,
> `_letter.scss:820`) write the same global `:root` with CONFLICTING values; last
> import wins, so `_notebook.scss:805`/`:808` and `_laboratory.scss:693` are DEAD.
> P1 consolidates them into ONE authoritative dark token set.
>
> **Owner decisions binding here (not re-opened): D-C** — converge the dark
> MECHANISM only (one flip block reachable via BOTH `@media (prefers-color-scheme:
> dark)` and `:root[data-theme="dark"]`); toggle POLICY is P3; do not delete the
> working `body.dark-mode` post toggle. **D-A** — radius tokenization is NOT P1.

---

## Phase 1 — Dark-cascade consolidation + contrast defect repair

### AC-101 (unwanted-behavior)
GIVEN the four dark `:root` blocks — `_sass/_variables.scss:160`, `_sass/_notebook.scss:800`, `_sass/_laboratory.scss:688`, `_sass/_letter.scss:820` — compile into one `assets/css/main.css` and today declare conflicting values for the same document-scoped token (`--dnd-parchment` is `#2c2c2c` at `_notebook.scss:805`/`_laboratory.scss:693` but `#232323` at `_letter.scss:825`; `--dnd-ink` is `#d0d0d0` at `_notebook.scss:808` but `#e0e0e0` at `_letter.scss:828`), so the earlier-imported declarations are silently dead under last-import-wins
WHEN the compiled stylesheet's dark `:root` custom-property declarations are grouped by token name
THEN no custom-property name SHALL resolve to more than one distinct value across the compiled dark `:root` scopes
VERIFY: specified script `scripts/dark-root-conflict.test.mjs` reads the built `_site/assets/css/main.css`, collects every `:root` custom-property declaration inside a `@media (prefers-color-scheme: dark)` or `[data-theme="dark"]` context, groups by name, and asserts each name has exactly one distinct value; exit 0

### AC-102 (ubiquitous)
GIVEN the dark token flip is spread across four `:root` blocks carrying three provably-dead declarations — `_sass/_notebook.scss:805` (`--dnd-parchment:#2c2c2c`), `_sass/_notebook.scss:808` (`--dnd-ink:#d0d0d0`), `_sass/_laboratory.scss:693` (`--dnd-parchment:#2c2c2c`) — each overridden sitewide by `_sass/_letter.scss`
WHEN the dark palette is consolidated
THEN the dark token overrides SHALL be authored from exactly one canonical source
VERIFY: specified script `scripts/dark-root-consolidation.test.mjs` asserts `_sass/` contains exactly one authoring site for dark `:root` custom-property overrides, that the three enumerated dead declarations no longer appear, and that the built `_site/assets/css/main.css` shows each dark token once per selector context; exit 0

### AC-103 (ubiquitous)
GIVEN D-C requires one dark token set reachable via BOTH `@media (prefers-color-scheme: dark)` (OS preference) and `:root[data-theme="dark"]` (the future toggle), while the compiled CSS today contains zero `data-theme` selectors
WHEN the consolidated dark token set is compiled
THEN the identical set of dark custom-property values SHALL be emitted under both a `prefers-color-scheme: dark` `:root` context and a `:root[data-theme="dark"]` context
VERIFY: `scripts/dark-root-conflict.test.mjs` asserts the {name,value} set emitted under `@media (prefers-color-scheme: dark) :root` equals the set under `:root[data-theme="dark"]` in the built `_site/assets/css/main.css`; exit 0

### AC-104 (unwanted-behavior)
GIVEN D-C reserves dark-toggle POLICY for P3 and forbids deleting the working `body.dark-mode` post toggle (`_layouts/post.html` `#toggle-dark-mode` button + handler, styles at `_sass/_post.scss:1151`) during P1
WHEN P1 converges the dark mechanism
THEN the `body.dark-mode` post toggle SHALL remain functional
VERIFY: `grep` confirms the `#toggle-dark-mode` control and its `_layouts/post.html` handler are unremoved, and the `npm run test:visual` post-target `dark-class` baseline still renders the dark palette (its screenshot differs from the post light baseline); exit 0

### AC-105 (ubiquitous)
GIVEN P1 changes dark-mode surfaces and text bindings, and the only cascade-accurate measure of a rendered pair is the built output
WHEN the built `_site` is audited for text contrast in both the light (default) and dark (`prefers-color-scheme: dark`) cascades
THEN every text-bearing element SHALL satisfy WCAG 1.4.3 minimum contrast against its cascade-resolved background
VERIFY: `npm run test:axe`, extended to run axe-core's `color-contrast` rule against each built page under both a default and a `colorScheme:'dark'` browser context, reports zero `color-contrast` violations; exit 0

### AC-106 (ubiquitous)
GIVEN two live AA text failures measured with `scripts/lib/color-math.mjs` against the compiled cascade — (a) `/about` dark, where the globally-flipped `--dnd-brown` (`#e0e0e0`) renders on `_sass/_about.scss`'s never-flipped white surfaces at `.attribute-name` (`:599`), `.category-title` (`:714`), `.quest-title` (`:882`) and `.ability-name` (`:1057`), `#e0e0e0` on `#ffffff` = **1.32**; and (b) `.scroll-seal` (`_sass/_notebook.scss:675`) and `.scroll-seal i` (`:693`), whose `var(--dnd-brown)` text on the never-flipped `var(--ff-gold)` `#e6a553` ground measures **3.27** in the default theme and **1.61** in dark
WHEN P1 repairs these surfaces and text pairings
THEN each enumerated selector SHALL reach a computed contrast ratio of at least 4.5 against its cascade-resolved background in every theme it renders in
VERIFY: specified script runs `getComputedStyle` (Playwright) on built `_site/about.html` (dark) and `_site/notebook.html` (light + dark), computes each enumerated selector's foreground-vs-resolved-background ratio with `scripts/lib/color-math.mjs`, and asserts every value >= 4.5; exit 0

### AC-107 (unwanted-behavior)
GIVEN `.item-rarity-label` (`_sass/_laboratory.scss:613`) already clears AA in dark — its `var(--dnd-brown)` text resolves through the consolidated flip to `#e0e0e0` on its `var(--dnd-parchment)` `#232323` ground = **11.91** (NOT the 2.01/2.26 a per-partial reading falsely reports), so it is not a defect and must not be "repaired"
WHEN P1 consolidates the dark tokens and deletes dead per-selector literals
THEN `.item-rarity-label`'s dark-mode computed contrast SHALL remain at least 4.5
VERIFY: specified script asserts `getComputedStyle` on built `_site/laboratory.html` (dark) gives `.item-rarity-label` a ratio >= 4.5 with a computed color equal to the consolidated flipped token value (no per-selector dark literal introduced); exit 0

### AC-108 (ubiquitous)
GIVEN `_data/palette-manifest.yml:32` `declared_backgrounds` covers only cream/light/parchment-dark plus two hero-gradients, so the contrast suite cannot see the gold ground `--ff-gold` `#e6a553` (where `.scroll-seal` text sits, failing today) nor the dark canvas `#232323`
WHEN the manifest's declared backgrounds are extended
THEN `declared_backgrounds` SHALL be extended to include the gold/dark ground set (`#e6a553`, `#232323`)
VERIFY: `npm run test:manifest` exits 0; `npm run test:contrast` measures the `.scroll-seal` text-token/`#e6a553` pair through a targeted theme-correct pairing (the hero-gradient pattern at `palette-contrast.test.mjs:69-94`, never a blanket cross-product that would false-positive light `-ink` tokens on `#232323`) and prints each new gold/dark pair with its numeric ratio; exit 0

### AC-109 (unwanted-behavior)
GIVEN the consolidated dark flip now resolves selectors that previously carried a hand-written per-selector dark literal (e.g. the thirteen `color: #e0e0e0` overrides across the dark blocks of `_notebook.scss`/`_laboratory.scss`/`_letter.scss`), some now redundant and some still load-bearing
WHEN a per-selector dark literal is deleted
THEN the compiled computed style of that selector in dark mode SHALL be unchanged by the deletion
VERIFY: specified script diffs `getComputedStyle` of each affected selector on built `_site` (dark) before and after each literal removal and asserts zero change; a literal whose removal alters the computed value is retained, not deleted; exit 0

### AC-110 (event-driven)
GIVEN the authoritative visual baselines are being regenerated post-font-self-hosting, and P1 intentionally moves pixels ONLY at the repaired selectors — `/about` dark surfaces/text and `.scroll-seal` in both themes
WHEN `npm run test:visual` compares the built `_site` against the authoritative baselines
THEN every target whose diff exceeds tolerance SHALL correspond to an enumerated expected-diff page (the `about` dark viewports or the `notebook` light and dark viewports)
VERIFY: `npm run test:visual` (compare mode) diff report is cross-checked against the enumeration; a diff at any non-enumerated target, or any change to a `margin`/`padding`/`border-radius` computed value (`git diff`), fails the phase; exit 0

### AC-111 (ubiquitous)
GIVEN `npm run test:a11y-static` is the project's trust anchor and passes at spec time
WHEN the a11y suite runs at the end of P1
THEN `npm run test:a11y-static` SHALL exit 0
VERIFY: `npm run test:a11y-static`; exit 0

### AC-112 (ubiquitous)
GIVEN P1 is its own ESL change, independently revertable (AC-002)
WHEN P1's merge commit is reverted
THEN the reverted tree SHALL still build and pass the a11y suite
VERIFY: `git revert` of P1's merge commit leaves `bundle exec jekyll build` exit 0 and `npm run test:a11y-static` exit 0

---

## Phase 2 — ITCSS + BEM + Sass module migration

### AC-201 (ubiquitous)
GIVEN `scripts/lib/scss-scan.mjs:23` performs a flat, non-recursive `readdirSync(SASS_DIR).filter(f => f.endsWith('.scss'))`, so a partial moved into a subdirectory becomes invisible to the scanner
WHEN the scanner enumerates stylesheet sources
THEN `listScssFiles()` SHALL return every `.scss` file under `_sass/` at any directory depth
VERIFY: specified test asserts `listScssFiles().length` equals the count from a recursive `find _sass -name '*.scss'`; exit 0

### AC-202 (ubiquitous)
GIVEN the anti-vacuity guard at `scripts/token-usage.test.mjs:65` only fires on a total wipeout (`usages.length === 0`), so a scanner silently skipping one subdirectory still passes
WHEN the token-usage suite runs
THEN the suite SHALL fail if the scanner's scanned-file count diverges from the recursive on-disk `.scss` count
VERIFY: specified strengthened guard in `token-usage.test.mjs`; mutation check — temporarily moving one partial into a subdirectory makes the suite FAIL before AC-201 lands and PASS after

### AC-203 (ubiquitous)
GIVEN `_data/palette-manifest.yml:31` hardcodes `meta.source: _sass/_variables.scss`, and `scripts/palette-manifest.test.mjs:68,75` locks manifest and source bidirectionally, so an ITCSS split of the settings layer breaks the suite by construction
WHEN the settings layer is split across more than one file
THEN `meta.source` SHALL resolve every file of the settings layer rather than one fixed path
VERIFY: `npm run test:manifest` exits 0 with the settings layer split across >1 file; the test resolves `meta.source` as a directory glob

### AC-204 (ubiquitous)
GIVEN AC-201..AC-203 make the harness structure-agnostic
WHEN the harness migration lands
THEN the harness migration SHALL land in its own commit, before any partial is moved
VERIFY: gate — `git log` shows the `scss-scan.mjs`/`meta.source` commit strictly precedes the first file-move commit; a file move in the same commit fails the gate

### AC-205 (ubiquitous)
GIVEN `scripts/lib/scss-scan.mjs:21` hardcodes `LOGOTYPE_SELECTORS = ['.hero-subtitle']`, consumed by `isLogotypeContext()` at `:110`, so renaming that selector silently reclassifies logotype token usages instead of failing loudly
WHEN a BEM rename touches the wordmark selector
THEN the logotype selector set SHALL be updated in the same commit as the rename
VERIFY: specified test asserts every entry of `LOGOTYPE_SELECTORS` matches at least one selector present in `_sass/`; a stale entry fails the suite loudly

### AC-206 (ubiquitous)
GIVEN the RPG/FF/D&D vocabulary is ubiquitous language that BEM wraps and never renames (`CONVENTIONS.md`)
WHEN a BEM rename is applied to a domain selector
THEN the domain noun SHALL be preserved in the resulting block name
VERIFY: gate — reviewer checks each rename against the rule `.scroll-card -> .scroll__card`, never `.card`; a rename dropping the domain noun is rejected

### AC-207 (ubiquitous)
GIVEN `.share-button` is defined twice — `_sass/_components.scss:214` (2.5rem, `::before` overlay, `position:relative`, `overflow:hidden`) and `_sass/_post.scss:477` (36px, `.twitter`/`.linkedin` grounds) — and `_post.scss` is imported later (`assets/css/main.scss:16`), so the rendered button is a hybrid of both
WHEN the two definitions are flattened into one
THEN the flattened definition SHALL compute to the same rendered result as today's cascade
VERIFY: `npm run test:visual` reports zero diff on the post target (P0 now exists — R1); a computed-style dump of `.share-button` before and after is byte-identical (GAP-5: which definition was *intended* is unknown and is NOT decided here)

### AC-208 (ubiquitous)
GIVEN 16 `@import` statements and 18 `darken()` calls in `_sass/`, both deprecated by Dart Sass, and `@use`/`@forward` is itself the variable/mixin hierarchy mechanism ITCSS requires
WHEN the site is built after the module migration
THEN the build SHALL emit zero Sass deprecation warnings for `@import`
VERIFY: `bundle exec jekyll build` stderr contains no `DEPRECATION WARNING` mentioning `@import`; exit 0

### AC-209 (ubiquitous)
GIVEN `darken()` is deprecated in favour of `color.adjust()`/`color.scale()`, and `_sass/_variables.scss:82,83,93` derive `--ff-purple-ink`, `--ff-purple-light-ink` and `--dnd-brown` through it
WHEN the colour functions are migrated
THEN every migrated colour SHALL retain its exact pre-migration computed hex
VERIFY: specified script compares each derived token's compiled hex before and after against `scripts/lib/color-math.mjs`; `--ff-purple-ink` remains `#783cb4`; zero drift

### AC-210 (ubiquitous)
GIVEN P2 restructures files and selectors without intending any rendering change
WHEN the a11y suite runs at the end of P2
THEN `npm run test:a11y-static` SHALL exit 0
VERIFY: `npm run test:a11y-static`; exit 0

### AC-211 (ubiquitous)
GIVEN the four real specificity fights at `_sass/_about.scss:404,405,411,412`, where `.avatar-orbs .orb` (0,2,0) beats `.orb-2` (0,1,0) and is compensated with `!important`
WHEN BEM flattens those selectors to equal specificity
THEN those four `!important` declarations SHALL be removed
VERIFY: `grep -c '!important' _sass/_about.scss` returns 0; the sitewide count drops from 38 to 34

### AC-212 (unwanted-behavior)
GIVEN 34 of the 38 `!important` declarations are legitimate — 22 in the print layer (`_sass/_post.scss:1199-1264`), 11 the required `.visually-hidden` clip idiom (`_sass/_utilities.scss`), 1 in dead `.hljs`
WHEN a contributor attempts a mass `!important` purge
THEN the print-layer and `.visually-hidden` declarations SHALL be preserved
VERIFY: `grep -c '!important' _sass/_utilities.scss` returns 11; the print-layer count in `_sass/_post.scss` remains 22

---

## Phase 3 — HTML component extraction

### AC-301 (ubiquitous)
GIVEN `.section-icon` names two structurally different components — an inline icon (`<i class="fas fa-scroll section-icon">` at `codex.html:33`, styled `margin-right`/`color` by `_sass/_letter.scss:244` and three byte-identical definitions at `_about.scss:1305`, `_notebook.scss:242`, `_laboratory.scss:202`) and a circular badge wrapper (`<div class="section-icon">` at `_layouts/post.html:106`, styled `background`/`border-radius:50%`/`display:flex` by `_sass/_post.scss:314`)
WHEN the component is split
THEN each of the two structural roles SHALL be addressed by its own distinct block name
VERIFY: specified script asserts no class name is styled with both `border-radius:50%` + `background` (badge signature) and bare `margin-right` + `color` (inline signature) across `_sass/`; exit 0

### AC-302 (ubiquitous)
GIVEN the inline-icon form is the dominant one (4 definitions, 21 of the 22 markup sites) and the badge form is the outlier (1 definition, 1 site)
WHEN the inline-icon definitions are consolidated
THEN the inline icon SHALL have exactly one definition in the stylesheet sources
VERIFY: `grep -rn '^\.<inline-icon-block> {' _sass/` returns exactly 1 match

### AC-303 (unwanted-behavior)
GIVEN the badge's foreground candidates were both measured on the `--ff-purple-light` (`#b19cd9`) ground with `scripts/lib/color-math.mjs` — intended `white` = **2.43**, actual `--ff-purple-ink` (`#783cb4`, forced by the later-imported `_letter.scss:244`) = **2.78** — so the accidental override is *better* than the design and neither clears 3.0
WHEN the dual-component defect is repaired
THEN the repair SHALL NOT restore `color: white` on the badge ground
VERIFY: gate — the diff does not reintroduce `color: white` against an undarkened `--ff-purple-light` ground; D-D governs the final pair (owner-gated; the icon is decorative, so WCAG 1.4.11 does not bite and no ratio threshold is asserted here)

### AC-304 (ubiquitous)
GIVEN the decorative `<i class="fas fa-list-ul">` at `_layouts/post.html:107` sits beside `<h3 class="toc-title">Contents</h3>`, which carries the meaning
WHEN the post TOC header is rendered
THEN the decorative icon SHALL carry `aria-hidden="true"`
VERIFY: built `_site` post page — the TOC header `<i>` has `aria-hidden="true"`; `npm run test:axe` exits 0

### AC-305 (ubiquitous)
GIVEN `.skip-to-content` is styled at `_sass/_utilities.scss:203` but appears in no markup — a missing WCAG 2.4.1 (Bypass Blocks) feature, not dead code
WHEN any page is rendered
THEN that page SHALL expose a skip link targeting its main content
VERIFY: built `_site` — every page contains an `<a class="skip-to-content" href="#...">` whose target id exists on the same page; `npm run test:axe` exits 0

### AC-306 (ubiquitous)
GIVEN `.section-icon` (5 standalone definitions + 1 contextual at `_sass/_post.scss:997`) and `.section-title` (5 definitions) are GLOBAL selectors, so duplication is live collision rather than mere redundancy
WHEN a component is extracted to a shared include
THEN that component SHALL have exactly one definition site in the stylesheet sources
VERIFY: specified script asserts each extracted block name has exactly 1 standalone definition across `_sass/`; exit 0

### AC-307 (ubiquitous)
GIVEN P3 changes markup structure
WHEN the a11y suite runs at the end of P3
THEN `npm run test:a11y-static` SHALL exit 0
VERIFY: `npm run test:a11y-static`; exit 0

---

## Phase 4 — Dead code removal

### AC-401 (ubiquitous)
GIVEN `.hljs` is styled at `_sass/_post.scss:1146` while highlight.js is loaded nowhere in the repo, and kramdown/rouge emits `.highlight` instead
WHEN the dead rule is removed
THEN `_sass/` SHALL contain no `.hljs` rule
VERIFY: `grep -rn '\.hljs' _sass/` returns zero matches; `npm run test:a11y-static` exits 0

### AC-402 (ubiquitous)
GIVEN `--dnd-red` is declared at `_sass/_variables.scss:94` and mirrored by a manifest row at `_data/palette-manifest.yml:148`, and `scripts/palette-manifest.test.mjs:75` fails on a manifest row whose token is not declared in the source
WHEN `--dnd-red` is deleted
THEN its manifest row SHALL be deleted in the same commit
VERIFY: `npm run test:manifest` exits 0 after the deletion; a source-only deletion fails the suite

### AC-403 (unwanted-behavior)
GIVEN `post-type-badge--{{ type_key }}` (`_includes/post-type-badge.html:19`) and `mastery-{{ skill.level }}` (`about.html:197`) are Liquid-interpolated class names that a naive grep reports as unused
WHEN dead-code detection runs
THEN a Liquid-interpolated class SHALL NOT be reported as dead
VERIFY: specified detector resolves `{{ }}` against `_data/post_types.yml` `order` and the skill levels in `about.html`; a fixture asserts both names are classified LIVE

### AC-404 (ubiquitous)
GIVEN `.skip-to-content` is a missing feature installed by AC-305, not dead code
WHEN dead-code removal runs
THEN `.skip-to-content` SHALL be retained
VERIFY: `grep -rn 'skip-to-content' _sass/_utilities.scss` still matches after P4; AC-305's markup assertion still passes

### AC-405 (ubiquitous)
GIVEN the HIGH-confidence dead set `.architecture-icon`, `.hero-actions`, `.page-header`, `.post-toc-wrapper`, `.col--offset-3`
WHEN each is removed
THEN each removal SHALL be justified by a detector run that resolves Liquid interpolation (AC-403)
VERIFY: the detector reports each name as unreferenced in both markup and Liquid-resolved output before its removal commit

### AC-406 (optional-feature)
GIVEN the MEDIUM-confidence set — the unused utility layer (`d-flex`, `mb-1..4`) and the mutually redundant, both-unused `.visually-hidden` / `.sr-only`
WHERE the owner elects to remove the MEDIUM set
THEN `.visually-hidden` and `.sr-only` SHALL NOT both be deleted, since the clip idiom is the standard target for a future skip link and screen-reader-only text
VERIFY: gate — at most one of the two is removed; the survivor retains its 11 `!important` clip declarations (AC-212)

### AC-407 (ubiquitous)
GIVEN P4 removes code that should have no consumers
WHEN the a11y suite runs at the end of P4
THEN `npm run test:a11y-static` SHALL exit 0
VERIFY: `npm run test:a11y-static`; exit 0
