---
name: gilgamesh-grind
description: Phase Grind externally-verified work loop — governs sandbox-first mutation within authority, the named-oracle gate after every meaningful change, the loop budget (time/turns/tokens), and the mechanical stopping policy over exactly {continue, recover, escalate, terminate}. Use after Lock freezes the plan; load when Gilgamesh enters the work loop. Do NOT use during Gauge/Inventory/Lock/Attest.
metadata:
  methodology: Gilgamesh
  phase: Grind
---

# Grind Skill — Gilgamesh (Phase Grind loop)

## When to use

Load once the plan is locked (Phase L complete). Governs the
mutate-in-sandbox → run-oracle → decide-stop loop. Never invoked in Gauge, Inventory,
Lock, or Attest.

Grind is where the work happens, and where the Excalipoor rule bites hardest: a
mutation is not believed until an **external oracle** says green.

---

## The action substrate (small and composable)

Grind uses a handful of semantically-shaped actions (digest §2 — a small substrate
beats a large tool catalog):

1. **read** — just-in-time gather via atlas-aci, within `authority.read`.
2. **edit-in-sandbox** — apply a mutation via the nexus harness applier
   `eidolons sandbox apply --proposal <p> --root <scratch>`. NEVER the real tree.
3. **run-oracle** — run the deliverable's NAMED external verifier in the sandbox
   (`eidolons sandbox run` / `eidolons sandbox loop`).

Nothing else mutates state. The sandbox is the only write zone (`authority.write =
sandbox`); the parent commits.

---

## Externalized verification (the gate)

After **every meaningful mutation**, run the deliverable's NAMED external oracle. The
oracle is one of:

| Class | Green signal |
|---|---|
| **test** | test runner exits 0 |
| **typecheck** | typechecker exits 0 |
| **lint** | linter exits 0 |
| **compile** | compiler exits 0 |
| **diff** | produced diff matches the expected shape |
| **schema-validate** | validator accepts the artefact |
| **parser** | parser accepts / round-trips the artefact |
| **env-feedback** | the environment reports the intended effect |

Success is silent (record the green outcome, move on); failure is verbose (capture the
**full** output into `TaskState.verification_outcomes`, keep it in context, adjust).
Never self-critique, never LLM-as-judge. One green external signal per deliverable is
the pre-completion gate; no result reaches PROPOSE without it.

**An oracle's output is a `VERIFY-<name>` result, never an evidence anchor.** A
command's stdout/stderr — including anything written to an ephemeral path like
`/tmp/*` — proves a claim at Attest time via the `VERIFY-<name>` line, not via a
`path:line` anchor. `EVIDENCE-<key>`/`PROPOSAL-TARGET` anchors resolve only to a
committed repo file (the source or script the fact derives from); a command-output
path is never a legal anchor target (`skills/attest.md` — repo-only anchor rule).

### Route around tool-surface gaps — never route around the oracle itself (verify-routing ladder)

Your tool allowlist is scoped narrower than the repo's full verification surface by
design (no generic `Bash(*)`). If the named oracle's most direct invocation form
falls outside it, that is **not** grounds to skip the oracle or to substitute your
own reasoning for its exit code. This is the same ladder `skills/attest.md` Step 1a
applies to required report lines:

1. **Direct.** If the verification command is directly allowed by your tool list
   (`make`, `bats`, `shellcheck`, `pytest`, `go test`, `jest`, `rspec`, `shasum`,
   `wc`) — run it directly.
2. **Delegated sandbox.** Otherwise route it through `eidolons sandbox run
   --allow-unsafe-host -- <cmd>` (trusted repo verifier scripts; the sandbox
   captures pass/fail) or `eidolons sandbox loop` for the mutate→verify cycle. It
   stands as equivalent verification, not a downgraded one.
3. **Blocked.** Only if both rungs are unavailable is the check genuinely blocked.
   Record that plainly — the specific denied invocation, as `fail` + blocker —
   rather than hand-deriving a pass from manual inspection. A manual walkthrough is
   not an external oracle, however careful.

Never skip a rung, never omit the line, never hand-derive a result you could
execute. A blocked-and-reported check is honest; a manually-reasoned "pass"
standing in for an oracle's exit code is exactly the Excalipoor failure mode this
methodology exists to prevent.

---

## The loop budget

Every mission carries `budget{time, turns, tokens}` frozen at Lock. On each iteration,
increment `spent` and check every dimension. Exhausting **any** dimension forces
`terminate` (below) — Gilgamesh Attests what is proven, never grinds past the budget.

---

## The stopping policy (mechanical — exactly four states)

Each iteration resolves to **exactly one** state. The set is closed; there is no fifth
option and no "just one more" beyond a wall.

| State | Mechanical transition condition | Next action |
|---|---|---|
| **continue** | Last oracle green (or first attempt) **and** no budget dimension exhausted. | Run the next planned step. |
| **recover** | An oracle went red **and** `consecutive_failures < 3` **and** budget remains. | Adjust the mutation (tighter anchor / different edit form / re-gather) and retry — bounded. |
| **escalate** | `consecutive_failures == 3`, **or** an authority/boundary wall (needs a denied capability, or a separable cross-boundary sub-mission). | Stop; carry the last oracle output + a `handoff-request` into Attest → ESCALATE. |
| **terminate** | **Success:** every deliverable green under its oracle; **or** any budget dimension (time/turns/tokens) exhausted. | Stop; go to Attest with what is proven. |

### Counters (never reset within a mission)

- `consecutive_failures` — reset to 0 only on a green oracle.
- `total_failures` — monotonic.
- A **per-target loop** (the same artefact failing 3×), an applier error, or a timeout
  each counts as a failure toward both counters.

---

## Worked iteration

```
1. state = continue
2. edit-in-sandbox(step)          # authority.write = sandbox
3. result = run-oracle(step.oracle)
4. if result == green:
     consecutive_failures = 0
     if all deliverables green: state = terminate (success)
     else: state = continue
   else:
     consecutive_failures += 1; total_failures += 1
     if consecutive_failures == 3: state = escalate
     elif budget_exhausted(): state = terminate (budget)
     else: state = recover
5. record result into TaskState.verification_outcomes
6. loop on continue/recover; exit on escalate/terminate
```

---

## Notes

- **Sandbox-first, always.** The only mutation path is `eidolons sandbox apply`. A
  direct write to the real tree violates the `write` authority row.
- **Keep failure output in context.** Prior red output informs the next mutation; do
  not discard it between iterations.
- **Escalate loudly.** When `escalate` fires, include the last oracle output in the
  ESCALATE body and attach a `handoff-request` so the orchestrator can route without
  re-running.
- **Trust the harness.** `eidolons sandbox apply` and the oracles are real and
  installed — invoke them. An apply error means *retry with a tighter anchor*, not
  *abandon a grantable mission*.

---

*Grind Skill — Gilgamesh Phase Grind: sandbox-first, external-oracle-gated, budget-bounded*
