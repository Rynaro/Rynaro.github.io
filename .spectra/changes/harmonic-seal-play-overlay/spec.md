---
eidolon: idg
kind: spec
created_at: 2026-08-31
artifact: spec
change_id: harmonic-seal-play-overlay
tier: full
version: 0.1.0
maker: vivi
checker: kupo
---

# Spec — `harmonic-seal-play-overlay`: a small game inside the Wayfinder

**Status:** `verified` · **ESL tier:** `full` · **maker:** `vivi` · **checker:** `kupo`
(maker != checker) · **has code:** `true`

**Post-verification addendum — 2026-08-31:** the focused Play-trigger visual and accessibility
refinement was independently re-verified at 1280×800 and 390×844. The visible `[Play]` retains
the accessible name `Play The Harmonic Seal`, a 46px target, explicit native-button resets, quiet
brass tertiary hierarchy, visible hover/focus states, no overflow, focus entry/return integrity,
and a zero-size `display:none` fallback when JavaScript is unavailable. Lifecycle remains verified.

**Post-verification addendum — redesigned invitation, 2026-08-31:** the subsequent invitation
layout supersedes the compact standalone trigger and also passed independent verification. The
hero action group again contains exactly two navigation links; a separately mounted, data-backed
folio slip follows it with title, four-folio eyebrow, mechanic description, and the visibly named
`Play The Harmonic Seal` button. Desktop uses a restrained three-column 38rem layout; at 767px
and below the 46px button occupies its own full-width row. No-JS and failed-mount runs hide the
entire aside at `display:none` with a 0×0 box. Hover, focus, overflow, focus entry/return, build,
axe, and prohibited-addition checks pass. Lifecycle remains verified.

## Outcome

Add a `[Play]` action to the homepage hero. It opens the existing Wayfinder/astrolabe dialog
directly in a `harmonic-seal` view containing a short, turn-based 5×5 toggle-grid game. The
game teaches its rule in Folio I, then presents three authored puzzles. Desktop keeps a centered
instrument over the page; mobile uses the full viewport.

This is one shared dialog, never a game modal inside a navigation modal. The existing Wayfinder
trigger opens the `chart` view. `[Play]` opens the `harmonic-seal` view. The game offers `Back to
chart`; the shared Close control and Escape close the dialog from either view.

The public title **The Harmonic Seal** was approved by the owner on 2026-08-31. The naming gate is
closed.

## Evidence and provenance

- RAMZA planned the game flow, authored the four-folio progression, and supplied the board data.
- FORGE critically reviewed the concept and interaction risks.
- IDG wrote this implementation contract from that plan, review, the owner's binding decisions,
  and the tested interaction draft.
- A few family members responded positively to the complete draft. This is useful qualitative
  evidence, not quantified, representative, or controlled user research.

Implementation was authorized by the owner on 2026-08-31. Deployment remains out of scope.

## Scope

### In scope

- A progressively enhanced `[Play]` control in the homepage `.atelier-actions` cluster.
- A `chart | harmonic-seal` view controller inside the existing `#astrolabe-chart` dialog.
- The four fixed folios and exact board states in this spec.
- Pulse, completion, next-folio, unlimited undo, restart-folio, restart-session, end-session,
  local reflection, finish-reflection, back-to-chart, shared close, and reopen flows.
- In-memory state preservation for the lifetime of the current document.
- Full-viewport mobile presentation and centered desktop presentation.
- Semantic DOM, keyboard/touch parity, focus management, reduced-motion behavior, and static,
  browser-level, responsive, and accessibility verification.

### Out of scope

- A second or nested modal, a standalone game page, or a floating global Play trigger.
- Score, visible move count, par, timer, lives, streaks, achievements, hints, difficulty modes,
  procedural/random boards, daily challenges, leaderboards, accounts, or networking.
- Audio, haptics, analytics, telemetry, or transmitting reflection content.
- `localStorage`, `sessionStorage`, cookies, server persistence, or cross-navigation recovery.
- Canvas-based game controls, a JavaScript framework, or a new runtime dependency.
- New game art, sprite production, backend work, publishing, or deployment.
- Changes to the existing Wayfinder constellation calculations or route data.

## Player rule and authored content

The board is five rows by five columns. A pulse toggles its own sigil plus each existing direct
orthogonal neighbor. There is no diagonal or wraparound effect; edge and corner pulses affect
only cells that exist. A folio completes only when all 25 current values equal its target chord.
State values are `0 = dormant`, `1 = awake`. Coordinates below are one-based `(row,column)`.

Folio I requires the first pulse at `(3,3)`. The second pulse is deliberately unmarked: the player
must infer `(2,4)` by comparing the changed board with the target. Pulsing any other cell before
the guided first pulse does not mutate state and produces a concise instruction. Later folios have
no guided cell.

| Folio | Name | Initial rows | Target rows | Verified pulse sequence |
|---|---|---|---|---|
| I | How a Pulse Travels | `10011 / 01001 / 01000 / 01110 / 10001` | `10001 / 01010 / 00100 / 01010 / 10001` | `(3,3), (2,4)` |
| II | The Brass Compass | `01100 / 11100 / 11011 / 00111 / 00110` | `00100 / 00100 / 11111 / 00100 / 00100` | `(2,2), (3,3), (4,4)` |
| III | The Ember Crown | `11110 / 11101 / 11011 / 10111 / 01111` | `00100 / 01010 / 10001 / 01010 / 00100` | `(1,1), (2,4), (4,2), (5,5)` |
| IV | The Wayfinder's Accord | `10000 / 01111 / 00011 / 11000 / 10011` | `01110 / 10001 / 10101 / 10001 / 01110` | `(1,3), (2,1), (3,4), (4,5), (5,2)` |

The verified progression is therefore 2 → 3 → 4 → 5 pulses. These sequences verify solvability;
they are never exposed as move counts, pars, or hints in the interface.

## Flow contract

1. On the homepage, `[Play]` opens the shared dialog in `harmonic-seal`; the Wayfinder trigger
   opens it in `chart`.
2. Folio I explains that a pulse changes a cross and visibly marks the center and affected cross.
   After the required pulse, the guide disappears and the player chooses the second center.
3. On exact target equality, pulse input stops and an explicit next action appears. Folios II–IV
   progressively require 3, 4, and 5 pulses, without showing those numbers.
4. `Undo pulse` restores one prior board snapshot, including from a completed folio. Undo is
   disabled only with empty history and has no limit. `Restart folio` restores that folio's exact
   initial state and clears its history. `Restart session` restores Folio I and clears game and
   reflection drafts.
5. `End session` enters the local reflection from any folio. Completing Folio IV does not jump
   implicitly: an explicit `Share a reflection` action enters it.
6. Reflection asks “Would you open another folio now?” (`Yes | Maybe | No`) and offers optional
   free text. `Finish session` changes to a local thank-you/hand-off state. Nothing is sent or
   stored outside page memory.
7. `Back to chart` changes the shared dialog view without clearing game or reflection state.
   Close, Escape, and the existing backdrop behavior close the shared dialog without clearing it.
8. Reopening with `[Play]` returns to the preserved game/reflection state; reopening with the
   Wayfinder trigger shows the chart. Navigation or reload creates a fresh session.

## Shared-dialog contract

- `#astrolabe-chart` remains the sole element with dialog semantics and the sole focus trap.
- Opening records the actual invoking element. Closing restores focus to that element.
- Chart and game are sibling views inside the astrolabe frame; only one is rendered to assistive
  technology and keyboard navigation at a time.
- Changing views does not close/reopen the dialog, nest focus traps, toggle page inertness, or
  create another backdrop.
- The persistent shared Close control remains visible and correctly labelled for the active view.
- Escape always closes the shared dialog; it never means undo, back, end session, or reflection.
- Backdrop clicks follow current Wayfinder behavior. If observed playtesting shows accidental
  mobile closes, changing that policy requires a follow-up owner decision; the current state
  preservation contract prevents progress loss meanwhile.

## State model

One document-lifetime controller owns this non-durable state:

```text
dialog: closed | open
view: chart | harmonic-seal
gameScreen: folio | reflection | reflection-complete
folioIndex: 0..3
board: 25 binary values
history: list of prior 25-value board snapshots
folioComplete: boolean
tutorialStep: guided-first | independent-second | complete
reflection: { interest: null | yes | maybe | no, note: string }
returnFocus: invoking HTMLElement | null
gridCursor: 0..24
```

Chart ↔ game changes and close ↔ reopen preserve every field except `dialog`, `view`,
`returnFocus`, and any transient announcement. `Restart folio` resets only `board`, `history`,
`folioComplete`, `tutorialStep`, and `gridCursor` for the current folio. `Restart session` resets
all game and reflection fields. A new document load reconstructs the initial state; no durable
storage API may be used.

## Responsive and visual contract

- Desktop: retain the site's dimmed-page overlay and centered astrolabe/instrument language.
- Mobile: the shared dialog and game occupy the full dynamic viewport, account for safe-area
  insets, avoid page-behind scroll, and do not require landscape or hover.
- Board cells remain square and large enough for touch. No horizontal scrolling is permitted.
- Current board state and target state use shape/mark plus accessible text; color alone is never
  the distinction. Focus indication remains visible in both states.
- The patterned target chords are binding only if the **simultaneous-legibility gate** passes at
  both 320×568 portrait and a short landscape viewport (minimum test: 568×320): the complete
  current 5×5 board and complete 5×5 target must be legible in the same viewport snapshot, with
  no zoom and no scrolling between comparison surfaces. Essential controls must remain reachable
  without horizontal clipping.
- If that gate fails, implementation stops and returns to the owner. It must not silently replace
  patterned targets with an all-dormant target, hide the target, change board size, or weaken the
  gate.
- Motion is brief and explanatory only. Under `prefers-reduced-motion: reduce`, state changes are
  immediate and remain understandable.

## Accessibility and input contract

- Use five semantic row groupings and 25 native buttons, one per sigil, within a named `role=grid`.
  The button in each grid cell carries row, column, and awake/dormant state in its accessible name.
- Implement roving tabindex: exactly one sigil button has `tabindex=0`, the other 24 have `-1`.
  Arrow keys move one cell without wrapping; Home/End move to row start/end; Ctrl+Home/Ctrl+End
  move to grid start/end. Enter and Space pulse. Pointer/touch activates the same operation.
- When the board rerenders, preserve the logical cursor unless a deliberate view/folio transition
  selects a new focus target. Do not strand focus on a removed or disabled element.
- Tab and Shift+Tab traverse the shared dialog's visible controls and cannot reach hidden views or
  the inert page. Close/Escape returns focus to the exact trigger used to open.
- View, folio, completion, undo, invalid tutorial pulse, and reflection transitions expose concise
  status text without announcing all 25 cells after each pulse.
- Target/current distinctions, completion, invalid actions, and focus do not rely on color, sound,
  or motion alone. Touch and keyboard flows have equivalent capability.

## File boundaries

Implementation is constrained to these source areas:

- `index.html`: add the homepage hero Play affordance only.
- `_data/harmonic_seal.yml` (new): public copy, folio metadata, and exact initial/target boards.
- `_includes/navigation.html`: add sibling chart/game views inside the existing astrolabe frame;
  retain the sole dialog shell and existing navigation content.
- `assets/js/sigil-navigation.js`: evolve the shared dialog controller to accept both triggers,
  switch views, preserve one focus trap, inert the page once, and restore invoking focus.
- `assets/js/harmonic-seal.js` (new): deterministic game/state/render/input module; no navigation
  or second-dialog ownership.
- `_layouts/default.html`: load the game module if a separate script is used.
- `_sass/objects/_navigation.scss`: only shared shell/view/responsive adjustments.
- `_sass/objects/_harmonic-seal.scss` (new) and `assets/css/main.scss`: game styles and one module
  registration, reusing existing tokens before adding any.
- `scripts/harmonic-seal.test.mjs`, `scripts/navigation.test.mjs`, and `package.json`: deterministic
  rule/state and shared-dialog contract tests.
- Browser/a11y/visual test fixtures or baselines only when required by the existing test harness.

Do not edit generated `_site/`, cache directories, post/content corpus, route data, constellation
catalog/calculations, or unrelated styles/scripts. If implementation requires another boundary,
Vivi must stop and request a spec amendment.

## Acceptance criteria

### AC-001 — Single shared dialog
GIVEN the homepage and existing Wayfinder
WHEN either trigger opens an overlay
THEN exactly one modal dialog and one backdrop exist; Play shows `harmonic-seal`, Wayfinder shows
`chart`, and no nested dialog/focus trap is created
VERIFY: DOM/integration test counts one `[role=dialog][aria-modal=true]`, exercises both triggers,
and asserts only the selected view is exposed/focusable

### AC-002 — View and close behavior
GIVEN the game view is open
WHEN Back to chart, shared Close, Escape, and backdrop are used
THEN Back to chart switches view in place; the other actions close according to existing Wayfinder
behavior and restore focus to the exact invoking trigger
VERIFY: browser test covers all four actions from both triggers and checks active element, inertness,
dialog visibility, and absence of a second open/close cycle on Back to chart

### AC-003 — Memory lifetime
GIVEN a modified folio, undo history, or reflection draft
WHEN the player switches chart↔game or closes↔reopens on the same document
THEN the draft is preserved; navigation/reload resets it; no durable storage is read or written
VERIFY: browser test compares state across switches/reopens, reloads for reset, and spies on
localStorage/sessionStorage/cookie writes

### AC-004 — Exact pulse law
GIVEN any of the 25 cells
WHEN it is pulsed
THEN only itself and existing orthogonal neighbors toggle, without diagonal or edge wrapping
VERIFY: deterministic unit tests assert center, edge, and corner masks and double-pulse identity

### AC-005 — Exact authored boards
GIVEN the four folios
WHEN their initial and target data are loaded and the verified sequences are applied
THEN all four reach exact target equality in 2, 3, 4, and 5 pulses respectively
VERIFY: data test validates 25 binary values per state, matches every row in this spec byte-for-byte,
applies the listed coordinate sequences, and asserts equality only after the final listed pulse

### AC-006 — Tutorial teaches then tests
GIVEN untouched Folio I
WHEN the player attempts a pulse other than `(3,3)`
THEN state does not change and the guide remains; after `(3,3)`, the guide disappears and the
player must independently select `(2,4)` to complete
VERIFY: interaction test compares board/history before invalid input, then performs the two-step
flow and checks guide, instruction, and completion states

### AC-007 — Progression without move pressure
GIVEN a folio reaches its target
WHEN completion renders
THEN pulse input stops and an explicit next-folio/reflection action appears, with no score, timer,
move counter, par, hint, or solution exposed
VERIFY: DOM test completes every folio and asserts progression controls plus absence of forbidden UI
and accessible-name terms

### AC-008 — Unlimited undo and resets
GIVEN any non-empty pulse history, including a completed folio
WHEN Undo, Restart folio, or Restart session is selected
THEN Undo restores one prior snapshot without a fixed limit; folio restart restores its initial state;
session restart restores Folio I and clears reflection
VERIFY: state tests use more than 25 pulses, undo to origin, and assert both reset scopes exactly

### AC-009 — Reflection is explicit and local
GIVEN any folio or completed Folio IV
WHEN End session or Share a reflection is selected
THEN the local reflection appears only by that explicit action, accepts Yes/Maybe/No plus optional
text, and never transmits or persists it
VERIFY: browser/network test asserts transition timing, draft preservation, zero fetch/XHR/beacon/form
submission, and reset on reload

### AC-010 — Semantic roving grid
GIVEN the 5×5 board
WHEN inspected and operated by keyboard
THEN it has five rows and 25 named native sigil buttons, exactly one roving tabindex=0, bounded arrow
movement, Home/End behavior, and Enter/Space parity with pointer input
VERIFY: DOM/browser test exercises every key boundary, checks no wrapping, accessible names/states,
focus preservation after rerender, and identical resulting board states

### AC-011 — Focus, inertness, and announcements
GIVEN the shared dialog is open
WHEN Tab, Shift+Tab, view changes, folio completion, undo, invalid tutorial input, or close occurs
THEN focus stays within visible dialog controls, hidden views are unreachable, page content is inert,
status changes are concise, and close restores invoking focus
VERIFY: browser test plus automated axe audit reports zero serious/critical violations and explicit
focus/status assertions pass

### AC-012 — Mobile full viewport
GIVEN supported mobile viewports
WHEN the game opens and the dynamic viewport changes
THEN it uses the full viewport, respects safe areas, prevents background scroll and horizontal
clipping, and keeps touch targets and essential actions usable without orientation lock
VERIFY: responsive browser tests at 320×568, 390×844, and 568×320 inspect bounding boxes, overflow,
safe-area layout, scroll ownership, and pointer activation

### AC-013 — Patterned-target rollout gate
GIVEN 320×568 portrait and 568×320 short landscape at 100% zoom
WHEN each patterned folio is displayed
THEN the complete current board and target are simultaneously legible in one viewport snapshot and
essential controls are horizontally unclipped
VERIFY: checker reviews deterministic screenshots for all four folios at both sizes and records pass;
any failure blocks implementation and requires an owner decision, with no fallback substitution

### AC-014 — Non-visual equivalence and reduced motion
GIVEN color-vision variation, muted audio, or reduced-motion preference
WHEN play state, target, focus, invalid action, and completion change
THEN each remains distinguishable through shape/text/focus/status and reduced motion removes
nonessential transitions without removing feedback
VERIFY: stylesheet/DOM assertions plus reduced-motion browser run and grayscale screenshot review

### AC-015 — Progressive enhancement and regression safety
GIVEN JavaScript is unavailable or a non-home page lacks the Play trigger
WHEN the site loads
THEN there is no dead Play control or script error, existing navigation fallback remains useful, and
the game module exits safely where its DOM is absent
VERIFY: no-JS homepage check, console-error scan on representative pages, production Jekyll build,
`npm run test:navigation`, new game tests, and `npm run test:a11y-static` all pass

### AC-016 — Scope and prohibited capabilities
GIVEN the implementation diff and built site
WHEN inspected
THEN it stays within declared boundaries and contains no second modal, canvas game controls, runtime
dependency, audio, analytics, random/procedural generation, network game call, or durable persistence
VERIFY: checker diff review plus targeted source/bundle scan records zero prohibited capability

## Rollout gates

1. **Owner title gate:** passed on 2026-08-31; the approved public title is **The Harmonic Seal**.
2. **Data gate:** exact boards and 2→3→4→5 solution tests pass before UI integration.
3. **Shared-dialog gate:** one-dialog/focus/inertness integration tests pass before visual polish.
4. **Simultaneous-legibility gate:** AC-013 passes at both minimum viewports. Failure stops work for
   owner decision; no silent target simplification is allowed.
5. **Accessibility/regression gate:** AC-010–AC-015 and the existing build/static accessibility
   suite pass before the change may be marked verified.
6. **Maker/checker gate:** Vivi may implement; Kupo must independently verify. Maker self-verification
   cannot promote the ESL change.

## Unresolved owner decisions

- **Conditional after responsive proof:** if patterned targets fail AC-013, choose among a revised
  layout, changed content, or cancellation. The implementer/checker may not choose for the owner.

All other interaction decisions in this spec are closed for this iteration.
