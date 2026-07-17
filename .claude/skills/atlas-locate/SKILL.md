---
name: atlas-locate
description: Phase L (Locate) — bounded probes and scatter subagents to answer DECISION_TARGET sub-questions. Descends a symbol → graph → lexical → windowed-read → test-dry-run ladder; emits FINDING-XXX records with evidence anchors and confidence tiers. Hot phase (≤60% of mission budget). Use after map.md is complete and sub-questions remain. Trigger phrases — "find where X happens", "trace Y", "who writes to Z", "who calls this", "what implements this".
allowed-tools: search_symbol graph_query search_text view_file test_dry_run memex_read
metadata:
  methodology: ATLAS
  phase: L
---

# SKILL: Locate — bounded probes & scatter subagents (Phase L)

## When to use

**Load when:** `map.md` is complete and sub-questions exist against `DECISION_TARGET`.

**Unload when:** every sub-question has a `FINDING-XXX` at confidence ≥ M or is
recorded in `GAPS`.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | Yes, but at the synthesis edge only. Retrieval remains deterministic-first. |
| Tool budget | ≤ 60% of mission `max_tool_calls` — this is the hot phase |
| Output | `findings.md` — list of `FINDING-XXX` records, each schema-valid |

---

## Probe ladder

For every sub-question, descend this ladder. Stop at the first tier that
produces a confident answer.

### Tier 1 — Symbol probe (deterministic)

```
search_symbol(name="CastVoteRecord")
  → definition site
  → all references (with path:line)
  → subclasses / implementers
  → method definitions on the symbol
```

This is a constant-cost index lookup. Use it whenever the sub-question
references a named thing (class, method, constant, config key).

### Tier 2 — Graph query (deterministic)

```
graph_query("callers_of: RecordVote#call")
graph_query("implementers_of: Tallier")
graph_query("writers_to: cast_vote_records")    # if graph indexes DB ops
```

Graph queries answer *relational* sub-questions without reading source.

#### Graph-first decomposition (raise η before any windowed read)

The 90/10 deterministic-first rule (I-3) means a relational sub-question should
be **exhausted on the graph** before any Tier-4 read. Codify the verb
vocabulary and reach for it first:

| Verb | Answers |
|------|---------|
| `callers_of(sym)` / `callees_of(sym)` | direct call edges in/out of a symbol |
| `implementers_of(iface)` / `subclasses_of(class)` | polymorphic dispatch targets |
| `writers_to(table)` / `readers_of(table)` | data-flow endpoints (if graph indexes DB ops) |
| `importers_of(module)` / `imported_by(module)` | module-coupling edges |
| `transitive_callers(sym, depth=N)` | depth-bounded upstream reach (cap the depth — unbounded = a read in disguise) |
| `callgraph_slice(scope)` | the sub-graph induced by a scope glob — used to **partition** a surface |

Pushing more Locate work onto these deterministic structural probes is the
single biggest lever on search-efficiency η: each is an O(1) index lookup with
exact results, where an LLM-authored search is expensive and only
probabilistically correct.

**Partition derives from the graph, not from a guess.** When the surface is
large enough to scatter (`skills/scatter.md`), the per-module fan-out partition
is computed from **one** parent-side `callgraph_slice(scope)` — the disjoint
clusters are a structural fact. Do **not** LLM-guess the clustering; that
re-introduces the inference trap the deterministic-first rule exists to avoid.

### Tier 3 — Scoped lexical search

```
search_text(pattern=r'audit_log\\s*\\.\\s*write', scope='app/flows/**', limit=50)
```

Caps at 50. If it returns 50, **do not** raise the cap. Two options:

- Narrow the scope glob.
- Replace the lexical pattern with a Tier 1/2 probe.

Repeated overflow = the question is mis-framed; revise.

### Tier 4 — Windowed read

```
view_file(path='app/flows/vote_casting/record_vote.rb', start=1, end=100)
# if answer is beyond line 100, cursor forward
view_file(path='...', start=100, end=200)
```

Use windowed reads only after tiers 1–3 have narrowed the target. Reading an
entire file is a Phase-T mistake, not a probe.

### Tier 5 — Dry-run or fixture inspection

If the mission concerns runtime behavior:

```
test_dry_run(path='test/flows/record_vote_test.rb', case='when user is guest')
```

Test files often document intended behavior more cleanly than implementation.

---

## The Operator pattern: scatter subagents

When the mission has ≥2 independent sub-questions, do not pursue them
serially in your own context. Spawn subagents.

> For a **large surface** (> 5 modules OR > 25 files) with ≥2 disjoint
> sub-questions, this scatter is formalized as the TRANCE-gated **Scatter-Gather
> Locate** sub-mode — see `skills/scatter.md` for the both-flags activation
> trigger, the 5-branch fan-out cap, the deterministic graph-derived partition,
> and the merge+dedup contract. Below the threshold (or for a single /
> tightly-coupled sub-question), stay serial — the heuristics here apply.

### When to scatter

- Sub-questions are topologically disjoint (different modules, different
  concerns).
- Each sub-question is self-contained enough to answer with a small excerpt
  of the map.
- Total expected token cost > 15% of remaining budget if pursued serially.

### Subagent spec

Each subagent receives:

```yaml
sub_mission:
  parent_mission_id: <MISSION-ID>
  question: <natural-language sub-question>
  scope: <path globs>
  budget:
    max_tool_calls: <parent_budget / num_subagents>
    max_tokens_input: <parent_budget / num_subagents>
  required_finding_count: 1..N
  map_excerpt: <only the MAP-MODULES and MAP-GRAPH slice relevant to scope>
```

Each subagent returns exactly one object:

```yaml
return:
  findings: [FINDING-XXX, ...]
  gaps: [...]
  telemetry: {tokens_used, tool_calls}
  # NO transcript. NO raw tool outputs.
```

The parent context merges the `findings` list. Subagent transcripts are
**destroyed**.

### When NOT to scatter

- Sub-question requires tight iteration with another sub-question.
- Only one sub-question exists.
- Budget is already tight; the coordination overhead isn't worth it.

---

## Writing a FINDING

```yaml
FINDING-017:
  claim: "RecordVote#call is the sole writer to cast_vote_records; authorization
          is delegated to VotingAuthorizer#authorize_ballot."
  evidence:
    - path: app/flows/vote_casting/record_vote.rb
      lines: 42-78
      excerpt_ref: memex://excerpt/7f31ab
    - path: app/policies/voting_authorizer.rb
      lines: 12-40
      excerpt_ref: memex://excerpt/2a9c05
  ruled_out:
    - "No other CallNode writing to cast_vote_records found in app/** (symbol
       probe exhaustive)."
  confidence: H
  supports_decision: DT-1
```

**Required fields:** `claim`, `evidence[]`, `confidence`, `supports_decision`.

**`ruled_out` is first-class.** "I searched X and found nothing" is a finding
— often the most valuable one. Do not discard negative results.

**Excerpts go to Memex, not into findings.md.** The finding carries the
reference; the raw text lives in the stable store.

---

## Confidence calibration

| Tier | When |
|------|------|
| H | Claim is directly observed in an AST-derived structural fact or in explicit source text cited verbatim. |
| M | Claim requires a short inferential step over observed evidence (e.g., "this FlowObject *likely* runs in the request thread because it has no Sidekiq wrapping"). |
| L | Claim is plausible from context but not directly anchored. Flag in `GAPS`. |

If you catch yourself writing "probably", "seems to", "I believe" — it's not
H. Be honest; downstream agents calibrate on your tiers.

---

## Three-strike halt

For each sub-question, maintain a strike counter. A probe returning
`confidence: L` or empty results = one strike. Three strikes = halt the
sub-question, record it in `GAPS` with:

```yaml
GAP-003:
  sub_question: "Does the voting FlowObject ever defer to Sidekiq?"
  strikes:
    - probe: graph_query("callers_of: Sidekiq::Client.push in app/flows/voting/**")
      result: empty
    - probe: search_text("perform_async|perform_later", scope='app/flows/voting/**')
      result: empty
    - probe: view_file('app/flows/voting/record_vote.rb', 1, 100)
      result: no Sidekiq references; synchronous only
  working_hypothesis: "Synchronous in the request thread."
  escalate_to: human | follow-up-mission
```

This is the dead-end guard. Without it, the agent will fixate.

---

## Exit gate

- [ ] Every `DECISION_TARGET` sub-question has ≥1 finding at confidence ≥ M, OR
      is recorded in `GAPS`.
- [ ] Every finding has `path:line` anchors.
- [ ] Every finding's `excerpt_ref` resolves in Memex.
- [ ] No finding's claim contains hedging language without an L tier.
- [ ] Tool-call count ≤ 60% of mission budget.
