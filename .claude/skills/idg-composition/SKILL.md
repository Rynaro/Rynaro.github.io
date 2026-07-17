---
name: idg-composition
description: Governs how the Scribe transforms context into structured, grounded prose during the Draft phase. Use when starting any document composition, loading templates, applying structural markers, or writing section by section with topological ordering and envelope-aware intake.
metadata:
  methodology: IDG
  phase: D
---

# Composition Methodology

Loaded during the Draft phase. Governs how the Scribe transforms context into structured prose.

## When to use

Load this skill when entering the Draft (D) phase of the IDG cycle — specifically when beginning any document composition (session-chronicle, ADR, runbook, change-narrative, or custom). Also load it when applying structural markers, building section skeletons from templates, or checking ECL envelope sidecars during intake. Do NOT load upfront; trigger on demand at Draft entry.

---

## Memory Recall (Phase I — intake entry)

At the start of Phase I, before classifying the source artefact, execute:

```
mcp__crystalium__recall(
  scope    = { project: <cwd-project>, agent_class_visibility: "idg" },
  query    = <document type + source artifact summary + objective>,
  k        = 5,
  layers   = ["semantic", "episodic", "procedural"]
)
```

Fold any relevant hits (prior terminology conventions, document patterns, structural
decisions for this project) into intake context before building the document skeleton.
The **semantic** layer is especially valuable for IDG: promoted conventions from past
chronicles sharpen terminology consistency across documents.

**Graceful skip:** if `mcp__crystalium__*` tools are unavailable (CRYSTALIUM not
installed), proceed without memory — never hard-fail. IDG is EIIS-standalone-
conformant and works without CRYSTALIUM.

---

## Envelope-Aware Intake (ECL v2.0)

When classifying a source artefact during the **I — Intake** phase, check whether the artefact arrived with an ECL sidecar envelope. The four steps below keep the same intake numbering IDG has always used — but validation, integrity, and contract-conformance checks are no longer re-implemented here. They are a single **blocking** gate owned by `skills/verify-incoming.md` (ECL §6.2.2, converged with the canonical shape (Kupo reference implementation)) — **one gate, not two**.

### Step 1 — Detect

Look for a file whose name is `<payload-basename>.envelope.json` in the same location as the payload. Examples:

- Payload: `apivr-completion-report.md` → Sidecar: `apivr-completion-report.md.envelope.json`
- Payload: `root-cause-report.md` → Sidecar: `root-cause-report.md.envelope.json`

If **no sidecar is found**, proceed normally. In the provenance block note: "no envelope; ECL verification skipped." No CHT score impact.

### Step 2 — Validate

Schema validation of the sidecar against the vendored ECL v2.0 envelope schema (`schemas/ecl-envelope.v2.json`; `schemas/ecl-envelope.v1.json` retained for the ECL §7.3 compatibility window) is owned by `skills/verify-incoming.md`. Load it now — do not validate the sidecar inline here.

### Step 3 — Recompute and compare sha256

sha256 recomputation against `envelope.integrity.value` is likewise owned by `skills/verify-incoming.md`. A mismatch is a **blocking REFUSE** at the gate, not a local `[DISPUTED]` marker — Draft-phase composition never sees a payload whose integrity hasn't already been confirmed.

### Step 4 — Check performative

Performative and `artifact.kind` conformance against the declared inbound edge (`contracts/<from>-to-idg.yaml`) is validated by `skills/verify-incoming.md`. An out-of-contract hand-off is refused at the gate before Intake classification begins — it never reaches this step as a live payload.

### Record and trace

Once `skills/verify-incoming.md` has recorded `verify_pass` (a failed gate refuses before Intake starts, so `verify_fail` never reaches this point), carry its outcome into working memory:

```
ecl_verification:
  message_id: <uuid>
  thread_id: <uuid>
  from: <eidolon slug>
  performative: <value>
  outcome: verify_pass | skipped
```

This record surfaces in the Gate phase and populates the chronicle's Communication Lineage section and provenance block. If the verified envelope carries `ise.assertion_grade` (ECL v2.0 §6.5), surface it alongside — the provenance block should let the reader distinguish upstream work that was mechanically `validated` from work that was only `self-attested`. See `skills/verify-incoming.md`.

**IDG does not, and shall not, fetch any envelope referenced via `input_handles`**. P0 forbids retrieval. If a handle resolves to a path already in-context (the requester has explicitly provided the file), reading it is permitted. Otherwise mark `[GAP]`.

---

## Section-Level Composition

Write one section at a time, in topological order. For each section:

1. **Scope the section** — what question does this section answer for the reader?
2. **Select context** — pull only the source material relevant to this section. Discard the rest for now.
3. **Draft** — write the section. Ground every claim.
4. **Cite** — tag each factual statement with its source artifact (inline or footnote, per template convention).
5. **Mark** — apply structural markers where appropriate.
6. **Transition** — write the bridge to the next section if the document type requires narrative flow.

### Context Budget Rule

When composing a section, keep injected context to the minimum necessary. If the full source material for a section exceeds ~2,000 tokens, summarize the supporting evidence and keep the original references as citations. This preserves working space for the model to reason about composition rather than drowning in raw material.

### Topological Section Order

Write sections that establish context before sections that depend on it:

- Background/Context → Decisions → Consequences
- Problem Statement → Steps Taken → Outcomes → Lessons
- Summary → Details → Follow-ups

If sections have no dependency relationship, write them in the template's default order.

---

## Structural Markers Reference

Markers are the Scribe's primary value-add. They transform passive documentation into actionable intelligence.

### `[DECISION]`
A choice was made. Always include:
- **What** was decided
- **Why** (rationale, even if brief)
- **Alternatives rejected** (if available in source material; `[GAP]` if not)

```markdown
[DECISION] Adopted Redis for session caching over Memcached.
Rationale: Redis supports data structures needed for rate-limiting (sorted sets).
Rejected: Memcached (no sorted sets), DynamoDB (latency budget exceeded).
```

### `[ACTION]`
Something needs to happen. Include:
- **What** needs doing
- **Owner** (if known; `TBD` if not)
- **Deadline or trigger** (if known)

```markdown
[ACTION] Update Terraform modules to provision Redis cluster. Owner: Platform team. Trigger: Before Sprint 14 deployment.
```

### `[DISPUTED]`
Source material conflicts. Present both sides neutrally:

```markdown
[DISPUTED] Load test results disagree on p99 latency.
- Agent A's benchmark: 12ms p99 under 10k RPS
- Manual test by engineer: 45ms p99 under 8k RPS
Resolution: Not yet determined. Recommend re-running with standardized methodology.
```

### `[GAP]`
Expected information is missing from provided context:

```markdown
[GAP] Rollback procedure not documented in session artifacts. Requested from Ops team.
```

---

## Writing Standards

### Grounding Rules

| Rule | Detail |
|------|--------|
| **No unsourced claims** | Every factual assertion must trace to a specific source artifact |
| **Distinguish inference from fact** | If the Scribe infers something (e.g., likely rationale for a decision), prefix with "Likely:" or "Inferred:" |
| **Preserve source fidelity** | Do not editorialize or interpret beyond what sources support |
| **Quote sparingly** | Paraphrase unless exact wording is load-bearing (error messages, commit messages, CLI output) |

### Audience Adaptation

| Audience | Depth | Jargon | Examples |
|----------|-------|--------|----------|
| Engineers on the team | Full technical depth | Domain terms OK without definition | Code snippets, file paths, CLI commands |
| Engineering leadership | Architectural level | Define non-obvious acronyms | Diagrams, trade-off summaries, impact statements |
| Cross-functional | Business outcomes | Minimal jargon, explain technical terms | User-facing impact, timelines, risk levels |

Determine audience from the document type default or explicit instruction. When uncertain, default to "Engineers on the team."

### Tone

- **Active voice** preferred ("The team decided..." not "It was decided...")
- **Concrete over abstract** ("Added 3 retry attempts with exponential backoff" not "Improved error handling")
- **Terse over verbose** — every sentence should earn its place
- **No hedging without cause** — "The migration completed successfully" not "The migration appears to have completed successfully" (unless completion is genuinely uncertain)

---

## Section Composition Checklist

Before moving to the next section, verify:

- [ ] Section answers the question it was scoped to answer
- [ ] Every factual claim has a source citation
- [ ] Structural markers applied where appropriate
- [ ] Tone matches audience level
- [ ] No information fabricated or assumed without marking
- [ ] Transition to next section is clear (if applicable)

---

*Scribe — Composition Skill*
