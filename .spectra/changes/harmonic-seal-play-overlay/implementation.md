---
eidolon: vivi
kind: implementation-report
created_at: 2026-08-31
change_id: harmonic-seal-play-overlay
tier: full
maker: vivi
checker: kupo
---

# Implementation report — The Harmonic Seal

Implemented the approved homepage-only `[Play]` enhancement inside the existing
`#astrolabe-chart` shell. The chart and game are sibling views governed by one dialog,
one backdrop, one inert-page boundary, and one focus trap. Game and reflection state
live only in the current document and survive view changes and close/reopen.

The implementation includes the four exact authored folios, the orthogonal pulse law,
guided-then-independent Folio I, explicit progression, unlimited snapshot undo, folio
and session resets, local reflection, semantic 5×5 button grid, roving tabindex, bounded
grid navigation, concise live status, full-viewport mobile layout, reduced-motion and
forced-colors treatment, and progressive enhancement that reveals Play only after a
successful game mount.

## Maker verification

- `bundle exec jekyll build` — pass.
- `npm run test:harmonic-seal` — pass.
- `npm run test:navigation` — pass.
- `npm run test:a11y-static` — pass.
- `npm run test:axe` — pass, including all four folios at 320×568, 390×844, and
  568×320 with complete current/target patterns and controls inside one viewport.
- `git diff --check` — pass.
- In-app browser checks — pass for tutorial no-op/guided completion, keyboard pulse,
  roving tabindex, shared-dialog switching, inertness, exact focus return, in-memory
  preservation, reflection completion focus, restart-session reset, and reload reset.

The patterned-target legibility gate passed without changing any approved board.
This is maker evidence only; independent checker verification remains pending.

## Checker-blocker remediation

- Tutorial progression is now an explicit event transition. Repeating the guided pulse and
  undoing all the way to the initial board preserves `independent-second`; only folio/session
  restart restores `guided-first`. Unit and live-browser regression checks cover that sequence.
- Every target image now references a nonvisual row-by-row description containing all 25
  awake/dormant states. The live audit checks that description against the active authored
  target for every folio at all three responsive test viewports.
- Focused tests, production build, `npm run test:a11y-static`, and `npm run test:axe` pass after
  these changes.
