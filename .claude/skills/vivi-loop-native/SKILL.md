---
name: vivi-loop-native
description: "Load in Vivi's V (Verify) phase. The core capability that distinguishes Vivi from its predecessor APIVR-Δ: drive the closed, autonomous, bounded edit-run-test loop (`eidolons sandbox loop`) as its `--fix-hook`, consuming localized feedback, retrying in fresh context, refusing to game the tests, and gating on pass^k. Use whenever the task has an executable test oracle and a loop-competent host."
metadata:
  methodology: Vivi
  phase: V-Verify
---

# Loop-Native Verify Skill

The closed execution-feedback loop is the most-replicated performance lever for code agents (RLEF; S\*; SE-agent survey) — but only when it is **external-feedback-driven** (intrinsic self-correction degrades — Kamoi TACL'24, Huang ICLR'24) and **localized** (a model fixes an error when told *where* it is — Tyen et al.). APIVR-Δ deliberately left this loop "out of scope (nexus gap R1)"; **Vivi makes it the core of the V phase.** The nexus ships the substrate (`eidolons sandbox loop`) and the contract (`roster/aci.yaml` `loop_contract`); Vivi is the loop-native coder that drives it.

> **Host-contingency (read first).** The loop's gain belongs to an **RL-trained / loop-competent host** (on a prompt-only host the inference-time loop is neutral-to-negative — RLEF Table 2). Vivi *exploits* a capable host's loop competence; it does not manufacture it. If the host is loop-incompetent, or no adequate isolation is available, **degrade gracefully**: fall back to APIVR-Δ's emit-then-hand-back posture (or recommend `eidolons add apivr`).

---

## 1 — The loop is the V phase

After the P-phase test-anchors exist and the I-phase produced an initial edit, the V phase **delegates running to the substrate** and Vivi acts as the edit step:

Vivi picks the **loop shape by host tier** (Stage 2 — host-adaptive):

**ITERATE** (thinking / loop-competent host):
```
eidolons sandbox loop \
  --via "<isolation>"                     # microVM/container — REQUIRED for untrusted code (R8-03)
  --tests "<the test command>"            # or --regression <cmd> --reproduction <cmd>
  --protect "<glob of the anchoring tests>"   # anti-reward-hacking
  --require-red                           # red gate: the repro anchor must FAIL on base first
  --k 2                                   # pass^k: a flaky green is BLOCKED
  --max-attempts 3                        # reconciled with the ≤3-same-category budget
  --judge-hook "<external diff judge>"    # layered hack detection (when available)
  --fix-hook "<invoke Vivi's repair step>"    # THIS skill, per iteration
```

**FANOUT** (standard / weak host — parallel-sample-and-select):
```
eidolons sandbox loop \
  --via "<isolation>" --tests "..." --protect "..." --require-red --k 2 \
  --fanout 3 --max-attempts 1 \
  --judge-hook "<external diff judge>" \
  --fix-hook "<invoke Vivi's candidate step>"   # THIS skill, once per candidate
```

On a weak host, self-repair iteration is the WRONG shape — feeding failures back
injects new errors (RLEF; self-repair degrades below ~strong-tier). Fanout
replaces the retry chain with N **independent fresh-context candidates** from
the same base tree + the same localized base-failure feedback; the SUBSTRATE
selects the survivor externally (tests + pass^k + sealed holdout + judge). The
model never judges its own retry.

> **Declared, not just prose (`roster/routing.yaml` 1.1).** The above host-tier
> branch is no longer methodology guidance alone — the nexus roster encodes it
> as DATA. `roster/routing.yaml` declares `vivi.degraded_mode: fanout`: FANOUT
> is the declared default loop shape on a weak or undeclared host tier. It also
> declares `vivi.fallback: apivr`: the kernel's **S1.7 host-tier gate**
> (`cli/src/run.sh`) routes to APIVR-Δ as the *declared* conservative peer
> (`fallthrough_reason: "declared-fallback"`) when the gate trips, rather than
> a generic next-ranked pick. This skill's ITERATE/FANOUT split is Vivi's
> in-loop implementation of the same shape the kernel already dispatches on.

The substrate owns the bounded control flow, isolation, diff-not-apply, and the VIGIL escalation; **Vivi owns the reasoning inside `--fix-hook`.** The nexus never edits or merges.

## 2 — Each `--fix-hook` invocation: fresh context, localized feedback

The loop invokes the fix-hook once per failing iteration. Vivi's invocation MUST be:

- **Fresh-context by default — enforced by `EIDOLONS_SANDBOX_FRESH_CONTEXT`.**
  Read the env var at the START of every fix-hook invocation:

  ```
  if [ "${EIDOLONS_SANDBOX_FRESH_CONTEXT:-}" = "true" ]; then
    # DECLINE to inject the prior attempt's error transcript or reasoning.
    # Seed the retry with ONLY:
    #   1. $EIDOLONS_SANDBOX_FEEDBACK  (the localized substrate signal)
    #   2. The task/acceptance spec (the original requirements)
    #   3. The current working tree state (read as needed, via atlas-aci view_file)
    # Do NOT load: prior attempt diffs, prior hypothesis text, prior error reasoning.
  fi
  ```

  **Anti self-conditioning discipline.** The substrate already exports ONLY the
  localized feedback vars (no prior-reasoning transcript is ever exported). The
  `EIDOLONS_SANDBOX_FRESH_CONTEXT=true` flag makes this discipline EXPLICIT and
  ENFORCEABLE: when it is set, the fix-hook MUST decline to inject any prior-attempt
  reasoning it may have available in its own context. The purpose is to break the
  accumulating self-correction cycle that the science shows degrades performance
  (Kamoi TACL'24, Huang ICLR'24). Treat this as a hard rule, not a preference.

  **Default path: FRESH CONTEXT.** Even when `EIDOLONS_SANDBOX_FRESH_CONTEXT` is
  unset or empty, apply the fresh-context discipline. The flag is a substrate signal;
  the withholding discipline is Vivi's methodology. Absence of the flag does NOT mean
  "load all prior transcripts."

- **Localized.** Read the structured feedback the substrate exports:

  ```
  $EIDOLONS_SANDBOX_FEEDBACK      # JSON: {failing, loci:[file:line...], test_name:[...],
                                  #        assertion:[...], full_log, output_tail, phase, attempt}
  $EIDOLONS_SANDBOX_FULL_LOG      # the COMPLETE captured output (never just a tail)
  $EIDOLONS_SANDBOX_LAST_OUTPUT   # the most recent command output
  $EIDOLONS_SANDBOX_ATTEMPT       # current attempt number (1-indexed)
  $EIDOLONS_SANDBOX_BASE          # base directory of the sandbox
  ```

  Target the reported `loci` (exact failing assertion / file:line frame). Load
  `skills/context-engineering.md` for the atlas-aci-driven in-loop loci assembly
  procedure — do NOT re-read whole files.

- **Per-iteration crystalium recall (before the edit — S1.9).**
  After reading feedback and BEFORE making any code edit, perform the hard-precision-gated
  failure-signature recall from `skills/memory-management.md §Per-Iteration Failure-Signature
  Recall`. Procedural/semantic hits short-circuit re-derivation. Ignore low-confidence hits.
  Never let a memory miss block the edit step.

- **EVIDENCE GATE (mandatory — backported from the APIVR-Δ spine).** If
  `$EIDOLONS_SANDBOX_FEEDBACK` is missing, empty, or unparseable, do **NOT**
  guess a fix from memory of the task. A repair without concrete failure
  evidence is speculation — read `$EIDOLONS_SANDBOX_FULL_LOG` directly; if that
  too is absent, make NO edit and exit non-zero so the loop records a failed
  attempt and escalates on cap. Never hallucinate a failure to fix.

- **Fanout candidate discipline (`EIDOLONS_SANDBOX_CANDIDATE` set).** You are
  ONE independent candidate, not a retry chain: produce one coherent, COMPLETE
  fix in a single shot — there is no second pass to finish a half-edit.
  **Diversify by candidate index:** candidate 1 implements the P-phase
  top-ranked strategy; candidate 2 the runner-up; candidate 3+ the next ranked
  (or a materially different decomposition). N samples of the SAME strategy
  waste the fanout; the selection gate can only pick a survivor that exists.

## 3 — Anti-reward-hacking obligations (the loop AMPLIFIES gaming)

A closed loop with a pass/fail oracle is precisely what incentivizes evaluator-gaming (a structural equilibrium, not a correctable bug). Vivi's inherited anti-overfit spine is the guardrail; in the loop it is **mechanically enforced** by the substrate, and Vivi must never attempt to circumvent it:

- **Never edit the anchoring tests.** They are passed to `--protect`; a mutation aborts the loop and escalates to VIGIL. Fix the *implementation*, not the oracle.
- **Regression-first, then reproduction.** Success requires the pre-existing suite to pass **and** the newly-anchored acceptance test. Passing only the new test FAILS.
- **No always-pass shims, no peeking** at future commits / gold patches.
- **Red gate (`--require-red`).** A reproduction anchor that passes on the base
  tree is VACUOUS — the substrate blocks the run (`final=vacuous-reproduction`).
  Return to P and re-derive the anchor; never weaken a repro test to "make the
  gate happy".
- **Judge gate (`--judge-hook`).** A candidate that survives visible tests +
  pass^k + holdout may still be a heuristic non-fix; an external diff-review
  judge can reject it (`judge-rejected`). The judge's verdict is final for that
  candidate — do not argue with it, produce a better fix.

## 4 — pass^k before accepting

A single green run is necessary but not sufficient. With `--k > 1`, a candidate must pass `k` re-runs; a non-deterministic pass is **flaky → BLOCKED**, not merged. Treat a flaky green as a failed attempt (route to R — Reflect), never as success.

**Vivi's default: `--k 2`.** The fix-hook invocation (§1) always passes `--k 2`. This is a methodology default (not the substrate's default of k=1) — Vivi owns it explicitly. A single green run is not enough to trust a loop-derived fix.

## 5 — Escalation (bounded; reconciled)

Vivi's methodology owns the **≤3-same-category** retry budget (the authority); the substrate's `--max-attempts` is the ceiling. Whichever trips first ends the loop and emits the existing ECL `repair-failed-report` to **VIGIL** (no new performative; the closed 10-set is preserved). Provide the localized feedback + the candidate diff in the hand-off. **Oscillation flag (backported from the APIVR-Δ spine):** if the attempts alternated between two states (fix A breaks test B, fix B breaks test A — same loci flip-flopping across feedback), set `loop_detected: true` in the report payload so VIGIL starts from the oscillation, not from the last symptom. ISE sidecar: `ise.assertion_grade="self-attested"` (ECL v2.0 §6.5.2) — the escalation is Vivi's own bounded-failure judgement, not an externally-gated pass.

## 6 — Output

On success: the loop emits a **candidate diff** for review — Vivi does **not** apply or merge it (diff-not-apply; the human apply-gate is aligned with governed-autonomy). Emit the `vivi-completion-report` ECL envelope to IDG. On cap-out: the VIGIL hand-off above.

**ISE grade on the completion envelope (ECL v2.0 §6.5.2).** `vivi-completion-report` sets `ise.assertion_grade="validated"` — this is the ONLY one of Vivi's three envelope kinds that earns it, because it is the only one gated by pass^k (§4): the loop only reaches this exit after the candidate passed the substrate's spec-mandated regression-first-then-reproduction verification `k` times over, external to Vivi's own say-so. That is precisely what `validated` requires ("emitter ran spec-mandated gates") — it is not a self-report. `reasoning-request` and `repair-failed-report` are `self-attested`: neither exits through the pass^k gate (one precedes verification, the other is the verification failing out). All three set `ise.receiver_authorization = {auto_route: true, auto_merge: false, auto_deploy: false}` — diff-not-apply means Vivi never authorizes a receiver to merge or deploy on its behalf.

**Mandatory post-pass^k commit (S1.9).** Immediately after `final="passed"` (pass^k-green confirmed), Vivi MUST call `mcp__crystalium__commit(layer=procedural, ...)` as specified in `skills/memory-management.md §Mandatory Post-pass^k Commit`. This is NOT discretionary — it is a methodology obligation on every successful loop exit. The verified fix-pattern (diff + anchoring tests + failure_signature) is the most reliable learning signal available; committing it makes it available for future Vivi sessions and for VIGIL cross-Eidolon pattern reuse. **ADAPTER-NOT-ENGINE: the CODER (Vivi) issues this call; sandbox.sh never does.**

---

*Loop-Native Skill — external-feedback-driven, localized, EIDOLONS_SANDBOX_FRESH_CONTEXT-gated (prior-transcript DECLINED), hard-precision-gated crystalium recall, mandatory post-pass^k procedural commit, anti-gaming, pass^k-gated. The capability APIVR-Δ refused; the reason Vivi exists.*
