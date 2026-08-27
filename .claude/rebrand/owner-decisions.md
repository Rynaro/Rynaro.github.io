# Owner Decisions — RESOLVED 2026-07-16

Answers to the plan's **Open Decisions** section, given directly by the owner (Henrique / Rynaro). These are **binding inputs to v0.4** and close 8 of 8 open items. RAMZA folds these into the plan; no further owner input is required to execute Phases 0–4.

---

## 1. Identity line — **RESOLVED**

The canonical compound identity line, to be stored **once** in `_data` and consumed verbatim by the homepage hero, the About lead, the meta/OG description, and social bios (AC-001):

> **An engineering lead who never stopped shipping — a Code Alchemist transmuting chaos into scalable systems, now conducting AI familiars in the open.**

Rationale for the choice: carries all three hats in one sentence; "never stopped shipping" supplies IC credibility; the metaphor stays intact while the AI era is foregrounded. **Known trade-off accepted:** it is the longest of the three candidates and **the hero subtitle may need two lines** — a layout consideration for Phase 4 (`index.html:72` currently holds a single-line tagline).

## 2. Canonical job title — **RESOLVED: "Director of Engineering"**

`_data/jobs.yaml:1` updates to match `_data/character_build.yml:5`. Closes **D10** / **AC-002**.

## 3. Retro post-type labels — **RESOLVED: yes, lightweight**

- 2019-12-12 (SFTP), 2020-01-13 (Clojure), 2023-02-10 (use cases), 2023-02-16 (domains) → `type: scroll`
- 2026-02-18 (LLM routing) → `type: transmutation` (+ `assay`) — closes **AC-021**
- 2019-03-06 ("My notebook !") → `type: log` (candidate — it is the launch/meta post)

Makes the voice split deliberate rather than accidental, at near-zero cost.

## 4. PT-BR locale — **RESOLVED: drop it**

Remove `og:locale:alternate pt_BR` from `_includes/head/meta.html:18`. No PT-BR content is planned. Closes **D11**.

## 5. Analytics — **RESOLVED: Plausible**

Replaces the dead UA property `UA-135917274-1`. Cookie-free, no consent banner, ~1 KB script — consistent with the text-first substance layer. **Note:** UA *removal* (AC-009 / D8) ships in Phase 1 independently and is not blocked on Plausible being wired up.

## 6. Contact form — **RESOLVED: real Formspree form-hash ID**

Register a form and replace the endpoint at `letter.html:98` (currently posts to `https://formspree.io/f/hi@hlavezzo.me` — an email where a hash ID belongs). Keeps the themed "Magical Correspondence" UX. Closes **D9**.
**Executor note:** the real form ID is a credential the owner must supply; the story cannot complete without it.

## 7. Opal island (Phase 5) — **RESOLVED: decide at the Phase 5 gate, not now**

Phase 5 stays in the plan as **optional and owner-gated**. It is hard-gated behind Phase 1 (**EC-1**) and sequenced after the Phase 4 accessibility work regardless; **Story 5.0 already requires a committed go/no-go record predating any `_opal/` commit (AC-053)**. Deciding now buys nothing and forecloses information the owner will have later.

## 8. The reframe — **RESOLVED: it lands as INSIGHT, not a substitute** ⭐

FORGE declined to recommend on this one and routed it to the owner as the one genuinely un-analysable question. The owner's answer:

> **"It's insight — that's genuinely satisfying."**

**This is the highest-signal answer in the set, and it changes the plan's centre of gravity.**

### Consequences RAMZA must fold into v0.4

1. **FORGE's RISK-5 is CLOSED.** RISK-5 was: *"Owner rejects Ruling 2 as a substitute good and reads the verdict as a soft 'no'."* It was live and unmitigated. The owner has now affirmatively accepted Ruling 2 **on its own terms**. Mark it closed with this citation.
2. **Ruling 2 is the main event, not the consolation prize.** The build-time transmutation work in Phases 2/3 — server-rendered category pages (AC-013), the kramdown/generator TOC (AC-023, which also fixes the no-JS empty-`Contents` defect D15), CSS smooth-scroll, the `prefers-color-scheme` dark-mode foundation — is what the owner actually wants. It should be **framed and sequenced as a headline deliverable**, not as groundwork.
3. **Phase 5's justification narrows to joy alone — correctly.** With the reframe satisfying the craft desire, the island is no longer load-bearing for **C7 (owner joy / craft-identity)**. Combined with decision 7 (defer), **the realistic disposition of Phase 5 is "probably not, and that is a fine outcome."** FORGE's own fallback holds: *"the post is still writable from data already in hand"* (**RC-8**) — the 96.6 / 2.9 / 0.49 decomposition is a complete publishable insight that requires building nothing.
4. **The framing discipline is UNCHANGED and non-negotiable.** "Insight" is about the *craft* satisfaction of Ruby-transmutes-the-site-at-build-time. It is **not** licence to reintroduce the withdrawn performance justification. **DECISION-C stands: Ruling 2 is sold on correctness + accessibility + SEO, never on speed.** The heaviest page ships 4,778 B gzipped; there was never a performance problem. Re-read `opal-measurement.md`.

---

## Net effect on the plan

- **8 of 8 open decisions closed.** No owner input blocks Phases 0–4.
- **One new dependency:** the Formspree form ID is a credential only the owner can produce (decision 6).
- **One new Phase 4 layout input:** the chosen identity line may require a two-line hero subtitle (decision 1).
- **One risk closed:** FORGE RISK-5.
- **One centre-of-gravity shift:** Ruling 2 promoted from groundwork to headline; Phase 5 demoted from "the lust" to "an optional indulgence the owner no longer needs."
