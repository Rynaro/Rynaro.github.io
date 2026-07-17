---
name: vivi-context-engineering
description: "Load at the start of the Vivi Analyze phase. Techniques for building a repo map, running progressive disclosure, and maximising context relevance for coding tasks. Use whenever you need to understand unfamiliar code before editing it, or when an existing Discovery Report feels under-grounded."
metadata:
  methodology: Vivi
  phase: A-Analyze
---

# Context Engineering Skill

Techniques for maximizing the quality and relevance of information available during coding tasks. The primary constraint on agent performance is not reasoning capability but context quality.

**atlas-aci availability.** When the `mcp__atlas-aci__*` tools are wired (granted via the nexus atlas-aci MCP grant), use them for every step of the L1→L4 ladder and the in-loop loci-driven assembly. When atlas-aci is NOT available (tools absent or unavailable), degrade gracefully to the documented manual-read fallback for each rung — the fallback procedures are described inline below. Never hard-depend on atlas-aci.

---

## Principle: Progressive Disclosure

Do NOT front-load context. Discover incrementally:

```
1. Directory structure (cheap: ~100 tokens)
2. Repo map / structural summary (moderate: ~500-1K tokens)
3. Interface signatures of relevant files (moderate: ~200 tokens/file)
4. Full file contents ONLY for files being modified (expensive: varies)
```

Never read full file contents "just in case." Every token of context displaces reasoning capacity.

---

## Repo Map Generation

### Purpose
Create a compressed structural overview of the codebase that fits in ~500-1K tokens. This gives you a bird's-eye navigation map before diving into details.

### Procedure

```
Step 1: Directory scan
  atlas-aci: mcp__atlas-aci__list_dir(path=".", depth=3)
    → returns a tree of directories and files at the requested depth.
    → identify top-level organization (by domain? by layer? hybrid?).
    → note: config/, lib/, app/, spec/test/ locations.
  If atlas-aci unavailable: ls -R . (piped with depth limiting) or find . -maxdepth 3 -type f | sort.

Step 2: Structural extraction (for target domain + adjacent domains)
  For each key file, extract ONLY:
    - Class/module name
    - Public method signatures (name + params, not body)
    - Key imports/dependencies
    - Inheritance/mixin chain
  Skip: private methods, implementation details, comments.
  atlas-aci: mcp__atlas-aci__view_file(path=<file>, start_line=1, end_line=60)
    → ALWAYS paginate. Never dump a full file in one call. Use start_line/end_line to
       read just the header block (imports + class definition + public interface).
    → Read additional ranges only if the interface is not visible in the first page.
  If atlas-aci unavailable: read only the first ~60 lines of each key file manually.

Step 3: Reference ranking
  - Which files are imported by the most other files? (high leverage, high risk)
  atlas-aci: mcp__atlas-aci__graph_query(symbol=<module_name>, direction="dependents")
    → lists files that import/depend on a given symbol or module.
  - Which files import the most other files? (integration points)
  atlas-aci: mcp__atlas-aci__graph_query(symbol=<module_name>, direction="dependencies")
  If atlas-aci unavailable: grep -r "require\|import\|from" --include="*.{ext}" -l | sort | uniq -c | sort -rn.

Step 4: Compress to summary
  Format:
    DOMAIN/
      Model (inherits BaseModel) — #create, #update, #archive [tested]
      Repository — #find_by_id, #search, #count [tested]
      Service — #execute, #validate [untested ⚠️]
      Component — renders list, detail views [tested]
  atlas-aci: mcp__atlas-aci__memex_read(query=<domain summary fragment>)
    → pull any previously stored excerpt from the ATLAS-built memex for this repo.
    → If a memex entry exists, use it to seed the repo map instead of re-scanning.
  If atlas-aci unavailable: skip memex lookup; build the map from scratch.
```

### Output
A concise map you reference throughout the task. Update it if you discover new relevant files.

---

## Hierarchical Localization

When searching for where to make changes, narrow progressively:

```
Level 1 — Domain identification (atlas-aci: mcp__atlas-aci__list_dir)
  "Which top-level domain/module is this feature in?"
  → mcp__atlas-aci__list_dir(path=".", depth=2)
    Scan the returned tree for top-level modules/packages/apps.
    Identify 1-3 candidate domains.
  If atlas-aci unavailable: scan directory names, README, route definitions manually.
  Output: 1-3 candidate domains.

Level 2 — File identification (atlas-aci: mcp__atlas-aci__search_text)
  "Which files within the domain are relevant?"
  → mcp__atlas-aci__search_text(query=<feature keyword or symbol name>, path=<domain dir>)
    Returns file paths + matching lines (match-only, no full-file dump).
    Ranks results by relevance — inspect the top entries.
  If atlas-aci unavailable: grep -r "<keyword>" --include="*.<ext>" -l | head -20.
  Output: 3-8 candidate files with relevance ranking.

Level 3 — Symbol identification (atlas-aci: mcp__atlas-aci__search_symbol + mcp__atlas-aci__graph_query)
  "Which specific classes, methods, or functions need to change?"
  → mcp__atlas-aci__search_symbol(symbol=<name>, exact=false)
    Returns definition locations (file:line) for classes, functions, methods.
  → mcp__atlas-aci__graph_query(symbol=<name>, direction="callers")
    Returns the call-graph: who calls this symbol (callers / dependents).
    Use to understand the blast radius of a change before making it.
  If atlas-aci unavailable: grep -rn "def <name>\|class <name>\|function <name>" --include="*.<ext>".
  Output: specific file:line targets for modification.

Level 4 — Context gathering (atlas-aci: mcp__atlas-aci__view_file PAGINATED)
  "What do I need to understand about these specific symbols?"
  → mcp__atlas-aci__view_file(path=<file>, start_line=<target-N>, end_line=<target+N>)
    Read ONLY the window around the identified symbol — ±30-50 lines.
    Make multiple paginated calls if the implementation spans multiple ranges.
    NEVER call view_file with start_line=1, end_line=<large> — that is a full file dump.
  → Also view the corresponding test file around the relevant test (same pagination rule).
  If atlas-aci unavailable: read the specific section of the file; avoid full-file reads.
  Output: full understanding of change targets + their contracts.
```

**Rule**: Do not jump to Level 4 without completing Levels 1-3. Premature deep reading wastes context budget on irrelevant code.

### Test Oracle Probe (atlas-aci: mcp__atlas-aci__test_dry_run)

Before executing any test command, get a preview of which tests would run:

```
mcp__atlas-aci__test_dry_run(command=<the test command>, path=<repo root or subdir>)
  → returns the list of test IDs that the command would select, without running them.
  → use this to confirm the --tests / --regression / --reproduction commands select
    the right tests before committing them to the loop's --tests argument.
```

If atlas-aci unavailable: verify with `<test-cmd> --collect-only` (pytest) or `--dry-run` (bats/rspec) before binding to the loop.

---

## In-Loop Loci-Driven Assembly (S1.4-assembly)

This is the per-iteration context assembly step that runs INSIDE the `--fix-hook` invocation, after the substrate delivers localized feedback. It replaces "re-read whole files" with a precision-targeted evidence-pull.

**When:** at the START of each `--fix-hook` invocation, immediately after reading `$EIDOLONS_SANDBOX_FEEDBACK`.

```
# 1. Parse the feedback signal
feedback = parse_json($EIDOLONS_SANDBOX_FEEDBACK)
  # fields: loci:[file:line...], test_name:[...], assertion:[...], phase, attempt, failing

# 2. For each locus in feedback.loci (cap at 5 loci to bound context cost):
for locus in feedback.loci[:5]:
  file, line = parse(locus)   # "path/to/foo.go:42"

  # 3. View the failure site (paginated — window around the reported line)
  mcp__atlas-aci__view_file(path=file, start_line=max(1,line-25), end_line=line+25)
    → anchor evidence: the exact code the failing assertion references.

  # 4. Identify the symbol under failure
  mcp__atlas-aci__search_symbol(symbol=<inferred symbol from locus context>, exact=false)
    → confirms definition locations; resolves which impl owns the failing path.

  # 5. Pull the call graph for blast-radius awareness
  mcp__atlas-aci__graph_query(symbol=<symbol from step 4>, direction="callers")
    → reveals who calls this code — prevents a fix that breaks callers.

# 6. View the failing test (paginated — the test assertion window)
for test_name in feedback.test_name[:3]:
  mcp__atlas-aci__search_symbol(symbol=test_name, exact=true)
    → locate the test function definition
  mcp__atlas-aci__view_file(path=<test file>, start_line=<test line-5>, end_line=<test line+30>)
    → read the assertion the test makes — confirms what "passing" means.
```

**Result:** a tight, evidence-anchored repair context (typically 3-8 paginated excerpts, ~1-3K tokens) that directly targets the reported failure, NOT a broad file re-read.

**If atlas-aci unavailable:** degrade to manual reads — for each locus, read only the surrounding 40-line window of the failing file; grep for the test name to find its location; read only that test's immediate body. Same principle: target the locus, do not re-read whole files.

---

## Context Budget Management

### Token Budget Allocation (approximate for 128K context window)

| Category | Budget | Purpose |
|----------|--------|---------|
| System instructions + methodology | ~4K | Always loaded |
| Active skill (current phase) | ~2-3K | Loaded per-phase |
| Repo map | ~1K | Generated in Analyze |
| Memory recall | ~1-2K | Queried in Analyze |
| Discovery report | ~1-2K | Produced in Analyze |
| Execution plan | ~1-2K | Produced in Plan |
| Active file contents | ~10-30K | During Implement |
| Test output / error logs | ~2-5K | During Verify/Reflect |
| In-loop loci assembly | ~1-3K | Per fix-hook iteration |
| Conversation history | Remainder | Slides as session progresses |

### Context Pressure Signals

Watch for these signs that context is becoming stale or overloaded:

| Signal | Response |
|--------|----------|
| Forgetting earlier decisions | Re-inject execution plan summary |
| Repeating a search already done | Check if repo map is still in context |
| Hallucinating file contents | Re-read the actual file via view_file; do not rely on memory |
| Losing track of task progress | Re-inject task progress checklist |
| Contradicting earlier analysis | Summarize current state and restart from checkpoint |

### Context Refresh Protocol

When context pressure is detected:

```
1. Summarize current state in a structured checkpoint:
   - What has been accomplished
   - What remains
   - Key decisions made and why
   - Current blockers

2. Drop stale context:
   - File contents from already-completed steps
   - Superseded plan versions
   - Resolved error logs

3. Re-inject essential context:
   - Task goal and acceptance criteria
   - Execution plan (current version)
   - Task progress checklist
   - Repo map (if still relevant)
```

---

## Asset Search Strategies

### For Internal Asset Discovery

Use multiple search strategies in order of efficiency:

```
1. Convention-based search (fastest)
   - Look in expected locations based on project structure
   - e.g., model for "Widget" → app/models/widget/ or app/models/widget.rb
   atlas-aci: mcp__atlas-aci__list_dir(path="app/models", depth=2)

2. Naming pattern search (atlas-aci: mcp__atlas-aci__search_text)
   - mcp__atlas-aci__search_text(query="widget", path=".")
     Returns matching file:line pairs — much cheaper than grep -r piped output.
   If atlas-aci unavailable:
   - grep -r "widget" --include="*.rb" -l
   - grep -r "def.*widget" --include="*.rb"

3. Symbol search (atlas-aci: mcp__atlas-aci__search_symbol)
   - mcp__atlas-aci__search_symbol(symbol="WidgetController", exact=true)
     Resolves definition location directly.
   If atlas-aci unavailable: grep -rn "class WidgetController" --include="*.rb"

4. Dependency chain traversal (atlas-aci: mcp__atlas-aci__graph_query)
   - mcp__atlas-aci__graph_query(symbol="WidgetController", direction="dependencies")
     Returns what WidgetController already uses.
   If atlas-aci unavailable: follow imports/requires manually from the identified file.

5. Test-based discovery
   - mcp__atlas-aci__search_text(query="widget", path="spec/")
     Search test files for how existing features are tested.
   If atlas-aci unavailable: grep -r "widget" spec/ --include="*_spec.rb" -l
```

### For Understanding Existing Code

Before reading a full file, try these cheaper approaches:

```
1. Read ONLY the class/module definition + public interface
   atlas-aci: mcp__atlas-aci__view_file(path=<file>, start_line=1, end_line=60)

2. Read the corresponding test file (often more informative than source)
   atlas-aci: mcp__atlas-aci__view_file(path=<test_file>, start_line=1, end_line=80)

3. Read callers of the code (reveals actual usage patterns)
   atlas-aci: mcp__atlas-aci__graph_query(symbol=<name>, direction="callers")

4. Retrieve stored excerpts from the ATLAS memex (fastest if available)
   atlas-aci: mcp__atlas-aci__memex_read(query=<symbol or domain name>)
```

---

## Language-Specific Context Hints

### Typed Languages (TypeScript, Go, Rust, Java)
- Interface/type definitions are extremely high-value context
- Read type signatures BEFORE implementations
- Types serve as self-documenting contracts
- atlas-aci: `mcp__atlas-aci__search_symbol(symbol=<InterfaceName>, exact=true)` to locate type definitions quickly

### Dynamic Languages (Ruby, Python, JavaScript)
- Test files are MORE important than source (they document behavior)
- Look for type annotations, YARD docs, JSDoc, or type stubs
- Pay special attention to framework conventions (Rails, Django)
- atlas-aci: `mcp__atlas-aci__search_text(query=<method_name>, path="spec/")` to find usage patterns

### Configuration-Heavy Frameworks (Rails, Django, Spring)
- Route files map URLs to handlers (high-value context)
- Database schema/migrations define data model
- Initializers and middleware define cross-cutting behavior
- atlas-aci: `mcp__atlas-aci__list_dir(path="config", depth=2)` to map configuration structure

---

## Integration with Vivi Phases

| Phase | Context Engineering Action |
|-------|--------------------------|
| **A** Analyze | `list_dir` repo scan → `search_text`/`search_symbol` localization → `view_file` interfaces → `memex_read` prior excerpts |
| **P** Plan | `search_text` in test dirs → `view_file` (paginated) for test patterns → `test_dry_run` to preview test selection |
| **I** Implement | `view_file` (paginated, active files only) → `graph_query` for blast-radius → refresh when switching focus |
| **V** Verify | **in-loop loci assembly** (see §In-Loop Loci-Driven Assembly above) → `view_file` failure site → `search_symbol` + `graph_query` callers |
| **R** Reflect | `recall` failure signatures from CRYSTALIUM → `view_file` around the re-failing site → ensure original requirements in context |
| **Δ** Delta | `list_dir` touched domains → `graph_query` for normalization candidates → `memex_read` for prior observations |

---

## Verify Upstream Envelopes (ECL v2.0)

When the Analyze phase ingests an artefact handed off by ATLAS (`scout-report`), SPECTRA (`spec`), VIGIL (`root-cause-report`), or FORGE (`reasoning-report`), check for a sibling `${P%.*}.envelope.json` next to the payload.

If present:

1. Load `skills/verify-incoming.md`.
2. Run the validation pipeline (schema → integrity → contract match).
3. On `verify_pass`, proceed.
4. On `verify_fail`, emit the warning to stderr, append the failure code to `.eidolons/.trace/<thread_id>.jsonl`, **and continue** — verification is opt-in / warn-only at ECL v2.0.

If the sibling envelope is absent, proceed without verification. This is expected during the ECL rollout window when upstream Eidolons may not yet have adopted.

---

*Context Engineering Skill — atlas-aci-driven (L1 list_dir → L2 search_text → L3 search_symbol/graph_query → L4 view_file paginated) + in-loop loci assembly (S1.4-assembly) + manual fallback when atlas-aci absent*
