---
name: forge-checker-handoff
description: Governs the checker-handoff gate for FORGE verdicts that authorize an irreversible action. Use at the end of the Emit phase, after the verdict and recommended action are drafted, to check the recommended action against the five mechanically observable irreversibility trigger markers (deploy/release, destructive migration or data deletion, security-boundary change, external spend/commitment, public communication). On a match, set the emitted reasoning-report's requires_checker flag to true instead of letting the verdict flow straight to execution. Reversible verdicts (no marker match) are unaffected — do not fire this skill for them.
metadata:
  methodology: FORGE
  phase: E
---

# Checker-Handoff Skill — FORGE (maker ≠ checker, additive)

Loaded at the tail of the Emit phase, after the verdict and its recommended
action are drafted but before the envelope is finalized. FORGE's own Gate
(`skills/verification.md`) is a **self-review** pass — sound for most
verdicts, but not sufficient authority to greenlight an action that cannot be
undone. This skill is the mechanical trigger that routes those verdicts to a
**distinct checker** before any action is taken.

## When to use

Load this skill once per deliberation, at Emit, immediately after the winning
hypothesis's recommended action is known. Check the recommended action
against the trigger table below. Fire the hop only on a match. Do not use for
verdicts whose recommended action is reversible at ordinary cost — those emit
exactly as before, with `requires_checker: false` (the default).

---

## Irreversibility trigger table

Five categories, checked mechanically against the recommended action's text
— a match on **any** category fires the hop:

| # | Category | Observable markers in the recommended action |
|---|----------|-----------------------------------------------|
| 1 | **Deploy / release** | deploy, release, ship to production, go live, roll out, promote to prod |
| 2 | **Destructive migration or data deletion** | drop table, truncate, delete from, irreversible migration, purge data, destroy backup |
| 3 | **Security-boundary change** | change permissions, rotate credentials, modify IAM/ACL, disable auth, open firewall, grant/revoke access |
| 4 | **External spend / commitment** | sign contract, purchase, commit budget, vendor agreement, procurement, SLA commitment |
| 5 | **Public communication** | press release, public announcement, customer-facing communication, publish blog post, public API contract change |

These five categories are the closed trigger set for this skill — do not
extend them ad hoc. If a recommended action is genuinely irreversible but
does not fit any of the five, the standard Reversibility dimension in
`skills/framing.md` Step 4 and the verdict's `[RISK]` markers already carry
that signal; this skill only formalizes the mechanically-observable subset.

## Your hop

1. **Detect** — After drafting the recommended action, scan it against the
   trigger table above. Zero matches → skip to step 4 (no hop).
2. **Mark** — On a match, set `requires_checker: true` in the emitted
   reasoning-report's frontmatter (`schemas/reasoning-report-profile.v1.json`
   `requires_checker` field). Add a `[CHECKER-REQUIRED]` line to the
   verdict's Provenance section naming the fired category and a checker-class
   hint: **VIGIL** for evidence-based/technical claims (root-cause,
   feasibility, reproducibility — claims a second reasoning or investigation
   pass can adjudicate), **human** for judgment calls (organizational,
   strategic, or policy trade-offs no evidence pass resolves). The hint is
   guidance, not a dispatch — see Invariants below.
3. **Emit unchanged otherwise** — The hop does not add a reasoning pass, does
   not trigger REFORGE, and does not block emission. FORGE still emits its
   normal verdict on the normal 1–3 pass / 1-REFORGE budget; `requires_checker`
   is a payload marker, not a refusal.
4. **Default** — Absent a trigger match, `requires_checker` is `false` (the
   schema default). Reversible verdicts are byte-for-byte unaffected by this
   skill's existence.

## Invariants

- **maker(forge) ≠ checker(vigil/human).** FORGE's own Gate is necessary but
  not sufficient authority for an irreversible action. A `requires_checker:
  true` report MUST be reviewed by a distinct party before any action —
  FORGE never self-certifies past this line.
- **Tool-less, always.** FORGE holds no tools (P0-1) and does not gain any
  at this hop. The hop is expressed **purely via the emitted-artifact
  marker** (`requires_checker: true` + the `[CHECKER-REQUIRED]` note) —
  never a tool call, never a direct dispatch to VIGIL or a human. Routing
  between VIGIL and human is the **orchestrator's** decision, informed by
  but not bound to FORGE's checker-class hint.
- **Additive, never blocking.** This hop composes with — does not extend —
  the existing 3-pass / 1-REFORGE cap and does not gate emission. A verdict
  that fails to emit because of this skill is a bug in this skill, not
  correct behavior.
- **Backward compatible.** Orchestrators that do not read `requires_checker`
  see no change in behavior — the field defaults to `false` and the rest of
  the reasoning-report is unchanged.

## Graceful skip

If the recommended action's text is ambiguous or the decision type makes the
five categories inapplicable (e.g. a pure `ROOT-CAUSE` verdict with no
recommended action beyond "investigate further"), `requires_checker` stays
`false`. This skill never fabricates an irreversibility claim to be safe —
false positives erode the signal as much as false negatives.

---

*Reasoner — Checker-Handoff Skill (maker ≠ checker, additive)*
