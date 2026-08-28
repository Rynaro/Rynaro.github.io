# 🚀 My Personal Website // Alchemy Lab

[![Powered by JEX](https://img.shields.io/badge/Powered%20by-JEX-blue?style=flat-square)](https://github.com/Rynaro/jex)

Welcome to my digital playground! This is where I showcase my work, share my thoughts, and experiment with new ideas. Built with Jekyll and powered by JEX, this site is my personal corner of the internet.

## 🛠️ Tech Stack

- **Jekyll** - Static site generator
- **JEX** - Jekyll Easy eXecution tool
- **Docker** - Containerization
- **GitHub Pages** - Hosting

## 🚀 Quick Start

1. Clone this repository
2. Run `./jex.sh serve`
3. Visit `http://localhost:4000`

## 📝 Features

- 📚 Blog section for my thoughts and experiences
- 🧪 Laboratory for my experiments
- 📓 Digital notebook
- 💌 Open letter section

## ✒️ Writing in the Notebook

Run the guided authoring workflow in a terminal:

```sh
npm run notebook:new
```

It creates drafts by default and reads authors, entry types, assays, and categories
from the site's canonical YAML data. For automation, provide the required fields
and exactly one status explicitly:

```sh
npm run notebook:new -- --title "A field note" --resume "What this note preserves." --author henrique --type log --category tech --assay none --tags writing,jekyll --draft
```

Preview the Notebook, including entries in `_drafts/`, with:

```bash
npm run notebook:preview
```

The command uses port 4000 by default and stops with a readable suggestion if
that port is already occupied. Choose another port when needed:

```bash
npm run notebook:preview -- --port 4100
```

The usual writing loop is therefore `npm run notebook:new`, edit the generated
Markdown, then `npm run notebook:preview`. Press Ctrl-C to stop the preview.

### Evidence labels

Assays describe the support for an entry's claims, not its quality or authorship.
Leave narrative, personal, and historical notes unassayed when they make no
verification claim. Use `speculative` for a reasoned synthesis not validated on
this site's workload; use `tested` only with named checks or direct practice,
reviewable evidence, a review date, and explicit boundaries. Reserve `proven` for
sustained repeatable production use with evidence, operating context, and known
limits. Labels may be lowered when the evidence no longer holds.

Use `--publish` to create a dated `_posts` entry, `--dry-run` to inspect the exact
Markdown without writing, and `--help` for the complete option list. The workflow
never overwrites an existing entry.

## Social previews

The site selects one of five shared 1200×630 PNG cards automatically: Atelier for
general pages, Laboratory and Notebook for those destinations, and distinct Field
Note or Eidolon Dispatch artwork for posts. Eidolon selection comes from
`author_id` and `_data/notebook_authors.yml`, so no per-post image is required.

Override the selected image only when a page genuinely needs its own preview:

```yaml
social_image: /assets/images/social/special-preview.png
social_image_alt: "A concise description of the preview artwork"
```

Use an absolute HTTPS URL or a site-root-relative path. `social_image` is separate
from the editorial `image` field by design. Keep overrides as opaque 1200×630 PNGs
and always provide `social_image_alt`.

## Visual baselines

Build and refresh the ignored local screenshot reference set after an intentional
visual change:

```sh
npm run test:visual:update
```

Compare the current render against that set with `npm run test:visual`. The matrix
covers all primary routes at 320, 768, and 1280 pixels in light and dark modes,
both Human and Vivi-authored posts, and a bounded open-Wayfinder state on the
homepage. Reduced motion, a fixed clock, and settled rendering keep captures
repeatable. Baseline PNGs and `.visual/` output are ignored local verification
artifacts and are not deployed.

CI does not commit or cache the roughly 62 MB reference set. A successful push to
`master` (or a manually dispatched run on `master`) captures it once and uploads
the accepted commit's `visual-reference` artifact for 30 days. Pull requests find
the latest successful `master` push run, download that cross-run artifact, capture
their own candidate, compare the two sets, and always upload `visual-review` for
7 days. The JSON report and both expected/actual images make failures inspectable.
The reference is never updated and compared inside the same run.

The first pull request after enabling the workflow needs one successful
`Visual regression` push or manual run on `master` to seed the reference. The
repository must allow Actions read access; the workflow declares only
`contents: read` and `actions: read`. If branch protection requires the visual
check, add it only after this first seed exists.

References expire after 30 days. If no unexpired `visual-reference` remains,
open **Actions → Visual regression → Run workflow**, select `master`, and run it
to seed a fresh reference from the current accepted branch. Wait for that run to
succeed before retrying a pull request comparison. Keep the visual comparison
optional until the first seed succeeds; after that, make its PR check required.

## 🤝 Contributing

While this is my personal website, I'm always open to suggestions and improvements! Feel free to open an issue or submit a pull request.

---

Made with ❤️ and powered by [JEX](https://github.com/Rynaro/jex)
