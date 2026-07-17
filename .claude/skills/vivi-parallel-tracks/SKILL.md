---
name: vivi-parallel-tracks
description: "Load ONLY under TRANCE authorization when the Plan phase yields N independent, non-overlapping implementation tracks (disjoint file sets). Operationalizes the TRANCE G4 form — parallel multi-track implementation in mandatory git-worktree isolation, max 5 clean-context tracks, a per-track verifier cascade, a non-fungible per-track ≤3 reflection budget, explicit stop conditions, and a single-threaded merge/aggregation step. Absent TRANCE gating, Vivi runs exactly as today: single-track A→P→I→V→Δ/R."
metadata:
  methodology: Vivi
  phase: TRANCE-G4
---

# Parallel Multi-Track Mode (TRANCE G4)

Operationalizes the TRANCE G4 form for Vivi: **parallel feature branches in
isolated git worktrees + per-track verifier cascade + a mandatory
single-threaded merge/aggregation step.**

> **Single-track is the default.** The standard A→P→I→V→Δ/R cycle remains the
> default for every task. This mode activates ONLY under TRANCE authorization
> AND the entry gate below. It is **never** the default — it adds parallelism,
> not a fresh budget (trance-matrix R3) and not reflection past the published
> caps (trance-matrix R4).

> **Runtime note (loop-native).** Unlike its predecessor — which left the
> autonomous edit-run-test loop "out of scope (nexus gap R1)" — Vivi's per-track
> Verify **drives the closed loop** `eidolons sandbox loop`
> (`skills/loop-native.md`): each track is its own loop-native V→R (run →
> localized feedback → fresh-context repair → re-run, `--protect` / pass^k), in
> its own git worktree. The host/parent still executes the worktree spin-up +
> cleanup and the single-threaded merge (the Eidolon *specifies* isolation; the
> parent *executes* the bash) — but the per-track verifier cascade itself is the
> closed loop, not host-interpreted prose.

---

## 1 — Entry Gate (refuse unless ALL hold)

Enter this mode ONLY when every condition is true. Otherwise **fall back to
single-track** — do not force parallelism.

| # | Condition | Why |
|---|---|---|
| G-1 | **TRANCE-authorized** — both a complexity flag AND a stakes flag fire (cortex C6). | TRANCE is gated, never default. |
| G-2 | **Complexity = Complex** (4+ files, cross-domain). | Trivial/Standard stay single-track. |
| G-3 | **N independent tracks exist** — the Plan phase produced N implementation tracks with **disjoint file sets**, verified against the Plan's collision map (methodology.md A-Step 5). | This is the read-vs-write safety axis made mechanical: parallel WRITE is only defensible under strict isolation. |
| G-4 | **Tracks do NOT share files.** If any two tracks touch the same file, the precondition FAILS. | Shared-tree parallel write clobbers the tree (project memory: parallel agents on one tree clobber branches). |

If G-3 or G-4 fails → **refuse the mode, run single-track.** Record the refusal
reason. A partial overlap is not "almost disjoint" — it is single-track.

---

## 2 — Fan-Out (bounded, isolated, clean-context)

- **Max 5 tracks** (cortex C1 ceiling; orchestrator-worker sweet spot). More
  than 5 → split the work or sequence the surplus.
- **`isolation: worktree` is MANDATORY.** Each track runs in its **own git
  worktree** — never the shared working tree. Sub-agent isolation is safe for
  read and dangerous for write; isolation makes the parallel write safe.
- **Each track is a clean-context subagent.** Fresh context per track prevents
  self-conditioning / trajectory contamination across tracks.
- **Perspective-diverse only where it helps.** Use genuinely different
  assets/strategies when the sub-features differ. Do NOT spin N-identical
  tracks "for diversity" — quality dominates diversity-for-its-own-sake.
- Each track owns its file set (from the Plan) and **may not expand scope into
  another track's files** (boundary respect, I-3). Scope creep across a track
  boundary is a STOP condition (§4).

---

## 3 — Per-Track Verifier Cascade

Each track runs its **own** Verify phase (methodology.md V-VERIFY): lint →
test-anchors → regression, with the anti-overfit and pass^k gates from
methodology.md applied per track.

On per-track Verify-pass, the track emits its existing
**`vivi-completion-report`** envelope (`templates/vivi-completion-report.envelope.json`,
profile `schemas/vivi-completion-report-profile.v1.json`). **No new ECL kind**
— the parallel mode reuses the closed 10-performative set; one completion
envelope per passed track.

### Non-fungible per-track reflection budget

- The bounded-reflection budget (≤3 same-category attempts, I-5 / D5 /
  trance-matrix R4) is **scoped per worktree**.
- A track **may NOT borrow another track's retries.** Budgets are
  non-fungible.
- A track that exhausts its ≤3 budget is marked **BLOCKED**, excluded from the
  merge, and **never silently re-driven**. See `skills/failure-recovery.md`
  (per-track non-fungibility + cross-track INTEGRATION_ERROR).

---

## 4 — Stop Conditions (explicit)

The fan-out terminates when ANY holds — there is no unbounded multi-agent
free-run:

1. **All tracks reach Verify-pass OR Verify-blocked.** (Terminal state.)
2. **Hard cap: 5 tracks.** Never exceed.
3. **Per-track ≤3 same-category retries.** Exhausted → BLOCKED (not retried).
4. **No track expands scope into another track's file set.** Boundary breach →
   STOP that track, mark BLOCKED, do not merge it.

---

## 5 — Aggregation / Merge (mandatory, single-threaded)

The merge is a **single-threaded** step under **continuous parent context** —
the write boundary stays single-threaded even though the fan-out was parallel.

1. **Merge passed tracks in dependency order** (BLOCKED tracks are excluded).
2. **Run the FULL regression suite ONCE post-merge** — not per-track. Apply the
   pass^k reliability gate (methodology.md V-VERIFY): a result that passes once
   but is non-deterministic across repeats is **flaky → BLOCKED**, not merged.
3. **Classify cross-track breaks as `INTEGRATION_ERROR`** via the existing
   failure taxonomy (`skills/failure-recovery.md`). A regression that appears
   ONLY after merge (each track passed in isolation) is `INTEGRATION_ERROR`,
   routed to the merge step's reflection — **not** back into a track.
4. **Emit the aggregation artifact:** `templates/tracks-merge-report.md` — a
   Markdown report (NOT a new ECL kind) that aggregates the per-track
   `vivi-completion-report` envelopes: per-track table (id, worktree, file
   set, verdict, envelope ref, retries-used/3), merge order, conflicts
   resolved, post-merge full-suite result (pass^k note), and BLOCKED-track
   disposition.
5. **On unresolved cross-track conflict → escalate to VIGIL** via the **existing**
   `repair-failed-report` envelope (`templates/repair-failed-report.envelope.json`,
   `performative=ESCALATE`, `to.eidolon=vigil`). No new ECL kind, no new schema.

---

## 6 — Invariants

- Parallel WRITE requires `isolation: worktree` — Vivi never fans out into a
  shared tree (SPEC.md I-8).
- Max 5 tracks; merge is single-threaded under continuous parent context.
- Reuse the existing `vivi-completion-report` (per track) and
  `repair-failed-report` (escalation) envelopes — closed 10-performative set
  preserved (P0).
- Single-track A→P→I→V→Δ/R is the default; this mode is TRANCE-gated +
  entry-gated.

---

*Parallel Multi-Track Skill — worktree-isolated, bounded, TRANCE-gated, single-threaded merge.*
