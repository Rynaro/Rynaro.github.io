---
name: idg-section-parallel
description: Operationalizes the G5 gated parallel doc-section synthesis mode for IDG. Use when composing a large document (six or more independent sections) routed at the TRANCE tier; fires dependency-layering, bounded per-layer fan-out (up to five subagents), per-section CHT mini-gate, topological-order parent assembly, and provenance merge. Do NOT use for standard-tier or small documents — sequential composition is always the default.
metadata:
  methodology: IDG
---

# Section-Parallel Synthesis (G5)

Operationalizes the G5 form named in the cortex matrix: **gated parallel doc-section
synthesis**. This is the runnable mode behind the sequential "topological section
order" rule in `skills/composition.md`. It is **TRANCE-gated and never the default** —
standard tier always composes sequentially.

Load this skill only when the gate below fires. For small documents it is a no-op.

---

## When to use (gate)

Activate section-parallel synthesis only when **all** of these hold:

- The document has **six or more sections** that the skeleton marks as **independent**
  within a topological layer (no section depends on a sibling in the same layer).
- The composition is **read-only** — IDG never writes source files, so fan-out carries
  no write-conflict risk and needs no worktree isolation.
- The caller (cortex/host) routed the task at the **TRANCE** tier.

Otherwise compose sequentially per `skills/composition.md`. Small ADRs, runbooks, and
any document with fewer than six independent sections are an explicit **no-op** — do not
fan out; the coordination overhead is not repaid.

---

## The five steps

### 1. Dependency-layering

Build the section dependency graph from the skeleton (as in the Draft phase), then
**topologically layer** it: layer 0 is every section with no unmet dependency; layer 1
is every section whose dependencies are all in layer 0; and so on. Sections within a
layer are mutually independent by construction and may be drafted concurrently.

Record the layering in working memory so the parent can assemble in topological order
later.

### 2. Bounded per-layer fan-out

For each layer, in layer order, dispatch **at most five** clean-context per-section
subagents — one section per subagent. Each subagent receives **only** the source
material relevant to its section (the per-section context budget of
`skills/composition.md` still applies: ≤ ~2,000 tokens; summarize and cite beyond that).

A subagent runs in a **clean context** — it sees its section scope, its selected source
slice, and the already-assembled prior layers as read-only reference. It never sees
sibling drafts in its own layer (that is what prevents trajectory cross-contamination).

If a layer has more than five independent sections, batch them: drain five, then the
next five, preserving the per-layer cap. Fan-out is **read-only**; no subagent writes to
disk and no worktree is created.

### 3. Per-section CHT mini-gate (one revision max)

Each subagent runs a **per-section** CHT mini-gate on its own draft before returning it
(see `skills/verification.md` — two-granularity CHT). Score the section on Completeness,
Helpfulness, and Truthfulness:

- All three ≥ 4 → return the section.
- Any 2–3 → **one** targeted revision pass on the failing dimension, then return with a
  per-section flag note.
- Any 1 → return the section stub with an explicit `[GAP]` and the missing-context note;
  do not loop.

**Hard cap: one revision per section.** No subagent re-drafts more than once.

### 4. Parent assembly (topological-order selection, not averaging)

The parent collects all returned sections and assembles the document **in topological
order** (layer 0 first, then layer 1, …). Assembly is **selection, not averaging**: the
parent takes each section as drafted by its subagent — it does not merge or blend two
candidate prose variants into a mean. (IDG drafts each section once per branch; there is
no multi-candidate vote to average. If the host ever supplies redundant drafts of the
same section, the parent **selects** the higher per-section CHT score and discards the
other; it never concatenates or averages prose.)

Where two sections make claims that conflict, the parent does not silently pick a winner:
it emits a `[DISPUTED]` marker presenting both, per `skills/composition.md`.

### 5. One document-level coherence pass + provenance merge

After assembly the parent runs exactly **one** document-level coherence check (the
second granularity of the CHT gate): cross-section terminology consistency, transition
bridges between layers, no duplicated or contradictory claims, single provenance block.

The parent then **merges provenance**: it unions every subagent's per-section source
citations, ECL envelope outcomes, and `[GAP]`/`[DISPUTED]` flags into the single
document-level provenance block. Per-section CHT scores roll up to a document-level CHT
line; the coherence pass contributes the document-level Completeness/Helpfulness check.

**Stop condition (D5):** at most five branches per layer, at most one revision per
section, exactly one parent coherence pass. No further iteration. Deliver with flags.

---

## What this mode does NOT change

- **No new write surface.** IDG remains read-only; fan-out is concurrent reads +
  in-context drafting. No worktree, no file writes by subagents.
- **No averaging of prose.** Assembly is topological selection; conflicts become
  `[DISPUTED]`, never a blended mean.
- **No unbounded loops.** The per-section one-revision cap and the single coherence pass
  preserve IDG's "one gate, one revision max" guarantee at both granularities.
- **No default change.** Sequential composition stays the standard-tier default; this
  mode is gated behind the six-independent-section + TRANCE threshold.

---

*Scribe — Section-Parallel Skill*
