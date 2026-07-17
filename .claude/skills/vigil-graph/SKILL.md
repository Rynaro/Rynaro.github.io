---
name: vigil-graph
description: Phase G (Graph) — builds the Information Dependency Graph from candidate fault nodes. Distinguishes propagated symptoms from root candidates using information flow, not temporal order; ranks root candidates by descendant count. Use after `fault-surface.md` is schema-valid with ≥1 candidate, before the Intervene phase.
allowed-tools: view_file, search_symbol, graph_query, dep_graph_query, trace_inspect
metadata:
  methodology: VIGIL
  phase: G
---

# SKILL: Graph — build the Information Dependency Graph

## When to use

Load when `fault-surface.md` has ≤8 candidates. Unload when `idg.md` identifies ≥1 `ROOT_CANDIDATE` or escalates with `[GAP]`.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | For edge inference when AST/graph queries are insufficient — with explicit evidence requirement |
| Tool budget | ≤15% of mission budget |
| Output | `idg.md` — schema-valid per `schemas/idg.v1.json` |
| Critical rule | Every edge must cite trace evidence or AST-derived fact. Speculative edges are rejected. |

---

## Why Dependency Graph, Not Temporal Order

The most common attribution error in agentic debugging is treating the **earliest observed symptom** as the root cause. Research is unambiguous here: GraphTracer (arXiv:2510.10581) demonstrated +18.18% attribution accuracy over state-of-the-art temporal methods by using information dependency graphs; CHIEF (NeurIPS 2024) showed that hierarchical causal graphs outperform flat log analysis; the Lifecycle of Failures study (arXiv:2509.23735) quantified the lift at 46.3% → 65.8%.

**The principle:** A failure propagates through a dependency chain. The first node to show the failure is usually downstream of where it originated. Temporal order tells you where to start looking; dependency order tells you where it came from.

---

## Node Construction

Each candidate from `fault-surface.md` becomes a node. Each node records:

```yaml
id: N-001
candidate_ref: C-001           # from fault-surface.md
path: "app/flows/record_vote.rb"
lines: "42-78"
kind: code                     # code | test | config | schema | data | env | tool_output
observed_state: |
  At the point of failure: ballot.token = nil
expected_state: |
  At the point of failure: ballot.token = valid UUID
observation_source: |
  trace:stack_frame_1 + assertion_message + view_file(record_vote.rb:56)
```

**Hard rule:** `observed_state` must come from the reproduction trace, stderr, or direct file inspection. `expected_state` comes from the test assertion, spec, or type signature. If either cannot be anchored, the node is not admissible — return to Isolate.

---

## Edge Construction

Edges are **directed**, `A → B`, meaning "B's state depends on A's state". An edge requires one of:

| Edge type | Evidence required |
|-----------|-------------------|
| **Data flow** | AST/call-graph shows A's return value flows to B's input, OR trace shows A writes state that B reads |
| **Control flow** | A's execution precedes and conditions B's execution within the failing path |
| **Shared state** | A and B both read/write a named resource (DB table, global, file); trace confirms timing of access |
| **Contract boundary** | A produces output that B consumes across a boundary (API call, message queue, RPC) |

**Prohibited edges:**

- Edges based on "probably calls" inference without AST or trace evidence
- Edges from proximity alone (same file, same class, similar name)
- Edges derived from unit test structure (what a test happens to set up is not a dependency)
- Bidirectional edges (cycles handled separately — see below)

### Edge-building procedure

For each node `B`:

1. Use `dep_graph_query(readers_of: <B's inputs>)` to find what writes B's state
2. Use `dep_graph_query(callers_of: <B's entry points>)` to find what triggers B
3. Check trace for any node A whose output logically precedes B's state
4. Record only edges with at least one anchor from steps 1-3

---

## Identifying Root Candidates

A **root candidate** is a node in the graph with **zero incoming edges** among other candidate nodes.

Formal procedure:

1. Construct the graph `G` from `NODES` and `EDGES`.
2. For each node `n`: if `in_degree_within_candidate_set(n) == 0`, mark as `ROOT_CANDIDATE`.
3. Compute `descendant_count(n)` = number of candidate nodes reachable from `n`.
4. Rank `ROOT_CANDIDATES` by `descendant_count` descending.

**Interpretation:**

- Top-ranked root candidate = the node whose failure could explain the most symptoms.
- Low-ranked root candidate = may be real but explains fewer downstream failures; likely a compound-failure co-root.
- Nodes with incoming edges = `SYMPTOM_NODES`. Mark with `[SYMPTOM]`. These are not root causes — do NOT generate hypotheses for them unless all root candidates are falsified.

---

## Handling Special Graph Shapes

### Cycles

If the graph contains a cycle, one of two things is happening:

1. **False edge** — one of the edges in the cycle is not evidence-backed. Re-audit; likely an inferred edge that should be removed.
2. **Genuine feedback loop** — recursion, mutual callbacks, or circular state dependency. In this case: halt, emit `[DISPUTED]`, escalate to human review with the cycle documented. VIGIL does not auto-resolve feedback loops.

### Disconnected subgraphs

If `fault-surface.md` candidates form 2+ disconnected components, this is a signal for `COMPOUND` failure. Each component has its own root candidate. Classify the mission as compound; the Intervene phase will address each component independently.

### Single-node graph

If only one candidate survived Isolate, the graph has one node with no edges. It's the root candidate by default. Proceed to Intervene, but note in `idg.md` that no dependency analysis was performed (it was vacuous).

### No root candidates

Every node has at least one incoming edge → the true root is outside the candidate set. Escalate to Isolate with expanded scope, or emit `[GAP]` and escalate upward.

---

## Writing `idg.md`

```yaml
mission_id: VIGIL-YYYYMMDD-NNN
upstream_fault_surface: <ref>
nodes:
  - id: N-001
    candidate_ref: C-001
    path: "app/flows/record_vote.rb"
    lines: "42-78"
    kind: code
    observed_state: "ballot.token = nil at line 56"
    expected_state: "ballot.token = valid UUID"
    observation_source: "trace:stack_frame_1 + view_file"
    role: symptom       # symptom | root_candidate | both
  - id: N-002
    ...
edges:
  - from: N-003
    to: N-001
    kind: data_flow
    evidence: "dep_graph_query(writers_to: ballot.token) → N-003 at line 24"
  - from: N-002
    to: N-001
    kind: control_flow
    evidence: "trace shows N-002 executes immediately before N-001 within same call"
root_candidates:
  - node: N-003
    descendant_count: 2
    rank: 1
  - node: N-004
    descendant_count: 0
    rank: 2
symptom_nodes: [N-001, N-002]
graph_shape: normal       # normal | cyclic | disconnected | single_node | no_roots
disputed:
  - null                  # populated if cycles or evidence conflicts
compound_components:      # only if disconnected
  - null
```

---

## Pitfalls

- **Treating the failing test's location as the root cause.** The test is the observer of failure, rarely its source.
- **Asserting an edge because "it makes sense."** Makes-sense is not evidence. Cite the AST query or the trace line.
- **Ranking by suspicion instead of descendant count.** Suspicion is Isolate's job; Graph ranks by structural reach.
- **Skipping `[SYMPTOM]` marking.** Downstream phases must not waste interventions on symptom nodes; mark them explicitly.

---

*VIGIL Phase G — structure beats sequence for attribution*
