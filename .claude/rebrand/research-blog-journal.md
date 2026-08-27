# Running a Personal Blog as a Journal: Best Practices Research

Research for rebranding a Jekyll/GitHub Pages blog written by a software engineer / AI practitioner / engineering lead whose posts are journal-like dumps (LLM routing experiments, tooling habits). All claims sourced; URLs in the Sources section and inline.

---

## 1. The Philosophy: Why a Journal Blog Is a Legitimate (Often Superior) Form

### Learn in Public (swyx)
swyx's "Learn In Public" (https://www.swyx.io/learn-in-public) — read by millions, translated ~10 times — argues developers should emit "learning exhaust": blogs, cheatsheets, TILs, talks, documented problems solved along the way. Key claims:

- "Make the thing you wish you had found when you were learning."
- "By far the biggest beneficiary of you trying to help past you is future you."
- On fear of looking dumb: "Try your best to be right, but don't worry when you're wrong." He tells learners to "wear your noobyness on your sleeve" and not to judge results "by 'claps' or retweets or stars or upvotes."

The essay explicitly de-prioritizes polish: authenticity and consistency of output matter more than any single artifact's quality.

### Blogging as thinking
- Simon Willison, in his interview with Cynthia Dunlop (https://writethatblog.substack.com/p/simon-willison-on-technical-blogging): "Writing is thinking. Having a blog helps you practice how to think."
- Henrik Karlsson's widely-cited essay (https://www.henrikkarlsson.xyz/p/search-query) reframes the payoff: "A blog post is a very long and complex search query to find fascinating people and make them route interesting stuff to your inbox." He argues you should write at the edge of your knowledge for the sharpest imaginable reader ("Write for Jackson Pollock") — niche specificity filters *in* your people; a tiny audience is a feature, not a failure.

### The TIL approach (Simon Willison, Josh Branchaud, thoughtbot)
Willison's "What to blog about" (https://simonwillison.net/2022/Nov/6/what-to-blog-about/) names the two lowest-friction, highest-value formats: **TILs** and **project write-ups**. Neither carries "any expectations of shining new insights": with a TIL "you're not promising anyone a revelation or an in-depth tutorial," and for projects, "It doesn't matter if your project overlaps with thousands of others: the experience of building it is unique to you." Waiting for original ideas is "a mental trap that does nothing but hold you back." Most of his TILs (346+ at til.simonwillison.net) took under 10 minutes to write.

The repos-as-blogs lineage: Willison was inspired by Josh Branchaud's jbranchaud/til GitHub repo (https://github.com/jbranchaud/til, 14k+ stars, 1,800+ entries in 60+ topic folders, itself "shamelessly stolen" from thoughtbot/til). Branchaud's 10-year retrospective "A Decade of TILs" (https://www.visualmode.dev/a-decade-of-tils) credits hard constraints for the longevity: each TIL written in 5–10 minutes, title ≤50 characters, body ≤200 words, one tightly-focused thing.

### Digital gardens vs chronological streams
- **Maggie Appleton**, "A Brief History & Ethos of the Digital Garden" (https://maggieappleton.com/garden-history): gardens organize by "contextual relationships and associative links" rather than dates; "Gardens are never finished, they're constantly growing, evolving, and changing"; "Gardens are imperfect by design. They don't hide their rough edges or claim to be a permanent source of truth." Gardeners signal maturity with growth stages (🌱 seedling → 🌿 budding → 🌳 evergreen) plus "planted" and "last tended" dates, and disclose **epistemic status** — how they know what they know and how much effort went in (see also https://maggieappleton.com/epistemic-disclosure).
- **gwern**, "About This Website" (https://gwern.net/about): the "Long Content" ideal — "perpetual drafts" improved over years. His critique of default blogging: "Most blog posts are the triumph of the hare over the tortoise. They are meant to be read by a few people on a weekday in 2004 and never again, and are quickly abandoned." He pairs every page with metadata: status (notes → draft → in progress → finished), confidence (certain / highly likely / possible / unlikely...), and importance (0–10).
- **Tom Critchlow**, "Of Digital Streams, Campfires and Gardens" (https://tomcritchlow.com/2018/10/10/of-gardens-and-wikis/): streams (social) = fast-twitch; campfires (blogs) = medium-burn thinking out loud that fades over years; gardens (wikis) = decades-scale. Quoting Mike Caulfield: "The Garden is the web as topology... the Stream replaces topology with serialization." Critchlow's own garden is **a Jekyll wiki on GitHub Pages** (https://tomcritchlow.com/2019/02/17/building-digital-garden/) — directly transferable to this rebrand.

### When journal beats polished essay — and how they coexist
The journal (stream) wins when the value is *freshness, process, and search-query specificity*: experiments, failures, tool notes, "I just learned X." The polished essay/garden wins when the value is *reference and longevity*. The respected sites run both on one domain: Willison's weblog (stream: entries + link blog) sits beside til.simonwillison.net (reference notes); Appleton separates "notes" from "essays" by growth stage; gwern's long-content pages carry status tags so a "notes"-status page and a "finished" page share the site without confusing anyone. The mechanism that lets them coexist is **explicit labeling** (post types, status tags), not separation into different sites.

**Implications for the rebrand**
- Reframe the blog explicitly as a public engineering journal / lab notebook — this is a recognized, high-status genre (Willison, Evans, Webb), not a lesser blog. Say so on the About page.
- Adopt the TIL/project-write-up dichotomy as the two default post shapes; the existing "dump" posts already fit these molds.
- Add a lightweight status/epistemic vocabulary (e.g., `journal`, `til`, `essay` post types or seedling/evergreen labels) so journal entries and any future polished pieces can share one site without either undermining the other.
- Treat niche AI-routing/tooling posts as search queries for "your people" (Karlsson) — don't broaden topics to chase audience.

---

## 2. Lowering the Publishing Bar

### Post-length norms
- Julia Evans, "Some blogging myths" (https://jvns.ca/blog/2023/06/05/some-blogging-myths/), debunks "more material is always better": "I'd rather read something short, learn a couple of new things, and move on." Many of her posts are "hey, I just learned this!" posts; her advice to people stuck on completeness is to *make the post shorter and publish it*.
- Branchaud's constraint set (≤200 words, ≤50-char title, 5–10 minutes) sustained ~1,600 TILs over a decade (https://www.visualmode.dev/a-decade-of-tils).
- Matt Webb's rule: "One idea per post. If I find myself launching into another section, cut and paste the extra into a separate draft post" (https://interconnected.org/home/2020/09/10/streak).

### "No perfect drafts" tactics
- Willison: lower your standards and publish while "still actively unhappy" with the draft; "The flaws you see in your writing are invisible to everyone else" (https://writethatblog.substack.com/p/simon-willison-on-technical-blogging).
- Webb's anti-blocker rules: "Give up on attempting to be right." "Give up on trying to be popular." "Only write what's in my head at that exact moment. It's 10x faster." "If it's taking too long to write, stop." (https://interconnected.org/home/2020/09/10/streak)
- Devon Zuegel, "Epistemic statuses are lazy, and that is a good thing" (https://devonzuegel.com/epistemic-statuses-are-lazy-and-that-is-a-good-thing): "I originally started using these as a hack in order to publish half-baked ideas that I'd otherwise not feel comfortable sharing." The label converts perfectionism into a one-line disclaimer.
- Evans on correctness: you don't need to be 100% right — hedge uncertain claims with "I think..." / "my understanding is..." (https://jvns.ca/blog/2023/06/05/some-blogging-myths/).

### Cadence: consistency vs bursts
- Matt Webb: "Three posts a week, more or less" — rules that produced a streak from 24 weeks (when he wrote them down in 2020) to 300+ consecutive weeks of posting (https://interconnected.org/home/2020/09/10/streak; https://interconnected.org/home/2025/02/19/reflections). "Writing is a muscle."
- Willison ran **weeknotes** — 193 posts, 2019–2025, aimed at "once every two or three weeks," sometimes slipping to monthnotes — started "as an accountability mechanism and to get into a habit of writing regularly" (https://simonwillison.net/tags/weeknotes/). A recurring dated format is the single most proven cadence device for journal blogs.
- Counterweight — Evans debunks the consistency myth: you don't have to be consistent (or exciting, or comprehensive); bursts are fine (https://jvns.ca/blog/2023/06/05/some-blogging-myths/). Xe Iaso's site shows burst behavior (multiple posts in a single day, then quiet weeks) across 400+ posts (https://xeiaso.net/).

### Keeping friction near zero
- **Link-blogging**: Willison's "My approach to running a link blog" (https://simonwillison.net/2024/Dec/22/link-blog/): "Sharing interesting links with commentary is a low effort, high value way to contribute to internet life at large." His value-add rules: always name the creators; only recommend what he's actually read; add context, cross-links to his own archive, quotes, screenshots. Goal: "if you read both my post and the source material you'll have an enhanced experience."
- **Tooling that removes steps**: Willison built draft-mode preview URLs so he can write from his phone (https://simonwillison.net/2024/Dec/22/link-blog/); TIL-as-repo means publishing = `git push` (https://github.com/jbranchaud/til).
- **Templates/constraints as the template**: Branchaud's format rules and Webb's "one idea per post" function as templates — the shape of the post is pre-decided so only the content varies.

**Implications for the rebrand**
- Define 2–3 fixed post shapes with built-in constraints (e.g., TIL ≤300 words; "lab note" = what I tried / what happened / open questions; link post = link + 2 paragraphs of commentary) as Jekyll layouts or front-matter defaults.
- Pick a recurring dated anchor — weeknotes or monthnotes — as the cadence backbone; it legitimizes "dump" content by design and survives busy periods (slip to monthnotes rather than silence).
- Adopt one standing rule from Webb: one idea per post; overflow becomes the next post's draft. This turns long dumps into a queue of short entries.
- Since it's already Git + Jekyll, exploit repo-native publishing: a `_til/` collection where a markdown file commit is the entire publish pipeline.

---

## 3. Reader Experience: Keeping a Stream Navigable

### Tags, series, archives
- Willison's blog is built on typed content (entries, blogmarks, quotations) sharing a tag system; tags let a 20+-year archive stay searchable (https://simonwillison.net/2024/Dec/22/link-blog/; https://simonwillison.net/series/blogging/ shows he also groups posts into named **series**).
- Xe Iaso's 400+ articles are navigable through 30+ topic tags and separate sections (Blog, Talks, Notes) (https://xeiaso.net/).
- Archive-page practice: the purpose of an archive page is to let readers reach relevant older content via filters and taxonomies (https://pathfinderseo.com/blog/blog-archive-design-layout/; https://www.smashingmagazine.com/2010/05/website-archives-best-practices-and-showcase/).

### "Start here" pages
A "start here" page outperforms a bare reverse-chronological index for new readers of a long-running blog: it routes people to the best-of posts by theme, which "often get lost in the shuffle" (https://problogger.com/podcast/how-to-create-an-effective-start-here-page-for-your-blog/). For a journal blog this is the antidote to "the stream buries the good stuff."

### Distinguishing note-vs-article post types
This is the load-bearing pattern across every respected journal blog found:
- Willison: entries vs blogmarks vs quotations (https://simonwillison.net/2024/Dec/22/link-blog/), plus TILs on a separate subdomain (https://til.simonwillison.net/).
- Appleton: notes/essays with growth-stage + tended-date metadata (https://maggieappleton.com/garden-history).
- gwern: status/confidence/importance metadata on every page (https://gwern.net/about).
- Xe Iaso: blog vs notes vs shitposts vs talks (https://xeiaso.net/).

### Epistemic status / effort disclaimers
- Appleton: gardeners attach "a short statement that makes clear how they know what they know, and how much time they've invested in researching it" (https://maggieappleton.com/garden-history; https://maggieappleton.com/epistemic-disclosure).
- Zuegel: statuses give "dignity to recognition that you might be wrong" and help readers locate exactly where they disagree (https://devonzuegel.com/epistemic-statuses-are-lazy-and-that-is-a-good-thing).
- swyx's "Digital Garden Terms of Service" (https://www.swyx.io/digital-garden-tos) makes the reader contract explicit: the author reserves "a right to be wrong or incomplete," will retract or rephrase, and readers are "expressly welcome to... counter-argue, or outright disagree."

### /now pages
Derek Sivers created the /now page in 2015 — "what you'd tell a friend you hadn't seen in a year" about current focus, with a last-updated date; it doubles as "a good link to give people when saying no" (https://sive.rs/now2; movement history at https://sive.rs/nowff; directory: https://nownownow.com/about). For a journal blog, /now is the standing summary that individual entries never provide.

### RSS expectations
- Full-text feeds are the strong community norm for personal blogs: they respect the reader's chosen environment, aid accessibility, and reduce missed posts (Neil Brown: https://neilzone.co.uk/2026/04/please-consider-publishing-a-full-text-rss-feed-for-your-website-or-blog/; Kev Quirk: https://kevquirk.com/blog/why-having-a-full-post-rss-feed-is-a-good-idea/; Kevin Cox's best-practices: https://kevincox.ca/2022/05/06/rss-feed-best-practices/).
- Willison additionally advises not to over-invest in design — dated entries and permanent URLs are what matter — and to offer email as well as RSS since many readers now subscribe by newsletter (https://writethatblog.substack.com/p/simon-willison-on-technical-blogging). He mirrors the blog weekly to a Substack (https://simonw.substack.com/).

**Implications for the rebrand**
- Add three cheap navigational fixtures to the Jekyll site: a tag-filtered archive page, a curated "Start here" page (5–10 best entries grouped by theme: LLM routing, tooling, leadership), and a /now page with a last-updated stamp.
- Encode post type in front matter (`type: til | journal | essay | link`) and render a small visible badge — readers instantly calibrate expectations, which is what makes raw entries safe to publish.
- Add a one-line epistemic-status field to journal-type layouts (optional per post), and consider a short "garden terms of service"-style paragraph on the About page.
- Ship full-text RSS (Jekyll: `feed.xml` with full content), and optionally per-tag feeds; keep permalinks stable through the rebrand.

---

## 4. Voice & Authenticity

### First-person tone and writing for your future self
- The journal genre is unapologetically first-person: swyx's core loop is helping "past you," and "by far the biggest beneficiary... is future you" (https://www.swyx.io/learn-in-public). TIL repos are explicitly personal learning journals that happen to be public (https://github.com/jbranchaud/til).
- Willison on voice: develop it by consistent practice, and don't let LLMs write for you — he uses them only "as a thesaurus, as a proofreader and occasionally to check that the argument I'm making does not have any embarrassing holes" (https://writethatblog.substack.com/p/simon-willison-on-technical-blogging). Notable for an AI practitioner: the most credible LLM blogger conspicuously does not delegate his prose to LLMs.
- Evans: write for one specific person rather than everyone; "If it helps one person, I figure I've won" (https://jvns.ca/blog/2023/06/05/some-blogging-myths/). Readers respond to her writing "from a place of vulnerability" — the just-learned perspective is the appeal, not a weakness (https://jvns.ca/blog/2021/05/24/blog-about-what-you-ve-struggled-with/).

### Raw journals still build professional credibility
- Willison attributes most of his career opportunities to the blog: "It turns out having an established blog gives you a surprising amount of influence in a field" — and his journal-style link blog + TILs made him one of the most-cited independent voices on LLMs; his process posts get amplified by Kottke (https://kottke.org/25/01/0045988-simon-willison-shares-his) and Daring Fireball (https://daringfireball.net/linked/2025/01/02/willisons-approach-to-running-a-link-blog). His guardrail: "I value my credibility above all else" — he never links to things he hasn't read (https://writethatblog.substack.com/p/simon-willison-on-technical-blogging; https://simonwillison.net/2024/Dec/22/link-blog/).
- Wes Kao (writes for 300k+ operators; weekly newsletter) argues the differentiator for leaders is a "spiky point of view": "a thesis about something in your realm of expertise that other experts might disagree with" — defensible, rooted in experience, and explicitly *not* "a hot take or a mic drop moment" (https://newsletter.weskao.com/; https://www.radletters.com/blog/develop-your-spiky-point-of-view-with-wes-kao). For an engineering lead, journal entries that take positions ("I route cheap prompts to model X because...") build more authority than neutral summaries.
- Karlsson: writing at the edge of your knowledge is precisely what attracts peers who route better ideas back to you (https://www.henrikkarlsson.xyz/p/search-query).

### Pitfalls (career risk of half-baked takes) and mitigations
- The risk is real: journal posts are written at the edge of the author's knowledge, so mistakes are frequent. Evans' documented mitigations ("Some tactics for writing in public," https://jvns.ca/blog/2023/08/07/tactics-for-writing-in-public/): fix mistakes fast ("usually I'll stay near a computer for a few hours after I post... so that I can fix mistakes quickly"); hedge uncertain claims; state open questions explicitly ("people LOVE answering questions"); preempt predictable objections ("I decided not to do X because of A B C"); and deliberately avoid flamewar-prone topics.
- Status labels as risk insurance: "It's ok to be a bit wrong sometimes, as long as you make it clear when you aren't sure about a thing" (Caro, "Writing blog posts about things I'm not an expert in," https://www.caro.fyi/articles/blogging-not-expert/); Zuegel's epistemic statuses exist exactly to publish half-baked ideas safely (https://devonzuegel.com/epistemic-statuses-are-lazy-and-that-is-a-good-thing); swyx's garden TOS pre-negotiates the right to be wrong (https://www.swyx.io/digital-garden-tos).
- Employer separation: Xe Iaso's standing disclaimer — "Any and all opinions listed here are my own and not representative of any of my employers, past, future, and/or present" (https://xeiaso.net/).
- Kao's line between spiky and reckless: conviction rooted in evidence and experience, never contrarianism for reaction (https://www.radletters.com/blog/develop-your-spiky-point-of-view-with-wes-kao).

**Implications for the rebrand**
- Keep the raw first-person register — it is the genre's asset — but pair it with visible hygiene: status labels, dated updates, and fast public corrections. Rawness + transparency reads as senior; rawness alone can read as careless.
- As a lead/AI practitioner, let entries take defensible positions (spiky POV) grounded in the actual experiments being journaled; avoid ungrounded hot takes on flamewar topics (model-war tribalism, "X is dead").
- Add a site-wide disclaimer (opinions ≠ employer) and a "living document / I will be wrong sometimes" paragraph modeled on swyx's garden TOS.
- If using LLMs in the writing loop, follow Willison's norm: assistant, not author — stated openly, since AI-practitioner readers will care.

---

## 5. Concrete Exemplars and Their Mechanics

1. **Simon Willison — simonwillison.net + til.simonwillison.net** (software engineer, now leading independent LLM voice)
   - Post types: long entries, blogmarks (links), quotations — plus a separate TIL site (346+ TILs, most written in <10 min). (https://simonwillison.net/2024/Dec/22/link-blog/; https://simonwillison.net/2022/Nov/6/what-to-blog-about/)
   - Cadence devices: weeknotes tag, 193 posts 2019–2025, target every 2–3 weeks (https://simonwillison.net/tags/weeknotes/); weekly email digest via Substack (https://simonw.substack.com/).
   - Disciplines: name creators, never link unread material, add context/quotes/cross-links; draft-preview tooling for phone publishing. (https://simonwillison.net/2024/Dec/22/link-blog/)
   - Lesson: journal formats (links, TILs, weeknotes) compounded into field-level influence in AI.

2. **Julia Evans — jvns.ca**
   - Mechanics: short "I just learned this" posts; hedged claims ("I think..."); rapid post-publication fixes; questions embedded in posts; write-for-one-person targeting; topic selection that avoids flamewars. (https://jvns.ca/blog/2023/06/05/some-blogging-myths/; https://jvns.ca/blog/2023/08/07/tactics-for-writing-in-public/; https://jvns.ca/blog/2021/05/24/blog-about-what-you-ve-struggled-with/)
   - Lesson: expertise not required — "you actually just need to know 1-2 interesting things that the reader doesn't."

3. **swyx — swyx.io**
   - Mechanics: Learn in Public manifesto as the operating system; a "Digital Garden Terms of Service" that reserves the right to be wrong and invites disagreement; mix of essays and lighter notes. (https://www.swyx.io/learn-in-public; https://www.swyx.io/digital-garden-tos)
   - Lesson: pre-negotiate the reader contract so half-formed posts carry no reputational surprise.

4. **Xe Iaso — xeiaso.net**
   - Mechanics: 400+ posts across typed sections (blog / notes / shitposts / talks); 30+ tags; bursty cadence (several posts in a day is normal); standing employer disclaimer; signature conversational device — dialogues with recurring characters (e.g., Mara), implemented in their custom Markdown pipeline. (https://xeiaso.net/; https://xeiaso.net/blog/how-mara-works-2020-09-30/)
   - Lesson: a strong persona and honest post-type labels ("shitposts") make an informal stream feel intentional, not sloppy.

5. **Matt Webb — interconnected.org**
   - Mechanics: 15 written rules ("Three posts a week, more or less"; "One idea per post"; "Give up on attempting to be right"); 300+-week posting streak; invented weeknotes in 2009 as "a special way to think out loud"; calls the blog his public notebook. (https://interconnected.org/home/2020/09/10/streak; https://interconnected.org/home/2025/02/19/reflections; https://medium.com/job-garden/a-pre-history-of-weeknotes-plus-why-i-write-them-and-perhaps-why-you-should-too-week-16-31a4a5cbf7b0)
   - Lesson: explicit personal rules beat willpower; volume makes any single weak post irrelevant.

6. **Maggie Appleton — maggieappleton.com**
   - Mechanics: garden of notes/essays with growth stages (seedling/budding/evergreen), planted + last-tended dates, epistemic status disclosures. (https://maggieappleton.com/garden-history; https://maggieappleton.com/epistemic-disclosure)
   - Lesson: metadata, not polish, is what makes unfinished work publishable.

7. **gwern — gwern.net**
   - Mechanics: "perpetual drafts" / Long Content; every page tagged with status, confidence, and importance. (https://gwern.net/about)
   - Lesson: the far pole of the spectrum — even maximal-effort content benefits from journal-style status honesty; useful model for any future evergreen pieces.

8. **Josh Branchaud — github.com/jbranchaud/til**
   - Mechanics: repo-as-blog, 1,600–1,800+ TILs over 10 years, folders by topic, hard constraints (≤200 words, ≤50-char titles, 5–10 minutes each); publishing = git commit. (https://github.com/jbranchaud/til; https://www.visualmode.dev/a-decade-of-tils)
   - Lesson: constraints are the engine of decade-long consistency; a GitHub-native flow suits a GitHub Pages blog perfectly.

9. **Supporting models**: Wes Kao (weekly operator newsletter; spiky-POV credibility for leaders — https://newsletter.weskao.com/); Tom Critchlow (Jekyll + GitHub Pages wiki-garden coexisting with a blog — https://tomcritchlow.com/2019/02/17/building-digital-garden/); Derek Sivers (/now page — https://sive.rs/now2).

**Implications for the rebrand**
- The closest role models for this specific blog are Willison (AI journaling with typed posts + link blog) and Branchaud/Critchlow (Git/Jekyll-native mechanics); borrow Willison's post-type taxonomy and Branchaud's constraints.
- Steal one signature device to make the journal feel designed: visible post-type badges (Xe), growth-stage emoji (Appleton), or a weeknotes series (Webb/Willison).
- Publish the operating rules (à la Webb's 15 rules or swyx's TOS) as a short page — it converts "informal dump blog" into "deliberate public notebook" in readers' eyes.

---

## Sources

**Philosophy**
- swyx, "Learn In Public" — https://www.swyx.io/learn-in-public
- Simon Willison, "What to blog about" — https://simonwillison.net/2022/Nov/6/what-to-blog-about/
- Henrik Karlsson, "A blog post is a very long and complex search query..." — https://www.henrikkarlsson.xyz/p/search-query
- Maggie Appleton, "A Brief History & Ethos of the Digital Garden" — https://maggieappleton.com/garden-history
- Maggie Appleton, "Epistemic Disclosure" — https://maggieappleton.com/epistemic-disclosure
- gwern, "About This Website" (Long Content) — https://gwern.net/about
- Tom Critchlow, "Of Digital Streams, Campfires and Gardens" — https://tomcritchlow.com/2018/10/10/of-gardens-and-wikis/
- Tom Critchlow, "Building a digital garden" — https://tomcritchlow.com/2019/02/17/building-digital-garden/

**Lowering the bar / cadence**
- Matt Webb, "15 rules for blogging, and my current streak" — https://interconnected.org/home/2020/09/10/streak
- Matt Webb, "Reflections on 25 years of Interconnected" — https://interconnected.org/home/2025/02/19/reflections
- Matt Webb, "A pre-history of weeknotes" — https://medium.com/job-garden/a-pre-history-of-weeknotes-plus-why-i-write-them-and-perhaps-why-you-should-too-week-16-31a4a5cbf7b0
- Julia Evans, "Some blogging myths" — https://jvns.ca/blog/2023/06/05/some-blogging-myths/
- Simon Willison, "My approach to running a link blog" — https://simonwillison.net/2024/Dec/22/link-blog/
- Simon Willison, weeknotes tag — https://simonwillison.net/tags/weeknotes/
- Simon Willison, "How I blog" series index — https://simonwillison.net/series/blogging/
- Cynthia Dunlop, "Simon Willison on Technical Blogging" — https://writethatblog.substack.com/p/simon-willison-on-technical-blogging
- Josh Branchaud, TIL repo — https://github.com/jbranchaud/til
- Josh Branchaud, "A Decade of TILs" — https://www.visualmode.dev/a-decade-of-tils

**Reader experience**
- Derek Sivers, "How and why to make a /now page" — https://sive.rs/now2
- Derek Sivers, "The /now page movement" — https://sive.rs/nowff
- nownownow.com about — https://nownownow.com/about
- ProBlogger, "Why You Should Create a Start Here Page" — https://problogger.com/podcast/how-to-create-an-effective-start-here-page-for-your-blog/
- PathfinderSEO, blog archive design — https://pathfinderseo.com/blog/blog-archive-design-layout/
- Smashing Magazine, "Website Archives: Best Practices" — https://www.smashingmagazine.com/2010/05/website-archives-best-practices-and-showcase/
- Neil Brown, "Please consider publishing a full-text RSS feed" — https://neilzone.co.uk/2026/04/please-consider-publishing-a-full-text-rss-feed-for-your-website-or-blog/
- Kev Quirk, "Why Having A Full Post RSS Feed Is A Good Idea" — https://kevquirk.com/blog/why-having-a-full-post-rss-feed-is-a-good-idea/
- Kevin Cox, "RSS Feed Best Practices" — https://kevincox.ca/2022/05/06/rss-feed-best-practices/
- Simon Willison newsletter — https://simonw.substack.com/

**Voice, credibility, risk**
- Julia Evans, "Some tactics for writing in public" — https://jvns.ca/blog/2023/08/07/tactics-for-writing-in-public/
- Julia Evans, "Blog about what you've struggled with" — https://jvns.ca/blog/2021/05/24/blog-about-what-you-ve-struggled-with/
- Devon Zuegel, "Epistemic statuses are lazy, and that is a good thing" — https://devonzuegel.com/epistemic-statuses-are-lazy-and-that-is-a-good-thing
- Caro, "Writing blog posts about things I'm not an expert in" — https://www.caro.fyi/articles/blogging-not-expert/
- swyx, "Digital Garden Terms of Service" — https://www.swyx.io/digital-garden-tos
- Wes Kao newsletter — https://newsletter.weskao.com/
- Rad Letters, "Develop Your Spiky Point of View with Wes Kao" — https://www.radletters.com/blog/develop-your-spiky-point-of-view-with-wes-kao
- Kottke on Willison's link blog — https://kottke.org/25/01/0045988-simon-willison-shares-his
- Daring Fireball on Willison's link blog — https://daringfireball.net/linked/2025/01/02/willisons-approach-to-running-a-link-blog

**Exemplars**
- Xe Iaso — https://xeiaso.net/ and "How Mara Works" — https://xeiaso.net/blog/how-mara-works-2020-09-30/
- Simon Willison TILs — https://til.simonwillison.net/
- Chris Coyier, "Julia Evans on Blogging" — https://chriscoyier.net/2023/09/06/julia-evans-on-blogging/
