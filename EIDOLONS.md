# EIDOLONS — canonical agent dispatch & methodology surface

This file is managed by `eidolons sync`. It composes the per-Eidolon
methodology references hoisted from host-vendor files. Do not edit
inside `<!-- eidolon:<name> start --> ... end -->` markers; manual edits
above the first marker block or below the last are preserved.

Vendor files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
`.github/copilot-instructions.md`) may serve as dispatch-pointer surfaces;
pointer mapping is governed by `hosts.pointer_targets` in `eidolons.yaml`.
`EIDOLONS.md` is the single canonical composition surface per `eidolons sync`.

<!-- eidolon:atlas start -->
## ATLAS — Read-only codebase scout (v1.13.0)

Entry:     `./.eidolons/atlas/agent.md`
Full spec: `./.eidolons/atlas/SPEC.md`
Cycle:     A (Assess) → T (Traverse) → L (Locate) → A (Abstract) → S (Synthesize)

**P0 (non-negotiable):** read-only (refuse edit/write/commit/deploy/migrate/refactor/fix); mission-first (requires `mission.md` + `DECISION_TARGET`); bounded ACI (`view_file` ≤100, `search_text` ≤50, `list_dir` ≤200); evidence-anchored claims (`path:line` + H|M|L); deterministic retrieval first, LLM search last.
<!-- eidolon:atlas end -->

<!-- eidolon:ramza start -->
## RAMZA — Mechanized, tamper-evident planning (v1.0.0)

Entry:     `.eidolons/ramza/agent.md`
Full spec: `.eidolons/ramza/SPEC.md`
Cycle:     DISCOVER/CLARIFY (as needed) → RS → S → [P] → [E] → C → [T] → (R, capped 3) → A

**P0 (non-negotiable):** READ-ONLY in every phase (no code edits, ever — implementation is Vivi's job); every gate (right-size, phase transition, scoring, EARS lint, criteria freeze, drift, emission) runs through `.eidolons/ramza/bin/ramza-*`, never role-played by the model; all artifacts under `.spectra/` only; maker≠checker on plan critique.
<!-- eidolon:ramza end -->

<!-- eidolon:vivi start -->
## Vivi — Brownfield feature implementation (v1.3.0)

Entry:     `.eidolons/vivi/agent.md`
Full spec: `.eidolons/vivi/SPEC.md`
Cycle:     A (Analyze) → P (Plan) → I (Implement) → V (Verify) → Δ (Delta) / R (Reflect)

**P0 (non-negotiable):** Internal First (USE → EXTEND → WRAP → CREATE); test-anchored (expected test cases before implementation); boundary-respect (no out-of-scope edits); evidence-based (no speculation); escalate early (3 failures at same category = STOP).
<!-- eidolon:vivi end -->

<!-- eidolon:idg start -->
## IDG — Documentation synthesis (v1.10.0)

Entry:     `.eidolons/idg/agent.md`
Full spec: `.eidolons/idg/SPEC.md`
Cycle:     I (Intake) → D (Draft) → G (Gate)

**P0 (non-negotiable):** synthesis from provided context only (no retrieval or code analysis); structural markers ([DECISION], [ACTION], [DISPUTED], [GAP]) required; CHT verification gate (Completeness / Helpfulness / Truthfulness) with one revision max; provenance-first (every claim traces to source session).
<!-- eidolon:idg end -->

<!-- eidolon:forge start -->
## FORGE — Reasoner / structured deliberation (v1.10.0)

Entry: `./.eidolons/forge/agent.md`
Spec:  `./.eidolons/forge/SPEC.md`
Cycle: F (Frame) → O (Observe) → R (Reason) → G (Gate) → E (Emit)

**P0 (non-negotiable):** reasoning-only (no tools, no mutations); frame first
(refuse vague questions); ≥3 hypotheses with adversarial stress-tests;
evidence-anchored claims (H/M/L tiers); bounded deliberation (≤3 passes +
1 REFORGE); reversal conditions mandatory.

See `./.eidolons/forge/SPEC.md` for full rules and the phase pipeline.
<!-- eidolon:forge end -->

<!-- eidolon:vigil start -->
## VIGIL — Forensic debugger (v1.8.0)

Entry:     `./.eidolons/vigil/agent.md`
Full spec: `./.eidolons/vigil/SPEC.md`
Cycle:     V (Verify) → I (Isolate) → G (Graph) → I (Intervene) → L (Learn)
Authority: read-only

**P0 (non-negotiable):** reproduction gates attribution (≥2 deterministic runs or statistical CI ≥85%); dependency-graph ranking (never temporal order); ≥3 hypotheses before intervention; counterfactual-gated blame (minimal flip from fail→success); ≤5 intervention budget then escalate; flag-gated authority (read-only | sandbox | write — write never inferred); evidence-anchored findings with `path:line` + confidence tier; non-determinism declared, not masked.
<!-- eidolon:vigil end -->

<!-- eidolon:kupo start -->
## KUPO — Low-effort executor (v1.3.0)

Entry:     `.eidolons/kupo/agent.md`
Full spec: `.eidolons/kupo/SPEC.md`
Cycle:     K (Keep-or-Kick) → U (Understand) → P (Patch) → O (Observe)

**P0 (non-negotiable):** PROPOSE-only (the parent commits — never the real tree); external-only verify (a NAMED test/lint/typecheck/compile — never self-critique); worker-never-router (no DELEGATE/DECIDE/CRITIQUE/REQUEST); scope-guard (KEEP only localized ≤2-file verifier-backed tasks with pass-rate >0.20, else REFUSE/ESCALATE); circuit-breaker (3-consecutive or 20-total failures → ESCALATE).
<!-- eidolon:kupo end -->

<!-- eidolon:gilgamesh start -->
## GILGAMESH — Bounded-authority fallthrough generalist (v1.0.0)

Entry:     `.eidolons/gilgamesh/agent.md`
Full spec: `.eidolons/gilgamesh/SPEC.md`
Cycle:     G (Gauge) → I (Inventory) → L (Lock) → G (Grind) → A (Attest)

**P0 (non-negotiable):** external-only verify (a NAMED test/parser/diff/typecheck/env-feedback — never self-critique; your blade might be Excalipoor); PROPOSE-only across the authority line (sandbox-first — the parent commits, never the real tree); worker-never-router (no DELEGATE/DECIDE/CRITIQUE/REQUEST, no spawn — a delegation need is a handoff-request PROPOSEd upward, downstream: []); specialist-preferring (fallthrough only — REFUSE clean specialist fits); bounded authority (read/write/exec/network/secrets/deploy × default/escalation — deploy never-grantable); bounded budget + stopping policy {continue, recover, escalate, terminate}; no permanent memory (the wanderer leaves with no weapons).
<!-- eidolon:gilgamesh end -->
