---
name: atlas-rescout
description: Incremental delta re-scout (Phase A/T mode) — a READ-ONLY, evidence-anchored re-run that reuses a prior scout-report + its Memex store + a git-diff range to re-probe ONLY the changed surface, carrying unchanged findings forward verbatim. Narrows (does NOT close) the always-on-live-index staleness gap. Use at Phase A intake when a prior scout-report.md + Memex store exist for the same surface and the question is "what changed since the last scout" or "re-verify the prior map against HEAD". Do NOT use for a first-time scout (run the full A→T→L→A→S cycle instead).
allowed-tools: search_symbol graph_query search_text view_file memex_read
metadata:
  methodology: ATLAS
  phase: A
---

# SKILL: Delta re-scout (incremental mode)

## When to use

**Load when:** a prior `scout-report.md` + its Memex excerpt store exist for
this surface, and you need to re-establish currency against a newer commit
without re-running the full mission.

**Unload when:** the delta-scout-report is emitted with every prior finding
re-labelled FRESH / UNCHANGED / RE-VERIFIED / NEWLY-STALE.

**Honest scope (read this first).** This is a *faster evidence-anchored
re-run*, **not** an always-on live index. ATLAS-as-a-separate-step is intrinsic
to its read-only-by-construction design; a true always-on index is an
atlas-aci runtime / nexus integration concern. The delta re-scout **narrows
the staleness penalty** by re-probing only changed surfaces — it does **not
close** the live-index gap. Do not over-claim it.

This mode is read-only (I-1). It reads `git diff` / `git log` via the existing
deterministic Traverse ladder (`rg` / `git log` in `skills/traverse.md`), never
a write tool. Memory recall and Memex reads are permitted under I-1.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | At the synthesis edge only; the changed-surface computation is deterministic. |
| Tool budget | Bounded by the changed-surface size, not the full repo — this is the whole point. |
| Output | `delta-scout-report.md` — same class as `scout-report.md`, with a section-3 finding-status label per finding. |

---

## Inputs

1. **Prior `scout-report.md`** (surfaced by `mcp__crystalium__recall` at Phase A
   intake, or supplied by the parent) — its `FINDING-XXX` records with
   `path:line` anchors and the originating commit.
2. **Prior Memex store** — the byte-exact excerpts those findings cited.
3. **A git-diff range** — `<prior_mission_commit>..HEAD` (the prior commit is
   recorded in the prior scout-report telemetry; if absent, fall back to the
   prior report's git heatmap base).

---

## Procedure

### Step 1 — Compute the changed surface (deterministic)

```
git diff --name-only <prior_mission_commit>..HEAD
```

Intersect the changed file set with the prior `map.md` `MAP-MODULES`:

```
CHANGED-SURFACE = diff_files ∩ prior MAP-MODULES (and their MAP-GRAPH neighbours)
```

Files that changed but lie outside the prior scope are noted in `MAP-GAPS`
(they may warrant a full scout, not a delta) but are not re-probed here.

### Step 2 — Re-run Phase T over the changed surface ONLY

Re-map structure (entrypoints, modules, call-graph edges) **only** for
`CHANGED-SURFACE`. Deterministic and cheap — Tree-sitter / `rg` / `git log`,
no LLM calls (Phase T rule). Unchanged regions reuse the prior `map.md` slice
verbatim.

### Step 3 — Mark prior findings STALE by anchor intersection

A prior `FINDING-XXX` is **STALE** iff its anchored `path:line_start-line_end`
range intersects a changed hunk in the diff. Findings whose anchors are
untouched are **not** re-probed.

### Step 4 — Re-probe ONLY the stale findings

For each STALE finding, run the `skills/locate.md` Tier 1–5 probe ladder over
its anchor, producing an updated finding (new anchor, new confidence). This is
the only LLM-synthesis-edge work in the mode.

### Step 5 — Carry forward UNCHANGED findings verbatim

Findings whose anchors were untouched are copied **verbatim from Memex** —
claim, anchor, confidence, and `excerpt_ref` unchanged. **Provenance is
preserved**; this is ATLAS's differentiator (read-only + evidence-anchored +
auditable lineage). Do not re-author what did not change.

---

## Output — delta-scout-report.md

Same class and section layout as `scout-report.md` (reuse the existing
`templates/scout-report.md` and `schemas/scout-report.v1.json`). Section 3 of
the delta report labels **every** finding with its delta status:

| Label | Meaning |
|-------|---------|
| `FRESH` | New finding, no prior counterpart (surfaced by the changed surface). |
| `UNCHANGED` | Carried forward verbatim from Memex; anchor untouched by the diff. |
| `RE-VERIFIED` | Prior finding whose anchor was touched, re-probed, claim still holds (possibly new line range). |
| `NEWLY-STALE` | Prior finding whose anchor was touched and the claim no longer holds; superseded or dropped to a `GAP`. |

Each label records the **originating commit** (the prior commit for
UNCHANGED/carried-forward, `HEAD` for FRESH/RE-VERIFIED) so the lineage is
auditable.

---

## Stop condition

The delta re-scout completes when **every prior finding has a delta label**
and **every changed-surface region** has either a FRESH finding or a `GAP`.
No re-scatter beyond `agent.md` P0 rule 9 (max recursion = 1).

---

## Telemetry

```
delta-rescout | changed_files: <n> | stale_findings: <n> | unchanged_carried: <n>
              | fresh: <n> | reverified: <n> | newly_stale: <n>
              | reprobe_tool_calls: <n vs full-scout estimate>
```

The `reprobe_tool_calls vs full-scout estimate` ratio is the staleness-saving
signal — it quantifies how much of the live-index gap the delta narrowed.

---

## Exit gate

- [ ] Changed surface computed deterministically (`git diff` ∩ prior MAP-MODULES).
- [ ] Phase T re-ran over the changed surface ONLY; unchanged map reused verbatim.
- [ ] Every prior finding labelled FRESH / UNCHANGED / RE-VERIFIED / NEWLY-STALE
      with an originating commit.
- [ ] UNCHANGED findings carried verbatim from Memex (provenance preserved).
- [ ] Changed-surface files outside prior scope noted in `MAP-GAPS`, not silently dropped.
- [ ] Report does NOT claim to be an always-on index — staleness narrowed, not closed.
