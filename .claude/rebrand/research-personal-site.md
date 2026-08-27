# Best Practices for a Personal Site: AI Practitioner + Hands-on Dev + Engineering Lead

Research report for the Rynaro.github.io rebrand (Jekyll on GitHub Pages). July 2026.

---

## 1. Positioning & Personal Branding

**Coherence beats breadth.** Practitioner guides converge on the same first step: define what you want to be known for before touching design. Identify the specific problems you solve and narrow the focus so employers/peers can categorize you — then tell *the same story* across the site, GitHub, and LinkedIn ([freeCodeCamp personal branding handbook](https://www.freecodecamp.org/news/personal-branding-for-devs-handbook/), [Proxify guide](https://career.proxify.io/article/guide-to-personal-branding-for-software-engineers)). The personal website is repeatedly called the single best branding asset because it shows work regardless of employer and is itself a demonstration of craft ([freeCodeCamp](https://www.freecodecamp.org/news/build-your-personal-brand-as-a-developer/)).

**The multi-hat problem has a proven pattern: a compound one-liner + "eras."** swyx (Shawn Wang) is the best live example of someone holding exactly this tri-identity (AI + dev + community/leadership). His homepage leads with a compound identity statement ("Writer, Founder, Devtools Startup Advisor") instead of a job title, then organizes talks/writing by *era* — JavaScript/React era → AI Engineer era — which validates past IC work while making the current AI focus unmistakable. The site privileges ideas and influence over credentials: "popular writing" and "popular speaking" are first-class nav items, not a CV ([swyx.io](https://swyx.io/)).

**Leads earn credibility through operating, not through claiming leadership.** Will Larson's "Writers who operate" argues the most valuable industry writers are those who write *while holding a real role* — operating is "an endless source of new topics" and keeps writing honest, versus full-time thought-leadership that chases trending topics ([lethain.com/writers-who-operate](https://lethain.com/writers-who-operate/)). The corollary for a personal site: the leadership narrative should emerge from written evidence (decisions, retros, strategy notes), not from a "Leader. Visionary." tagline.

**AI-era relevance without hype = show receipts.** Simon Willison — arguably the most trusted independent LLM voice — built that trust on "do stuff and then blog about it," which he calls "one of the most underrated pieces of career advice" ([tweet](https://x.com/simonw/status/1783491337867960321?lang=en)). swyx's "Learn in Public" supplies the mechanism: "Make the thing you wish you had found when you were learning," and share it consistently — mentors and opportunities follow ([swyx.io/learn-in-public](https://swyx.io/learn-in-public)).

**Implications for the Jekyll rebrand:**
- Write one compound identity sentence (e.g., "Engineering lead who still ships — writing about LLM systems in production") and repeat it verbatim on homepage hero, About, meta description, and social bios.
- Don't split the three personas into three site sections; unify them under one narrative ("I lead teams *and* build AI systems, and I write about both") — swyx's "eras" trick works for the history: Rails/backend era → leadership era → AI era.
- Let leadership credibility come from operating content (posts about real decisions), not titles; keep IC credibility via code-anchored posts and TILs.
- Kill any generic tagline ("passionate about technology"); the first 3–4 words of the hero must state what you actually do.

---

## 2. Information Architecture

**Consensus page set.** Across guides: Home, About, Writing/Blog, Projects/Work, Contact are the essentials, with Resume/CV optional as a link rather than a page ([Network Solutions](https://www.networksolutions.com/blog/personal-website-pages/), [Anna Rossetti's guide](https://annarossetti.com/articles/how-to-make-a-website/), [curious.page 2026 examples roundup](https://curious.page/blog/best-personal-website-examples-developers)). Guides for developers specifically add: a blog is the traffic and credibility engine, and project entries should state purpose, role, stack, and link to code/live demo ([dev.to ultimate guide](https://dev.to/devmakasana/the-ultimate-guide-to-creating-a-personal-website-as-a-developer-55pn)).

**/now — a public declaration of priorities.** Derek Sivers' /now page pattern (now 2,300+ sites at [nownownow.com](https://nownownow.com/about)) answers "what are you focused on right now" — "what you'd tell a friend you hadn't seen in a year" — with a last-updated date. It fills the gap between a static About page and social feeds, and doubles as a polite way to decline requests ([sive.rs/now2](https://sive.rs/now2), [sive.rs/nowff](https://sive.rs/nowff), [IndieWeb wiki](https://indieweb.org/now)). For a lead, it's the cheapest possible "current role + current obsessions" signal.

**/uses — small page, outsized search traffic.** Wes Bos's /uses convention (directory at [uses.tech](https://uses.tech/), [awesome-uses repo](https://github.com/wesbos/awesome-uses)) documents editor/terminal/hardware/config. It exists because people constantly ask and search for tool recommendations — one guide notes uses pages are "surprisingly popular and great for SEO" ([dev.to guide](https://dev.to/devmakasana/the-ultimate-guide-to-creating-a-personal-website-as-a-developer-55pn), [wesbos.com/uses](https://wesbos.com/uses)). In 2026 a /uses page is also a natural, hype-free home for your actual AI toolchain (agents, models, harnesses).

**Homepage must serve two reading speeds.** Hero-section research: headline + 1–2 supporting sentences + a clear next step; if the first few words don't explain what you do, visitors bounce ([Trajectory hero formulas](https://www.trajectorywebdesign.com/blog/website-hero-message/), [Prismic hero guide](https://prismic.io/blog/website-hero-section)). The recruiter/peer path needs About/Projects/Contact one click away; the casual reader path needs recent + best writing immediately visible. swyx solves this with "Latest" + "Popular" side by side ([swyx.io](https://swyx.io/)); Will Larson keeps a curated [/featured](https://lethain.com/featured/) page so 15 years of archives don't bury the best work.

**Digital-garden option.** Maggie Appleton's essay defines gardens as organized by "contextual relationships and associative links" rather than reverse chronology, embracing visible imperfection and continuous revision ([maggieappleton.com/garden-history](https://maggieappleton.com/garden-history)). Rach Smith runs her whole site this way ([rachsmith.com](https://rachsmith.com/)). It's a fit if you want low-pressure publishing, but chronological blogs remain the stronger credibility format for leads (dated, permalinked evidence of thinking over time).

**Implications for the Jekyll rebrand:**
- Target IA: Home, About, Writing (with tags/series), Projects, /now, /uses, Contact (footer-level), plus /feed.xml. All are trivial as Jekyll pages/collections — no plugins needed beyond what GitHub Pages whitelists.
- Homepage = one-liner hero → 3–5 "start here / best of" posts → recent posts list → quiet links to About/Projects/now. No carousel, no skill bars, no animated hero.
- Add a hand-curated "Featured/Start here" page (Larson pattern) — cheap in Jekyll via front-matter flag (`featured: true`) and a loop.
- Date-stamp /now updates and link it from the About page and footer; register it at nownownow.com for a free backlink.

---

## 3. Content Strategy for Credibility

**Writing is the main asset — especially for leads.** Blog writing is repeatedly tied to promotion cases ("completing and communicating a significant technical achievement is often a key factor for promotion to Staff Engineer") and to hiring: "If they also find a personal blog full of your writing and your code, you just jumped ahead of 95% of applicants" ([Manning: Why Write Engineering Blogs](https://manningbooks.medium.com/why-write-engineering-blogs-fc60d28673c0), [Chase Seibert](https://chase-seibert.github.io/blog/2014/08/01/why-blogging.html)). Larson's whole engineering-leadership brand is a writing corpus that became three books ([lethain.com](https://lethain.com/), [staffeng.com](https://staffeng.com/about/)).

**The two lowest-friction, highest-yield formats: TILs and project write-ups.** Simon Willison: "Write about things you've learned, and write about things you've built." TILs are "liberating" because "you're not promising anyone a revelation" — most take under 10 minutes; and for projects, "writing about something is the cost I have to pay for building it" — add "write about it" to your definition of done. Include screenshots/GIFs because demos bit-rot ([What to blog about](https://simonwillison.net/2022/Nov/6/what-to-blog-about/), [interview](https://writethatblog.substack.com/p/simon-willison-on-technical-blogging)).

**Debunked blockers.** Julia Evans' "Some blogging myths": you don't need to be original ("Just because there is information on the internet, it doesn't get magically teleported into people's brains!"), you don't need to be an expert ("you just need to know 1-2 interesting things that the reader doesn't"), you don't need to be 100% right (use "my understanding is…"), page views don't matter, and short posts are fine — "The best way to 'win' is to make a lot of stuff" ([jvns.ca](https://jvns.ca/blog/2023/06/05/some-blogging-myths/)). Her companion principle: blog about what you struggled with — if you struggled, others are struggling too ([cdevroe summary](https://cdevroe.com/2021/05/26/julia-evans-stuggle-blogging/)).

**What makes lead-tier writing land: grounded opinion.** Sean Goedecke (GitHub engineer, one of the most-read new eng blogs of 2024–25): the posts that resonate express "a clear opinion about working in tech that many people disagree with," grounded in actual work experience — and he's "as upfront as possible about the quantity and nature of my actual experience." Practical notes: keep 7–8 drafts going, don't obsess over infrastructure, and set up RSS *before* you have traction (he regrets losing early readers) ([seangoedecke.com/on-writing](https://www.seangoedecke.com/on-writing/)).

**Showing AI work without hype.** AI-portfolio guidance in 2026 is blunt: hiring managers see hundreds of "completed the LLM course" portfolios; what stands out is production instinct — error handling, evals, deployment, honest documentation of what broke and why; "a strong portfolio shows how you think about tradeoffs, not just how fast you can ship a demo" ([DataExpert guide](https://www.dataexpert.io/blog/ultimate-guide-ai-engineering-portfolios), [Let's Data Science](https://letsdatascience.com/blog/the-ml-portfolio-that-actually-gets-you-hired-in-2026), [dev.to](https://dev.to/klement_gunndu/5-ai-portfolio-projects-that-actually-get-you-hired-in-2026-5bpl)). Eugene Yan is the model: writing that turns "practical experience into clear, useful guidance for builders," which made him a reference voice for production ML/LLM systems ([eugeneyan.com/about](https://eugeneyan.com/about/), [Amazon Science profile](https://www.amazon.science/working-at-amazon/eugene-yan-and-the-art-of-writing-about-science)). A link blog is the second AI-credibility device: Willison's blogmarks always "add value beyond just the link" and credit creators by name — curation as expertise ([My approach to running a link blog](https://simonwillison.net/2024/Dec/22/link-blog/)).

**Project pages vs GitHub links.** Consensus: 3–5 standout projects beat exhaustive lists; each project page should be skimmable in 60–90 seconds — problem, role, architecture, stack, metrics, post-launch evolution — with GitHub as the deep link, not the landing page ([Fonzi](https://fonzi.ai/blog/portfolio-for-engineer), [DataExpert](https://www.dataexpert.io/blog/ultimate-guide-ai-engineering-portfolios)). Willison's stronger framing: the *write-up about building it* is the project page — your experience is unique even when the project isn't ([What to blog about](https://simonwillison.net/2022/Nov/6/what-to-blog-about/)).

**Implications for the Jekyll rebrand:**
- Add a TIL section as a second Jekyll collection (or a `til` category) with its own index and feed scope — high-frequency, low-stakes publishing next to fewer, deeper essays.
- Make each flagship project a short on-site page (problem → role → stack → what broke → outcome) linking out to GitHub; retire any auto-generated repo list.
- For AI content, adopt the "evals and tradeoffs, not demos" register: publish what you measured and what failed; consider a lightweight link-blog post type for LLM news with your commentary.
- Write 2–3 "operating" posts (real leadership decisions, migrations, incident retros — anonymized) to carry the lead narrative; opinions grounded in experience, caveated honestly.

---

## 4. Design & UX Norms

**Text-first, minimal, fast is the prestige aesthetic for this audience.** Dan Luu's pure-HTML site is the extreme proof: his web-bloat research found much of the modern web unusable on slow connections/devices while lightweight blogs stayed readable, and his own stock-Octopress setup once took ~12s to first render before he stripped it down ([danluu.com/web-bloat](https://danluu.com/web-bloat/), [slow-device](https://danluu.com/slow-device/), [octopress-speedup](https://danluu.com/octopress-speedup/)). Minimalist-build guides land at the same place: content-first, ~150 lines of CSS can include syntax highlighting and dark mode, neutral base + one accent color, JS optional and only for enhancements like a theme toggle ([Minimalist's Guide](https://levelup.gitconnected.com/the-minimalists-guide-to-building-a-fast-personal-website-12dafd595915), [companion piece](https://levelup.gitconnected.com/how-to-build-a-minimalist-website-thats-fast-accessible-and-responsive-d556e8bec78b)). Note the counterpoint: Josh Comeau's maximal-whimsy interactive blog is also beloved — but it *is* his product (he sells interaction-design courses); for a lead/AI writer, minimal-fast better matches the message.

**Typography carries the whole site.** Content-heavy personal sites live or die on readable body text, clear heading hierarchy, and mobile-tested sizes ([minimalist guides above](https://levelup.gitconnected.com/the-minimalists-guide-to-building-a-fast-personal-website-12dafd595915)).

**Dark mode: respect the OS, offer an override.** Use `@media (prefers-color-scheme: dark)` to follow system preference, plus a manual toggle; avoid pure `#000` backgrounds; keep WCAG contrast (4.5:1 body, 3:1 large text) in both themes; build on CSS custom properties so both themes share one token set ([Smashing Magazine: Inclusive Dark Mode](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/), [WCAG contrast guide](https://www.webability.io/blog/color-contrast-for-accessibility)). Accessibility baseline: semantic landmarks (`header/nav/main/footer`), visible focus states in both themes, screen-reader spot checks ([same sources](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)).

**RSS is a first-class feature again.** RSS is having a documented resurgence as readers flee algorithmic, AI-flooded feeds for deliberately chosen human sources ([kenmorico](https://kenmorico.com/vault/rss-feeds-for-blogs), [idiallo](https://idiallo.com/blog/is-rss-still-relevant)). Practitioners specifically ask for **full-text** feeds, not summaries ([neilzone: "Please consider publishing a full-text RSS feed"](https://neilzone.co.uk/2026/04/please-consider-publishing-a-full-text-rss-feed-for-your-website-or-blog/), [Giles Thomas](https://www.gilesthomas.com/2025/03/full-text-in-rss)). And Goedecke's regret — add RSS *before* traction ([on-writing](https://www.seangoedecke.com/on-writing/)).

**Implications for the Jekyll rebrand:**
- Performance budget: aim for a page that's readable with CSS alone — no JS on article pages except (optionally) a theme toggle; Jekyll/GitHub Pages already ships zero JS by default, so the main work is auditing the theme's CSS/fonts (system font stack or one self-hosted variable font).
- Implement dark mode with CSS custom properties + `prefers-color-scheme` + a tiny toggle; verify 4.5:1 contrast in both themes.
- Ship jekyll-feed with **full-text** output, link the feed visibly in header/footer (not just `<link rel>`), and consider separate tag-scoped feeds (e.g., /ai.xml) for readers who only want one persona's content.
- One accent color, strong type hierarchy, semantic HTML landmarks, visible focus rings — treat this as the entire "design system."

---

## 5. Discoverability

**Jekyll/GitHub Pages SEO is three whitelisted plugins + discipline.** `jekyll-seo-tag` (GitHub-endorsed) emits title/description/canonical/Open Graph/Twitter/JSON-LD from front matter; `jekyll-sitemap` generates the sitemap; `jekyll-feed` the Atom feed ([jekyll-seo-tag repo](https://github.com/jekyll/jekyll-seo-tag), [Sinibardy's beginner guide](https://jsinibardy.com/optimize-seo-jekyll), [Nikhita Raghunath: SEO for Jekyll blogs](https://www.nikhita.dev/seo-jekyll)). Gotchas: set `url`/`baseurl` correctly so canonical URLs match the serving domain (GitHub Pages redirects take precedence), add robots.txt pointing at the sitemap, verify in Google Search Console, and write per-post `description` front matter ([McGarrah: Jekyll canonical fixes](https://www.mcgarrah.org/jekyll-seo-sitemap-canonical-url-fixes/), [dev.to complete guide](https://dev.to/dss99911/optimizing-jekyll-for-seo-complete-guide-4hl9)).

**Social cards are the highest-leverage low-effort win.** og:title/description/image/url + `twitter:card=summary_large_image` control the preview on LinkedIn/X/Slack/Discord; 1200×630 og:image; OG isn't a Google ranking factor but optimized cards see materially higher CTR, which drives the links that *are* ranking factors ([Semrush OG guide](https://www.semrush.com/blog/open-graph/), [toolk.site complete guide](https://www.toolk.site/blog/open-graph-meta-tags-guide)).

**IndieWeb: own the canonical identity, syndicate outward.** POSSE = Publish on your Own Site, Syndicate Elsewhere — your domain stays the canonical URL and identity while copies flow to the networks where readers are ([indieweb.org/POSSE](https://indieweb.org/POSSE), [Matthias Ott: Welcome to the IndieWeb](https://matthiasott.com/notes/welcome-to-the-indieweb)). Webmentions can pull back likes/replies from around the web, but they're an enhancement, not a requirement ([joelotter on POSSE](https://www.joelotter.com/posts/2023/03/indieweb/), [dasroot webmentions overview](https://dasroot.net/posts/2026/03/webmentions-indieweb-social-interactions/)).

**Cross-posting: fine, with canonical discipline.** dev.to has a first-class canonical_url field; Medium requires importing (not pasting) to get the canonical link right; without canonical tags, duplicates can outrank or penalize you ([Dom Habersack: Protect your SEO when crossposting](https://domhabersack.com/blog/seo-when-crossposting), [dev.to canonical thread](https://dev.to/arikfr/cross-post-blog-posts-to-devto-414i), [Medium canonical guide](https://medium.com/blogging-guide/understanding-canonical-links-and-medium-article-seo-for-your-blog-or-website-25a5afe2b71c)). dev.to typically out-engages Medium for technical content ([Ali Spittel's comparison](https://dev.to/aspittel/comment/b8f5)). The strategic frame: platforms can hold your work hostage or die; publish on your domain first, always ([O'Reilly Technical Blogging](https://www.oreilly.com/library/view/technical-blogging-2nd/9781680507126/f_0094.xhtml)).

**Human-authored writing is a differentiator now.** With AI slop flooding feeds, readers actively seek "writing that feels grounded in real expertise, real experience, and real perspective" — the personal blog's value is *rising* ([compose.ly](https://www.compose.ly/content-strategy/are-blogs-still-relevant), [Axios on AI vs human content](https://www.axios.com/2025/10/14/ai-generated-writing-humans)). Voice and specificity are SEO strategy.

**Implications for the Jekyll rebrand:**
- Enable the GitHub-Pages-whitelisted trio (`jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`); set `url:` correctly; add robots.txt + Search Console verification; require `description` (and optionally `image`) in every post's front matter.
- Create a default 1200×630 OG image template (name + one-liner, on-brand colors) and per-post images for flagship essays only.
- Adopt POSSE: your domain is canonical; syndicate to dev.to via its canonical_url field (skip Medium unless there's an existing audience); link posts from LinkedIn/X rather than re-writing them there.
- Skip webmentions for launch (needs JS/third-party service like webmention.io); revisit later — RSS + OG + canonical discipline covers 90% of the value.

---

## 6. Concrete Exemplars

1. **Simon Willison — simonwillison.net** (independent AI researcher/tooling). What works: three interleaved content velocities — long essays, a high-volume link blog with value-added commentary and creator credit, and TILs — all dated and permalinked; projects always get write-ups ("write about it" is in his definition of done). The result is *the* reference model for AI credibility without hype: evidence accumulates daily. ([What to blog about](https://simonwillison.net/2022/Nov/6/what-to-blog-about/), [link blog approach](https://simonwillison.net/2024/Dec/22/link-blog/), [interview](https://writethatblog.substack.com/p/simon-willison-on-technical-blogging))
2. **Julia Evans — jvns.ca** (dev tooling/systems). What works: relentless approachability — blogs what she struggled with, uses qualifiers instead of false authority, values one helped reader over pageviews; the personality (exclamation marks, zines/comics) makes deep systems content feel welcoming. Proof that voice is a moat. ([Some blogging myths](https://jvns.ca/blog/2023/06/05/some-blogging-myths/), [Why Julia Evans's blog is so great](https://www.harihareswara.net/posts/2013/why-julia-evanss-blog-is-so-great/), [Chris Coyier on Evans](https://chriscoyier.net/2023/09/06/julia-evans-on-blogging/))
3. **swyx — swyx.io** (AI Engineer movement founder; ex-Netlify/AWS). What works: compound identity tagline; Latest + Popular split serving both new and returning readers; talks/writing organized by career "eras" so the React past reinforces rather than muddies the AI present; two audience-scoped newsletters. The template for multi-persona coherence. ([swyx.io](https://swyx.io/), [Learn in Public](https://swyx.io/learn-in-public))
4. **Will Larson — lethain.com** (CTO; author of *Staff Engineer*, *An Elegant Puzzle*). What works: pure writing corpus, no portfolio theater; a curated /featured page surfaces the best of 15+ years; books grew out of the blog. The template for engineering-leadership credibility. ([lethain.com](https://lethain.com/), [featured](https://lethain.com/featured/), [Writers who operate](https://lethain.com/writers-who-operate/))
5. **Eugene Yan — eugeneyan.com** (Anthropic, ex-Amazon applied science). What works: "Writing helps me learn better… it attracts like-minded readers"; production-grounded LLM/ML system patterns turned him into a reference voice; clean Writing/About/Speaking IA with a strong "start here" set. The template for the AI-practitioner persona. ([eugeneyan.com/about](https://eugeneyan.com/about/), [Amazon Science profile](https://www.amazon.science/working-at-amazon/eugene-yan-and-the-art-of-writing-about-science))
6. **Dan Luu — danluu.com** (perf/systems researcher). What works: near-zero styling, pure-HTML pages backed by his own measurements of web bloat on slow devices; the anti-design *is* the brand statement: nothing here but ideas. The template for the text-first pole. ([web-bloat](https://danluu.com/web-bloat/), [slow-device](https://danluu.com/slow-device/))
7. **Josh Comeau — joshwcomeau.com** (interaction/CSS educator). What works: interactive MDX widgets embedded in posts; "whimsy" as differentiator. Instructive as the *opposite* pole: heavy interactivity works because it demonstrates the exact skill he sells — a reminder that design maximalism must be on-message. ([How I Built My Blog v2](https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/))
8. **Rach Smith — rachsmith.com** (CodePen engineer). What works: explicitly "no longer a blog" — a digital garden mixing short in-progress thoughts with considered notes; Obsidian→Astro sync makes publishing nearly frictionless, which sustains volume; /now page; honest personal register alongside dev content. The template for low-pressure sustained publishing. ([rachsmith.com](https://rachsmith.com/), [How I wrote more](https://rachsmith.com/how-i-wrote-more/), [garden concept: Maggie Appleton](https://maggieappleton.com/garden-history))
9. **Sean Goedecke — seangoedecke.com** (GitHub staff-level engineer). What works: opinionated essays on how tech companies actually work, grounded in and caveated by stated experience; minimal site, fast rise (2024–25) proving text + opinion + honesty still compounds quickly; his documented lesson: ship RSS on day one. ([on-writing](https://www.seangoedecke.com/on-writing/))

**Implications for the Jekyll rebrand:**
- Closest structural models to copy: Eugene Yan (AI-practitioner IA: Writing / Start-here / About / Speaking) crossed with Larson (featured page, leadership essays) and Willison's TIL/link-blog cadence for freshness.
- Sit deliberately on the Dan Luu–side of the design spectrum (fast, text-first) but with Yan-level typography polish; skip Comeau-style interactivity — it's off-message for a lead/AI writer.
- Steal swyx's "eras" framing for the About page to make Rails/backend history + leadership + AI read as one arc.
- Adopt the garden *ethos* (publish imperfect, revise openly, "last updated" stamps) without abandoning chronological posts — dated permalinks are the credibility substrate every exemplar shares.

---

## Sources

**Positioning & branding**
- https://www.freecodecamp.org/news/personal-branding-for-devs-handbook/
- https://www.freecodecamp.org/news/build-your-personal-brand-as-a-developer/
- https://career.proxify.io/article/guide-to-personal-branding-for-software-engineers
- https://www.educative.io/blog/build-personal-brand-software-engineer
- https://swyx.io/learn-in-public
- https://swyx.io/
- https://lethain.com/writers-who-operate/
- https://x.com/simonw/status/1783491337867960321?lang=en

**Information architecture**
- https://sive.rs/now2 ; https://sive.rs/nowff ; https://nownownow.com/about ; https://indieweb.org/now
- https://uses.tech/ ; https://github.com/wesbos/awesome-uses ; https://wesbos.com/uses
- https://dev.to/devmakasana/the-ultimate-guide-to-creating-a-personal-website-as-a-developer-55pn
- https://www.networksolutions.com/blog/personal-website-pages/
- https://annarossetti.com/articles/how-to-make-a-website/
- https://curious.page/blog/best-personal-website-examples-developers
- https://www.trajectorywebdesign.com/blog/website-hero-message/ ; https://prismic.io/blog/website-hero-section
- https://maggieappleton.com/garden-history
- https://lethain.com/featured/

**Content strategy**
- https://simonwillison.net/2022/Nov/6/what-to-blog-about/
- https://simonwillison.net/2024/Dec/22/link-blog/
- https://writethatblog.substack.com/p/simon-willison-on-technical-blogging
- https://jvns.ca/blog/2023/06/05/some-blogging-myths/
- https://cdevroe.com/2021/05/26/julia-evans-stuggle-blogging/
- https://www.seangoedecke.com/on-writing/
- https://manningbooks.medium.com/why-write-engineering-blogs-fc60d28673c0
- https://chase-seibert.github.io/blog/2014/08/01/why-blogging.html
- https://staffeng.com/about/
- https://www.dataexpert.io/blog/ultimate-guide-ai-engineering-portfolios
- https://letsdatascience.com/blog/the-ml-portfolio-that-actually-gets-you-hired-in-2026
- https://dev.to/klement_gunndu/5-ai-portfolio-projects-that-actually-get-you-hired-in-2026-5bpl
- https://fonzi.ai/blog/portfolio-for-engineer

**Design & UX**
- https://danluu.com/web-bloat/ ; https://danluu.com/slow-device/ ; https://danluu.com/octopress-speedup/
- https://levelup.gitconnected.com/the-minimalists-guide-to-building-a-fast-personal-website-12dafd595915
- https://levelup.gitconnected.com/how-to-build-a-minimalist-website-thats-fast-accessible-and-responsive-d556e8bec78b
- https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/
- https://www.webability.io/blog/color-contrast-for-accessibility
- https://neilzone.co.uk/2026/04/please-consider-publishing-a-full-text-rss-feed-for-your-website-or-blog/
- https://www.gilesthomas.com/2025/03/full-text-in-rss
- https://kenmorico.com/vault/rss-feeds-for-blogs ; https://idiallo.com/blog/is-rss-still-relevant

**Discoverability**
- https://github.com/jekyll/jekyll-seo-tag
- https://jsinibardy.com/optimize-seo-jekyll ; https://www.nikhita.dev/seo-jekyll
- https://www.mcgarrah.org/jekyll-seo-sitemap-canonical-url-fixes/
- https://dev.to/dss99911/optimizing-jekyll-for-seo-complete-guide-4hl9
- https://www.semrush.com/blog/open-graph/ ; https://www.toolk.site/blog/open-graph-meta-tags-guide
- https://indieweb.org/POSSE ; https://matthiasott.com/notes/welcome-to-the-indieweb ; https://www.joelotter.com/posts/2023/03/indieweb/
- https://dasroot.net/posts/2026/03/webmentions-indieweb-social-interactions/
- https://domhabersack.com/blog/seo-when-crossposting
- https://dev.to/arikfr/cross-post-blog-posts-to-devto-414i ; https://dev.to/aspittel/comment/b8f5
- https://medium.com/blogging-guide/understanding-canonical-links-and-medium-article-seo-for-your-blog-or-website-25a5afe2b71c
- https://www.oreilly.com/library/view/technical-blogging-2nd/9781680507126/f_0094.xhtml
- https://www.compose.ly/content-strategy/are-blogs-still-relevant ; https://www.axios.com/2025/10/14/ai-generated-writing-humans

**Exemplars**
- https://simonwillison.net/ ; https://jvns.ca/ ; https://swyx.io/ ; https://lethain.com/ ; https://eugeneyan.com/about/ ; https://danluu.com/ ; https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/ ; https://rachsmith.com/ ; https://www.seangoedecke.com/on-writing/
- https://www.amazon.science/working-at-amazon/eugene-yan-and-the-art-of-writing-about-science
- https://www.harihareswara.net/posts/2013/why-julia-evanss-blog-is-so-great/
- https://chriscoyier.net/2023/09/06/julia-evans-on-blogging/
- https://rachsmith.com/how-i-wrote-more/
