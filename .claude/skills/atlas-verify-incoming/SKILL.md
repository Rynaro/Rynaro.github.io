---
name: atlas-verify-incoming
description: Receiver-side ECL integrity gate (blocking, symmetric). Refuses to process any upstream artefact whose sibling .envelope.json lacks a verify_pass trace event from the orchestrator. Use when reading any upstream artefact handed off to ATLAS that carries a sibling .envelope.json. Symmetric across all Eidolons — every Eidolon enforces it identically per ECL §6.2.2.
metadata:
  methodology: ATLAS
  phase: cross-cutting
---

# Verify-Incoming Skill — ATLAS (blocking, symmetric)

## When to use

Load this skill when reading any upstream artefact at path `P` where a sibling
file `${P%.*}.envelope.json` exists in the same directory. If no `.envelope.json`
sibling exists, skip the gate silently and process normally.

---

Receiver-side integrity gate for inbound ECL hand-offs, converged on the
**ECL v2.0** blocking gate shape (canonical reference: Kupo's
`skills/verify-incoming.md`). When an upstream artefact arrives with a
sibling `.envelope.json`, ATLAS MUST NOT process the payload unless its
SHA-256 integrity has been **verified and passed**. This is the **blocking**
posture mandated by ECL v2.0 §6.2.2 ("a receiver SHALL NOT process a payload
whose integrity tag does not match"). It is **symmetric**: every Eidolon in
the roster ships this same gate, so no hand-off edge can silently skip it.

> **Posture change (vs. earlier opt-in warn-only):** previous versions logged a
> warning and processed the payload anyway. That is now superseded. On an
> unverified or failed envelope this skill **refuses** and hands back to the
> orchestrator. Provenance is only a differentiator if receivers actually reject
> tampered payloads — end to end, not just at the orchestrator.

---

## Where the cryptographic check runs (and why the receiver only reads)

ATLAS's tool surface cannot run the SHA-256 gate itself (receiver Eidolons
have restricted or no Bash). The mechanical check therefore runs **at the
orchestrator**, once, before ATLAS is dispatched:

```sh
# Orchestrator pre-step (host LLM, full Bash) — already shipped in the nexus CLI:
eidolons verify-envelope <artefact>.envelope.json --block      # exit 3 ⇒ tamper/mismatch
#   …or, when routing through the kernel:
eidolons run --verify <artefact>.envelope.json --verify-block  # gates the route
```

The gate writes a `verify_pass` (or `verify_fail`) trace event keyed by
`message_id`. ATLAS then enforces the result using **only `Read`** — no Bash
required:

1. Read `.eidolons/.trace/<thread_id>.jsonl` (the `thread_id` is
   `envelope.thread_id`).
2. Find the event whose `message_id` matches `envelope.message_id`.
3. **`verify_pass` with `integrity_method: "sha256"`** → integrity confirmed,
   proceed to contract conformance below.
4. **`verify_fail`, or no matching event** → integrity unconfirmed → **REFUSE**
   (see Failure Mode). Do **not** process the payload.

**Defense-in-depth (optional):** if ATLAS's host happens to grant Bash with
`eidolons` on PATH, it MAY independently re-run `eidolons verify-envelope
<env> --block` and abort on a non-zero exit. The orchestrator pre-verify is the
contract; self-verification is an additional guard, never a replacement.

---

## Memory: Recall + Ingest (CRYSTALIUM)

On an inbound hand-off, first recall related prior context (if CRYSTALIUM
available):

```
mcp__crystalium__recall(
  scope  = { project: <cwd-project>, agent_class_visibility: "atlas" },
  query  = <artefact GOAL + from.eidolon + artifact.kind>,
  k      = 5,
  layers = ["semantic", "episodic", "procedural"]
)
```

Only **after** the integrity gate passes (`verify_pass`) ingest the received
envelope to record the inbound edge:

```
mcp__crystalium__ingest(
  envelope = <received .envelope.json contents>,
  payload  = <artefact payload contents>
)
```

Never ingest an envelope that failed or skipped verification. **Graceful skip:**
if `mcp__crystalium__*` tools are unavailable, skip both calls silently.

---

## Trigger

Load this skill automatically when:

- Reading an upstream artefact at path `P`, **and**
- A sibling file `${P%.*}.envelope.json` exists in the same directory.

Detection rule (POSIX sh compatible):

```sh
envelope_path="${artefact_path%.*}.envelope.json"
[ -f "$envelope_path" ] && load_skill "verify-incoming"
```

If no `.envelope.json` sibling exists, this is a non-ECL artefact — skip the gate
silently and process normally.

---

## Inbound edges ATLAS accepts

`to.eidolon` MUST equal `atlas`. `from.eidolon` MUST be a declared upstream
sender. Performative and `artifact.kind` are validated against the ECL inbound
contract `contracts/<from>-to-atlas.yaml` (source of truth); the table below
is the convenience summary:

| from | performative(s) | `artifact.kind` |
|---|---|---|
| `vigil` | PROPOSE, CRITIQUE, INFORM | `root-cause-report` |
| `forge` | PROPOSE, INFORM, CRITIQUE | `reasoning-report` |

A hand-off whose `from.eidolon` is not listed, or whose performative /
`artifact.kind` is not allowed for that edge, is an `UNDECLARED_EDGE` /
`PERFORMATIVE_NOT_ALLOWED` / `ARTIFACT_KIND_NOT_ALLOWED` violation → **REFUSE**.

---

## Failure Mode (BLOCKING — refuse, do not process)

On **any** integrity or contract failure:

1. Append a `verify_fail` event to `.eidolons/.trace/<thread_id>.jsonl`.
2. Print to stderr: `[atlas-verify-incoming] REFUSE: <FAILURE_CODE> from <from.eidolon>`.
3. **Do not process the payload.** Hand control back to the **orchestrator** with
   a refusal. The orchestrator routes the failure to **VIGIL** (integrity /
   tamper investigation) or to the **human** — never a silent retry, never a
   silent process-anyway.

Failure codes: `INTEGRITY_MISMATCH`, `UNVERIFIED` (no `verify_pass` on record),
`SCHEMA_INVALID`, `UNDECLARED_EDGE`, `PERFORMATIVE_NOT_ALLOWED`,
`ARTIFACT_KIND_NOT_ALLOWED`, `CONTEXT_OVER_BUDGET`, `MISSING_REQUIRED_SECTION`
(full ECL v2.0 §5.3 set).

On success: append `verify_pass`, then proceed with the payload.

---

## Trace Events

Append one JSONL line per verification to `.eidolons/.trace/<thread_id>.jsonl`
(create if absent). The `thread_id` comes from `envelope.thread_id`; if the
envelope is unparseable, use `unknown`.

**verify_pass:**
```json
{"ts":"<RFC3339>","event":"verify_pass","message_id":"<uuid>","thread_id":"<uuid>","from":"<eidolon>@<version>","to":"atlas@<version>","performative":"<performative>","integrity_method":"sha256"}
```

**verify_fail:**
```json
{"ts":"<RFC3339>","event":"verify_fail","message_id":"<uuid>","thread_id":"<uuid>","from":"<eidolon>@<version>","to":"atlas@<version>","integrity_method":"sha256","verify_failure_code":"<CODE>","decision":"refused"}
```

---

## Notes

- **Blocking, not warn-only.** Refusal is the whole point: a receiver that
  processes a tamper-flagged payload defeats the provenance guarantee.
- **Symmetric.** All six Eidolons ship this gate with identical semantics; the
  only per-Eidolon variation is the inbound-edge table above.
- **Mechanical gate, single source of truth.** The SHA-256 comparison is the
  nexus `eidolons verify-envelope` verb (ECL v2.0 §6.2.2) — never
  re-implemented or LLM-estimated in this skill.
- **Read-only enforcement.** The receiver needs only `Read` to consult the
  trace; this is why the gate is symmetric across tool-less Eidolons.

---

*Verify-Incoming Skill — blocking, symmetric, mechanical-gate-backed (ECL v2.0 §6.2.2)*
