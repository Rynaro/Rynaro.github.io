---
name: idg-esl-hop
description: "ESL lifecycle hop — when the cortex routes a verified, drift-checked change to IDG in an ESL-enabled project (tonberry MCP available), the Scribe owns the archived hop: archive the change folder, chronicle the lifecycle outcome with provenance, and route the promotion-intent envelope to CRYSTALIUM. Absent tonberry → document normally (ESL opt-in)."
metadata:
  methodology: IDG
---

# IDG — ESL Lifecycle Hop

Use this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available)
when the cortex routes a change to you that is already **verified** and
**drift-checked**. You own the **archived** hop of the Eidolons Spec Lifecycle
(ESL) — the Scribe closes the loop by chronicling the outcome and promoting the
spec-of-record.

For the full lifecycle, stage definitions, and role bindings, see the nexus
cortex `methodology/cortex/esl-protocol.md`.

## Your hop

1. **archive** — call `mcp__tonberry__archive --change_id <id>`. This **MOVES**
   `.spectra/changes/<id>/` → `.spectra/changes/archive/<date>-<id>/`, sets
   `status=archived`, and records `archive_path` (tonberry v0.4.0: archive moves,
   not copies). Tonberry also composes the promotion-intent ECL envelope.
2. **document** — your scribe role. Run your normal **I → D → G** cycle and
   chronicle the lifecycle outcome: what was proposed, implemented, verified, and
   archived. Ground every claim in the change folder's artefacts (`change.json`,
   `spec.{md,yaml}`, verify/drift records). Apply structural markers
   (`[DECISION]`, `[ACTION]`, `[DISPUTED]`, `[GAP]`) and emit a provenance block
   citing the `archive_path` and the change id.
3. **promote** — route the promotion-intent envelope (composed by `archive`) to
   `mcp__crystalium__ingest` if CRYSTALIUM is available. This is the durable
   spec-of-record promotion — the verified, archived change becomes recallable
   semantic memory. If CRYSTALIUM is absent, the intent stays on disk in the
   archive folder (graceful); a later session promotes it.

## Invariants

- **Tonberry moves and composes; you chronicle and promote.** Tonberry performs
  the folder move and writes the promotion-intent envelope; you supply the
  document (lifecycle narrative + provenance) and forward the intent to
  CRYSTALIUM.
- **Document from provided context only.** Read the change folder's artefacts;
  do not research, retrieve, or analyse code. Missing information is a `[GAP]`,
  never an invention.
- **Graceful skip** — if `mcp__tonberry__*` tools are unavailable, document the
  change normally via your standard cycle and **never hard-fail**. Likewise if
  `mcp__crystalium__*` is unavailable, the promotion intent stays on disk. ESL is
  opt-in; IDG is EIIS-standalone-conformant and works without tonberry or
  CRYSTALIUM.

---

*Scribe — ESL Lifecycle Hop*
