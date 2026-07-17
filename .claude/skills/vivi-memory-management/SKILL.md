---
name: vivi-memory-management
description: "Load at Vivi session start, session end, or when you notice a repeating pattern across tasks. CRYSTALIUM-primary memory protocol: when mcp__crystalium__* tools are available, route ALL memory through CRYSTALIUM (recall/commit/ingest/plan_checkpoint/session_end). The local agents/memories/*.md files are the standalone fallback for when CRYSTALIUM is absent — EIIS conformance. Never write both."
metadata:
  methodology: Vivi
---

# Memory Management Skill

**Primary rule:** If `mcp__crystalium__*` tools are available, route all memory
through CRYSTALIUM. The local `agents/memories/*.md` files are the standalone
fallback for when CRYSTALIUM is absent (EIIS conformance — Vivi works
uninstalled). **Never write to both in the same session.**

See `methodology/cortex/memory-protocol.md` (nexus) for the full
layer × tier matrix, Dream consolidation knobs, and `plan_checkpoint`/
`plan_replan` semantics.

---

## Routing Decision (run once at session start)

```
IF mcp__crystalium__recall is callable
  → CRYSTALIUM path (§ CRYSTALIUM Protocol below)
ELSE
  → Local-file path (§ Standalone Fallback below)
```

---

## CRYSTALIUM Protocol (when installed)

**Trust tier:** T1 (set process-wide via `CRYSTALIUM_CALLER_TIER=T1`).
`author_agent` MUST be `"vivi"` on every direct `commit` call.

### Session Start — Memory Recall (A-ANALYZE Step 1)

```
mcp__crystalium__recall(
  scope  = { project: <cwd-project>, agent_class_visibility: "vivi" },
  query  = <task goal + domain + module area>,
  k      = 8,
  layers = ["semantic", "episodic", "procedural"]
)
```

- `episodic` — past task outcomes in the same domain
- `semantic` — known failure root causes, architectural decisions, conventions
- `procedural` — verified reusable skills for this task type

Fold relevant hits into mission context (≤ 1-2K tokens summarized).

### Per-Iteration Failure-Signature Recall (V-VERIFY, inside --fix-hook)

**ADAPTER-NOT-ENGINE: the CODER (Vivi) issues this call; sandbox.sh never does.**

Before making any edit in a `--fix-hook` invocation, derive the failure-signature from
`$EIDOLONS_SANDBOX_FEEDBACK` and query procedural/semantic memory for prior fixes:

```
feedback = parse_json($EIDOLONS_SANDBOX_FEEDBACK)

# Build the failure signature (keyed by stable, localized fields — not the full log)
failure_sig = {
  loci:      feedback.loci,        # file:line array — normalized by the substrate
  test_name: feedback.test_name,   # failing test identifiers
  failing:   feedback.failing      # failure category/label
}

mcp__crystalium__recall(
  scope  = { project: <cwd-project>, agent_class_visibility: "vivi" },
  query  = failure_sig,            # keyed by the localized failure signal
  k      = 4,
  layers = ["procedural", "semantic"]   # LEAD with procedural + semantic; NOT raw episodic
)
```

**HARD precision-gate (CTIM-Rover counter-evidence).** Raw episodic memory (prior
attempt transcripts, exact stack traces, full diffs) DEGRADES SE-agent performance —
it re-introduces self-conditioning through the back door. This recall is PRECISION-GATED:

- Lead with `layer=procedural` (verified fix-PATTERNS: "for this class of failure at
  these file:line targets, the pattern is...") and `layer=semantic` (root-cause knowledge:
  "this framework version has this class of bug").
- Do NOT retrieve raw `episodic` trajectories here. If `layers=["episodic"]`-only results
  are returned, IGNORE them. They are indexed by task outcome, not by failure signature,
  and applying a prior attempt's full trajectory is exactly the self-conditioning the
  fresh-context discipline prohibits.
- A low-confidence recall (score below threshold, or no relevant hit) is IGNORED, not
  blindly applied. A bad procedural hit is worse than no hit — it steers the repair
  toward a known-wrong path.
- If the recall surfaces a procedural entry that matches the failure signature (high
  confidence), use it to short-circuit re-derivation of the fix strategy. Document that
  you are reusing a stored pattern (auditability).

Cross-Eidolon composability: VIGIL persists failure-signatures (from its root-cause-report
hand-offs) into CRYSTALIUM with matching `loci`/`test_name`/`failing` keys. When a Vivi
failure signature matches a VIGIL-authored entry, the recall surfaces it — enabling
cross-Eidolon pattern reuse without any direct inter-Eidolon call.

**Graceful skip:** if `mcp__crystalium__recall` is unavailable or the call fails,
proceed to the edit step without delay. Never block the fix-hook on a memory miss.

### Plan Phase — Checkpoint + Replan

After the Execution Plan is produced (P-PLAN phase output):

```
mcp__crystalium__plan_checkpoint(
  plan_id  = <task-slug + date, e.g. "add-widget-search-2026-06-01">,
  state    = <full execution plan snapshot including scope, strategy, steps>,
  step     = "initial",
  metadata = { author_agent: "vivi", task_title: <title> }
)
```

Returns a `checkpoint_id`. Store it in the working execution plan context.

If the plan is revised mid-cycle (methodology abort rules — "stop and return to
Plan" — fire at I-IMPLEMENT or V-VERIFY):

```
mcp__crystalium__plan_replan(
  plan_id            = <same plan_id>,
  from_checkpoint_id = <checkpoint_id>,
  new_plan           = { diff: <what changed and why>, supersedes_id: <checkpoint_id> }
)
```

This records the branch decision before the revised plan is executed, keeping
the execution history auditable.

### Implement Phase — Skill Reuse + Procedural Commit

**Before building:** if recall surfaced a procedural entry (verified skill) for
this task type, invoke it:

```
mcp__crystalium__skill_invoke(
  skill_id = <procedural entry id from recall>,
  context  = <current task context>
)
```

Use the `result` to short-circuit re-derivation. Do NOT auto-promote the
`skill_invoke` result — commit a summary if it proves valuable (see Reflect below).

**After verifying a new reusable pattern:** if a skill-class discovery is made
and passes Verify:

```
mcp__crystalium__commit(
  layer   = "procedural",
  payload = <verified skill description: what, where, how to use>,
  provenance = { author_agent: "vivi", quality: "verified" }
)
```

Unverified patterns → `layer = "semantic"` with a `quality: candidate` tag.

### Mandatory Post-pass^k Commit (V-VERIFY, on loop success)

**ADAPTER-NOT-ENGINE: the CODER (Vivi) issues this call; sandbox.sh never does.**

When the sandbox loop exits with `final="passed"` (confirmed pass^k-green — NOT just
a single green run), Vivi **MUST** commit the verified fix-pattern to procedural memory.
This is MANDATORY, not discretionary. A pass^k-green is an extremely high-quality
signal — the fix is reproducible. Discarding it wastes the most reliable learning
opportunity in the loop.

```
mcp__crystalium__commit(
  layer   = "procedural",
  payload = {
    pattern_name:      <brief description of the fix, e.g. "nil-guard before X.call in foo.go:42">,
    failure_signature: {
      loci:      <the loci array from feedback.json that triggered this fix>,
      test_name: <the failing test names>,
      failing:   <the failure category>
    },
    fix_diff:          <the minimal diff that resolved the failure>,
    anchoring_tests:   <the test name(s) that confirmed pass^k>,
    domain:            <module/area>,
    quality:           "verified",
    pass_k:            <k value used, e.g. 2>
  },
  provenance = { author_agent: "vivi", quality: "verified" }
)
```

The `failure_signature` field is the admission record: it makes this entry retrievable
by the Per-Iteration Failure-Signature Recall (above) the next time the same class of
failure appears — in this session or a future one, by Vivi or by VIGIL.

**If the commit call fails:** log the failure to stderr and continue — never block the
success path on a memory write. The fix is already applied; the commit is a durability
enhancement, not a gate.

### Verify Phase — Ingest Completion Report (V-VERIFY / I-exit)

After the `vivi-completion-report.envelope.json` ECL envelope is produced and
the payload is verified:

```
mcp__crystalium__ingest(
  envelope = <vivi-completion-report.envelope.json contents>,
  payload  = <completion report contents>
)
```

This records the handoff at T1 with full ECL provenance (`from.eidolon=vivi`
drives tier derivation; `integrity.value` stored as `provenance.content_hash`).

### Reflect / Delta Phase — Episodic + Semantic Commits + Session End

After the task completes (Δ-DELTA success path) or exhausts retries (R-REFLECT
escalation path):

**Task outcome:**
```
mcp__crystalium__commit(
  layer   = "episodic",
  payload = {
    task_title:    <title>,
    domain:        <module/area>,
    outcome:       "SUCCESS" | "PARTIAL" | "FAILED" | "ESCALATED",
    summary:       <one sentence>,
    key_decisions: <what was chosen and why>,
    lesson:        <one takeaway>
  },
  provenance = { author_agent: "vivi" }
)
```

**If failures occurred (root cause):**
```
mcp__crystalium__commit(
  layer   = "semantic",
  payload = {
    failure_category: <taxonomy category>,
    context:          <what was being done>,
    root_cause:       <what went wrong>,
    prevention:       <how to avoid in future>,
    domain:           <area/module>
  },
  provenance = { author_agent: "vivi" }
)
```

**If new patterns discovered:**
```
mcp__crystalium__commit(
  layer   = "procedural",  # or "semantic" if unverified
  payload = {
    pattern_name: <name>,
    location:     <file:line or directory>,
    type:         <Model | Service | Component | Utility | Convention | Architecture>,
    purpose:      <what it does>,
    usage_hint:   <one line>,
    quality:      "verified" | "candidate"
  },
  provenance = { author_agent: "vivi" }
)
```

**Session end (once per task completion):**
```
mcp__crystalium__session_end()
```

This triggers Dream consolidation asynchronously. Dream handles dedup,
promotion, and stale-removal automatically — do NOT hand-consolidate when
CRYSTALIUM is present.

**Graceful skip:** if any `mcp__crystalium__*` call fails or the tool is
unavailable, fall through to the Standalone Fallback path silently. Never
hard-fail.

---

## CRYSTALIUM call → local-file mapping

| Vivi local protocol | CRYSTALIUM call (when installed) |
|---|---|
| Session-Start: read task-log/failure-catalog/pattern-registry/session-handoff | `recall(scope, query, k, layers=[semantic, episodic, procedural])` |
| Session-End: update task-log.md (outcome) | `commit(layer=episodic, provenance={author_agent:"vivi"})` |
| Session-End: update failure-catalog.md (root cause/prevention) | `commit(layer=semantic, provenance={author_agent:"vivi"})` |
| Session-End: update pattern-registry.md (reusable asset/pattern) | `commit(layer=procedural, ...)` (verified) or `layer=semantic` (candidate) |
| Write session-handoff.md | `plan_checkpoint(state=<plan snapshot incl. scope>)` |
| Revise plan mid-cycle | `plan_replan(diff={...,supersedes_id})` |
| Manual Memory Consolidation | **Dream consolidation — automatic via `session_end`**; do NOT hand-consolidate when CRYSTALIUM present |
| Memory Query Patterns | `recall` with appropriate `query`/`layers` |

---

## Standalone Fallback (when CRYSTALIUM absent)

Use when `mcp__crystalium__*` tools are unavailable. The local Reflexion
protocol is fully independent — Vivi is EIIS-standalone-conformant.

### Memory Architecture

```
agents/memories/
├── task-log.md          # Completed tasks with outcomes (≤ 30 entries)
├── pattern-registry.md  # Discovered assets and architectural patterns
├── failure-catalog.md   # Root causes and prevention strategies (≤ 30 entries)
├── delta-history.md     # Normalization suggestions with status
└── session-handoff.md   # Checkpoint for session boundaries
```

### Session Start Protocol

```
1. Read task-log.md — scan last 5-10 entries for:
   - Work in the same domain as current task
   - Open items or follow-ups from previous tasks
   - Recent patterns that might apply

2. Read failure-catalog.md — scan for:
   - Failures in the same domain or file area
   - Prevention strategies relevant to current task type
   - Known gotchas in the technology stack

3. Read session-handoff.md — if exists:
   - Resume from last checkpoint
   - Verify assumptions are still valid
   - Check if codebase has changed since handoff

4. Read pattern-registry.md — scan for:
   - Known reusable assets in the target domain
   - Architectural decisions and their rationale
   - Team conventions discovered in past sessions
```

**Budget**: Memory recall should take ≤ 1-2K tokens of context.

### Session End Protocol

#### Update Task Log

Add entry to `agents/memories/task-log.md`:

```markdown
### [DATE] — [Task Title]
- **Domain**: [module/area]
- **Outcome**: SUCCESS | PARTIAL | FAILED | ESCALATED
- **Summary**: [one sentence]
- **Key decisions**: [what was chosen and why]
- **Assets**: [discovered or created]
- **Lesson**: [one takeaway for future tasks]
```

#### Update Failure Catalog (if failures occurred)

Add entry to `agents/memories/failure-catalog.md`:

```markdown
### [DATE] — [Failure Category]: [Brief description]
- **Context**: [what was being done]
- **Error**: [one-line error summary]
- **Root cause**: [what actually went wrong]
- **Fix applied**: [what resolved it]
- **Prevention**: [how to avoid this in future]
- **Domain**: [area/module for searchability]
```

#### Update Pattern Registry (if new patterns discovered)

Add entry to `agents/memories/pattern-registry.md`:

```markdown
### [Asset/Pattern Name]
- **Location**: [file:line or directory]
- **Type**: Model | Service | Component | Utility | Convention | Architecture
- **Purpose**: [what it does]
- **Usage example**: [how to use it, one line]
- **Quality**: Tested | Untested | Deprecated
- **Discovered**: [date]
```

#### Write Session Handoff (if work is incomplete)

Write to `agents/memories/session-handoff.md`:

```markdown
## Session Handoff — [DATE]

### Task in Progress
- **Goal**: [acceptance criteria]
- **Current phase**: A | P | I | V | R | Δ
- **Branch**: [git branch name]

### Completed Steps
1. [step] — done

### Remaining Steps
2. [step] — next
3. [step] — blocked on [reason]

### Key State
- Files modified: [list]
- Tests: [X passing, Y failing]
- Open questions: [any ambiguities]

### Context to Re-inject
- [Critical decision that must be remembered]
- [Important constraint discovered during work]
```

### Memory Consolidation (standalone only)

Run consolidation when any memory file exceeds its cap:

| File | Cap | Consolidation Strategy |
|------|-----|----------------------|
| task-log.md | 30 entries | Merge old entries by domain into summaries, keep recent 15 as-is |
| failure-catalog.md | 30 entries | Deduplicate by root cause pattern, archive resolved patterns |
| pattern-registry.md | No hard cap | Remove entries for deleted/deprecated code, merge duplicates |
| delta-history.md | 20 entries | Remove implemented suggestions, archive rejected ones |
| session-handoff.md | 1 entry | Overwrite on each session end (always current) |

**Note:** When CRYSTALIUM is present, Dream consolidation handles dedup,
promotion, and pruning automatically. Do NOT run the manual consolidation
protocol above when CRYSTALIUM is installed.

---

## In-Session Task Tracking (both paths)

During implementation, maintain a structured task list in working context
regardless of which memory path is active:

```markdown
## Active Task: [title]
Phase: IMPLEMENT (step 3 of 5)

### Progress
- [x] TASK-1: Discover existing assets — DONE
- [x] TASK-2: Write test anchors — DONE
- [ ] TASK-3: Extend WidgetQuery with #search_by_text — IN PROGRESS
- [ ] TASK-4: Add controller action — PENDING
- [ ] TASK-5: Run full verification suite — PENDING
```

**Re-inject this checklist** after every tool use / verification cycle.

---

## Anti-Patterns in Memory

### What NOT to Store

- Exact code snippets (they go stale; store patterns and locations)
- Speculative conclusions (record only validated patterns)
- Emotional commentary (record objective quality assessments)
- Raw error logs (store classified root causes, not full stack traces)
- Information about deleted or heavily refactored files

### What ALWAYS to Store

- Successful patterns with locations (high reuse value)
- Failure root causes with prevention strategies (avoid repeating mistakes)
- Architectural decisions with rationale (institutional knowledge)
- Asset discovery results (reduces future Analyze phase time)
- Team conventions not documented elsewhere

---

## ECL_VERSION

When restoring a session, query `ECL_VERSION` alongside the Eidolon version.
Drift > 1 minor relative to the consumer's expected envelope version triggers
a warning surface — see ECL v2.0 §7.2.

---

*Memory Management Skill — CRYSTALIUM-primary, local-file fallback, Dream-aware*
