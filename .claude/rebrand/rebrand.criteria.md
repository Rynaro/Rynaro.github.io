### AC-001 (ubiquitous)
THEN the site SHALL define the canonical compound identity line in exactly one `_data` field consumed verbatim by the homepage hero, the About page, and the meta description
VERIFY: grep finds the identity string defined once under `_data/`; index.html, about.html, `_includes/head/meta.html` each reference that field

### AC-002 (ubiquitous)
THEN the site SHALL present one canonical job title identically in `_data/character_build.yml` and `_data/jobs.yaml`, replacing the Director-of-Development vs Director-of-Engineering split
VERIFY: the job title in character_build.yml equals jobs.yaml[0].title; `grep -rn "Director of" _data` yields a single distinct title

### AC-003 (ubiquitous)
THEN the repository SHALL document the five themed post-types as the closed set of allowed `type` front-matter values in a committed conventions file
VERIFY: a conventions doc enumerates {scroll, cantrip, log, distillation, transmutation} as the permitted `type:` values

### AC-004 (event-driven)
GIVEN the rebranded site source
WHEN `jekyll build` runs with `JEKYLL_ENV=production`
THEN the build SHALL exit 0 with no missing-layout or missing-include error in its log
VERIFY: gate: `jekyll build` exits 0; build log contains no "Could not find layout" or "Included file not found"

### AC-005 (unwanted-behavior)
GIVEN favicon and social-card image references in the built output
WHEN `_site` is scanned for local image paths
THEN every referenced local image SHALL resolve to a file that exists, never a dangling path such as bottle.png or me.jpg
VERIFY: script asserts each local image reference in `_site` exists on disk; zero missing

### AC-006 (event-driven)
GIVEN a post carrying a per-post summary field
WHEN the page is built with jekyll-seo-tag enabled
THEN the emitted meta description SHALL be that post's own summary rather than the generic site description
VERIFY: for a sample post, the `_site` meta description equals the post summary text, not `site.description`

### AC-007 (ubiquitous)
THEN the site SHALL publish a syndication feed whose entries contain the full post body rather than a truncated excerpt
VERIFY: the first `feed.xml` entry content length is within 5% of the rendered post body length

### AC-008 (ubiquitous)
THEN the site chrome SHALL surface a human-visible link to the feed in the header or footer, not only a `<link rel>` hint
VERIFY: an `<a>` whose href resolves to the feed appears in the rendered header or footer markup

### AC-009 (unwanted-behavior)
GIVEN the retired Universal Analytics property
WHEN the built site is scanned for analytics identifiers
THEN no `UA-` Universal Analytics identifier SHALL remain in any emitted page
VERIFY: `grep -r "UA-135917274" _site` returns zero matches

### AC-010 (ubiquitous)
THEN the build SHALL emit a `sitemap.xml` listing the published pages of the site
VERIFY: `_site/sitemap.xml` exists and lists at least the home, About, Notebook, plus each post URL

### AC-011 (ubiquitous)
THEN every rendered page SHALL carry a canonical URL whose host is the served `hlavezzo.me` origin
VERIFY: each page's `<link rel="canonical">` host equals `hlavezzo.me`

### AC-012 (event-driven)
GIVEN the homepage
WHEN it is rendered
THEN it SHALL surface reader-facing post content below the hero rather than a hero-only landing
VERIFY: `_site/index.html` contains a post-list region linking at least the most recent post permalink

### AC-013 (unwanted-behavior)
GIVEN the Notebook category filter tabs
WHEN a reader filters by any category present in the post corpus
THEN every post SHALL be reachable through a non-"All" tab, never orphaned behind a phantom `storybook` tab
VERIFY: the set of tab `data-category` values equals the set of categories used by posts; no tab maps to zero posts

### AC-014 (ubiquitous)
THEN the site SHALL publish a `/now` page that displays a visible last-updated date
VERIFY: `_site/now/` renders and contains a "last updated" date string

### AC-015 (ubiquitous)
THEN the site SHALL publish a `/uses` page listing the current toolchain including the AI familiars
VERIFY: `_site/uses/` renders and lists hardware or editor plus the AI tools such as Claude or local models

### AC-016 (ubiquitous)
THEN the site SHALL serve a 404 page rendered through an existing themed layout rather than the unstyled minima remnant
VERIFY: `_site/404.html` renders with the site chrome; no reference to a missing `page` layout remains

### AC-017 (event-driven)
GIVEN a post declaring a `type` from the themed vocabulary
WHEN the post renders
THEN the post layout SHALL display a visible post-type badge matching that declared type
VERIFY: a post with `type: cantrip` renders a badge labeled for the cantrip type in `_site`

### AC-018 (optional-feature)
GIVEN a post that sets the optional epistemic-status (`assay`) field
WHEN the post renders
THEN the layout SHALL display the declared epistemic-status label
VERIFY: a post with `assay: speculative` renders the speculative label in `_site`

### AC-019 (ubiquitous)
THEN the site SHALL publish a reader-contract page stating the right-to-be-wrong or living-document terms for the journal
VERIFY: a terms or contract page renders and states the correction or revision policy

### AC-020 (ubiquitous)
THEN every page SHALL carry a sitewide "opinions are my own, not my employer's" disclaimer in the global footer
VERIFY: the disclaimer string appears in the shared footer include of every rendered page

### AC-021 (event-driven)
GIVEN the 2026 LLM-routing post
WHEN the research-dump ("transmutation") post-type is applied to it
THEN it SHALL render with a post-type badge visibly distinct from the handcrafted "scroll" essays
VERIFY: the post's rendered badge label differs from a scroll post's badge label

### AC-022 (ubiquitous)
THEN the site SHALL provide a cadence-anchor stream ("Alchemist's Log") with its own index or tag aggregation page
VERIFY: a log index or tag page renders and lists the log-type entries

### AC-023 (event-driven)
GIVEN a post whose body contains headings
WHEN the rendered page is loaded with JavaScript disabled
THEN the table-of-contents region SHALL contain server-rendered links to those headings rather than an empty "Contents" shell
VERIFY: JS-disabled fetch of a post shows `#toc-content` containing at least one anchor whose href matches a heading id

### AC-024 (unwanted-behavior)
GIVEN any page of the site
WHEN the operating system reports a reduced-motion preference
THEN no script-created animated node SHALL be injected into the page DOM
VERIFY: headless run with `prefers-reduced-motion: reduce` emulated over Home, About, Notebook, Laboratory, and Letter asserts zero script-injected animated nodes; `grep -rn "style.animation" assets/js/` shows every injection site behind a `matchMedia` reduced-motion guard

### AC-025 (event-driven)
GIVEN a visitor whose operating system reports a dark colour-scheme preference
WHEN any page is loaded with JavaScript disabled
THEN the page SHALL render in the dark theme via `prefers-color-scheme`
VERIFY: JS-disabled render with `prefers-color-scheme: dark` emulated shows the dark theme background token on every page, not only post pages

### AC-026 (ubiquitous)
THEN every palette token whose manifest role is `content` SHALL reach a contrast ratio of at least 4.5:1 against each declared background it is used on
VERIFY: the palette contrast unit test enumerates every (token, background) pair in which a `content`-role token is used across the declared-background set -- cream, light, parchment-dark, and the hero gradient stops `#211C30`/`#312A45` -- and asserts every pair is >= 4.5 without rounding; the test fails if the `content` set is empty

### AC-027 (ubiquitous)
THEN every meaning-bearing non-text boundary SHALL reach a contrast ratio of at least 3:1 against its adjacent colour
VERIFY: the palette contrast test asserts the stat-bar track hairline and fill-edge tokens are >= 3:1 against the adjacent surface without rounding

### AC-028 (ubiquitous)
THEN each character-sheet HP, MP, and ST bar SHALL expose `role="meter"` carrying `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`
VERIFY: axe run on the About page reports each HP/MP/ST bar with role meter and a non-empty aria-valuetext such as "85 of 100 hit points"

### AC-029 (ubiquitous)
THEN the EXP bar SHALL expose `role="progressbar"` rather than `role="meter"`
VERIFY: axe run on the About page reports the EXP bar with role progressbar and the required aria-value attributes

### AC-030 (unwanted-behavior)
GIVEN a project rendered with a rarity tier
WHEN the rarity chip is presented
THEN the tier SHALL be conveyed by a visible text label, never by chip colour alone
VERIFY: each rarity chip in `_site` contains the tier word as text; Color Oracle simulation confirms tiers remain distinguishable without hue

### AC-031 (unwanted-behavior)
GIVEN any auto-starting animation presented in parallel with other content on any page
WHEN the page is loaded with no motion preference expressed
THEN the animation SHALL complete within five seconds rather than loop indefinitely
VERIFY: `grep -rn "infinite" _sass/ assets/js/` returns zero hits outside a `--motionOK` gated block; each remaining animation declares a finite duration <= 5s and a non-infinite iteration count

### AC-032 (ubiquitous)
THEN every purely decorative SVG ornament SHALL be hidden from assistive technology by exactly one method
VERIFY: each ornament SVG root carries `aria-hidden="true"` and no ornament carries both `aria-hidden` and an empty `alt`

### AC-033 (ubiquitous)
THEN every themed navigation item SHALL expose an accessible name that contains its visible themed label
VERIFY: the accessible name for the Notebook link contains the string "Notebook"; axe reports no label-in-name violation

### AC-034 (unwanted-behavior)
GIVEN a fluid type rule expressed with `clamp()`
WHEN the rule is evaluated
THEN its maximum value SHALL be no more than 2.5 times its minimum value
VERIFY: a script parses every `clamp()` in `_sass/` and asserts max/min <= 2.5

### AC-035 (event-driven)
GIVEN any page of the site
WHEN it is viewed at a viewport width equivalent to 320 CSS pixels
THEN the content SHALL reflow without requiring scrolling in two dimensions
VERIFY: a 320px-wide render of Home, About, and one post shows no horizontal scrollbar

### AC-036 (event-driven)
GIVEN any interactive element
WHEN it receives keyboard focus
THEN its focus indicator SHALL remain visible and not be entirely obscured by the fixed sidebar or sticky chrome
VERIFY: keyboard walk of Home, About, and one post shows a visible focus ring on every interactive element with no element hidden behind the 60px sidebar

### AC-037 (ubiquitous)
THEN every pointer target SHALL present a hit area of at least 24 by 24 CSS pixels or satisfy the 24px spacing exception
VERIFY: axe target-size check reports zero violations across the sigil nav and social icon row

### AC-038 (unwanted-behavior)
GIVEN a themed chip, badge, banner, or stat row
WHEN a user overrides text spacing to the 1.4.12 values
THEN no text SHALL be clipped by a fixed height
VERIFY: `grep -rnE '(^|[^-[:alnum:]])height:[[:space:]]*[0-9]' _sass/` returns zero hits within themed chip, badge, banner, or stat-row rule blocks (this pattern excludes `min-height`/`max-height`/`line-height`); the text-spacing bookmarklet clips nothing

### AC-039 (ubiquitous)
THEN the continuous-integration pipeline SHALL fail the build when any sitemap URL reports a WCAG 2.2 AA violation
VERIFY: `pa11y-ci` with the axe runner and `standard: WCAG2AA` runs over the sitemap in GitHub Actions and exits non-zero on any violation

### AC-040 (ubiquitous)
THEN the site SHALL publish an `/accessibility` page stating the conformance target and the known gaps
VERIFY: `_site/accessibility/` renders and names WCAG 2.2 AA, the automated axe check, and a contact route for reports

### AC-041 (unwanted-behavior)
GIVEN the compiled Opal island artifact
WHEN any page other than the island page is built
THEN it SHALL ship zero bytes of Opal runtime
VERIFY: a script builds the set of every page in `_site` that loads Opal runtime bytes -- resolving each page's `<script src>` references and matching those referenced payloads against `Opal` -- and asserts that set equals exactly {`_site/laboratory/transmutation-circle/index.html`}; the check inspects the referenced `.js` payloads, not the HTML text

### AC-042 (ubiquitous)
THEN the island page total JavaScript SHALL be at most 150 KiB gzipped
VERIFY: gzipped byte sum of every script the island page loads is <= 153600

### AC-043 (unwanted-behavior)
GIVEN the committed Opal artifact
WHEN the drift gate recompiles the source
THEN the committed output SHALL match a recompile that pins the exact flag set including `--no-source-map`
VERIFY: CI recompiles with the pinned flag list and byte-compares against the committed artifact; no `sourceMappingURL` appears in the committed output

### AC-044 (ubiquitous)
THEN the island's Ruby `require` list SHALL be enumerated in a committed manifest with a measured gzipped cost recorded per require
VERIFY: a committed manifest lists each require with its measured gz delta; every entry beyond `native` carries a measurement predating its adoption

### AC-045 (event-driven)
GIVEN the island page
WHEN it is loaded with JavaScript disabled
THEN it SHALL present a static inline SVG of the circle with explanatory prose
VERIFY: JS-disabled fetch of the island page shows a `<noscript>` region containing an inline `<svg>` and descriptive text

### AC-046 (ubiquitous)
THEN the island SHALL ship together with a `type: transmutation` post stating, in the owner's own words, what the widget does that justifies 135 KiB of runtime to a reader
VERIFY: the post contains an explicit value-floor paragraph naming what the widget does for the reader; a reviewer can answer "would someone visit this for its own sake?" from that paragraph alone

### AC-047 (unwanted-behavior)
GIVEN a palette token referenced by a CSS `color`, `border-color`, or `fill` rule that renders body text or a meaning-bearing boundary, and whose manifest role is not `logotype`
WHEN the token classification manifest is applied
THEN that token SHALL carry manifest role `content` with obligation `ink`, resolving to an `-ink` token rather than an `-ornament` one
VERIFY: a script cross-references every token usage in `_sass/` against the manifest and asserts every non-`logotype` body-text or meaning-bearing-boundary usage resolves to a token whose role is `content` and obligation is `ink`; zero such usages resolve to an `ornament` or `exempt` token

### AC-048 (ubiquitous)
THEN the repository SHALL carry a committed manifest assigning every palette token exactly one `role` from ornament, logotype, or content together with exactly one `obligation` from ink or exempt, under the mapping in which `content` takes `ink` while `ornament` and `logotype` take `exempt`
VERIFY: a committed manifest enumerates every token declared in `_sass/_variables.scss` with exactly one role and one obligation each; zero tokens are unclassified; a script asserts that role `content` holds if and only if obligation `ink` for every row, and asserts that every `logotype`-role token is referenced only by rules inside the wordmark selector set (`.hero-subtitle` in `_home.scss` and `_about.scss`) and by no rule that renders body text

### AC-049 (ubiquitous)
THEN the palette contrast test SHALL run as a blocking continuous-integration check from the first accessibility release onward
VERIFY: the CI workflow invokes the palette contrast test and exits non-zero on any failing token; the check is present in the same release that ships the ink token split

### AC-050 (unwanted-behavior)
GIVEN the Opal island's transmutation circle animation
WHEN the island page is loaded with no motion preference expressed
THEN the animation SHALL complete within five seconds rather than loop indefinitely
VERIFY: a headless run of the island page records zero transform or style mutation on the circle between t=5s and t=15s with no user input; additionally `grep -n "infinite"` over the island's compiled artifact and stylesheet returns zero hits -- the behavioural clause governs, so a `requestAnimationFrame` loop that declares no duration still fails

### AC-051 (event-driven)
GIVEN the Opal island widget
WHEN a keyboard user tabs to it and operates it with arrow keys
THEN every interactive control SHALL be keyboard-operable -- reachable, showing a visible focus indicator, and releasing focus on Tab
VERIFY: keyboard walk of the island page reaches each control, shows a visible focus ring, and exits the widget by Tab without a focus trap

### AC-052 (unwanted-behavior)
GIVEN the island's compiled script tag
WHEN the site is built
THEN the island's compiled script SHALL be loaded only by the island page and only with the `defer` attribute
VERIFY: the island page's script tag matches `defer`; `grep -rl "transmutation-circle" _site --include='*.html'` returns exactly the island page

### AC-053 (ubiquitous)
THEN the owner's value-floor decision SHALL exist as a committed record stating a `go` verdict before any island source is written
VERIFY: given island source exists in `_opal/`, a committed decision record states a dated `go` verdict on the value floor and its commit timestamp precedes the first commit touching `_opal/`; a `no-go` record followed by any `_opal/` commit fails

### AC-054 (unwanted-behavior)
GIVEN the built site's emitted markup
WHEN it is scanned for Font Awesome stylesheet references
THEN exactly one Font Awesome version SHALL be loaded
VERIFY: `grep -rho "font-awesome[^\"']*" _site | sort -u` yields exactly one version string

### AC-055 (unwanted-behavior)
GIVEN the post front matter across the corpus
WHEN it is scanned for comment-system fields
THEN no post SHALL declare a `comments` field while no comment system is wired
VERIFY: `grep -rn "^comments:" _posts/` returns zero matches

### AC-056 (unwanted-behavior)
GIVEN the emitted meta tags
WHEN the site declares no Portuguese content
THEN no `og:locale:alternate` value of `pt_BR` SHALL be emitted
VERIFY: `grep -rn "pt_BR" _site` returns zero matches

### AC-057 (unwanted-behavior)
GIVEN the emitted meta keywords
WHEN the built site is scanned
THEN every programming language advertised in the keywords SHALL be a member of the language set backed by the skills data
VERIFY: a script builds the backed set L from `_data/skills.yml` categories["Programming Languages"].skills[].name (case-folded); splits every emitted `<meta name="keywords">` content on commas into case-folded, trimmed tokens K; and for each token matching the pinned language lexicon V = {ruby, elixir, javascript, typescript, golang, go, crystal, python, rust, clojure, java, c, c++, c#, php, perl, scala, kotlin, swift, haskell, erlang} as a whole word, asserts that language is a member of L; zero unbacked languages remain (today's unbacked set is golang, crystal, python, rust)

### AC-058 (unwanted-behavior)
GIVEN a fluid type rule expressed with `clamp()`
WHEN its middle term is inspected
THEN that middle term SHALL carry a `rem` or `px` component rather than a viewport unit alone
VERIFY: a script parses every `clamp()` in `_sass/` and asserts each middle term matches a `rem` or `px` component; zero `vw`-only middle terms remain

### AC-059 (ubiquitous)
THEN the `type: transmutation` post SHALL state the shipped island artifact's re-measured gzipped size together with its runtime/require/app-code tier decomposition
VERIFY: the post states the shipped artifact's final measured gzipped bytes, equal to the artifact's own component of the CI measurement AC-042 performs on the island page (the artifact figure, not the page total -- the two differ by the page's other scripts), states the three tier percentages (runtime / require / app code) summing to 100, names the per-file-sum method for the site-JS baseline (each file gzipped separately, as served), and `grep -nE "7,?862|7\.9 ?KB|17\.8|18\.25" <post>` returns zero matches
