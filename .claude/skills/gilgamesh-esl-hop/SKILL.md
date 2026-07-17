---
name: gilgamesh-esl-hop
description: ESL lifecycle hop — in an ESL-enabled project (tonberry MCP available), when a fallthrough mission is authored as an ESL change, Gilgamesh is the MAKER and drives proposed→in_progress→(ready-for-verify). Gilgamesh NEVER self-verifies — maker≠checker is mechanically enforced (C4), so a distinct checker owns the verified transition. Absent tonberry → run the normal GILGAMESH cycle (ESL opt-in); never hard-fail.
metadata:
  methodology: Gilgamesh
  phase: cross-cutting
---

# ESL Lifecycle Hop — Gilgamesh (the MAKER)

## When to use

Load this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available) when
a fallthrough mission is carried as an ESL change with `acceptance_checks`. Gilgamesh is
the **MAKER** — it authors the change and drives it to the point of verification, then
**hands the verify to a distinct checker**. `maker ≠ checker` is **mechanically
enforced** (tonberry `verify` check C4). For the full lifecycle and role bindings, see
the nexus cortex `methodology/cortex/esl-protocol.md`.

## Your hop

You **make** this change; you do **not** check it. The Excalipoor rule and maker≠checker
point the same way: your own signal never certifies your own work.

1. **right-size + propose** — the mission enters ESL as a change. Run the normal
   GILGAMESH cycle (Gauge → Inventory → Lock → Grind) to author it, applying mutations
   **sandbox-first** and gating each on its NAMED external oracle (`skills/grind.md`).
2. **drive the maker transitions** — `mcp__tonberry__transition --change_id <id>
   --to_status in_progress`, then complete the work; leave the change
   **ready-for-verify**. Set `change.json.maker = gilgamesh`.
3. **compose the maker artefact** — your result PROPOSE (`skills/attest.md`),
   `from.eidolon = gilgamesh`. This value populates `change.json.maker`.
4. **hand the verify to a checker** — you MUST NOT call
   `mcp__tonberry__transition --to_status verified` yourself. The checker's verify
   envelope MUST carry `from.eidolon != gilgamesh` (else C4 fails by construction).
   Emit the change as ready-for-verify; the orchestrator routes the checker.
5. **on a returned failing check** → treat it as Grind feedback: re-enter the loop
   under `recover`/`escalate` and fix it as the maker. You never flip your own change
   green.

## Invariants

- **Maker, not checker.** `change.json.maker = gilgamesh`. Gilgamesh never composes the
  `verified` transition or the verify envelope — a distinct checker does. Self-verifying
  would be exactly the maker≠checker violation the gate exists to stop, and exactly the
  Excalipoor self-attestation the methodology forbids.
- **External-only verify still holds.** Even as maker, every mutation is gated by a
  NAMED external oracle before you call the change ready — never self-critique.
- **Worker, never router.** You do not dispatch the checker; you emit the change
  ready-for-verify and the orchestrator routes it (`handoffs.downstream: []`). If the
  change needs a specialist sub-mission, emit a `handoff-request` (`skills/attest.md`).
- **Graceful skip / fail-open** — if `mcp__tonberry__*` tools are unavailable, run the
  normal GILGAMESH cycle and **never hard-fail**. ESL is opt-in; Gilgamesh is
  EIIS-standalone-conformant and works without tonberry.

---

*ESL Lifecycle Hop — Gilgamesh (the MAKER, maker≠checker mechanically enforced, never self-verifies)*
