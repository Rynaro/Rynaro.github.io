---
name: forge-verify-incoming
description: Blocking receiver integrity gate for inbound ECL hand-offs to FORGE (ECL §6.2.2). Use automatically when reading any upstream artefact that carries a sibling `.envelope.json` — verifies `verify_pass` trace event keyed by `message_id` before processing the payload. Refuses and returns control to the orchestrator on integrity mismatch, missing event, schema violation, or undeclared edge. Do not use for artefacts without a sibling envelope.
metadata:
  methodology: FORGE
  phase: F
---

# Verify-Incoming Skill — FORGE (blocking, symmetric)

Loaded when reading any upstream artefact handed off to FORGE that carries a sibling `.envelope.json`. Blocking receiver integrity gate (ECL §6.2.2).

## When to use

Load this skill automatically when the Reasoner reads any upstream artefact at path `P` AND a sibling `${P%.*}.envelope.json` exists. The skill enforces the blocking integrity gate: a `verify_pass` trace event keyed by `message_id` MUST be on record before processing begins. On any integrity or contract failure, the skill REFUSES and returns control to the orchestrator. If no `.envelope.json` sibling exists, skip silently.

Receiver-side integrity gate for inbound ECL hand-offs. When an upstream
artefact arrives with a sibling `.envelope.json`, FORGE MUST NOT process the
payload unless its SHA-256 integrity has been **verified and passed**. This is
the **blocking** posture mandated by ECL §6.2.2 ("a receiver SHALL NOT process a
payload whose integrity tag does not match"). It is **symmetric**: every Eidolon
in the roster ships this same gate, so no hand-off edge can silently skip it.

> **Posture change (vs. earlier opt-in warn-only):** previous versions logged a
> warning and processed the payload anyway. That is now superseded. On an
> unverified or failed envelope this skill **refuses** and hands back to the
> orchestrator. Provenance is only a differentiator if receivers actually reject
> tampered payloads — end to end, not just at the orchestrator.

---

## Where the cryptographic check runs (and why the receiver only reads)

FORGE's tool surface cannot run the SHA-256 gate itself (receiver Eidolons
have restricted or no Bash). The mechanical check therefore runs **at the
orchestrator**, once, before FORGE is dispatched:

```sh
# Orchestrator pre-step (host LLM, full Bash) — already shipped in the nexus CLI:
eidolons verify-envelope <artefact>.envelope.json --block      # exit 3 ⇒ tamper/mismatch
#   …or, when routing through the kernel:
eidolons run --verify <artefact>.envelope.json --verify-block  # gates the route
```

The gate writes a `verify_pass` (or `verify_fail`) trace event keyed by
`message_id`. FORGE then enforces the result using **only `Read`** — no Bash
required:

1. Read `.eidolons/.trace/<thread_id>.jsonl` (the `thread_id` is
   `envelope.thread_id`).
2. Find the event whose `message_id` matches `envelope.message_id`.
3. **`verify_pass` with `integrity_method: "sha256"`** → integrity confirmed,
   proceed to contract conformance below.
4. **`verify_fail`, or no matching event** → integrity unconfirmed → **REFUSE**
   (see Failure Mode). Do **not** process the payload.

**Defense-in-depth (optional):** if FORGE's host happens to grant Bash with
`eidolons` on PATH, it MAY independently re-run `eidolons verify-envelope
<env> --block` and abort on a non-zero exit. The orchestrator pre-verify is the
contract; self-verification is an additional guard, never a replacement.

---

## Memory: Recall + Ingest (CRYSTALIUM)

On an inbound hand-off, first recall related prior context (if CRYSTALIUM
available):

```
mcp__crystalium__recall(
  scope  = { project: <cwd-project>, agent_class_visibility: "forge" },
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

## Inbound edges FORGE accepts

`to.eidolon` MUST equal `forge`. `from.eidolon` MUST be a declared upstream
sender. Performative and `artifact.kind` are validated against the ECL inbound
contract `contracts/<from>-to-forge.yaml` (source of truth); the table below
is the convenience summary:

| from | performative(s) | `artifact.kind` |
|---|---|---|
| `atlas`, `spectra`, `apivr`, `idg` | PROPOSE, INFORM | `consultation-request` |
| `vigil` | PROPOSE, CRITIQUE, INFORM | `root-cause-report` |

A hand-off whose `from.eidolon` is not listed, or whose performative /
`artifact.kind` is not allowed for that edge, is an `UNDECLARED_EDGE` /
`PERFORMATIVE_NOT_ALLOWED` / `ARTIFACT_KIND_NOT_ALLOWED` violation → **REFUSE**.

---

## Failure Mode (BLOCKING — refuse, do not process)

On **any** integrity or contract failure:

1. Append a `verify_fail` event to `.eidolons/.trace/<thread_id>.jsonl`.
2. Print to stderr: `[forge-verify-incoming] REFUSE: <FAILURE_CODE> from <from.eidolon>`.
3. **Do not process the payload.** Hand control back to the **orchestrator** with
   a refusal. The orchestrator routes the failure to **VIGIL** (integrity /
   tamper investigation) or to the **human** — never a silent retry, never a
   silent process-anyway.

Failure codes: `INTEGRITY_MISMATCH`, `UNVERIFIED` (no `verify_pass` on record),
`SCHEMA_INVALID`, `UNDECLARED_EDGE`, `PERFORMATIVE_NOT_ALLOWED`,
`ARTIFACT_KIND_NOT_ALLOWED`.

On success: append `verify_pass`, then proceed with the payload.

---

## Trace Events

Append one JSONL line per verification to `.eidolons/.trace/<thread_id>.jsonl`
(create if absent). The `thread_id` comes from `envelope.thread_id`; if the
envelope is unparseable, use `unknown`.

**verify_pass:**
```json
{"ts":"<RFC3339>","event":"verify_pass","message_id":"<uuid>","thread_id":"<uuid>","from":"<eidolon>@<version>","to":"forge@<version>","performative":"<performative>","integrity_method":"sha256"}
```

**verify_fail:**
```json
{"ts":"<RFC3339>","event":"verify_fail","message_id":"<uuid>","thread_id":"<uuid>","from":"<eidolon>@<version>","to":"forge@<version>","integrity_method":"sha256","verify_failure_code":"<CODE>","decision":"refused"}
```

---

## Notes

- **Blocking, not warn-only.** Refusal is the whole point: a receiver that
  processes a tamper-flagged payload defeats the provenance guarantee.
- **Symmetric.** All six Eidolons ship this gate with identical semantics; the
  only per-Eidolon variation is the inbound-edge table above.
- **Mechanical gate, single source of truth.** The SHA-256 comparison is the
  nexus `eidolons verify-envelope` verb (ECL §6.2.2) — never re-implemented or
  LLM-estimated in this skill.
- **Read-only enforcement.** The receiver needs only `Read` to consult the
  trace; this is why the gate is symmetric across tool-less Eidolons.

---

*Reasoner — Verify-Incoming Skill (blocking, symmetric, ECL §6.2.2)*
