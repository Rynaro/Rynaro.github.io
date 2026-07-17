---
name: atlas-esl-hop
description: "ESL lifecycle hop — the DISCOVER hop. When a scout mission's findings surface change-worthy signal (a defect, a spec/impl drift, or a genuine gap) in an ESL-enabled project (.spectra/ present), ATLAS proposes opening an ESL change at 'proposed' by framing the scout-report + its ECL envelope it already emits as the proposal artifact — it never calls mcp__tonberry__* itself and never implements (refusal boundary intact). SPECTRA's own esl-hop owns the actual right_size/propose/specify tonberry calls on receipt, over the existing atlas-to-spectra handoff edge. Absent .spectra/ or absent change-worthy findings → hand off the scout-report normally (ESL opt-in)."
metadata:
  methodology: ATLAS
  phase: S
---

# ATLAS — ESL Lifecycle Hop (the DISCOVER hop)

## When to use

Load at Phase S (Synthesize), after the fold is validated and before
`scout-report.md` is finalized, when **both** hold:

- **Change-worthy signal.** ≥1 finding in `findings.md` asserts something is
  broken, drifted, or missing relative to a spec/expectation the mission
  surfaced — not merely descriptive topology. See "What counts as
  change-worthy" below.
- **ESL-enabled project.** A `.spectra/` directory exists at the consumer
  project root — checked with a single read-only `list_dir` probe, never an
  MCP call. ATLAS has no `mcp__tonberry__*` tool surface and never acquires
  one.

If either condition is false, skip this skill silently and emit
`scout-report.md` the normal way (`skills/synthesize.md`). ESL is opt-in;
ATLAS is EIIS-standalone-conformant and works without it.

## What counts as change-worthy

A finding is change-worthy when its claim is one of:

- a **defect** — behavior contradicts a spec, contract, or documented
  invariant;
- a **drift** — an implementation and its governing spec/doc have diverged;
- a **gap** — a required capability, test, or safeguard is absent.

Purely descriptive findings ("X calls Y at `path:line`") are not
change-worthy on their own. When uncertain, the mission's own `GAPS`/`RISKS`
framing (scout-report §5) is the signal — anything already flagged there as
needing a decision or a fix is change-worthy by definition.

## Your hop — DISCOVER (`proposed`), never MAKE

You are the furthest-upstream Eidolon in the ESL chain. You do **not** call
`mcp__tonberry__*` — right-sizing, opening the `change.json` record, and
running S→P→E→C→T→R→A belong to **SPECTRA's own hop**
(`skills/esl-hop.md` in the SPECTRA repo), triggered when it receives your
hand-off. Your job stops at **naming the change-worthy finding and handing it
off** — the refusal boundary (P0 rule 1: read-only, no
`edit`/`write`/`commit`/`deploy`/`migrate`/`refactor`/`fix`) stays fully
intact: you never create, edit, or transition ESL state yourself.

1. **flag the proposal in §4.** In `scout-report.md` §4 "Recommended next
   actions", tag every change-worthy `R-N` item `[→ SPECTRA]` with an
   explicit `[ESL-PROPOSAL]` marker naming the `FINDING-XXX`/`GAP-XXX` it
   rests on, and state plainly that the item proposes opening an ESL change
   at `proposed`. This is the same artifact Phase S already emits — no new
   file, no new schema.
2. **frame the envelope objective.** In `scout-report.envelope.json`, set
   `performative: "PROPOSE"` (the existing default for ATLAS→SPECTRA) and
   word `objective` to name the ESL proposal intent, e.g. `"Deliver scout
   report for mission <id>, proposing an ESL change at 'proposed' for
   FINDING-003/FINDING-007."`. The `ise` block is unchanged from the standard
   scout-report emission (`skills/synthesize.md` "Envelope sidecar"):
   `ise.assertion_grade: "self-attested"` and
   `ise.receiver_authorization: {auto_route: true, auto_merge: false,
   auto_deploy: false}` — SPECTRA MAY auto-route the finding into its own ESL
   intake without an operator confirm, but MUST NOT auto-merge or
   auto-deploy anything off an ATLAS-originated discovery.
3. **hand off via the existing edge.** Deliver `scout-report.md` +
   `scout-report.envelope.json` to SPECTRA exactly as `skills/synthesize.md`
   already prescribes (`contracts/atlas-to-spectra.yaml`,
   `artifact.kind: scout-report`, unchanged). SPECTRA's `spectra-esl-hop`
   skill (when `.spectra/` and tonberry are present on its side) takes it
   from there: right_size → propose → specify.

## Invariants

- **Refusal boundary intact.** ATLAS never calls a tonberry write verb
  (`propose`, `transition`, `archive`, `verify`) and never touches
  `.spectra/changes/`. This hop is discovery framing on an artifact ATLAS
  already emits, not a new write surface.
- **SPECTRA owns `proposed`.** The actual `change.json` at `proposed` status
  is created by SPECTRA's hop, never ATLAS's. ATLAS's contribution is
  evidence carried across the existing roster edge
  (`contracts/atlas-to-spectra.yaml`), not a tonberry-recognized object.
- **No new artifact kind, no new contract.** The proposal rides inside the
  standard `scout-report` artifact/envelope pair — inventing a distinct ECL
  `artifact.kind` here would require a contract change outside ATLAS's repo;
  this hop deliberately does not do that.
- **Evidence-anchored, same as every ATLAS claim.** Every `[ESL-PROPOSAL]`
  item cites a `FINDING-XXX`/`GAP-XXX` + its `path:line` anchor (I-7). No new
  claims are introduced at this hop.
- **Graceful skip.** No `.spectra/` directory, or no change-worthy finding →
  skip silently, emit `scout-report.md` normally. ESL is opt-in.

---

*ATLAS — ESL Lifecycle Hop (the DISCOVER hop; upstream of `proposed`, never a maker)*
