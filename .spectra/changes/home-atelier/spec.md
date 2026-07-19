# Change `home-atelier` — Homepage rework: The Alchemist's Observatory

**Tier:** full (right_size 5 files / rubric 7 / tradeoff present) — spec kept lean;
verification leans on the repo's automated gates (contrast / motion / axe / visual
baseline) rather than heavy critic ceremony, per the owner's direct creative dispatch.

**Maker:** opus-orchestrator · **Checker:** kupo · **Branch:** `rework/home-atelier`
(chained off `normalize/tokens`, PR #65).

## 1. Context

The homepage is a "Code Alchemist" hero: an interactive alchemy circle (drag-to-rotate
orbital rings, floating alchemical element sigils + Nordic runes) over a dark purple
gradient, followed by *Recent Scrolls* and *Favorites from the Grimoire* sections.

Two problems motivate the rework:

1. **Latent unreachable content (defect).** `body.home { position: fixed; overflow:
   hidden }` locks the homepage to a single viewport, yet the Scrolls/Favorites sections
   live below the fold — they are in the DOM but unreachable by scroll today.
2. **Astonish ceiling.** The hero is handsome but static-feeling; the owner wants the
   earendil.com quality of a *live-rendered* ambient background and *discoverable,
   non-obstructive* interactivity ("enjoyable once they find out").

## 2. Owner decisions (this session)

- **D1 — Single-screen atelier.** Keep the homepage a single immersive locked viewport
  (no scroll). Resolve the defect by *removing* the Scrolls/Favorites sections from the
  homepage; those posts stay discoverable via nav → Notebook and the sitewide footer.
- **D2 — Living nebula background.** A performant canvas layer behind the hero: drifting
  stardust + soft nebula clouds, pointer parallax. One static frame under
  `prefers-reduced-motion`.
- **D3 — Signature interactions:** (a) *Living constellation* — pointer draws nearby
  motes into slow orbit; faint constellation lines form and fade. (b) *Dev homage* — a
  subtle FPS readout, a styled console sigil/greeting, and a Konami rune-cipher easter
  egg with a one-shot transmutation payoff. (The "Great Work" gamified sequence was
  considered and declined.)

## 3. Scope

**Touches:** `index.html`, `_sass/pages/_home.scss`, `assets/js/home.js`, new
`assets/js/observatory.js` (ambient canvas engine), and this change folder.

**Preserves (personal brand — do not "normalize away"):** the alchemy circle centerpiece
and its drag/sigil interactions, the RPG/alchemy ubiquitous vocabulary (scrolls, sigils,
runes, grimoire), hero name/subtitle/tagline/social row, the trademark line.

## 4. Acceptance checks (EARS)

- **AC-A01** — WHERE a visitor loads the homepage, THE hero SHALL fill exactly one
  viewport with no vertical scroll (single-screen atelier preserved).
- **AC-A02** — THE homepage SHALL NOT render the Recent Scrolls or Favorites sections;
  those posts SHALL remain reachable via the main nav (Notebook) and the sitewide footer.
- **AC-A03** — WHEN `prefers-reduced-motion: reduce` is set, THE ambient canvas SHALL
  render a single static frame and start NO continuous animation loop (WCAG 2.2.2 /
  AC-024 lineage).
- **AC-A04** — WHERE motion is permitted, every auto-starting hero animation SHALL remain
  finite (≤5s, non-infinite iteration count) — no regression of AC-031.
- **AC-A05** — WHEN the pointer moves over the hero, THE nebula/constellation SHALL
  parallax toward the pointer, AND THE canvas SHALL set `pointer-events: none` so it never
  intercepts clicks on hero content or links.
- **AC-A06** — THE FPS readout SHALL be `aria-hidden="true"` and SHALL NOT be announced to
  assistive technology.
- **AC-A07** — WHEN the visitor enters the Konami sequence (↑↑↓↓←→←→ B A), THE page SHALL
  play a one-shot transmutation flourish AND SHALL NOT alter navigation or content state.
- **AC-A08** — THE alchemy circle SHALL remain drag-to-rotate AND its element/rune sigils
  SHALL remain hover/tap interactive (no regression of existing behavior).
- **AC-A09** — THE hero title, subtitle, tagline, and any visible readout text SHALL meet
  WCAG AA contrast (≥4.5:1) against their background — no regression of the
  palette-contrast gate.
- **AC-A10** — THE canvas loop SHALL cap its work: bounded mote budget, and it SHALL
  pause via `visibilitychange` when the tab is hidden, so it does not peg the CPU.
- **AC-A11** — THE footer include SHALL remain present in the homepage DOM (AC-020
  sitewide-disclaimer no-regression).

## 5. Out of scope

- Other pages (About, Notebook, Laboratory, Letter) — untouched.
- The "Great Work" gamified transmutation sequence (declined by owner).
- No new third-party requests (self-hosted-fonts / cookie-free invariant preserved; the
  canvas engine is first-party vanilla JS, no libraries).
