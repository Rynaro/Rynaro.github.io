# Whimsy AND WCAG: Building a Decorative, Personality-Forward Site That Is Genuinely Excellent

Research report for the **Code Alchemist** rebrand of hlavezzo.me. July 2026.

**Scope note.** This report *extends* [`research-personal-site.md`](./research-personal-site.md) §4 rather than duplicating it. That section established the text-first/minimal norm, dark mode via `prefers-color-scheme` + toggle, 4.5:1 body contrast, semantic landmarks, and RSS — and it explicitly recommended "minimal-fast" over "maximal-whimsy." **This report takes the opposite brief as a hard constraint**: the fantasy-RPG persona ships, and the job is to make it pass. Everywhere the two reports touch, this one is the operative guidance for the *decorative* layer; §4 remains operative for feeds, dark-mode plumbing, and landmarks.

**Method note.** Sections 1–5 and 7 are sourced from W3C Understanding docs, MDN, and named practitioner essays. Section 2 additionally contains an **original contrast audit of this repository's actual palette** (`_sass/_variables.scss:5-63`), computed with the WCAG 2.x relative-luminance formula. Section 6's exemplars were verified by fetching the sites/essays; where a claimed exemplar did *not* hold up, that is reported rather than hidden.

---

## 1. WCAG 2.2 Practical Baseline — The Criteria That Actually Bite Decorative Designs

WCAG 2.2 (W3C Recommendation) is the operative bar. WCAG 3.0 is a Working Draft not expected to reach Recommendation until roughly 2030 and will coexist with, not replace, 2.2 ([W3C WCAG 3.0 draft](https://www.w3.org/TR/wcag-3.0/); [Adrian Roselli, April 2026](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)). Target **AA**.

Most of WCAG is indifferent to whether a site is ornate. Six criteria are not — these are the ones a fantasy skin collides with.

### 1.4.3 Contrast (Minimum), AA — and its three escape hatches

> "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1"; large-scale text 3:1. Large-scale = "at least 18 point or 14 point bold" (≈24px / ≈18.66px bold).
> — [Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

The three exceptions are the persona's best friends, and they are narrower than people assume:

> **Incidental:** "Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement."
> **Logotypes:** "Text that is part of a logo or brand name has no contrast requirement."

So: the rune ring is exempt (pure decoration). The wordmark is exempt (logotype). A tagline is **not** exempt — it's text you intend people to read.

### 1.4.11 Non-text Contrast, AA — the one that bites stat bars and rarity chips

> "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): **User Interface Components** — Visual information required to identify user interface components and states, except for inactive components…; **Graphical Objects** — Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed."
> — [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

Two operative details. First, "the computed values should not be rounded (e.g. 2.999:1 would not meet the 3:1 threshold)." Second — and this is the whole ballgame for HP/MP bars — the criterion binds *"parts of graphics required to understand the content."* On a stat bar, the part required to understand the content is **the boundary between the filled and unfilled portion**. That boundary, not the pastel itself, is what must hit 3:1. This is a much cheaper obligation than "make the pastel dark."

### 2.5.8 Target Size (Minimum), AA — the sigil nav and social icon row

> "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:"
> — **Spacing:** "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target"
> — **Equivalent:** "The function can be achieved through a different control on the same page that meets this criterion"
> — **Inline:** "The target is in a sentence or its size is otherwise constrained by the line-height of non-target text"
> — **User agent control** / **Essential**
> — [Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

Note the shape of the Spacing exception: a decorative 16px sigil can stay 16px *visually* as long as its hit area is padded out, or as long as neighbours are far enough apart that the 24px circles don't intersect. Decoration size and target size are decoupled. [C42](https://www.w3.org/WAI/WCAG22/Techniques/css/C42) is the sanctioned technique (`min-height`/`min-width` on the target container).

### 2.4.11 Focus Not Obscured (Minimum), AA — and 2.4.13 Focus Appearance, AAA

2.4.11 (AA): "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content." The named failure is [F110](https://www.w3.org/WAI/WCAG22/Techniques/failures/F110) — "a sticky footer or header completely hiding focused elements." A themed site with a fixed sigil sidebar or sticky ornamental header is exactly the F110 shape.

2.4.13 (AAA, worth hitting anyway) defines *how visible*: the focus indicator "is at least as large as the area of a 2 CSS pixel thick perimeter of the unfocused component," and "has a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states" ([Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)). The Understanding doc also warns that "semi-transparent overlays or overlays that apply a blur or other dimming effect may also cause failures of 1.4.11 Non-text Contrast and/or 2.4.13" — relevant to any parchment-texture or glow overlay.

### 1.4.10 Reflow, AA — the character sheet's problem

> "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels [and] Horizontal scrolling content at a height equivalent to 256 CSS pixels" — except content that "requires two-dimensional layout for usage or meaning."
> — [Understanding 1.4.10](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)

320 CSS px ≈ a 1280px window at 400% zoom. The exception list (maps, diagrams, data tables, games) is about *usage or meaning*, not about aesthetics. An RPG character sheet laid out in two columns because it looks like a character sheet does **not** qualify — the meaning survives one column.

### 1.4.12 Text Spacing, AA — the quiet killer of fixed-height chrome

The user may override to: line-height 1.5×, spacing after paragraphs 2×, letter-spacing 0.12×, word-spacing 0.16× font size. "Content is not required to use these text spacing values; the requirement is to ensure that when a user overrides the authored text spacing, content or functionality is not lost" ([Understanding 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)).

Decorative UI fails this constantly, and always for the same reason: `height` instead of `min-height` on a themed chip, badge, banner, or button, so the text clips when it grows.

### implication for the Code Alchemist rebrand

- **Bank the two exemptions deliberately, in writing.** Classify every visual token as `ornament` (rune ring, alchemy glyphs, parchment texture, corner filigree → exempt as pure decoration), `logotype` (the "Code Alchemist" wordmark → exempt), or `content` (everything else → must pass). The persona survives because the *decoration* is exempt by spec, not by mercy — but that only works if the decoration carries no information. The moment a rune means something, it loses its exemption. Keep runes meaningless and they can stay any color you like.
- **Decouple ornament size from hit size.** Keep the sigil glyphs and social icons at whatever size the composition wants; wrap each in a `min-width:24px; min-height:24px` (or padded) target per C42, or space them so the 24px circles don't intersect. Zero visual cost.
- **Audit the fixed sidebar against F110 now, not later.** `$sidebar-width: 60px` (`_sass/_variables.scss:20`) plus any sticky header is the classic 2.4.11 failure geometry. Cheapest fix: `scroll-margin` on focusable targets — invisible, no design change.
- **Trade-off, named:** the two-column character sheet is a genuine persona-vs-1.4.10 conflict — the two-column parchment *is* the visual joke. Cheapest reconciliation: keep two columns down to ~600px, then single-column with the parchment frame and stat bars intact. You lose the sheet's *silhouette* at 320px, not its identity. Do **not** claim the "two-dimensional layout" exception; it won't hold.

---

## 2. Pastel Palettes and Contrast — The Site's Actual Numbers

The generic finding is well established: pastels are high-lightness, low-saturation, and "colors with very different lightness values will almost always have sufficient contrast, regardless of hue" — pastels sit at 70–90% lightness and therefore cannot get far from a light background ([Dopely, accessible palettes](https://dopelycolors.com/blog/accessible-color-palettes)). The subtler trap: "a swatch can look good in isolation but fail when used as button text, card borders, form focus rings, alerts, links, or chart colors."

Rather than restate that, here is **this repository's palette, measured**. Computed from `_sass/_variables.scss:5-63` using the WCAG 2.x relative-luminance / contrast-ratio formula ([1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).

### 2.1 Foreground tokens vs. the site's backgrounds

`bg-cream` = `#F8F5F2` (`$background-cream`). AA body = 4.5:1; large text / non-text = 3:1.

| Token | Hex | vs `#F8F5F2` cream | vs `#F0ECE9` light | vs `#e8e0c0` parchment-dark | Verdict |
|---|---|---|---|---|---|
| `$text-dark` | `#4A4A4A` | **8.16** | 7.55 | 6.69 | ✅ body anywhere |
| `--text-primary` | `#333` | **11.63** | 10.76 | 9.54 | ✅ body anywhere |
| `--dnd-ink` | `#4e342e` | **10.43** | 9.64 | 8.55 | ✅ body anywhere |
| `--ink-color` | `#3a2921` | **12.73** | 11.77 | 10.44 | ✅ body anywhere |
| `$text-medium` | `#6D6D6D` | 4.76 | **4.41 ✗** | **3.91 ✗** | ⚠️ AA on cream only |
| `--text-secondary` | `#666` | 5.29 | 4.89 | **4.33 ✗** | ⚠️ fails on parchment-dark |
| `--dnd-red` | `#a94442` | 5.38 | 4.98 | **4.41 ✗** | ⚠️ fails on parchment-dark |
| `--ff-blue-dark` | `#306d9a` | 5.12 | 4.73 | **4.19 ✗** | ⚠️ fails on parchment-dark |
| `$text-light` | `#8A8A8A` | **3.18 ✗** | **2.94 ✗✗** | **2.61 ✗✗** | ❌ never body text |
| `--text-light` | `#898989` | **3.22 ✗** | **2.98 ✗✗** | **2.64 ✗✗** | ❌ never body text |
| `--dnd-brown` | `#8a6d3b` | **4.46 ✗** | **4.13 ✗** | **3.66 ✗** | ❌ misses 4.5 by 0.04 |
| `--ff-purple` | `#9966cc` | **3.77 ✗** | 3.49 | 3.09 | ❌ large/non-text only |
| `--ff-red` | `#e74c3c` | **3.52 ✗** | 3.25 | **2.88 ✗✗** | ❌ large/non-text only |
| `--ff-blue` | `#4499cb` | **2.90 ✗✗** | **2.68 ✗✗** | **2.38 ✗✗** | ❌❌ fails even 3:1 |
| `--ff-purple-light` | `#b19cd9` | **2.24 ✗✗** | 2.07 | 1.84 | ❌❌ ornament only |
| `--ff-gold` | `#e6a553` | **1.96 ✗✗** | 1.81 | 1.61 | ❌❌ ornament only |
| `--ff-green` | `#2ecc71` | **1.94 ✗✗** | 1.79 | 1.59 | ❌❌ ornament only |

**Three findings that matter.**

1. `--ff-gold` (`#e6a553`) is at **1.96:1** on cream. It is almost certainly doing accent/heading/link work somewhere, and it is not close — it is off by more than 2×. Same for `--ff-green` (1.94) and `--ff-blue` (2.90, which fails even the *non-text* 3:1 bar, so it can't legally be a border, focus ring, or icon either).
2. `--dnd-brown` at **4.46:1** misses AA by 0.04. Per 1.4.11's own note, "2.999:1 would not meet the 3:1 threshold" — no rounding. A one-step darken fixes it and is visually imperceptible.
3. The `$text-light` / `--text-light` pair (3.18–3.22) is the classic "tertiary gray" failure. It's fine for *large* text (3:1) and non-text, illegal for body.

### 2.2 The pastels as surfaces — and why the stat bars fail

| Pastel | Hex | vs cream | 1.4.11 (3:1)? |
|---|---|---|---|
| `$pastel-purple` | `#CDB4DB` | 1.73 | ❌ |
| `$pastel-blue` | `#B9C9E6` | 1.54 | ❌ |
| `$pastel-lavender` | `#E5D4F1` | 1.29 | ❌ |
| `$pastel-pink` | `#F8D1E0` | 1.27 | ❌ |
| `$pastel-mint` | `#C8E7D5` | 1.22 | ❌ |

Every pastel is between **1.22 and 1.73** against cream. If an HP bar is a pastel fill on a cream track, the fill/track boundary — the part that conveys the value — is invisible to 1.4.11. **But**: as established in §1, 1.4.11 binds the *boundary*, not the fill. A 1px `--dnd-ink` hairline around the track and at the fill edge carries the 3:1 obligation at ~12.7:1, and every pastel stays exactly as it is.

This is the same technique shipping games use. Xbox Accessibility Guideline 102 documents it: in *For Honor*, "The white outline ensures that the symbols remain visible against dark backgrounds… while the black outline ensures that the symbols remain visible against light backgrounds"; in *The Outer Worlds*, "the white outline around the bright red and purple meters… increase visibility" ([XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)). Outline the ornament; don't desaturate it.

### 2.3 The rarity tiers — the worst offenders, and the reason why

The tokens are the literal *World of Warcraft* item-quality colors, which were designed for a **near-black** UI. On cream they collapse:

| Tier | Hex | on white text | on black text | vs cream |
|---|---|---|---|---|
| common | `#7c818c` | 3.91 | 5.38 | 3.60 |
| uncommon | `#1eff00` | **1.37** | 15.36 | **1.26** |
| rare | `#0070dd` | 4.81 | 4.36 | 4.43 |
| epic | `#a335ee` | 4.88 | 4.30 | 4.50 |
| legendary | `#ff8000` | **2.52** | 8.34 | **2.32** |

`uncommon` (#1eff00) at **1.26:1** against cream is effectively invisible. `legendary` (#ff8000) at 2.32 fails the non-text bar. And there is no single text color that works across the set: white text passes on `rare`/`epic` and fails on `uncommon`/`legendary`; black text passes on `uncommon`/`legendary` and is marginal on `rare`/`epic`.

There is also a **1.4.1 Use of Color** problem independent of contrast: "Color is not used as the only visual means of conveying information… or distinguishing a visual element" ([Understanding 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)). Rarity encoded purely as chip color is exactly the failure. The sanctioned techniques are G14 ("information conveyed by color differences is also available in text") and G182 ("additional visual cues are available when text color differences are used"). Xbox states the same rule in game terms: "color alone should never be used to represent information" ([XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)).

### 2.4 How practitioners keep a soft palette and still pass

- **Reserve pastels for surfaces and ornament; ink the text.** Tinted-dark neutrals (`--dnd-ink` #3a2921 at 12.7:1, `--dnd-parchment` as its ground) read as *warm and thematic*, not as generic black-on-white. The site already owns these tokens — they're just under-used relative to the pastels.
- **Generate the ramp in a perceptual space, by contrast target.** Adobe's [Leonardo](https://leonardocolor.io/) generates colors *from* a contrast ratio rather than checking one afterward, working in CIECAM02/OKLCH so "all key colors are automatically distributed evenly by their lightness"; it is what Adobe's Spectrum design system uses ([Nate Baldwin on Leonardo](https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2)). [Accessible Palette](https://accessiblepalette.com/) does the same with consistent-lightness scales. This lets you say "give me the pastel-purple hue at 4.5:1 on cream" and get `#6B4E7C`-ish back — same *hue family*, legal as text.
- **Audit as a grid, not as swatches.** "Test every color against every background it might appear on and create a grid showing which combinations pass AA, which pass AAA, and which fail" ([Dopely](https://dopelycolors.com/blog/accessible-color-palettes)). §2.1 above *is* that grid; keep it as a build artifact.
- **APCA / WCAG 3 lookahead: do not act on it.** APCA "was pulled from the July 2023 working draft"; the current WCAG 3 draft says "The contrast algorithm used in WCAG 3 is yet to be determined." Roselli's advice is to "limit legal risk by either choosing colors that also meet WCAG 2 contrast requirements, or… documenting them," and he warns that tools promoting APCA give "the problematic advice of dismissing WCAG 2 requirements in favor of an unapproved draft standard" ([Roselli, April 2026](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)). APCA is genuinely kinder to pastels — and it is not a defense. Design to WCAG 2; look at APCA only as a tiebreaker between two options that both already pass.

### implication for the Code Alchemist rebrand

- **Split every themed hue into an `-ink` and an `-ornament` token.** `--ff-gold` stays `#e6a553` for the alchemy circle, rune strokes, and the wordmark (all exempt); add `--ff-gold-ink` darkened to ≥4.5:1 on cream for any gold *text*. Same for `--ff-blue` (2.90 → use `--ff-blue-dark` #306d9a at 5.12, which already exists), `--ff-green`, `--ff-purple-light`. The palette *reads* identical; only the text layer moves. This is the single highest-leverage change in the whole rebrand.
- **Keep the WoW rarity colors — as glow, border, and pip, never as the text's background.** Render a rarity chip as: ink-colored label text on parchment, with the tier color as a 2px border + outer glow + a filled-pip count (◆/◆◆/◆◆◆◆◆). The border carries the tier color at whatever contrast it likes (it's redundant with the label), the label carries the meaning, and 1.4.1 is satisfied by G14 (the word "Legendary" is right there). The MMO loot feel survives intact — arguably strengthens, since pip-counts are *more* game-native than color-only.
- **Outline the stat bars rather than darkening them.** `--dnd-ink` hairline on the track and at the fill boundary (XAG 102's *For Honor* / *Outer Worlds* technique). Pastel HP/MP fills stay exactly as designed; 1.4.11 passes on the boundary at ~12:1.
- **Trade-off, named:** `--rarity-uncommon: #1eff00` at 1.26:1 on cream cannot appear as text or as a meaning-bearing 3:1 element on this background, full stop — it is a dark-UI color on a light UI. The cheapest reconciliation that keeps the exact hex: give the Laboratory page a **dark parchment/obsidian surface** (a "loot inspection" panel), where `#1eff00` hits ~15:1 and every WoW color works as designed. You gain a themed dark-surface component *and* the authentic MMO palette in one move.

---

## 3. Motion & Animation — The Alchemy Circle and the Loot Shimmer

### 3.1 What actually triggers people

Val Head's research is the primary practitioner source and it is specific about *which* motion hurts:

> "Animations that move an object across a large amount of space" are most apt to trigger negative responses; "the physical size of screen matters less than the size of the motion relative to the screen space available." Parallax and scrolljacking are "highly likely to be triggering." "Animations covering a large perceived distance can be triggering."
> — [Val Head, *Designing Safer Web Animation For Motion Sensitivity*, A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)

And the escape route:

> "Animation that involves only non-moving properties, like opacity, color, and blurs, are unlikely to be problematic."

The WCAG 2.3.3 Understanding doc concurs on severity: "the impact of animation on people with vestibular disorders can be quite severe," potentially requiring bed rest ([Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)). MDN adds that "animations such as scaling or panning large objects can be vestibular motion triggers" ([MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)).

**A slow rotation in place is near the benign end of this taxonomy** — it covers no distance, moves nothing across space, and changes no perceived depth. A rune ring that *rotates* is far safer than a hero that *parallaxes*. That is a real, sourced win for the alchemy circle.

### 3.2 2.2.2 Pause, Stop, Hide (AA) — and the 5-second door

> "For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement… is part of an activity where it is essential."
> — [Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

All three conditions must hold. The homepage circle starts automatically ✅, and is presented in parallel with the name/subtitle/tagline/social row ✅ — so **only condition (2) is negotiable**. The Understanding doc explicitly exempts content that is the sole focus of the page ("preloader animations… not presented alongside other content"), which the hero is not.

Critically: **the Understanding doc for 2.2.2 does not mention `prefers-reduced-motion` at all.** Honouring reduced motion does *not* discharge 2.2.2 — that criterion is about a mechanism available to *everyone*, on the page. This is the most commonly-believed false thing in this whole area.

### 3.3 No-motion-first, and substitution over deletion

Tatiana Mac's pattern inverts the default:

```css
/* not this */
.circle { animation: rotate 20s linear infinite; }
@media (prefers-reduced-motion: reduce) { .circle { animation: none; } }

/* this */
.circle { animation: none; }
@media (prefers-reduced-motion: no-preference) { .circle { animation: rotate 20s linear infinite; } }
```

> "Defaulting to this latter approach will mean that all users will default to no animation, including users whose browsers won't recognise the media query." … "The difference is not just in code, but in mindset shift."
> — [Tatiana Mac, *prefers-reduced-motion: Taking a no-motion-first approach*](https://www.tatianamac.com/posts/prefers-reduced-motion)

But `reduce` does not mean *nothing*. MDN: the setting means the user "prefers an interface that removes, reduces, or **replaces** motion-based animations." Josh Comeau operationalizes this:

> "I often try to come up with alternative motion-free animations for folks who prefer reduced motion, so that their experience still feels premium." … "not all animations include motion" — "an element fading in and out is safe to use for everyone."
> — [Josh Comeau, *Accessible Animations in React*](https://www.joshwcomeau.com/react/prefers-reduced-motion/)

MDN's own canonical example swaps a `scale()` pulse for an `opacity` dissolve under `reduce` — it does not delete it.

Adam Argyle's Open Props ships this as a token: `@custom-media --motionOK (prefers-reduced-motion: no-preference)`, used as `@media (--motionOK) { … }` ([Open Props](https://open-props.style/); [CSS-Tricks, Open Props @custom-media recipes](https://css-tricks.com/open-props-custom-media-recipes/)). One media query, declared once, applied everywhere.

### implication for the Code Alchemist rebrand

- **Make the alchemy circle's loop finite and ≤5 seconds — then 2.2.2 does not apply at all, and you owe no pause button.** A transmutation circle that *inscribes itself, flares, and settles* into a static sigil is (a) cheaper than a pause control, (b) legally clean by construction, and (c) *better theater* than an infinite idle spin — the circle completes, which is what a circle is for. This is the cheapest reconciliation in the entire report. Re-trigger it on nav, not on a timer.
- **If the infinite spin is non-negotiable, the price is one visible control.** A themed pause affordance ("still the circle" / a rune toggle) satisfies 2.2.2 and is itself on-brand. Budget it as a persona *feature*, not a compliance tax. `prefers-reduced-motion` alone will **not** cover you here — sourced above.
- **Adopt no-motion-first + `--motionOK`, and substitute rather than delete under `reduce`.** Circle: rotation → static sigil with a slow opacity breath. Loot shimmer: a traveling gradient sweep → a static holographic-foil gradient, or a gentle opacity pulse on the rarity border. Reduced-motion users still get a "legendary looks special" signal; they just don't get the sweep. Per Val Head, opacity/color/blur are "unlikely to be problematic."
- **Audit the hover/loot shimmer against Val Head's taxonomy, not against taste.** A shimmer that sweeps *across* a card is small-area, short-distance → low risk. Anything parallax, scrolljacked, or scaling-large is high risk and should not enter the design. The persona never needed parallax; don't let it in through the back door.

---

## 4. Ornament, Screen Readers, and the Character Sheet

### 4.1 Hiding ornament correctly

For decorative raster/`<img>`: "A null (empty) alt text (`alt=""`) should be provided so that they can be ignored by assistive technologies" — and note the failure mode of omitting it entirely: "When the alt attribute is not provided, some screen readers will announce the file name of the image instead" ([W3C WAI, Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)).

For inline SVG ornament: "A SVG cannot have an alt attribute, which is why `role="presentation"` or `aria-hidden="true"` is an excellent solution for SVGs." And critically — **do not combine methods**: "Using both can confuse the accessibility tree and cause unpredictable results. Choose one — don't combine them with an empty alt attribute" ([A11Y Collective](https://www.a11y-collective.com/blog/alt-text-for-decorative-images/)).

The rune ring, alchemy circle, corner filigree, and parchment texture are all textbook ornament: `aria-hidden="true"` on the SVG root, one method, no exceptions.

### 4.2 Icon-only controls — the sigil nav and social row

This is where "mystery meat" is a real, named failure, and the data is unkind: icon-only buttons with no accessible name appear "on roughly 27.7% of home pages tested" ([HTMHell, *Misleading Icons*](https://www.htmhell.dev/adventcalendar/2024/27/)). Mystery meat navigation proper is "a form of web navigation user interface whereby the target of each link is not visible until the user points their cursor at it" — and the exclusive use of icons without explicit labels "may not be considered intuitive because it relies on the designer's personal understanding of the meaning of each icon" ([Wikipedia, MMN](https://en.wikipedia.org/wiki/Mystery_meat_navigation)).

Sara Soueidan's recommended pattern, in her stated order of preference — visible text > `aria-label` > `aria-labelledby` > visually-hidden text, with technique #1 (visually-hidden) recommended:

```html
<button>
  <svg aria-hidden="true" focusable="false"><!-- … --></svg>
  <span class="visually-hidden">Menu</span>
</button>
```

She is explicit that "there's just no good way to use an SVG as the sole means to provide an accessible name" — label the *button*, hide the *icon* ([Sara Soueidan, *Accessible Icon Buttons*](https://www.sarasoueidan.com/blog/accessible-icon-buttons/)). The `visually-hidden` utility in 2026 is `position:absolute; clip-path:inset(50%); height:1px; width:1px; overflow:hidden; white-space:nowrap;` — and the legacy `clip` property "is redundant because `clip-path` produces the same result… no need to include it unless you need to support Internet Explorer" ([dbushell, *Everything you never wanted to know about visually-hidden*](https://dbushell.com/2026/02/20/visually-hidden/)).

### 4.3 The game-metaphor nav — Notebook / Laboratory / Letter

Worth being precise, because the conventional wisdom over-applies here: **"Notebook" is not mystery meat.** MMN is about *unlabeled icons* and hover-revealed targets. A visible text label that happens to be a metaphor is a *findability* question, not an accessibility failure. There is no WCAG criterion against metaphorical link text.

What *is* a criterion: **2.5.3 Label in Name** — the accessible name must contain the visible label text ([WCAG 2.5.3](https://wcag.dock.codes/documentation/wcag253/)). So the fix is never "rename Notebook to Blog for screen readers" — that would *create* a 2.5.3 failure and flatten the persona simultaneously. The accessible name must be "Notebook."

The reconciliation is additive: keep the themed word as the label, add a plain gloss. Xbox frames the same requirement for game UI — XAG's stated goal is to "ensure that players have enough context to operate a game's interface and understand its UI components and their functions" ([XAG 112](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112)). Games solve this with subtitle text under the menu item, not by renaming "Inventory" to "Items List."

### 4.4 The character sheet: `meter`, not `progressbar`

This one has a crisp answer. The APG is unambiguous:

> "A meter is a graphical display of a numeric value within a defined range" (battery, fuel). "**The `meter` should not be used to indicate progress**, such as loading or percent completion of a task. To communicate progress, use the `progressbar` role instead."
> — [W3C APG, Meter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)

HP, MP, ST are **measurements within a range** → `role="meter"`. EXP (0/100 toward level 16) is **progress toward completion** → `role="progressbar"`. That distinction is not pedantry; it changes what the screen reader announces.

Required on each: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, an accessible name (`aria-labelledby` to the visible "HP" label), and — the useful one — `aria-valuetext`, "for values better expressed beyond percentages (e.g., '50% (6 hours) remaining')". Without it, AT "typically present values as percentages": a screen reader would announce HP as "85 percent" instead of "85 of 100 hit points."

**Native `<meter>` vs. `role="meter"`:** normally prefer native. Here, don't. Native `<meter>` is a cross-browser styling swamp — WebKit needs `appearance:none` to reach `::-webkit-meter-*`, "but `appearance: none` breaks rendering on Chrome, so you must check if the browser is Safari-based," and Firefox needs `::-moz-meter-bar` and doesn't support `::before`/`::after` on the gauge ([MDN ::-webkit-meter-bar](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-meter-bar); [Hongkiat](https://www.hongkiat.com/blog/style-html5-meter/)). A `<div role="meter">` gives identical semantics with full styling freedom — which is exactly what a themed HP bar needs.

### 4.5 Forced-colors mode — the ornament's other exit

Windows High Contrast / `forced-colors: active` strips the skin: "Custom backgrounds vanish, drop shadows disappear, and decorative borders get stripped… the OS strips backgrounds and shadows" ([Polypane, *Forced colors explained*](https://polypane.app/blog/forced-colors-explained-a-practical-guide/); [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)). A stat bar drawn as a pastel `background-color` becomes an empty rectangle — the value disappears entirely.

The remedy is to redraw meaning with system colors under `@media (forced-colors: active)` using `Canvas`/`CanvasText`/`ButtonText`, and to use `forced-color-adjust: none` only where "you have already adapted these colours" — "use it sparingly and only after you have confirmed the contrast still works."

### implication for the Code Alchemist rebrand

- **`role="meter"` for HP/MP/ST, `role="progressbar"` for EXP, `aria-valuetext` on all of them — and build them as styled `<div>`s, not native `<meter>`.** `aria-valuetext="85 of 100 hit points"` makes the character sheet *narrate as a character sheet*. The RPG conceit becomes something a screen-reader user experiences too, rather than something they're excluded from. This is the persona getting *stronger* under accessibility pressure, not weaker.
- **`aria-hidden="true"` on the rune ring / alchemy SVG / filigree — one method, never stacked with `alt=""`.** And per §1, ornament that is announced to nobody is also ornament that is contrast-exempt: the same decision buys both wins.
- **Sigil nav and social row: visible themed word where there's room; `<span class="visually-hidden">` inside the button plus `aria-hidden="true" focusable="false"` on the SVG where there isn't.** Never `aria-label` on the `<svg>` itself. Where a visible label exists, the accessible name must *contain* it (2.5.3) — so the accessible name is "Notebook," not "Blog."
- **Keep the metaphor; add the gloss.** `Notebook <span class="nav-gloss">Writing</span>`, `Laboratory <span class="nav-gloss">Projects</span>`, `Letter <span class="nav-gloss">Contact</span>`. Both words are in the accessible name, the fantasy word is the one styled to dominate, and the XAG 112 "enough context" bar is met. Cost: one small line of type. Do **not** delete the themed words — that's the flattening this rebrand exists to prevent.
- **Trade-off, named:** under `forced-colors: active` the skin is *gone* — that's the OS's call and you cannot and should not fight it. Cheapest reconciliation: accept the loss of decoration, but add a `@media (forced-colors: active)` block that redraws the meter fill boundary and rarity chips with `CanvasText` borders so the *information* survives. The user in that mode has explicitly asked for no skin; give them the data.

---

## 5. Layout & Typography Craft

### 5.1 Fluid type has an accessibility ceiling — and a clean rule

`vw`-based sizing can fail **1.4.4 Resize Text** (AA, 200%): "rem values increase when you zoom in, but viewport units are not affected," so clamped text can refuse to reach 200% ([F94](https://www.w3.org/WAI/WCAG21/Techniques/failures/F94.html); [Adrian Roselli, *Responsive Type and Zoom*](https://adrianroselli.com/2019/12/responsive-type-and-zoom.html)).

The usable rule, from Maxwell Barvian's Smashing analysis:

> "The maximum value must be less than or equal to 2.5 times the minimum value."
> — [*Addressing Accessibility Concerns With Using Fluid Type*, Smashing](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/)

with the middle term always carrying a `rem`/`px` component alongside the `vw` component — `clamp(16px, 5.33px + 3.33vw, 48px)`, never `clamp(1rem, 4vw, 3rem)`.

For a themed site this bites hardest on **display headings**, which is exactly where the temptation to go `clamp(2rem, 8vw, 6rem)` (3× ratio → fails) lives.

### 5.2 Measure

45–75 characters, 66 the canonical target, from Bringhurst; novices do best near 45, experienced readers tolerate ~80 ([UXPin](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/)). The `ch` unit is "purpose-built for character-based max-widths."

Xbox states the same rule for game UI and makes it a hard number: "The line width shouldn't be more than 80 characters or glyphs (or 40 if Chinese/Japanese/Korean)" and "Line spacing (leading) in blocks of text should be at least a space-and-a-half (1.5)" ([XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)). A parchment column is still a column.

### 5.3 Grid vs. flex vs. container queries

The durable heuristic: "For your layout, use CSS Grid; for alignment of your elements, use Flexbox" — grid works "from the layout in," flex works "from the content out" ([MDN, *Relationship of grid layout to other layout methods*](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods); [LogRocket](https://blog.logrocket.com/css-flexbox-vs-css-grid/)).

Container queries are production-safe in 2026: Chrome 105+, Firefox 110+, Safari 16+, ~95%+ coverage, "zero fallbacks or polyfills needed" ([caniuse](https://caniuse.com/css-container-queries); [web.dev, *Container queries land in stable*](https://web.dev/blog/cq-stable)). Guidance: "Use container queries for component-level responsiveness and media queries for page-level layout" ([MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)).

This is directly useful for a themed site: a rarity-carded project or a stat block should reflow based on *its own* width, so the same component can sit in a 300px sidebar and an 800px column without a JS resize listener. Responsive-without-JS is now the default, not the aspiration.

### 5.4 Display fonts and readable body — the game industry has already ruled on this

The strongest available precedent is Xbox's, and it is remarkably on-point for a fantasy skin:

> "Include at least one sans serif type-face option."
> "**If stylistic fonts are used (for example, blood dripping off font), provide a non-stylized font option.**"
> — [XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)

That is the entire fantasy-typography problem, answered by a platform that ships *Sea of Thieves*: **the stylized font is allowed; it just can't be the only option for body text.** Note what XAG does *not* say — it never says "don't use a blood-dripping font."

Supporting craft: pair fonts with compatible x-heights, since "a heading font with a significantly lower x-height than the body font creates visual inconsistency that increases cognitive load when scanning" ([DeveloperUX](https://developerux.com/2025/06/23/ultimate-guide-to-accessible-font-pairing/)). "Cursive and novelty fonts are hard to read for users with dyslexia or visual impairments"; [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) (Braille Institute) "prioritize[s] character distinction and [is] freely available" ([DesignYourWay](https://www.designyourway.net/blog/best-fonts-for-accessibility/)). "Consistent spacing is especially helpful for users with dyslexia, as it minimizes… 'rivers of space'."

Performance: "self-hosting with subsetted variable fonts is the recommended approach" in 2026; `font-display: swap` "shows fallback text immediately and swaps in your custom font once it loads, preventing invisible text and improving LCP" ([Font Compressor](https://fontcompressor.com/blog/font-display-swap)). Note the repo already has a real font-loading defect to fold in here: Font Awesome loaded twice at 6.4.0 and 6.4.2 (scout FINDING-037).

### implication for the Code Alchemist rebrand

- **Cap every `clamp()` at max ≤ 2.5× min, and never write a `vw`-only middle term.** The display H1 wants `clamp(2rem, 8vw, 6rem)` (3×, fails 1.4.4); write `clamp(2rem, 1.2rem + 3.2vw, 5rem)` (2.5×, passes). The heading is still huge and still theatrical — it just can't be *quite* as huge at 1920px. That is the entire cost.
- **Confine the display face to H1/H2, nav, and the wordmark; body in a hyperlegible face at ~66ch.** This is XAG 101's own rule ("provide a non-stylized font option"), applied by *zone* instead of by user setting — cheaper for a static site than a font-switcher, and it produces the classic RPG-manual look anyway: ornate headers, clean body. Self-host one subsetted variable display font + one variable body font with `font-display: swap`; dedupe Font Awesome to a single version while you're in there.
- **Container-query the rarity cards and stat blocks.** A loot card that reflows on *its own* width means the Laboratory grid, a homepage "recent loot" strip, and a sidebar can all reuse one component with zero JS — and 1.4.10 reflow at 320px falls out for free rather than being retrofitted.
- **Use `min-height`, never `height`, on every themed chip, badge, banner, and stat row.** This is the whole of 1.4.12 compliance for decorative UI, and it costs one word per rule. Fixed-height ornament is what clips when a dyslexic reader bumps their letter-spacing.

---

## 6. Exemplars — What Specific Mechanic Lets Personality Survive the Bar

Verified by fetching each source. Characterized honestly — including where a widely-cited candidate did not hold up.

### Lynn Fisher — lynnandtonic.com ✅ strongest single exemplar

Ten annual full redesigns, "always starts with a blank CSS file" ([About](https://lynnandtonic.com/about/)). The 2025 refresh is a 436px fixed-width container that elastically stretches and bounces on window resize — maximally gimmicky.

**The mechanics that let it survive:**
- **A breakpoint escape hatch for the gimmick.** "Below 500px viewport width, the site reverts to standard full-width responsive design" — the joke is desktop-only *by design*, so 1.4.10 reflow is never in tension with it ([2025 case study](https://lynnandtonic.com/thoughts/entries/case-study-2025-refresh/)).
- **`outline` + `outline-offset` + layered `box-shadow` for focus**, chosen specifically "to prevent text shifting" and to stay visible across light and dark modes.
- **Scope reduction when the gimmick couldn't be made accessible.** In 2022 she hit drag-and-drop, which "can be difficult for screen readers and keyboard-only users, so she didn't want major navigational and content pieces to be totally inaccessible and reduced scope significantly" ([2022 case study](https://lynnandtonic.com/thoughts/entries/case-study-2022-refresh/)).
- **Visually-hidden narration as the fallback.** In 2021, "screenreaders felt like an unknown, so she ended up including a visually-hidden step-by-step description of the sequence" ([2021 case study](https://lynnandtonic.com/thoughts/entries/case-study-2021-refresh/)).
- **Skip link inverted to fit the layout**: "my skip link—for the first time—skips the content and not *to* the content."

**Takeaway:** the decoration is never removed; it is **fenced** — to a viewport range, to a non-navigational layer, or to a described equivalent.

### Adam Argyle — nerdy.dev / Open Props ✅ the reusable mechanic

Loud, unapologetic personality — hot-pink cyborg avatars, 8-bit figures, post titles like "Humans Are Now Legacy Dependencies." Also a CSS Working Group member.

**The mechanic:** motion preference is a **named design token**, not a per-animation decision. `@custom-media --motionOK (prefers-reduced-motion: no-preference)`, then `@media (--motionOK) { … }` everywhere ([Open Props](https://open-props.style/); [CSS-Tricks](https://css-tricks.com/open-props-custom-media-recipes/)). Open Props' animation tokens ship reduced-motion-aware by default and are used as Adobe-Spectrum-adjacent infrastructure. Personality survives because compliance is *infrastructural* — you can't forget it, because forgetting it means not using the token.

### Josh W. Comeau — joshwcomeau.com ⚠️ great mechanic, weaker stance than advertised

**The mechanic (verified, excellent):** `usePrefersReducedMotion`, with an explicit philosophy of **substitution over deletion** — "I often try to come up with alternative motion-free animations… so that their experience still feels premium," and "not all animations include motion… an element fading in and out is safe to use for everyone." He explicitly warns against a global kill-switch ([*Accessible Animations in React*](https://www.joshwcomeau.com/react/prefers-reduced-motion/)).

**The honest caveat:** his flagship whimsy essay, [*A Million Little Secrets*](https://www.joshwcomeau.com/blog/whimsical-animations/), does **not** mention `prefers-reduced-motion`, vestibular disorders, or motion sensitivity at all; its restraint arguments are about *annoyance*, not accessibility. The [Whimsical Animations course page](https://whimsy.joshwcomeau.com/) makes one accessibility claim — "building accessible experiences that don't trigger motion sensitivities" — with no dedicated module and no technical specifics. **Cite Comeau for the hook and the substitution philosophy; do not cite him as proof that whimsy-first sites are accessible by default.**

### Xbox Accessibility Guidelines ✅ the single best precedent for *this* rebrand

The only source found that governs a **fantasy-styled, ornate, stat-bar-and-rarity-chip UI** and publishes hard numbers. Nothing else comes close for this brief.

**The mechanics:**
- **Decoration is explicitly exempt.** "Text or visual elements that are pure decoration… have no contrast requirement" — with a worked example of *Gears 5*'s decorative menu chrome ([XAG 102](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)). Same for logotypes: *Age of Empires II*'s logo "wouldn't be subject to meeting contrast requirements."
- **Outline, don't desaturate.** *For Honor*'s double outline (black + white) keeps ornate heraldic symbols readable on any background; *The Outer Worlds*' white outline around "bright red and purple meters" is precisely the HP/MP bar problem, solved without dulling the meters.
- **Stylized fonts are permitted, with an unstyled option.** "If stylistic fonts are used (for example, blood dripping off font), provide a non-stylized font option" ([XAG 101](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)).
- **Configuration beats compromise.** "The best approach… is by providing players with choices to configure the UI." *Fallout: New Vegas* ships three HUD colors; *Eagle Island* ships a backdrop dimmer plus "outline characters"/"outline platforms."
- **Hard numbers:** 4.5:1 standard text/elements, 3:1 large-scale and inactive, 7:1 high-contrast mode, 80-char line width, 1.5 line spacing, 200% text scaling. And: "When text is displayed over a non-solid color background, the text contrast ratio should be measured between the text and the **lowest contrasting area** of the background" — which is the rule for parchment texture.

### Game Accessibility Guidelines ✅ the terse version

The Basic tier, quoted exactly: "Use an easily readable default font size"; "Provide high contrast between text/UI and background"; "**Ensure no essential information is conveyed by a fixed colour alone**" ([gameaccessibilityguidelines.com/basic](https://gameaccessibilityguidelines.com/basic/)). Note the word *fixed* — the guideline anticipates that the color is fine if it's reconfigurable or redundant. Cross-referenced by XAG's own resources table.

### Maggie Appleton — maggieappleton.com ✅ the "status without color" pattern

Heavily illustrated visual essays, "frankly overengineered" by her own description, hand-drawn animation throughout ([maggieappleton.com](https://maggieappleton.com/), [Colophon](https://maggieappleton.com/colophon/)).

**The mechanic worth stealing:** every post carries a **growth stage** — "seedlings," "buddings," "evergreens." That is a whimsical rarity-tier system that is **word-first and icon-second**, i.e. 1.4.1-compliant by construction rather than by remediation. Also: Astro islands architecture, "minimizing JavaScript shipped to the client" — heavy visual identity, light payload.

### Cassie Evans — cassie.codes ⚠️ verify before citing

Her stated principle is genuinely useful — **"SVG has a DOM, which allows it to be made nice and accessible"** — and it's the core argument for building the alchemy circle as inline SVG rather than a canvas/WebGL toy or a GIF: an SVG's parts are individually addressable, `aria-hidden`-able, and CSS-styleable, including under `forced-colors`.

**Caveat:** as of this fetch, cassie.codes is effectively **archived** — the site is now a farewell note ("It was a joy to maintain a personal site…"), redirecting to her GSAP work. Cite the principle and her talks ([Smashing podcast](https://www.smashingmagazine.com/2020/09/smashing-podcast-episode-24/)); don't cite the live site as a working exemplar.

### D&D Beyond ❌ the cautionary tale — this is the failure mode to avoid

The closest thing to "an RPG character sheet on the web at scale," and it is a **negative** exemplar. Despite an accessibility statement claiming screen-reader and keyboard support, users report the character builder "has buttons, checkboxes, and other widgets which are not properly labeled and don't have support for tabbing focus," dialogs that trap focus, "various links have no accessible names, such as social media links using background images," and spell tables "not properly recognized by screen readers" ([D&D Beyond forums](https://www.dndbeyond.com/forums/d-d-beyond-general/bugs-support/75949-screen-reader-accessibility-in-the-web-interface); [AFB AccessWorld](https://afb.org/aw/20/9/16759)).

Every one of those is a failure this rebrand is structurally exposed to: an unlabeled stat widget, an icon social row using background images, a themed table. **The fantasy character sheet on the web has a canonical accessibility failure, and it is worth beating on purpose.**

### Negative finding, reported honestly

**No fantasy/RPG/medieval-themed *website* with a published WCAG stance was found**, despite targeted searching. The genre's accessibility precedent lives almost entirely in **games** (Xbox/GAG/APX), not on the web. Two consequences: (a) XAG and GAG are the right precedent to lean on and should be cited explicitly in the rebrand spec; (b) there is an actual, unoccupied niche here — a fantasy-skinned personal site with a published accessibility statement would be close to novel, and that is itself a persona asset for an engineering lead.

### implication for the Code Alchemist rebrand

- **Adopt Lynn Fisher's "fence the gimmick" discipline as the governing rule.** Every decorative flourish gets an explicit boundary declared up front: a viewport range (the two-column sheet above 600px), a layer (ornament never carries information), or a described equivalent (visually-hidden narration). Nothing gets removed; everything gets fenced.
- **Make reduced-motion a token, Argyle-style, on day one.** Define `--motionOK` once in `_variables.scss` and gate every animation through it. Retrofitting `prefers-reduced-motion` across 13 SCSS partials later is the expensive path; a token now is free and un-forgettable.
- **Cite XAG 101/102 by number in the rebrand spec, and steal `<meter>`-outline + stylized-font-with-readable-body wholesale.** It is a shipping-console-platform precedent that a fantasy UI with ornate fonts, HP meters, and rarity colors is accessible *when outlined and labeled* — written by the people who ship *Sea of Thieves*. That's a far stronger argument than any web-design blog, and it's specifically an argument *for* keeping the skin.
- **Beat D&D Beyond on purpose, and say so.** A published `/accessibility` page — "this character sheet is a real character sheet, and it works with a screen reader" — is simultaneously a compliance artifact, a differentiator against the genre's canonical failure, and *on-brand persona content* for an engineering lead. Frame the rune ring's `aria-hidden` and the meter's `aria-valuetext` as craft, because they are.

---

## 7. Auditing Workflow and a Realistic Solo Bar

### 7.1 What automation actually buys you

The number is consistent across sources: automated tools catch roughly **30–40%** of WCAG issues — "mainly programmatic things like missing alt text, colour contrast, form labels and heading structure" — leaving 60–70% to humans, including "all subjective and context-dependent issues like meaningful link text, logical reading order and whether content is genuinely understandable" ([ExceedAbility](https://exceedability.com/manual-vs-automated-testing.html); [TestParty](https://testparty.ai/blog/automated-accessibility-testing-guide); [Deque's Automated Accessibility Coverage Report](https://www.deque.com/automated-accessibility-coverage-report/)). CivicActions puts it bluntly: "Automated testing only catches about one-third of accessibility issues, so it cannot be relied upon to determine if a site complies."

For *this* site the split is unusually favourable, though — the contrast failures in §2 are exactly the class automation nails, and they're the biggest real risk. Automate contrast and you've bought down most of the actual exposure.

### 7.2 The CI stack, sized for Jekyll on GitHub Pages

CivicActions documents the exact pattern: `pa11y-ci` with the **axe** runner, driven by the Jekyll sitemap. "A sitemap.xml generator should be added to Jekyll for use by pa11y-ci to test all pages. The typical GitHub Actions workflow installs Ruby and JavaScript dependencies, starts Jekyll with a detached server script, and then pa11y-ci scans URLs from the sitemap once Jekyll has started" ([CivicActions](https://accessibility.civicactions.com/posts/automated-accessibility-testing-leveraging-github-actions-and-pa11y-ci-with-axe); [pa11y](https://github.com/pa11y/pa11y); [canaxess/a11y-github-actions](https://github.com/canaxess/a11y-github-actions)). Config via `.pa11yci` JSON: concurrency, `standard: WCAG2AA`, `runners: ["axe"]`.

axe-core is the recommended runner over the htmlcs default. Lighthouse CI adds performance/SEO alongside accessibility ([Accesify](https://www.accesify.io/blog/accessibility-testing-automation-axe-pa11y-lighthouse-ci/)). For a 5-page site the whole suite runs in well under a minute.

**Interactive, not CI:** axe DevTools and WAVE browser extensions for spot checks; [Colour Contrast Analyser](https://developer.paciellogroup.com/resources/contrastanalyser/) and [Accessibility Insights](https://accessibilityinsights.io/) for eyedropper checks against gradients/textures — both named in XAG 102's own tooling table. [Color Oracle](https://colororacle.org/) for colorblind simulation of the rarity tiers (also XAG-recommended).

### 7.3 The manual protocol — the 5-minute version

The realistic solo protocol, from the screen-reader testing guides: "Start with NVDA + Firefox for the best free testing experience" (free, nvaccess.org); on Mac, "VoiceOver is already on your Mac… press Cmd + F5." Five checks ([DEV, *Screen Reader Testing in 5 Minutes*](https://dev.to/agentkit/screen-reader-testing-in-5-minutes-a-developers-quick-start-guide-27l7); [AbleProof](https://ableproof.com/blog/screen-reader-testing-guide)):

1. Page title announces meaningfully on load.
2. Heading navigation (H key / Rotor) gives a logical H1→H2→H3 with no skips.
3. Tab through every interactive element — each announces what it does. "'Button' with no label is a dealbreaker."
4. Form inputs announce their labels. "'edit text' with no context" = missing label.
5. Decorative images are **silent**; informational images describe content. "If you hear a filename or a generic 'image,' that's a problem."

And the honest limit: "A sighted developer running NVDA for the first time will catch the obvious failures… a daily screen reader user will catch the experiential failures." Also: "You don't need to run a full screen reader audit on every commit."

### 7.4 A realistic acceptance bar for a solo personal site

**Automate in CI (blocking):**
- `pa11y-ci` + axe, `WCAG2AA`, across all sitemap URLs — 5 pages + posts, cheap.
- A **palette contrast unit test**: assert every `-ink` token ≥4.5:1 and every meaning-bearing non-text token ≥3:1 against each declared background. §2's script is ~30 lines and turns the report's biggest finding into a regression guard. Almost nobody does this; for a site whose *identity* is a risky palette, it's the highest-value check available.
- Lighthouse CI budget (perf + a11y).

**Check by hand at milestones (not per-commit):**
- The 5-step screen-reader pass on Home + About + one post.
- Keyboard-only walk: every sigil-nav item, social icon, theme toggle, share button reachable, visibly focused, and not obscured by the fixed sidebar (2.4.11 / F110).
- 400% zoom on About (1.4.10, the two-column character sheet).
- The text-spacing bookmarklet on the rarity chips and stat rows (1.4.12).
- OS reduced-motion ON → confirm the circle settles and the shimmer degrades to opacity.
- `forced-colors: active` in Edge/Chrome DevTools → confirm meter values and rarity tiers still readable.
- Color Oracle over the Laboratory grid → confirm tiers distinguishable without hue.

**Explicitly out of scope for a solo site:** paid audits, AAA conformance (except 2.4.13 focus appearance, which is cheap and worth it), a VPAT, professional AT-user testing. The hybrid consensus — "automated tools in CI for fast regression checks, plus manual audits at milestones and before launch" — is the right ceiling here.

### implication for the Code Alchemist rebrand

- **Ship a palette contrast test as a real CI check, and treat the `-ink`/`-ornament` token split as the thing it enforces.** The test encodes the persona's own bargain: ornament tokens are exempt and untested; ink tokens are tested and must pass. That's a machine-checkable statement of "the decoration stays, the text is readable" — and it makes the fantasy palette *safe to extend* later instead of a permanent liability.
- **Add `jekyll-sitemap` and wire `pa11y-ci` + axe over it in GitHub Actions.** Five pages; the run is trivial. It catches the missing-`aria-label`-on-a-social-icon class of bug — the exact class that D&D Beyond ships to production.
- **Put the manual pass on a milestone checklist, not a per-commit hook**, and add the three checks generic checklists omit but this design needs: reduced-motion on, `forced-colors: active`, and Color Oracle over the rarity tiers.
- **Trade-off, named:** none of this proves the site is *good* for a screen-reader user — a first-time NVDA driver catches mechanics, not experience. Cheapest reconciliation: publish an `/accessibility` page stating the bar honestly ("targets WCAG 2.2 AA; automated axe in CI; manually spot-checked with NVDA/VoiceOver; here's what I know is imperfect; mail me at hi@hlavezzo.me"). That converts an unclosable gap into a feedback channel — and, for a site whose whole persona is *craft*, into persona content.

---

## Sources

**W3C / WAI — normative and Understanding docs**
- [WCAG 2.2 (Recommendation)](https://www.w3.org/TR/WCAG22/)
- [W3C Accessibility Guidelines (WCAG) 3.0 — Working Draft](https://www.w3.org/TR/wcag-3.0/)
- [Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)
- [Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Understanding SC 1.4.10: Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
- [Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Understanding SC 1.4.12: Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [Understanding SC 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [Understanding SC 2.4.13: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Understanding SC 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [F94: Failure of SC 1.4.4 due to incorrect use of viewport units to resize text](https://www.w3.org/WAI/WCAG21/Techniques/failures/F94.html)
- [F110: Failure of SC 2.4.11 due to a sticky footer or header](https://www.w3.org/WAI/WCAG22/Techniques/failures/F110)
- [C42: Using min-height and min-width on target container to ensure sufficient target spacing](https://www.w3.org/WAI/WCAG22/Techniques/css/C42)
- [W3C WAI Tutorials: Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/)
- [W3C ARIA APG: Meter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WCAG 2.5.3 Label in Name](https://wcag.dock.codes/documentation/wcag253/)

**MDN**
- [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [`forced-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors)
- [`forced-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/forced-color-adjust)
- [ARIA: progressbar role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/progressbar_role)
- [`::-webkit-meter-bar`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-meter-bar) · [`::-moz-meter-bar`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-moz-meter-bar)
- [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [Relationship of grid layout to other layout methods](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods)

**Game-industry accessibility (the closest published precedent for a fantasy UI)**
- [Xbox Accessibility Guideline 101 — Text display](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101)
- [Xbox Accessibility Guideline 102 — Contrast](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102)
- [Xbox Accessibility Guideline 112 — UI navigation](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/112)
- [Xbox Accessibility Guidelines (index)](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines)
- [Game Accessibility Guidelines — Basic](https://gameaccessibilityguidelines.com/basic/)
- [Accessible Player Experiences (AbleGamers)](https://accessible.games/accessible-player-experiences/)

**Practitioner essays — motion**
- [Val Head, *Designing Safer Web Animation For Motion Sensitivity* (A List Apart)](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)
- [Val Head, *Designing With Reduced Motion For Motion Sensitivities* (Smashing)](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/)
- [Tatiana Mac, *prefers-reduced-motion: Taking a no-motion-first approach to animations*](https://www.tatianamac.com/posts/prefers-reduced-motion)
- [Josh W. Comeau, *Accessible Animations in React with prefers-reduced-motion*](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
- [web.dev, *prefers-reduced-motion: Sometimes less movement is more*](https://web.dev/articles/prefers-reduced-motion)

**Practitioner essays — color & contrast**
- [Adrian Roselli, *WCAG3 Contrast as of April 2026*](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html)
- [Adrian Roselli, *Responsive Type and Zoom*](https://adrianroselli.com/2019/12/responsive-type-and-zoom.html)
- [Maxwell Barvian, *Addressing Accessibility Concerns With Using Fluid Type* (Smashing)](https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/)
- [Trys Mudford, *Utopia WCAG warnings*](https://www.trysmudford.com/blog/utopia-wcag-warnings/)
- [Nate Baldwin, *Leonardo: an open source contrast-based color generator*](https://medium.com/@NateBaldwin/leonardo-an-open-source-contrast-based-color-generator-92d61b6521d2) · [Leonardo](https://leonardocolor.io/)
- [Accessible Palette](https://accessiblepalette.com/)
- [Dopely, *How to Create Accessible Color Palettes (WCAG Guide)*](https://dopelycolors.com/blog/accessible-color-palettes)

**Practitioner essays — ornament, icons, layout, type**
- [Sara Soueidan, *Accessible Icon Buttons*](https://www.sarasoueidan.com/blog/accessible-icon-buttons/)
- [HTMHell, *Misleading Icons: Icon-Only-Buttons and Their Impact on Screen Readers*](https://www.htmhell.dev/adventcalendar/2024/27/)
- [Wikipedia, *Mystery meat navigation*](https://en.wikipedia.org/wiki/Mystery_meat_navigation)
- [A11Y Collective, *How to Identify Decorative Images and Boost Accessibility*](https://www.a11y-collective.com/blog/alt-text-for-decorative-images/)
- [David Bushell, *Everything you never wanted to know about visually-hidden*](https://dbushell.com/2026/02/20/visually-hidden/)
- [Ben Myers, *Forced Colors Mode*](https://benmyers.dev/encyclopedia/forced-colors-mode/) · [Polypane, *Forced colors explained*](https://polypane.app/blog/forced-colors-explained-a-practical-guide/)
- [Smashing, *Modern Fluid Typography Using CSS Clamp*](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- [UXPin, *Optimal Line Length for Readability: The 50–75 Character Rule*](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/)
- [web.dev, *Container queries land in stable browsers*](https://web.dev/blog/cq-stable) · [caniuse: CSS Container Queries](https://caniuse.com/css-container-queries)
- [LogRocket, *When to use Flexbox and when to use CSS Grid*](https://blog.logrocket.com/css-flexbox-vs-css-grid/)
- [DeveloperUX, *Ultimate Guide to Accessible Font Pairing*](https://developerux.com/2025/06/23/ultimate-guide-to-accessible-font-pairing/)
- [DesignYourWay, *Accessible Typography: The 13 Best Fonts for Accessibility*](https://www.designyourway.net/blog/best-fonts-for-accessibility/) · [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/)
- [Font Compressor, *font-display: swap Explained*](https://fontcompressor.com/blog/font-display-swap)
- [Hongkiat, *How to Use and Style the HTML5 Meter Element*](https://www.hongkiat.com/blog/style-html5-meter/)

**Exemplars**
- [Lynn Fisher — About](https://lynnandtonic.com/about/) · [2025 refresh](https://lynnandtonic.com/thoughts/entries/case-study-2025-refresh/) · [2022 refresh](https://lynnandtonic.com/thoughts/entries/case-study-2022-refresh/) · [2021 refresh](https://lynnandtonic.com/thoughts/entries/case-study-2021-refresh/)
- [Adam Argyle — nerdy.dev](https://nerdy.dev/) · [Open Props](https://open-props.style/) · [CSS-Tricks, *Open Props @custom-media Recipes*](https://css-tricks.com/open-props-custom-media-recipes/)
- [Josh W. Comeau, *A Million Little Secrets*](https://www.joshwcomeau.com/blog/whimsical-animations/) · [Whimsical Animations course](https://whimsy.joshwcomeau.com/)
- [Maggie Appleton](https://maggieappleton.com/) · [Colophon](https://maggieappleton.com/colophon/)
- [Cassie Evans](https://www.cassie.codes/) · [Smashing Podcast Ep. 24: What Is SVG Animation?](https://www.smashingmagazine.com/2020/09/smashing-podcast-episode-24/)
- [D&D Beyond — screen reader accessibility (forum thread)](https://www.dndbeyond.com/forums/d-d-beyond-general/bugs-support/75949-screen-reader-accessibility-in-the-web-interface) · [AFB AccessWorld on D&D accessibility](https://afb.org/aw/20/9/16759)

**Auditing / tooling**
- [CivicActions, *Automated accessibility testing: Leveraging GitHub Actions and pa11y-ci with axe*](https://accessibility.civicactions.com/posts/automated-accessibility-testing-leveraging-github-actions-and-pa11y-ci-with-axe)
- [pa11y/pa11y](https://github.com/pa11y/pa11y) · [canaxess/a11y-github-actions](https://github.com/canaxess/a11y-github-actions)
- [Deque, *The Automated Accessibility Coverage Report*](https://www.deque.com/automated-accessibility-coverage-report/)
- [ExceedAbility, *Manual vs Automated Accessibility Testing*](https://exceedability.com/manual-vs-automated-testing.html) · [TestParty, *What Automated Accessibility Testing Catches and What It Misses*](https://testparty.ai/blog/automated-accessibility-testing-guide)
- [Accesify, *Integrating axe, Pa11y, and Lighthouse CI into DevOps Pipelines*](https://www.accesify.io/blog/accessibility-testing-automation-axe-pa11y-lighthouse-ci/)
- [DEV, *Screen Reader Testing in 5 Minutes*](https://dev.to/agentkit/screen-reader-testing-in-5-minutes-a-developers-quick-start-guide-27l7) · [AbleProof, *How to Test with a Screen Reader*](https://ableproof.com/blog/screen-reader-testing-guide)
- [Accessibility Insights](https://accessibilityinsights.io/) · [Colour Contrast Analyser](https://developer.paciellogroup.com/resources/contrastanalyser/) · [Color Oracle](https://colororacle.org/) · [18F, *Accessibility scanning*](https://guides.18f.gov/engineering/tools/accessibility-scanning/)

**Repository artifacts referenced**
- `_sass/_variables.scss:5-63` — palette, FF/D&D CSS vars, rarity tiers (source of the §2 audit)
- [`.claude/rebrand/scout-report.md`](./scout-report.md) — FINDING-006 (design system), FINDING-008 (alchemy circle hero), FINDING-027 (character sheet), FINDING-037 (Font Awesome duplication)
- [`.claude/rebrand/research-personal-site.md`](./research-personal-site.md) §4 — text-first norms, dark mode, RSS (extended, and partly contested, by this report)
