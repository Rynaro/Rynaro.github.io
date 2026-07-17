---
name: atlas-scatter
description: Phase L sub-mode (Scatter-Gather Locate) — TRANCE-gated parallel fan-out of read-only Locate probes across topologically-disjoint module clusters, each in a clean-context subagent, merged back into findings.md via a deterministic dedup contract. Never default; serial Locate is the standard path. Use ONLY when map.md surface is large (>5 modules OR >25 files) AND ≥2 disjoint DECISION_TARGET sub-questions exist. Trigger phrases — "audit across all modules", "trace these N independent flows", "scout this large surface in parallel". Do NOT load for a single sub-question, tightly-coupled sub-questions, or a tight budget.
allowed-tools: search_symbol graph_query search_text view_file test_dry_run memex_read
metadata:
  methodology: ATLAS
  phase: L
---

# SKILL: Scatter-Gather Locate (Phase L sub-mode)

## When to use

**Load when:** `map.md` is complete AND the activation trigger below fires.
This is the operationalized G1 TRANCE form of the diffuse scatter primitives
already in `skills/locate.md` (Operator pattern) and `agent.md` P0 rule 7.

**Unload when:** every sub-question has ≥1 merged finding at confidence ≥ M
or a `GAP`, and the merged `findings.md` has entered the Phase A fold.

**This mode does not add capability — it adds parallelism.** It is still
read-only (I-1). Scatter never grants a write tool, never resets the budget,
and never escapes a refusal gate. Branch budgets sum to ≤ the parent budget.

---

## Activation trigger (both-flags rule — TRANCE-gated)

Scatter-Gather is **GATED, never default.** Standard-tier Locate stays serial.
Both flags MUST hold (cortex C5 + C6). If either is false, the mode is inert
and you run the serial probe ladder in `skills/locate.md`.

| Flag | Source | Threshold |
|------|--------|-----------|
| Surface size (C5) | `map.md` `MAP-MODULES` / file count | **> 5 modules OR > 25 files** in scope |
| Disjoint sub-questions (C6) | `mission.md` `DECISION_TARGET` decomposition | **≥ 2 topologically-disjoint** sub-questions (different modules / concerns) |

Either flag alone → stay **standard tier** (serial Locate). Both flags →
escalate to the Scatter-Gather sub-mode.

### When NOT to scatter (carry-through from locate.md)

- Only one sub-question exists.
- Sub-questions are tightly coupled (one's answer feeds another's probe).
- Budget is already tight — coordination overhead outweighs the parallel win.

In any of these, **do not scatter.** Run serial Locate.

---

## Fan-out plan (bounded, deterministic partition)

1. **Derive the partition deterministically.** Run a single parent-side
   `graph_query("callgraph_slice: <scope>")` (or, if unavailable, partition by
   `MAP-MODULES` centrality clusters from `map.md`). **Do not LLM-guess the
   clustering** — the partition is a structural fact, not an inference
   (see `skills/locate.md` Tier-2 graph-first decomposition).
2. **One sub-mission per disjoint cluster**, mapped 1:1 to a disjoint
   sub-question where possible.
3. **Hard cap: 5 branches** (cortex C1; orchestrator-worker sweet spot ~5).
   If the partition yields > 5 clusters, merge the lowest-centrality clusters
   until N ≤ 5.
4. **Per-branch budget = `parent_remaining / N`.** Budgets are partitioned,
   not multiplied. The sum of branch budgets MUST NOT exceed the parent's
   remaining budget.

**Diversity is scope-diversity, not redundancy.** Branches probe *different*
modules. Do **not** spawn N identical probes of the same module — quality of
the partition dominates redundant diversity.

---

## Sub-mission spec (Operator pattern, clean context)

Each branch is an **ephemeral clean-context subagent** seeded with ONLY its
scope-slice + one sub-question + its budget. The clean context is the point:
it prevents trajectory self-conditioning (no branch sees another branch's
path). Reuses the `locate.md` `sub_mission` YAML, tightened:

```yaml
sub_mission:
  parent_mission_id: <MISSION-ID>
  branch_id: <1..N>
  question: <one disjoint sub-question>
  scope: <path globs for this cluster only>
  budget:
    max_tool_calls: <parent_remaining / N>
    max_tokens_input: <parent_remaining / N>
  map_excerpt: <ONLY the MAP-MODULES + MAP-GRAPH slice for this cluster>
```

Each branch runs the **Tier 1–5 probe ladder** (`skills/locate.md`) within its
scope and returns **exactly one structured object — no transcript** (I-4):

```yaml
return:
  branch_id: <1..N>
  findings: [FINDING-XXX, ...]   # branch-local IDs
  gaps: [GAP-XXX, ...]
  ruled_out: [<negative result notes>, ...]
  telemetry: {tokens_used, tool_calls}
  # NO transcript. NO raw tool outputs. Excerpts go to Memex.
```

The parent never ingests branch transcripts. Branch working state is destroyed
on return.

---

## Merge + dedup contract (two-stage bounded gather)

### Stage 1 — Gather & dedup (parent-side, deterministic)

1. **Renumber to global IDs.** Branch-local `FINDING-XXX` / `GAP-XXX` ids are
   renumbered to a global namespace to avoid cross-branch collision.
2. **Dedup on mechanical fields first.** Merge two findings into one when they
   match on **(path, overlapping line-range)**; use **claim-equivalence** only
   as a tiebreak. The merged finding keeps the **highest** confidence tier and
   **unions** the evidence anchors and `ruled_out` notes.
3. **Contradictions are NOT silently merged.** When two branches make
   conflicting claims about the same anchor, emit a single finding marked
   **`[DISPUTED]`** (D7) carrying both claims, and drop it to **confidence L**
   pending a follow-up probe. Do not pick a winner mechanically.

### Stage 2 — Fold (reuse existing machinery)

The merged `findings.md` flows **unchanged** into the existing Phase A
clean-context fold (`skills/abstract.md`). **No new aggregator is built** —
the AgentFold subagent already aggregates; scatter merely feeds it a merged
list instead of a serial one.

---

## Stop condition (explicit — D5)

Scatter completes when **every sub-question has ≥1 merged finding at
confidence ≥ M OR a `GAP`.** Scatter does **not** re-spawn: max recursion
remains 1 (`agent.md` P0 rule 9). A branch that returns only `L`/empty triple
records a `GAP`; the parent does not re-scatter that cluster.

---

## Telemetry

Record at the gather edge:

```
scatter | branches: N | fan_out_ratio: <sum(branch_tokens)/serial_estimate>
        | dedup_count: <merged-away> | disputed: <count> | tool_calls: <sum>
```

`fan_out_ratio` and `dedup_count` are the feedback signals: a low dedup count
on overlapping scopes means the partition was too coarse; a high one means the
clusters were not actually disjoint (revisit the trigger).

---

## Exit gate

- [ ] Both activation flags verified against `map.md` + `mission.md` before
      scattering (else serial Locate).
- [ ] Partition derived from a deterministic graph/centrality query, ≤ 5 branches.
- [ ] Each branch ran clean-context, returned one object, no transcript (I-4).
- [ ] Per-branch budgets sum to ≤ parent remaining budget.
- [ ] Merged `findings.md`: global ids, dedup on path/line, `[DISPUTED]` on
      contradiction (never silent-merge).
- [ ] Every sub-question has a finding ≥ M or a `GAP`; no re-scatter.
- [ ] Merged findings entered the Phase A fold; telemetry recorded.
