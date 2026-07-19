# Change `hero-transmutation` — Hero rework: "Solve et Coagula" particle transmutation

**Tier:** full (right_size 5 files / rubric 8 / tradeoff present). Machine-readable
contract + acceptance checks live in `spec.yaml`; this is the narrative. Verification is
objective-gate-based (see §4).

**Maker:** opus-orchestrator · **Checker:** kupo · **Branch:** `rework/home-atelier`
**Research of record:** `.claude/rebrand/research-hero-backgrounds.md` (Fable deep research).

## 1. Context

The `home-atelier` hero (starfield + nebula + cursor-proximity **constellation** lines)
drew the owner's verdict: *"almost no animation"* and *"looks like every canvas tutorial
on the internet."* That is accurate — particle-line linking is the single most-copied
canvas effect (particles.js/tsParticles), and a drifting starfield is the first canvas
tutorial anyone writes. Fable's deep research mapped the cliché and recommended **Concept
A (particle transmutation onto the site's own sigils)** grounded on **Concept B (dithered
prima-materia field)**. Full creative authority was granted, including the sigils.

## 2. What changed

- **The constellation is deleted at the root** — no proximity lines in any reskin, and
  the starfield is retired (research §7 "do-not-do").
- **`observatory.js` is a new engine**: first-party value/curl noise advects a few
  thousand motes that **dissolve** into divergence-free turbulence (*solve*) and
  **condense** onto alchemical figures rasterised from the site's own sigil geometry
  (*coagula*) — the motto, enacted. Figures cycle on click (alchemy circle → the five
  elements → runes). Colour shifts violet↔gold across the stages.
- **The sigils are transformed, not kept**: the DOM alchemy-circle + static element
  sigils + Nordic runes are **removed from markup** and re-expressed as living dust.
- **Ground**: a static nigredo slab with a warm gold heart under the figure, finished
  with a broken-up Bayer dither (grain, not a mesh) — the 16-bit-era texture that reads
  as *authored*, escaping the "AI-slop purple-gradient" signature (research §1.4).
- **Interaction is material**, never diagrammatic: the pointer stirs the dissolved
  matter and scatters the resting dust (which re-gathers); it never fights coagulation.
- **`home.js`** is gutted to the Konami bridge (grand-work flare + "Solve et Coagula"
  reveal). Layout reworked to content-right / figure-left (mobile: figure top, content
  bottom; the fixed trademark is hidden on phones to avoid a social-row collision).

## 3. Accessibility (unchanged discipline)

No-motion-first; one condense on load then a resting opacity breath; the HUD's pause
control is the WCAG 2.2.2 mechanism (prefers-reduced-motion alone does not discharge it);
reduced-motion renders the coagulated figure as a **static long-exposure** still (not a
blank); pointer motion is user-initiated (2.3.3) and decays; canvas is `aria-hidden` +
`pointer-events:none`; bounded particle budget + `visibilitychange` stop + seeded PRNG.

## 4. Verification (all green — see `spec.yaml` gate_status)

`bundle exec jekyll build` (0) · `npm run test:a11y-static` (0 — incl. token-usage,
contrast, motion, dead-class, clamp, text-spacing, a11y-page) · `npm run test:axe` (0
violations across all pages, light + dark) · Playwright behaviour probe with screenshot
review (load-condense / rest / click solve→coagula→next-sigil / reduced-motion still /
Konami / mobile + desktop composition); 0 JS errors.

## 5. Scope / out of scope

Touches `assets/js/observatory.js`, `assets/js/home.js`, `index.html`,
`_sass/pages/_home.scss`, `_data/palette-manifest.yml`. Other pages untouched. The
`_about.scss` global `.hero__content { flex: 1 }` leak is overridden with a `body.home`
scoped rule rather than modifying the About page. `scripts/baselines/` (gitignored) will
need a local `test:visual --update` for the intentional redesign — not a CI gate.
