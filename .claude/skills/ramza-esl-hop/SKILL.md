---
name: ramza-esl-hop
description: "ESL lifecycle hop — when the cortex routes a non-trivial change to RAMZA in an ESL-enabled project (tonberry MCP available), RAMZA owns the proposed→specify hop: right-size, propose the change folder, emit the spec into it. Absent tonberry → produce the spec normally (ESL opt-in)."
metadata:
  methodology: RAMZA
---

# RAMZA — ESL Lifecycle Hop

Use this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available)
when the cortex routes a non-trivial change to you. You own the
**proposed → specify** hop of the Eidolons Spec Lifecycle (ESL).

For the full lifecycle, stage definitions, and role bindings, see the nexus
cortex `methodology/cortex/esl-protocol.md`.

## Your hop

1. **right_size** — run your own RS gate first (`ramza-rightsize`, see
   `agent.md` / `docs/methodology/SPEC.md`) — this sets RAMZA's own planning
   tier (trivial/lite/full: how much of your cycle runs). Separately, score
   complexity through the tool —

   ```
   echo '{"scope":2,"ambiguity":2,"dependencies":2,"risk":2}' \
     | ramza-score --rubric complexity --state <state>
   ```

   — and call `mcp__tonberry__right_size` with that score, your files-touched
   estimate, and the trade-off rationale. Tonberry returns the **ESL-level**
   tier — a distinct classification from your own RS tier; ESL decides whether
   the change routes to Kupo at all. Trivial ESL-level work routes to
   **Kupo**, not you; you take **lite** or **full**.
2. **propose** — call
   `mcp__tonberry__propose --change_id <id> --maker vivi --checker <kupo|vigil> --has_code <bool>`.
   This scaffolds `.spectra/changes/<id>/change.json`.
3. **specify** — run your normal **RS → S → P → E → C → T → (R) → A** cycle
   (every gate through `bin/ramza-*`, see `skills/methodology.md`) and emit the
   spec **into the change folder**:
   - **lite** → one-page `spec.md` (GIVEN / WHEN / THEN + acceptance_checks).
   - **full** → `spec.{md,yaml}` (the standard dual-format RAMZA spec), with a
     recorded critic (`ramza-gate critic`, see `skills/critic.md`) before
     Assemble.
4. **compose_manifest** — call `mcp__tonberry__compose_manifest` to set `tier`
   and `acceptance_checks` (ids referencing your GIVEN / WHEN / THEN) in
   `change.json`.
5. **emission gate** — before handing off, run `ramza-verify-emit --spec <spec>
   [--envelope <envelope>]`; nothing hands off unvalidated (see
   `skills/methodology.md` "ECL emission").
6. **hand off** to the implementer (**Vivi** at `in_progress`) with your normal
   ECL `PROPOSE` envelope.

## Invariants

- **maker(vivi) ≠ checker(kupo/vigil)** — distinct roles, always, at the ESL
  layer. Separately, your own plan critique is maker≠checker too
  (`ramza-gate critic`, mandatory at tier=full) — two independent
  enforcements, never conflated.
- **Tonberry composes artifacts; you provide spec content + signals.** You
  supply the complexity score (via `ramza-score`), the spec text, and the
  acceptance-check ids; tonberry writes the `change.json` structure.
- **Graceful skip** — if `mcp__tonberry__*` tools are unavailable, produce the
  spec normally via your standard cycle and **never hard-fail**. ESL is opt-in;
  RAMZA is EIIS-standalone-conformant and works without tonberry.

---

*RAMZA — ESL Lifecycle Hop*
