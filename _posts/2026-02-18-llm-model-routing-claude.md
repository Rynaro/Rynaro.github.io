---
layout: post
author: Henrique A. Lavezzo
title:  "LLM Model Routing - Claude"
resume: "A bit reasoning around model routing"
date:   2026-02-18 20:41:45 -0300
comments: false
categories: llm
tags: braindump llm claude ai-models budget 
---

# Optimal model routing between Claude tiers for AI coding workflows

**The single most impactful decision in AI-assisted coding isn't which model you use — it's knowing when to switch.** With Opus 4.6's price dropping 67% to $5/$25 per million tokens (from $15/$75 in earlier generations), the economics of model routing have fundamentally shifted. The Opus-to-Sonnet cost gap shrank from 5× to just 1.67×, making intelligent routing more about matching cognitive depth to task complexity than pure cost arbitrage. This report synthesizes benchmark data, community experience, tool documentation, and cost analysis into an actionable methodology for routing between Claude Opus, Sonnet, and Haiku during coding sessions — including multi-agent orchestration scenarios.

The evidence supports a clear hierarchy: **Sonnet 4.5 as default workhorse** (handling 70–80% of tasks), **Opus for architecture-level reasoning and complex debugging**, and **Haiku with extended thinking as the underutilized powerhouse** for high-volume operations. But the nuances matter enormously, and static rules break down without understanding failure modes.

---

## The capability landscape: what the benchmarks actually reveal

The gap between tiers is real but narrower than most developers assume. On **SWE-bench Verified** (the gold standard for real-world coding), Opus 4.5 scores **80.9%**, Sonnet 4.5 hits **77.2%**, and Haiku 4.5 reaches **73.3%** — a total spread of just 7.6 percentage points. For context, Haiku 4.5 at $1/$5 per million tokens outperforms Claude Opus 4.1 (~72%), which cost $15/$75 just months ago.

The tiers diverge sharply on tasks requiring sustained reasoning and multi-step tool use. On **Terminal-Bench 2.0** (agentic terminal coding), Opus 4.6 scores 65.4% versus Sonnet 4.5's 51.0% — a 14-point gap. On **MCP Atlas** (orchestrating multiple tools at scale), Opus 4.5 scores 62.3% versus Sonnet 4.5's 43.8% — an 18.5-point chasm. On **OSWorld** (agentic computer use), the spread runs from Opus 4.6 at 72.7% down through Sonnet at 61.4% to Haiku at 50.7%. The pattern is unmistakable: **as task complexity and agent autonomy increase, the gap between tiers widens dramatically**.

| Benchmark | Opus 4.6/4.5 | Sonnet 4.5 | Haiku 4.5 | Gap (Opus–Haiku) |
|---|---|---|---|---|
| SWE-bench Verified | 80.9% | 77.2% | 73.3% | 7.6pp |
| Terminal-Bench 2.0 | 65.4% | 51.0% | — | 14.4pp+ |
| MCP Atlas (tool use) | 62.3% | 43.8% | — | 18.5pp+ |
| Aider Polyglot | 89.4% | 78.8% | — | 10.6pp+ |
| OSWorld (agentic) | 72.7% | 61.4% | 50.7% | 22.0pp |

Critically, **HumanEval and MBPP are saturated** — all tiers score above 90%, making these benchmarks useless for routing decisions. The real differentiators are multi-file, multi-step, and agentic benchmarks.

One surprising finding deserves emphasis: Opus 4.5 at **medium effort** matches Sonnet 4.5's best SWE-bench score while using **76% fewer output tokens**. At maximum effort, Opus exceeds Sonnet by 4.3 points while using 48% fewer tokens. This means Opus's token efficiency on hard problems can make it *cheaper per successful task* than Sonnet when accounting for retry costs.

---

## The pricing reality after the Opus price collapse

The economics of model routing changed fundamentally when Opus 4.5/4.6 dropped to $5/$25 per million tokens. The current tier structure:

| Model | Input/MTok | Output/MTok | Batch Input | Cache Read | Speed |
|---|---|---|---|---|---|
| **Opus 4.6** | $5.00 | $25.00 | $2.50 | $0.50 | Moderate |
| **Sonnet 4.5** | $3.00 | $15.00 | $1.50 | $0.30 | Fast |
| **Haiku 4.5** | $1.00 | $5.00 | $0.50 | $0.10 | 3–5× faster |

The Opus-to-Sonnet ratio is now **1.67×** on both input and output — compared to the previous 5× gap. The Sonnet-to-Haiku ratio remains **3×**, making Haiku the clear choice when quality is sufficient. For a concrete sense of costs per task:

- A **simple edit** (2K input, 500 output): $0.005 on Haiku, $0.014 on Sonnet, $0.023 on Opus
- **Unit test writing** (5K input, 6K output): $0.035 on Haiku, $0.105 on Sonnet, $0.175 on Opus
- **Complex multi-file refactoring** (50K input, 20K output): $0.15 on Haiku, $0.45 on Sonnet, $0.75 on Opus
- **Large codebase analysis** (100K+ context): $0.175 on Haiku, $0.525 on Sonnet, $0.875 on Opus

Real-world Claude Code usage averages **$6/developer/day** on Sonnet 4.5, with 90th percentile under $12/day. Prompt caching (0.1× input cost on cache hits) and batch API (50% discount) stack multiplicatively — a fully optimized pipeline can achieve **up to 90–95% savings** versus naive all-Opus usage.

---

## How production tools actually route between models

No major coding tool implements truly intelligent task-based auto-routing. Instead, the industry has converged on a simpler, more robust pattern: **phase-based splitting**, where stronger models plan and weaker models execute.

**Claude Code** offers the most explicit routing controls. Its `opusplan` alias uses Opus during planning mode and auto-switches to Sonnet for execution — the closest thing to automated routing in production. Sub-agents can specify `model: sonnet`, `model: haiku`, or `model: inherit` in YAML frontmatter, and the `CLAUDE_CODE_SUBAGENT_MODEL` environment variable overrides all sub-agent models globally. Notably, **sub-agents default to Sonnet** even when the main session runs on Opus, and Claude Code uses Haiku behind the scenes for background functionality like commit messages and context summarization.

**Aider** pioneered the **Architect/Editor split**: the main "architect" model reasons about the problem in natural language, then a separate "editor" model translates that reasoning into file edits. This pattern delivers measurable gains — o1-preview as architect with a cheaper editor achieved 85% on Aider's code editing benchmark, outperforming any single model.

**Cursor** uses a proprietary fine-tuned model for tab completions (separate from all chat models), offers an "Auto" mode that selects based on availability and reliability rather than task type, and transparently routes some background tasks to different providers. **Windsurf** runs a hidden planning agent alongside whatever model the user selects. Both tools demonstrate that **dual-model architectures are becoming standard**, even when not user-visible.

The community-reported workflow that emerges most consistently across platforms follows this pattern:

1. **Explore** with a fast model (read files, understand the codebase)
2. **Plan** with Opus ("ultrathink, analyze this, propose a plan, don't code yet")
3. **Implement** with Sonnet (execute the plan)
4. **Review** with Opus (catch edge cases, verify correctness)
5. **Clean up** with Haiku (formatting, import organization, small fixes)

---

## Five analytical lenses on the routing problem

### The Economist: diminishing returns define the optimal frontier

From a pure cost-efficiency perspective, the routing problem reduces to: *what is the marginal quality gain per additional dollar spent?* The data shows steep diminishing returns. Moving from Haiku ($1/$5) to Sonnet ($3/$15) — a 3× cost increase — buys a 3.9 percentage point improvement on SWE-bench (73.3% → 77.2%). Moving from Sonnet to Opus ($5/$25) — only 1.67× more — buys another 3.7 points (77.2% → 80.9%). The Sonnet-to-Opus upgrade is actually **better value per point** than the Haiku-to-Sonnet upgrade at current prices.

But this analysis changes dramatically by task type. On MCP Atlas (multi-tool orchestration), the Sonnet-to-Opus jump gains 18.5 points — extraordinary value. On simple edits, the quality difference between all three tiers is negligible, making Haiku the only rational choice. **The Economist's verdict: route by task type, not by default preference, and treat Opus's effort parameter as a continuous cost dial rather than a binary tier decision.**

The RouteLLM framework from LMSYS demonstrated that intelligent routing achieves **85% cost reduction while maintaining 95% of top-model quality**. One enterprise reduced annual AI costs from $3.96M to $1.37M (65% reduction) through systematic model selection.

### The Architect: design for escalation, not perfection

A well-designed routing system needs three properties: **reliable escalation**, **graceful degradation**, and **observable decision-making**. The critical insight from practitioners who tried auto-routing is that it fails: "I tried auto-mode and blind routing early on. Stopped using both. It led to indecision, unexpected cost spikes, and behavior I couldn't reason about when something went wrong."

The Architect's recommended design follows a **cascading pattern with explicit triggers**:

**Tier 1 — Haiku (default for sub-agents and simple tasks)**
- Handles: formatting, renaming, boilerplate, config changes, import fixes, commit messages, code classification
- Escalation trigger: output fails syntax validation, unit tests fail, or task requires multi-file awareness

**Tier 2 — Sonnet (default for interactive coding)**
- Handles: feature implementation, standard bug fixes, code review, test writing, documentation, single-file refactoring
- Escalation trigger: circular fixing patterns (model keeps reverting changes), concurrency/race condition bugs, architecture-level decisions needed, or task requires >200K context with high retrieval accuracy

**Tier 3 — Opus (reserved for high-complexity reasoning)**
- Handles: multi-file refactoring, architecture design, security review, subtle debugging, long-horizon agent workflows, multi-codebase changes
- De-escalation: once architecture is established, drop to Sonnet for implementation; use effort parameter at medium for "Opus-lite" tasks

**Fallback mechanisms**: If any tier fails twice on the same task, escalate one tier. If Opus fails, flag for human review. Never de-escalate mid-task — complete the current task at the escalated tier, then de-escalate for the next task.

### The Pragmatist: what experienced developers actually do

The community consensus is remarkably consistent. The most common workflow, reported independently across Reddit, Hacker News, Medium, and tool-specific forums:

- **"Haiku for setup, Sonnet for builds, Opus for reviews — that combo just works"** (Flutter developer)
- **"If a wrong answer is cheap, use Sonnet and retry on failure. If a wrong answer is expensive, pay for Opus on the first attempt"** (AceCloud analysis)
- **"Everyone believes their task requires no less than Opus, it seems"** (Hacker News commenter identifying the most common anti-pattern)

Practitioners converge on Sonnet as the daily driver. A developer on the $20 plan described their approach: "I usually start with Haiku, then switch to Sonnet or Opus for harder tasks." Continue.dev documented a workflow achieving **2× productivity** using Opus for planning and Sonnet for implementation on a real data pipeline project.

The Pragmatist's critical warning: **avoid switching models mid-conversation.** Switching requires re-sending the full context to the new model, consuming tokens and risking information loss. Instead, start new sessions when changing models. If you must switch, first ask the model to summarize the conversation state, then paste that summary into a fresh session with the new model.

### The Scientist: where the evidence is strong vs. thin

The evidence hierarchy is important for calibrating confidence in routing decisions:

**Strong evidence (benchmark-validated, multiple sources):**
- Opus significantly outperforms Sonnet on multi-step agentic tasks (MCP Atlas, Terminal-Bench, OSWorld — 14-22pp gaps)
- Haiku 4.5 with extended thinking beats Sonnet 4.5 with extended thinking 58% of the time on code review (Qodo, 400 real PRs, quality scores 7.29 vs 6.60)
- Extended thinking hurts performance by up to 36% on simple tasks where deeper reasoning is counterproductive
- Context degradation in long sessions is confirmed by academic research (primacy/recency bias, answer bloat, loss-of-middle-turns)
- Opus overengineering is acknowledged by Anthropic themselves in the Opus 4.6 announcement

**Moderate evidence (practitioner consensus, limited formal measurement):**
- Sonnet handles ~80% of typical coding tasks at near-Opus quality
- Haiku breaks down on code exceeding ~150 lines
- Phase-based switching (plan/execute) outperforms static model selection
- Opus is cheaper per successful task on complex problems due to fewer retries

**Weak evidence (anecdotal, needs more research):**
- Optimal effort parameter settings for specific task types
- Exact token-count thresholds for routing decisions
- Whether cross-model review (Opus checking Sonnet's work) consistently catches bugs that same-model review misses
- Quality degradation during peak usage hours

### The Strategist: building adaptive systems for a moving target

Models improve rapidly. Haiku 4.5 today outperforms Opus 4.1 from months ago. Any routing system built on fixed rules will degrade. The Strategist recommends:

**Design for model-agnostic interfaces.** Don't hardcode "use Opus" — instead, define capability requirements (e.g., "requires multi-file reasoning," "requires >200K context") and map those to models dynamically. When a new model launches, update the mapping table without changing the routing logic.

**Build feedback loops.** Track which model-task pairings produce successful outcomes (tests pass, code review approved, no bugs in production). Use this data to continuously refine routing. Aider's Architect/Editor pattern implicitly does this — if the editor's output fails tests, the architect can adjust its approach.

**Prepare for adaptive thinking.** Opus 4.6's adaptive thinking and effort parameter represent the future: a single model that dynamically scales reasoning depth. As this capability spreads to Sonnet and Haiku, the routing problem shifts from "which model?" to "how much thinking budget?" — a continuous optimization rather than a discrete choice.

**Invest in context management.** Opus 4.6's compaction API (server-side context summarization) and thinking block preservation represent infrastructure that makes long-running, multi-model sessions viable. Teams that build their workflows around these primitives will maintain advantage as models evolve.

---

## The five anti-patterns that destroy routing value

**1. The Opus Hammer.** Opus consistently overengineers simple tasks. One developer asked for email OTP login and received a 12-file authentication framework. Anthropic acknowledges this: Opus 4.6 "thinks more deeply and more carefully revisits its reasoning, which produces better results on harder problems but adds cost and latency on simpler ones." Mitigation: use the effort parameter at medium for routine work, or simply use Sonnet.

**2. The Haiku Speed Trap.** Haiku's sub-200ms responses create a false sense of progress. Developers accept lower-quality output because it arrives instantly and don't review it as carefully. Haiku "tends to hallucinate when generating code exceeding 150 lines" and "loses track fast" in sessions beyond ~7 minutes of sustained work. Mitigation: pair Haiku with CI/linting gates and treat its output as a draft requiring validation.

**3. The Mid-Conversation Switch.** Switching models mid-session forces the new model to re-process the entire conversation history, consuming extra tokens and losing the nuanced "understanding" the previous model had built. Community consensus: start fresh sessions when changing models. Use external state (CLAUDE.md files, summaries, test suites) to transfer context.

**4. The Thinking Token Explosion.** Extended thinking tokens are billed as output tokens. One production test saw costs jump from $109 to $1,485 — a **14× increase** — when reasoning-enabled modes were naively applied. Worse, extended thinking on simple tasks can *hurt* performance by up to 36%. Rule of thumb from practitioners: "If a human would do worse by thinking too hard, so will Claude."

**5. The "Everyone Needs Opus" Delusion.** Developers on subscription plans who default to Opus for routine work hit usage limits and lose access entirely. "The best model is the one I can use, not the one I can't afford." Sonnet handles the vast majority of coding tasks with negligible quality loss.

---

## Multi-agent orchestration: assigning models to roles

The most effective multi-agent coding architectures assign models based on role requirements, not uniform capability. The evidence supports this role-to-model mapping:

| Agent Role | Recommended Model | Reasoning |
|---|---|---|
| **Orchestrator / Planner** | Opus 4.6 (medium effort) | Needs multi-file awareness, architecture reasoning; effort parameter controls cost |
| **Implementation Agent** | Sonnet 4.5 | Best quality/cost for code generation; handles 80% of coding tasks well |
| **Code Reviewer** | Opus 4.6 or Haiku 4.5 + thinking | Opus catches subtle bugs others miss; Haiku+thinking surprisingly strong (58% win rate vs Sonnet+thinking) |
| **Explorer / Reader** | Haiku 4.5 | Read-only codebase exploration; speed matters, reasoning depth doesn't |
| **Test Writer** | Sonnet 4.5 | Benefits from semantic understanding; Haiku may miss edge cases |
| **Formatter / Linter** | Haiku 4.5 | Mechanical task; no reasoning needed |
| **Commit Message / Docs** | Haiku 4.5 | Simple generation; speed preferred |
| **Security Reviewer** | Opus 4.6 (high effort) | High cost of missed vulnerabilities justifies premium; Opus catches 50% "Important" issues vs Sonnet's 41.5% |

Claude Code's sub-agent architecture makes this practical. The main session runs on Opus via `opusplan`, while sub-agents individually specify their model tier. The `CLAUDE_CODE_SUBAGENT_MODEL=haiku` environment variable provides a cost-efficient default that can be overridden per-agent in YAML frontmatter.

For teams building custom multi-agent systems, the **fan-out/fan-in pattern** works well: an Opus orchestrator decomposes a task into independent sub-tasks, multiple Haiku or Sonnet agents execute in parallel (each touching different files), and the orchestrator aggregates and reviews results. Claude Code's "agent teams" feature in Opus 4.6 supports exactly this — a demo showed 16 agents building a 100K-line C compiler in two weeks.

**Critical implementation detail**: sub-agents in Claude Code receive only their system prompt and basic environment details, *not* the full conversation history. This is a feature, not a bug — it reduces token usage by ~67% for multi-domain tasks and prevents context contamination between agents.

---

## The unified routing methodology

This methodology integrates evidence from benchmarks, community practice, tool architectures, and cost analysis into an immediately applicable framework.

### Step 1: Classify the task

Before sending any request, classify it along two dimensions:

**Complexity dimension** (determines model tier):
- **Mechanical** (formatting, renaming, imports, config) → Haiku
- **Generative** (new functions, tests, docs, standard features) → Sonnet
- **Reasoning-intensive** (architecture, multi-file refactoring, subtle bugs, security) → Opus

**Error-cost dimension** (adjusts tier up or down):
- **Low error cost** (can iterate cheaply, has test coverage) → stay at tier or drop one
- **High error cost** (production code, security-sensitive, no tests) → stay at tier or escalate one

### Step 2: Configure the effort level

For Opus 4.6/4.5, set the effort parameter based on task difficulty:
- **Low effort**: Simple Opus tasks where you want its knowledge but not deep reasoning
- **Medium effort**: Matches Sonnet's SWE-bench performance with 76% fewer tokens — the sweet spot for most Opus tasks
- **High effort** (default): Full reasoning for architecture decisions and complex debugging
- **Max effort**: Reserve for the hardest 5% of problems (novel algorithms, multi-codebase refactoring)

For Haiku 4.5, **enable extended thinking** for any task beyond simple formatting — the data shows Haiku+thinking outperforms Sonnet+thinking on code review 58% of the time, making it the best value option for many tasks.

### Step 3: Implement cascading escalation

```
START → Haiku 4.5
  ├─ Syntax validation passes AND tests pass → ACCEPT
  ├─ Syntax fails OR tests fail → ESCALATE to Sonnet 4.5
  │    ├─ Tests pass → ACCEPT  
  │    ├─ Circular fixes detected OR 2+ failures → ESCALATE to Opus 4.6
  │    │    ├─ Success → ACCEPT
  │    │    └─ Failure → FLAG for human review
  │    └─ Task requires >200K context → ROUTE directly to Opus 4.6
  └─ Task classified as reasoning-intensive → SKIP to Sonnet or Opus
```

### Step 4: Configure multi-agent roles

For Claude Code specifically:
```bash
# Set main model to opusplan (Opus plans, Sonnet executes)
claude config set model opusplan

# Set sub-agents to Haiku for cost efficiency
export CLAUDE_CODE_SUBAGENT_MODEL=haiku

# Override specific sub-agents in YAML frontmatter where needed
# model: sonnet  (for implementation sub-agents)
# model: opus    (for security review sub-agents)
```

For custom multi-agent systems, follow this allocation:

- **1 Opus orchestrator** decomposes work, reviews results, makes architecture calls
- **N Sonnet workers** handle implementation tasks in parallel (one per independent file/module)
- **M Haiku utilities** handle exploration, formatting, commit messages, classification

### Step 5: Optimize costs with caching and batching

- Enable **prompt caching** for system prompts and stable codebase context (break-even at 2 calls; 90% input savings at steady state)
- Use **batch API** (50% discount) for non-real-time work: test generation, documentation, bulk refactoring
- Use **Opus at medium effort** instead of high effort for routine architecture work (saves 76% on output tokens)
- Track spending: target **$6–12/developer/day** on Sonnet as a healthy baseline

### Where the evidence is thin

This methodology rests on strong benchmark evidence for tier-level performance differences and robust community consensus on workflow patterns. However, several areas remain uncertain. The optimal effort parameter settings for specific task types have not been formally studied. Whether cross-model review consistently catches bugs that same-model review misses lacks rigorous measurement. The exact token-count thresholds that should trigger model escalation are based on heuristics, not empirical data. Quality variation during peak usage hours is reported anecdotally but unquantified. And the Haiku+thinking finding from Qodo, while striking, comes from a single benchmark on code review — its generalizability to other coding tasks is unknown.

The field is moving fast. Opus 4.6's adaptive thinking, which dynamically scales reasoning depth per query, points toward a future where the routing problem dissolves into a single model with a continuous effort dial. Until that future arrives, explicit model routing with the methodology described here represents the evidence-based optimum.

## Conclusion

Three insights emerge from this synthesis that go beyond conventional wisdom. First, **the Haiku+thinking combination is dramatically underutilized** — at $1/$5 per million tokens with extended thinking, it outperforms Sonnet+thinking on code review while costing one-third as much. Teams defaulting to Sonnet for everything are leaving significant value on the table. Second, **Opus's effort parameter has made static tier boundaries obsolete**. Opus at medium effort is effectively a better Sonnet at a similar token cost, meaning the real routing decision is increasingly about effort level rather than model name. Third, **phase-based splitting (plan with Opus, execute with Sonnet, utility with Haiku) has converged independently across every major coding tool** — Claude Code's `opusplan`, Aider's Architect/Editor, Windsurf's hidden planner, Cursor's dual-model architecture — making it the one pattern with the strongest cross-validated evidence. Build your workflow around this pattern, instrument it with feedback loops, and prepare for the routing problem itself to gradually disappear as adaptive thinking capabilities propagate across model tiers.
