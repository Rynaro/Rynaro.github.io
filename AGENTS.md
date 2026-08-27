# Repository guidance

## Project

- This is Henrique Lavezzo's personal Jekyll 4 site, deployed with GitHub Pages at `https://hlavezzo.me`.
- Pages and layouts use Liquid/HTML; styles live in `assets/css/main.scss` and `_sass/`; browser behavior lives in `assets/js/`; content and profile data live in `_posts/` and `_data/`.
- Keep the site's alchemy/RPG visual language and its existing vanilla JavaScript approach unless a task explicitly changes the design direction.

## Working conventions

- Make focused changes and preserve unrelated work. In particular, do not rewrite `jex.sh` merely to change its container runtime alias.
- Reuse existing Sass variables, partials, layouts, and includes before adding new abstractions.
- Keep JavaScript dependency-free and compatible with a statically generated site. Use progressive enhancement and guard DOM lookups on pages where an element may be absent.
- Keep site content in YAML or Markdown when the existing structure provides an appropriate home for it; do not duplicate data in templates or scripts.
- Do not edit generated output such as `_site/`, `.jekyll-cache/`, or `.sass-cache/`.
- Never commit secrets, tokens, local machine paths, or analytics credentials beyond the public site configuration already tracked in `_config.yml`.

## Verification

- Preferred local workflow: `./jex.sh serve`, then inspect `http://localhost:4000`.
- Build check: `bundle exec jekyll build` when Ruby dependencies are available, or use the repository's Docker/JEX workflow.
- For content-only changes, verify front matter, Liquid syntax, links, and relevant rendered pages.
- For style or interaction changes, check responsive behavior and browser-console errors on the affected pages.

## Delivery

- Summarize changed files and verification performed.
- Do not commit, push, publish, or deploy unless explicitly requested.

<!-- eidolon:cortex start -->
## Eidolons Routing Cortex

**Default operating mode:** route all non-trivial work through the Eidolons pipeline — this is the default, not an opt-in. The orchestrator delegates to Eidolon roles via the cortex and does not implement, spec, or scout directly. Answer directly only when a prompt is trivial, conversational, or a single-fact lookup.

**Read:** `.eidolons/cortex/EIDOLONS.md` — always-loaded descriptor table + dispatch protocol. It tells you which Eidolon (or chain) handles the prompt, at what tier (`standard` is the default; `TRANCE` is gated, never default), and what hand-off contract to use.

**Deep tables** (load on demand): `.eidolons/cortex/trance-matrix.md`, `.eidolons/cortex/handoff-graph.md`, `.eidolons/cortex/validation-gates.md`.
<!-- eidolon:cortex end -->

<!-- eidolon:dispatch-pointer start -->
## Eidolons

This project uses [Eidolons](https://github.com/Rynaro/eidolons). The canonical agent dispatch table, methodology references, and per-Eidolon hand-off contracts live at [`./EIDOLONS.md`](./EIDOLONS.md). Read that file before any non-trivial prompt — this is the default operating mode, not an opt-in.
<!-- eidolon:dispatch-pointer end -->
