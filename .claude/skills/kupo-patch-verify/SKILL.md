---
name: kupo-patch-verify
description: Phase P+O sandbox patch loop with external verifier; governs edit emission, harness applier invocation, per-file loop detector, circuit-breaker, and pre-completion green-signal gate. Use when Kupo enters Phase P to emit a patch or Phase O to run verifiers; load after a KEEP decision. Do NOT use during Phase K or U.
metadata:
  methodology: Kupo
  phase: P+O
---

# Patch-Verify Skill — Kupo (Phase P+O loop)

## When to use

Load during Phase P (Patch) and Phase O (Observe). Governs the
edit → harness-apply → sandbox → verify loop. Never invoked in K or U.

Loaded during Phase P (Patch) and Phase O (Observe). Governs the
edit → harness-apply → sandbox → verify loop. Never invoked in K or U.

---

## Phase P — Patch

### Edit emission

Emit the edit in one of two forms. Never emit a diff.

**Form 1 — search/replace (default):**

```json
{
  "target_path": "src/foo.ts",
  "edit_kind": "search_replace",
  "blocks": [
    { "search": "<exact verbatim text to find>", "replace": "<new text>" }
  ]
}
```

The `search` text MUST be **verbatim** — character-exact. Do not summarize,
paraphrase, or use placeholders. If the exact text is unavailable, go back to
Phase U and gather more context before emitting.

Multiple `blocks` are allowed when replacing non-adjacent hunks in the same file.
Each block is applied in order; they MUST NOT overlap.

**Form 2 — whole-file (use when the file is small or a full rewrite is cleaner):**

```json
{
  "target_path": "config.yaml",
  "edit_kind": "whole_file",
  "content": "<full new file content>"
}
```

Use whole-file only when search/replace would require > 3 blocks or the file is
< ~80 lines. For large files, prefer targeted search/replace blocks.

**Why never a diff:** small models cannot reliably apply unified diffs (Qwen-7B
0.59 EM; disabling fuzzy apply = 9× errors — Aider/Diff-XYZ studies). The harness
applier provides deterministic fuzzy matching; Kupo's job is to emit clean
structured proposals.

### Harness applier — TRUST IT, it is real

The nexus ships the applier. Invoke it on the scratch working copy the parent
provides (a throwaway copy of the repo — never the real tree):

```sh
eidolons sandbox apply --proposal <proposal-json> --root <scratch-dir>
```

It applies your search/replace (with deterministic fuzzy matching) or whole-file
edit to the files already under `<scratch-dir>` and reports `applied` or a
structured error. Kupo never writes files directly — this is the only mutation path.

**Do not doubt the tool.** `eidolons sandbox apply` exists and is installed. If you
cannot immediately confirm it, RUN IT — do not assume it is missing, and do not
`REFUSE`/`ESCALATE` a KEEP task on a tool-existence doubt. A `not_found` result
means your `search` text was not verbatim → return to Phase U, tighten the anchor,
and retry. An apply error is a Phase O failure (increment counters, adjust the
proposal, loop) — never a reason to abandon a trivially-in-scope task.

### Per-file loop detector

Track attempt count per `target_path`. If the **same target file** has been
patched **3+ times** without a green signal from Phase O:

- This file is stuck. Do not keep patching.
- Count it as 3 consecutive failures toward the circuit-breaker.
- If the circuit-breaker has not yet fired, attempt a different approach
  (e.g., switch edit form, re-gather context) — but only one retry.
- If still no green signal, `ESCALATE`.

---

## Phase O — Observe

### Running external verifiers

Use the named verifier from Phase K (never substitute a different one):

```sh
# Run the NAMED verifier in the applied scratch copy (its cwd). It has no --root:
( cd <scratch-dir> && <verifier-command> ); echo "exit=$?"
# For untrusted/host-isolated execution, wrap it via the sandbox (carries --via):
eidolons sandbox run --via <sandbox-cmd> -- <verifier-command>
```

Supported verifier classes: `test`, `typecheck`, `lint`, `compile`, `diff`,
`schema-validate`.

### Success silent, failures verbose

- **Green (exit 0):** proceed immediately to pre-completion gate. Do not
  re-run; do not seek a second confirmation. One green signal suffices.
- **Red (non-zero exit):** capture the **full** output. Keep it in context.
  Do not truncate. Surface failures verbosely to inform the next P iteration.

### Circuit-breaker (mandatory)

| Counter | Threshold | Action |
|---|---|---|
| Consecutive failures (same or different targets) | 3 | STOP → `ESCALATE` |
| Total failed attempts (entire session) | 20 | STOP → `ESCALATE` |

A "failure" is any of: applier error, non-zero verifier exit, timeout,
per-file loop detector trigger.

Counters never reset within a delegation. If the circuit-breaker fires,
`ESCALATE` immediately — do not attempt a final "just one more" patch.

### Step ceiling and timeout

Respect the host-declared step ceiling. Treat any command that exceeds the
per-command timeout as a failure (increment both consecutive and total counters).
Do not ignore timeouts.

### Pre-completion green-signal gate

Emit a `PROPOSE` **only after** ≥ 1 green external signal.

This gate is mandatory. It defeats the "models almost never abstain" failure mode
(RiskEval 2601.07767) — structural, not verbal. Do not emit PROPOSE after
introspection ("I'm confident this is right") — only after the verifier exits 0.

---

## Output: edit-proposal artefact + ECL PROPOSE

On green signal:

1. Construct the `edit-proposal` JSON matching `schemas/kupo-edit-proposal.v1.json`:

   ```json
   {
     "schema_version": "1",
     "kind": "edit-proposal",
     "task_ref": { "thread_id": "<from envelope>", "from_eidolon": "<sender>" },
     "edits": [ { "target_path": "...", "edit_kind": "search_replace", "blocks": [...] } ],
     "verification": {
       "verifier": "<command>",
       "verifier_class": "<class>",
       "result": "green",
       "output_excerpt": "<first 200 chars of output, or empty>"
     },
     "sandbox": {
       "applied": true,
       "ephemeral": true,
       "applier": "eidolons sandbox apply",
       "attempts": <N>
     }
   }
   ```

2. Compute `sha256` + `size_bytes` of the artefact file.
   (If Bash is unavailable, emit `PARENT_FILLS_SHA256` and
   `PARENT_FILLS_SIZE_BYTES` as placeholders; the parent patches these before
   running `harness_verify`.)

3. Compose the ECL envelope sidecar, validated against `schemas/ecl-envelope.v2.json`
   (`schemas/ecl-envelope.v1.json` is retained in-repo for the ECL §7.3
   back-compat window — do not emit against it for new proposals):

   ```json
   {
     "envelope_version": "2.0",
     "message_id": "<UUIDv7>",
     "thread_id": "<from inbound envelope>",
     "from": { "eidolon": "kupo", "version": "<version>" },
     "to": { "eidolon": "<original sender>" },
     "performative": "PROPOSE",
     "objective": "<≤240-char summary of the edit>",
     "artifact": {
       "kind": "edit-proposal",
       "schema_version": "1",
       "path": "<relative path to artefact>",
       "sha256": "<hex>",
       "size_bytes": <N>
     },
     "ise": {
       "assertion_grade": "validated",
       "provenance": {
         "methodology_version": "kupo-<version>",
         "tool_surface": ["Read", "Grep", "Glob", "Bash(eidolons sandbox:*)"],
         "lateral_consults": []
       },
       "receiver_authorization": {
         "auto_route": true,
         "auto_merge": false,
         "auto_deploy": false
       }
     },
     "integrity": { "method": "sha256", "value": "<hex>" }
   }
   ```

   **Why `ise.assertion_grade: "validated"` (ECL v2.0 §6.5) on every PROPOSE,
   with no lower grade ever emitted:** Kupo never reaches PROPOSE except
   through the pre-completion green-signal gate above — a NAMED external
   verifier (the one `skills/keep-or-kick.md` required to exist before KEEP
   was even granted) exited green in the sandbox. That is "emitter ran
   spec-mandated gates" by construction, not a self-report — `validated` is
   earned, not defaulted. **`ise.receiver_authorization.auto_merge: false` is
   load-bearing, not boilerplate:** the parent applies and commits (§4,
   PROPOSE-only P0) — Kupo's own verified signal never authorizes a receiver
   to merge on Kupo's say-so. `auto_route: true` / `auto_deploy: false`
   follow the same §6.5 defaults every Eidolon in the roster uses.

4. Write both files. Signal the parent that PROPOSE is ready.

5. **Post-flight procedural-memory commit (SHOULD, additive).** After the
   green signal that gates step 1, and before or alongside emitting PROPOSE,
   commit the verified edit pattern — see `SPEC.md §9` "Post-flight commit
   (KEEP verified)". Graceful-skip when CRYSTALIUM is absent.

---

## Notes

- **One green signal is enough.** Do not seek multiple confirmations.
- **Keep failures in context.** Prior error output informs the next patch.
  Do not discard failure output between P→O iterations.
- **Escalate loudly.** When the circuit-breaker fires, include the last failure
  output in the ESCALATE body so the parent can diagnose without re-running.
- **Never write the real tree.** The only mutation path is
  `eidolons sandbox apply`. Any direct file write would violate §4.

---

*Patch-Verify Skill — Kupo Phase P+O loop*
