---
name: idg-verification
description: Defines the CHT verification framework and provenance output for the Gate phase of the IDG cycle. Use when entering the Gate phase, verifying document completeness and truthfulness, running CHT scores, deciding DELIVER vs REVISE vs ESCALATE, or producing provenance metadata blocks.
metadata:
  methodology: IDG
  phase: G
---

# Verification Gates

Loaded during the Gate phase. Defines the CHT verification framework and provenance output.

## When to use

Load this skill when entering the Gate (G) phase of the IDG cycle — specifically when running the CHT gate (Completeness / Helpfulness / Truthfulness), generating provenance metadata, or deciding whether to deliver, revise, or escalate. Also load for the section-level mini-gate in G5 parallel mode. Do NOT load upfront; trigger on demand at Gate entry.

---

## CHT Framework

Three dimensions. Score each 1–5 after completing the draft.

### C — Completeness

Does the document cover everything it should?

| Score | Meaning |
|-------|---------|
| 5 | All template sections filled. No `[GAP]` markers. |
| 4 | All sections filled. 1–2 minor `[GAP]` markers with justification. |
| 3 | Most sections filled. Some `[GAP]` markers. Core content present. |
| 2 | Significant sections missing or skeletal. Multiple `[GAP]` markers. |
| 1 | Document is a stub. Insufficient context was provided. |

**Checks:**
- Every section in the template/skeleton is addressed
- Required structural markers are present (at least one `[DECISION]` in ADRs, at least one `[ACTION]` in runbooks)
- Cross-references between sections are consistent
- If a section is intentionally omitted, the omission is justified

### H — Helpfulness

Can the target audience understand and act on this document?

| Score | Meaning |
|-------|---------|
| 5 | Reader can act immediately. Clear next steps, no ambiguity. |
| 4 | Reader understands fully. Minor clarification might help in edge cases. |
| 3 | Reader understands the main points. Some sections need more context. |
| 2 | Reader would need to ask follow-up questions to act. |
| 1 | Document is confusing or disorganized. Audience mismatch. |

**Checks:**
- Technical depth matches stated audience
- Jargon is appropriate (defined if cross-functional audience)
- `[ACTION]` items have enough context to be actionable
- Document structure follows a logical reading path
- Conclusions and summaries appear where readers expect them

### T — Truthfulness

Is every claim grounded in source material?

| Score | Meaning |
|-------|---------|
| 5 | Every claim sourced. No inference without labeling. |
| 4 | Claims sourced. 1–2 minor inferences clearly labeled. |
| 3 | Most claims sourced. Some inferences not explicitly labeled. |
| 2 | Several unsourced claims. Risk of misleading reader. |
| 1 | Significant fabrication or unsupported assertions. |

**Checks:**
- Every factual statement traces to a source artifact
- Inferences are labeled ("Inferred:", "Likely:")
- `[DISPUTED]` markers present where sources conflict
- No invented rationale attributed to people or teams
- Error messages, commands, file paths are exact (not paraphrased)
- If the source artefact arrived with an `*.envelope.json` sidecar, the provenance block records the envelope's `message_id`, `thread_id`, `from`, `performative`, and `verify_pass` / `verify_fail` outcome. A `verify_fail` does not lower the score below 4 by itself; it is captured as `[DISPUTED]` in the document.

---

## Gate Decision

| Condition | Action |
|-----------|--------|
| All dimensions ≥ 4 | **DELIVER** — document is ready |
| Any dimension 2–3 | **REVISE** — one targeted revision pass on failing dimensions only |
| Any dimension 1 | **ESCALATE** — insufficient context to produce this document. Report what's missing. |

### Revision Protocol

When revising:
1. Identify the specific sections causing the low score
2. Fix only those sections — do not rewrite the entire document
3. Re-check the specific dimension that failed
4. Deliver with a note on what was revised

**Hard cap: one revision pass.** If the document still has issues after revision, deliver it with the remaining issues explicitly flagged in the provenance metadata. The requester can provide additional context for a follow-up pass rather than the Scribe entering an unbounded loop.

---

## Provenance Metadata

Every delivered document includes a provenance block at the end:

```markdown
---

## Provenance

- **Scribe version**: <version>
- **Document type**: [type]
- **Generated**: [timestamp]
- **Source artifacts**:
  - [list of source artifacts used, with identifiers]
- **CHT scores**: C:[N]/5 H:[N]/5 T:[N]/5
- **Coverage**: [brief assessment — what's well-covered vs gaps]
- **Flags**: [any unresolved `[GAP]` or `[DISPUTED]` markers]
```

### Source Artifact Identifiers

Use the most specific identifier available:

| Source Type | Identifier Format |
|-------------|------------------|
| Git commit | `commit:abc1234` |
| File | `file:path/to/file.rb` |
| Agent output | `agent:[agent-name]:[task-id]` |
| Conversation | `conversation:turn-[N]` |
| External doc | `doc:[title-or-url]` |
| Spec / ticket | `spec:[ID]` |
| ECL envelope | `ecl://thread/<thread_id>/message/<message_id>` |

---

## Memory Ingest (Phase G — after DELIVER)

Once the Gate decision is **DELIVER** (or DELIVER-with-flags after revision), persist
the document handoff to CRYSTALIUM.

### Ingest

If the document was handed off with an ECL sidecar envelope (`*.envelope.json`),
ingest via:

```
mcp__crystalium__ingest(
  envelope = <the validated *.envelope.json contents>,
  payload  = <delivered document contents>
)
```

This records the document at T1 (`from.eidolon=idg` drives tier derivation).

If no ECL sidecar is present, commit an episodic note directly:

```
mcp__crystalium__commit(
  layer      = "episodic",
  payload    = <document type + CHT scores + key decisions/gaps summary>,
  provenance = { author_agent: "idg", document_type: <type> }
)
```

`author_agent` MUST be `"idg"` on every direct commit.

### Session end

After ingest (or after delivery if CRYSTALIUM is absent), call:

```
mcp__crystalium__session_end()
```

This triggers Dream consolidation asynchronously. Call it once per IDG dispatch
completion. Dream promotes corroborated episodic entries (terminology conventions,
structural patterns) to the semantic layer — improving future recall quality.

**Graceful skip:** if `mcp__crystalium__*` tools are unavailable (CRYSTALIUM not
installed), skip ingest and session_end and mark the Gate phase complete normally.
Never hard-fail on absent CRYSTALIUM tools. IDG is EIIS-standalone-conformant.

---

*Scribe — Verification Skill*
