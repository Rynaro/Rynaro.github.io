---
name: atlas-traverse
description: Phase T (Traverse) — deterministic structural mapping of a codebase. Zero LLM calls during retrieval; only symbol index, AST, ripgrep, and git log. Emits map.md with entrypoints, modules, call graph, and heatmap. Use after mission.md is valid and before any meaning-based search. Trigger phrases — "map the repo", "what are the entrypoints", "build the call graph", "list all routes/workers/CLIs".
allowed-tools: view_file list_dir search_text search_symbol graph_query
metadata:
  methodology: ATLAS
  phase: T
---

# SKILL: Traverse — structural mapping (Phase T)

## When to use

**Load when:** Phase A (Assess) has produced a valid `mission.md` and you are
about to emit `map.md`.

**Unload when:** `map.md` passes exit criteria and you enter Phase L (Locate).

> **Memory pre-flight:** `recall` MUST have fired in Phase A (see `agent.md`
> §"Memory pre-flight") before Phase T begins. If it hasn't — e.g. this skill
> was loaded directly — call it now with the mission objective and target paths
> before any structural mapping. Fold relevant prior maps and known traps into
> your mission context. If `mcp__crystalium__*` tools are unavailable, proceed
> without memory — never hard-fail.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | **Zero** during retrieval. LLM used only to author the final `map.md` summary. |
| Tool budget | ≤ 20% of mission `max_tool_calls` |
| Output | `map.md` conforming to `templates/traversal-map.md` |

If you find yourself reasoning about *meaning*, stop — that's Phase L.
Traverse is about *structure*.

---

## Deterministic retrieval ladder

Try in order. Stop at the first that works for the mission scope.

### 1. Code-graph MCP server (preferred)

If the host provides a code-graph server (e.g. Sourcegraph, a Tree-sitter
index over MCP, a Prism-based graph for Ruby):

```
graph.roots(scope=<globs>)                 # entrypoints
graph.modules(scope=<globs>, top_n=20)     # centrality-ranked
graph.edges(scope=<globs>, kind=call|import|inherit)
```

These are O(1) lookups into an indexed structure. No file reads.

### 2. Language-native AST

For single-language repos without a graph server:

- **Ruby** → `prism` (`Prism.parse_file`, walk `CallNode` / `DefNode`)
- **Python** → stdlib `ast`
- **TypeScript/JavaScript** → `@typescript-eslint/parser` or `tree-sitter-typescript`
- **Go** → `go/ast` + `go/types`
- **Anything else** → Tree-sitter with the appropriate grammar

Emit a small script via `execute_read_only_script` (if the harness allows it)
or delegate to a deterministic MCP tool. **Never paste file contents into the
LLM to "parse" them.** That's the Inference Trap.

### 3. `rg` (ripgrep) for coarse structural signals

When AST is unavailable or the scope crosses languages:

```
rg --files <scope>                 # file enumeration
rg -l '^class |^module ' <scope>   # class/module surface
rg -l 'Rails.application.routes'   # routing entrypoints
```

Always use `--files` or `-l` (filenames only) at this stage. You are not
reading content yet.

### 4. `git log` for heatmap

```
git log --since='90 days' --name-only --pretty=format: <scope> | sort | uniq -c | sort -rn | head -30
git log --follow --format='%an' <file> | sort | uniq -c | sort -rn
```

Produces `MAP-HEATMAP` entries: churn + primary contributors. Optional but
high-signal for risk assessment.

---

## Entrypoint taxonomy (`MAP-ROOTS`)

The mission `DECISION_TARGET` almost always traces back to one of:

- **HTTP routes** (Rails routes, Express/Koa handlers, FastAPI, gRPC services)
- **Background workers** (Sidekiq, Celery, RQ, Temporal workflows)
- **CLI entrypoints** (`bin/`, `rake` tasks, `click`/`cobra` commands)
- **Public library API** (gem top-level, `__init__.py` re-exports, package `main`)
- **Event handlers** (webhooks, message consumers, scheduled jobs)
- **Test surfaces** (integration tests as executable specs of behavior)

Identify the root category relevant to the mission and enumerate exhaustively
within scope. Ignore others.

---

## What to skip by default

Hardcoded skip list (override only when mission explicitly requires):

```
node_modules/   vendor/bundle/    vendor/cache/
tmp/            log/              .git/
dist/           build/            public/assets/
coverage/       .bundle/          __pycache__/
*.min.js        *.map             *.lock
```

Generated code and vendored dependencies are noise at this phase.

---

## Ambiguity handling

- **Monorepo?** Ask which package(s) the mission applies to. Don't guess.
- **Multi-language?** Build `MAP-MODULES` per language; edges only within language.
- **Un-parseable file?** Record in `MAP-GAPS`, don't retry with different parsers.

---

## Exit gate

Before emitting `map.md`, check:

- [ ] `MAP-ROOTS` is non-empty and every entry is a real file.
- [ ] `MAP-MODULES` top-N is ranked by a deterministic metric, not by LLM guess.
- [ ] `MAP-GRAPH` edges are all AST-derived or graph-server-derived, never
      LLM-inferred.
- [ ] `MAP-GAPS` lists every region the index couldn't parse.
- [ ] Total token cost for Phase T ≤ 20% of mission budget.

If any fails, the mission is likely out of scope or the toolchain is
insufficient — halt and report.

---

## Common anti-patterns

| Anti-pattern | Why it's wrong | Fix |
|--------------|----------------|-----|
| "Let me read `app/controllers/*.rb` to understand routing" | Wastes thousands of tokens on content the router already knows | Query `Rails.application.routes.routes` or parse `config/routes.rb` with Prism |
| "I'll grep for `class.*Service`" | Captures junk, misses the real hierarchy | Use AST to get every `class` declaration with its superclass |
| "Give me a summary of this module" | That's interpretation, i.e. Phase L | Traverse answers *what exists*, not *what it means* |
| Loading AST of every file "just in case" | Blows the budget before Locate starts | Build the map from *structural* signals; let Locate zoom in |
