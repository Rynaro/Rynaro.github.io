---
name: atlas-abstract
description: Phase A (Abstract) — AgentFold compression of the Locate trajectory into a ≤2000-token working-memory summary plus a Memex excerpt store. Runs in a clean-context subagent to prevent trajectory contamination. Mechanically validates that every FINDING-XXX, GAP-XXX, and ESCALATION_TRIGGER is preserved. Use after findings.md is complete and before synthesis. Triggered automatically at phase boundary, or at ≥60% context-used telemetry threshold.
allowed-tools: memex_read view_file
metadata:
  methodology: ATLAS
  phase: A
---

# SKILL: Abstract — AgentFold & Memex (Phase A)

## When to use

**Load when:** `findings.md` is complete and you are about to Synthesize.

**Unload when:** the fold summary has passed mechanical validation and Phase S
has begun.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | Yes — this phase is summarization. But see the **clean-context rule** below. |
| Tool budget | ≤ 5% of mission `max_tool_calls` |
| Output | (1) a ≤2000-token fold summary in working memory; (2) a persisted Memex index |

---

## Why this phase exists

Long-horizon agents fail predictably when the Locate trajectory balloons
beyond the attention budget. Step-wise summarization loses critical
constraints; fixed truncation destroys intermediate reasoning; no summarization
at all courts context rot.

**AgentFold** is the alternative: treat Locate as a *branch* that you
explicitly `return` from. The return folds the branch into a self-authored
summary whose contract is mechanically checked. The Memex holds the raw
evidence, so the fold can be lossy without being destructive.

---

## The clean-context rule

The fold is performed by a prompt that has seen:

- `mission.md`
- `map.md`
- `findings.md`

And **nothing else.** Specifically, no Locate transcript, no tool logs, no
intermediate reasoning. Why: trajectory contamination. If the fold prompt
remembers the path it took, it will preserve path-relevant details at the
expense of mission-relevant details. The fold is for the mission, not the
journey.

Implementation: spawn an ephemeral subagent whose only inputs are the three
artifacts above and whose only output is the fold summary. Your current
(parent) context keeps the returned summary; discard its working state.

---

## Fold contract

The summary MUST preserve, in this order:

### 1. Mission header

```
MISSION-ID: <id>
DECISION_TARGET: <verbatim from mission.md>
SCOPE: <verbatim globs>
STATUS: completed | partial | blocked
```

### 2. Decision-ready answer

A ≤200-token prose answer to `DECISION_TARGET`, with inline `FINDING-XXX`
references after each factual clause. Example:

> RecordVote#call is the sole writer to `cast_vote_records` [FINDING-017].
> It delegates authorization to `VotingAuthorizer#authorize_ballot`
> [FINDING-017]. No Sidekiq path exists [FINDING-021, GAP-003].

### 3. Findings index

A flat list. **No claim text repeated — just IDs, tiers, and anchors.**

```
FINDING-017 | H | app/flows/vote_casting/record_vote.rb:42-78
FINDING-017 | H | app/policies/voting_authorizer.rb:12-40
FINDING-021 | M | app/flows/vote_casting/**  (ruled_out)
...
```

### 4. Open questions / gaps

Every `GAP-XXX` from findings, verbatim ID and one-line status.

### 5. Escalation log

Every `ESCALATION_TRIGGER` that fired during Locate, with timestamp and
resolution. (Especially important for election-critical or
security-sensitive missions where triggers map to hard gates.)

---

## What MAY be dropped

- Intermediate tool outputs (they're in Memex if needed).
- Failed probes that produced no finding (the ones that led to
  `ruled_out` notes are preserved via their finding).
- Narrative reasoning ("I first thought X, but then realized Y"). Downstream
  agents want conclusions, not process.
- Duplicate anchors across findings — listed once in the index, referenced
  from the answer prose.

---

## Mechanical validation

Before accepting the fold, run these checks (regex-grade, deterministic):

```
assert every FINDING-XXX from findings.md appears in the fold index.
assert every GAP-XXX from findings.md appears in §4.
assert every ESCALATION_TRIGGER from mission.md §ESCALATION_TRIGGERS
       that fired during Locate appears in §5.
assert §2 (decision-ready answer) ≤ 200 tokens.
assert total fold ≤ 2000 tokens.
assert every sentence in §2 is followed by at least one FINDING-XXX reference.
```

If any check fails, the mission was under-scoped — do **not** retry the fold
with a different prompt. Halt and escalate to human or spawn a follow-up
mission.

---

## Memex hygiene

### What goes in

- Every raw excerpt referenced by a FINDING.
- Key intermediate queries (e.g., the symbol-probe result graph for
  `CastVoteRecord`) — byte-exact, not summarized.
- The raw `findings.md` (for audit).

### Keying

Content-addressable, SHA-256 over the raw bytes. Example:

```
memex://excerpt/7f31ab...
```

### Retrieval contract

`memex.read(ref)` returns bytes identical to what was written. No
transformation, no summarization at read time. This is what lets downstream
agents re-inject exact syntax into their context if needed.

### What does NOT go in

- LLM-authored summaries (those belong in working memory).
- Tool transcripts (unless you deliberately want audit trail — expensive).
- User PII or secrets scraped during exploration. Memex is per-mission;
  assume any content could be surfaced to downstream agents.

---

## Telemetry

Record the **fold ratio**:

```
fold_ratio = tokens(fold_summary) / tokens(locate_trajectory)
```

Target: ≤ 0.1 (≥90% compression). The AgentFold literature shows this is
achievable and that violating it usually means the Locate phase collected
too much. Feedback signal: if you repeatedly hit fold_ratio > 0.2 across
missions, revisit your Locate skill — you're probably reading too much.

---

## Exit gate

- [ ] Clean-context fold produced by an ephemeral subagent.
- [ ] All five required sections present.
- [ ] Mechanical validation passed.
- [ ] Memex populated and all `excerpt_ref`s resolve.
- [ ] Parent context now holds only the fold summary + Memex index, not the
      Locate trajectory.
- [ ] `fold_ratio` recorded in telemetry.
