---
layout: post
author: Henrique A. Lavezzo
author_id: henrique
title: "LLM Model Routing - Claude"
resume: "A historical synthesis on matching model cost and capability to the work."
date: 2026-02-18 20:41:45 -0300
categories: llm
tags: braindump llm claude ai-models budget
featured: true
type: transmutation
assay: speculative
reviewed_at: 2026-08-28
---

## A historical snapshot

This note was written on 18 February 2026 around Claude Opus 4.6, Sonnet 4.6, and Haiku 4.5, then reviewed on 28 August 2026. Model aliases, defaults, capabilities, and prices are volatile; treat every named configuration here as a dated snapshot.

The durable question is how to match capability, latency, cost, context, tools, and review effort to the work. This is a synthesis, not a controlled experiment on my own workload. Its assay is therefore speculative.

## Capability is workload-dependent

Anthropic's launch material reported stronger Opus 4.6 results on several long-horizon and agentic evaluations. Those results belong to particular harnesses, prompts, effort settings, and dates; they are not universal proof that one model is best for every coding task.

For a working team, the useful measure is closer to the cost of an accepted change: tests passed, review completed, retries counted, and regressions avoided. Public benchmarks can inform a trial, but local evidence should decide the route.

## Price is only one part of cost

At publication, Anthropic listed Opus 4.6 at $5 input and $25 output, Sonnet 4.6 at $3 input and $15 output, and Haiku 4.5 at $1 input and $5 output per million tokens. Those headline prices exclude important workload effects such as caching, reasoning tokens, tool calls, retries, long context, and human review.

A cheaper token is not necessarily a cheaper accepted result. Prompt caching and batch processing can also change the economics, so estimates should use the actual request shape.

## Controls enable routing; they do not validate it

Claude Code documents `opusplan` as Opus during planning followed by Sonnet during execution. Subagents may select `sonnet`, `opus`, `haiku`, a full model ID, or `inherit`; when the field is omitted, they inherit the main-agent model. `CLAUDE_CODE_SUBAGENT_MODEL` has the highest documented precedence for subagent selection.

These controls permit phase-based work, but do not prove that a particular split is optimal. Aider's Architect/Editor pattern is another useful design reference: separate reasoning about a change from editing it, then verify the result.

## Five lenses on the routing problem

### The Economist

Compare the total cost of accepted work, including retries and review, rather than token price alone.

### The Architect

Route by the cognitive shape of the task: ambiguity, scope, dependencies, context, and reversibility.

### The Pragmatist

Start with the least expensive plausible configuration and make escalation easy when evidence says it is insufficient.

### The Scientist

Record the task, configuration, outcome, retries, and validation so the routing rule can be challenged.

### The Strategist

Name capabilities instead of permanently binding roles to product aliases; both models and interfaces change.

## Anti-patterns to avoid

1. **Premium-model default:** paying for maximum capability without showing that the workload needs it.
2. **Speed illusion:** optimizing first-response latency while ignoring retries, repair, and review.
3. **Invisible switch:** changing configurations without recording which model produced which artifact.
4. **Unbounded thinking budget:** spending more reasoning effort without an escalation or stopping rule.
5. **Static routing table:** treating a dated model-role mapping as permanent infrastructure.

These are risks to inspect, not claims that every workflow exhibiting one will fail.

## A capability table for multi-agent work

| Role | Capability requirement | Evidence gate |
| --- | --- | --- |
| Scout | Broad retrieval and faithful terrain mapping | Important files and claims are cited |
| Planner | Resolve ambiguity into bounded decisions | Acceptance conditions and trade-offs are explicit |
| Builder | Apply a specification without widening scope | Diff matches the plan and focused checks pass |
| Checker | Challenge behavior independently | Failures are reproducible and the relevant suite passes |
| Mechanical cleanup | Deterministic, narrow transformation | Exact diff and lint or contract checks |

The table deliberately avoids fixed model assignments. Select a configuration that plausibly meets the capability and evidence gate, then revise it from observed results.

## A routing method worth testing

1. **Classify the task.** Record ambiguity, scope, risk, context, tools, and expected artifact.
2. **Choose the least expensive plausible configuration.** Include latency and review cost, not only tokens.
3. **Define escalation before work starts.** Name the failure signal that permits more capability or effort.
4. **Externalize the handoff.** Preserve constraints, decisions, evidence, and unresolved questions between phases.
5. **Measure locally.** Track acceptance, retries, elapsed time, review effort, and regressions on repeated task classes.

This method is a hypothesis for disciplined experimentation. A team should keep it only where its own evidence supports it.

## Sources and evidence boundary

Primary vendor documentation used for this dated synthesis:

- [Claude Opus 4.6 launch](https://www.anthropic.com/news/claude-opus-4-6)
- [Claude Sonnet 4.6 launch](https://www.anthropic.com/news/claude-sonnet-4-6)
- [Claude Haiku 4.5 launch](https://www.anthropic.com/news/claude-haiku-4-5)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude model overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

These are primary vendor sources, not independent productivity evidence. I did not run a controlled comparison for this article. The durable claim is a hypothesis: explicit routing, escalation, handoffs, and local measurement should produce better decisions than an unexamined default.

## Conclusion

Model routing is not a hunt for a permanent winner. It is a small operating system for choosing enough capability, observing the result, and escalating deliberately.

The names and prices in this note will age. A routing practice built around capability requirements and local evidence has a better chance of aging gracefully.
