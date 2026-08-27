#!/usr/bin/env node
// scripts/dead-class-detect.test.mjs
//
// AC-403 (normalize-p4): a Liquid-aware dead-class detector -- the safety
// mechanism every deletion in this phase (AC-401/402/405/406) is gated
// behind. A naive `grep -rn '<class>' _includes/ _layouts/ *.html` OVER-
// REPORTS: `post-type-badge--{{ type_key }}` (_includes/post-type-badge.html:19)
// and `mastery-{{ skill.level }}` (about.html:194) are Liquid-interpolated
// class-name STEMS whose concrete suffix only exists after Jekyll resolves
// `{{ }}` against a data file at build time -- it is never typed out
// literally anywhere a plain grep can see it. Deleting the CSS for either
// would delete a LIVE style. This detector resolves every known stem
// against its real data source BEFORE it will call anything "dead".
//
// Classification is per candidate CSS class name (no leading dot):
//   'live' -- matches a known Liquid-interpolated stem (resolved against its
//             data source), OR has >=1 literal reference in markup/JS
//   'dead' -- zero literal references anywhere in markup/JS, and does not
//             match any known interpolated stem
//
// Library usage:   import { classify } from './dead-class-detect.test.mjs'
// Script usage:    node scripts/dead-class-detect.test.mjs
//   Runs the AC-403 fixture (post-type-badge--*/mastery-* and the other
//   known interpolated stems must classify LIVE) plus the AC-405
//   justification pass over the HIGH-confidence removal set (must classify
//   DEAD), and exits 0 iff every assertion holds.

import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

// ---------------------------------------------------------------------------
// 1. Markup/JS corpus. Every place a literal `class="..."` or `classList`
//    string could live -- mirrors what the acceptance criteria's own
//    verify_method means by "unreferenced in markup": .html/.md/.markdown
//    content plus .js behavior, walked recursively, skipping build output,
//    tooling directories, and vendored/dependency trees. Deliberately does
//    NOT include `_sass/**/*.scss` -- a class's own rule declaring it is not
//    a "reference" to it in the dead-code sense; only markup/JS usage counts.
// ---------------------------------------------------------------------------
const SKIP_DIRS = new Set([
  'node_modules', '_site', '.git', '.jekyll-cache', '.bundle', 'vendor',
  '.spectra', '.eidolons', '.claude', '.codex', 'archive',
]);
const MARKUP_EXT = new Set(['.html', '.md', '.markdown']);
const SCRIPT_EXT = new Set(['.js']);

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
}

function corpusFiles() {
  const all = [];
  walk(root, all);
  return all.filter((f) => MARKUP_EXT.has(extname(f)) || SCRIPT_EXT.has(extname(f)));
}

let _corpusCache = null;
function corpus() {
  if (!_corpusCache) {
    _corpusCache = corpusFiles().map((f) => ({ file: f, text: readFileSync(f, 'utf8') }));
  }
  return _corpusCache;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Naive-grep-equivalent literal reference search for a class name, word-bounded. */
function literalRefs(className) {
  const re = new RegExp(`(^|[^a-zA-Z0-9_-])${escapeRe(className)}([^a-zA-Z0-9_-]|$)`);
  const hits = [];
  for (const { file, text } of corpus()) {
    if (re.test(text)) hits.push(file.replace(root, ''));
  }
  return hits;
}

// ---------------------------------------------------------------------------
// 2. Known Liquid-interpolated stems (AC-403). Each names its template call
//    site (for humans/audit) and a resolve() that expands the stem against
//    its REAL data source into the concrete class names Jekyll actually
//    emits at build time -- this is the "resolve `{{ }}`" step a naive grep
//    cannot do.
// ---------------------------------------------------------------------------
function loadYaml(relPath) {
  return yaml.load(readFileSync(root + relPath, 'utf8'));
}

const STEMS = [
  {
    id: 'post-type-badge',
    stem: 'post-type-badge--',
    templateSite: '_includes/post-type-badge.html:19 -- class="post-type-badge post-type-badge--{{ type_key }}"',
    resolve() {
      const data = loadYaml('_data/post_types.yml');
      return data.order.map((key) => `post-type-badge--${key}`);
    },
  },
  {
    id: 'mastery',
    stem: 'mastery-',
    templateSite: 'about.html:194 -- class="skill-item mastery-{{ skill.level }}"',
    resolve() {
      // The mastery scale is a small closed numeric domain -- _sass/pages/
      // _about.scss defines .mastery-1 through .mastery-N. Every level in
      // that domain is reachable by a future _data/skills.yml entry, not
      // just the levels TODAY's data happens to instantiate (currently
      // 3/4/5only) -- so this resolves against the domain the CSS itself
      // targets, not merely today's live data, matching the spec's
      // "mastery-1..N SHALL be classified LIVE".
      const scssSrc = readFileSync(root + '_sass/pages/_about.scss', 'utf8');
      const levels = [...scssSrc.matchAll(/\.mastery-(\d+)\b/g)].map((m) => Number(m[1]));
      const maxLevel = Math.max(0, ...levels);
      return Array.from({ length: maxLevel }, (_, i) => `mastery-${i + 1}`);
    },
  },
  {
    id: 'post-assay-label',
    stem: 'post-assay-label--',
    templateSite: '_includes/post-assay-label.html:12 -- class="post-assay-label post-assay-label--{{ assay_key }}"',
    resolve() {
      const data = loadYaml('_data/assay.yml');
      return data.order.map((key) => `post-assay-label--${key}`);
    },
  },
  {
    id: 'item-rarity-label',
    stem: 'item-rarity-label--',
    templateSite: 'laboratory.html:86 -- class="item-rarity-label item-rarity-label--{{ project_rarity }}"',
    resolve() {
      const projects = loadYaml('_data/projects.yaml');
      const tiers = new Set(projects.map((p) => p.rarity || 'common'));
      // BEM modifier set _sass/pages/_laboratory.scss actually styles (the
      // closed rarity vocabulary), unioned with whatever _data/projects.yaml
      // happens to use today -- the class is reachable for any of these
      // regardless of which ones are currently instantiated.
      for (const t of ['common', 'uncommon', 'rare', 'epic', 'legendary']) tiers.add(t);
      return [...tiers].map((t) => `item-rarity-label--${t}`);
    },
  },
  {
    id: 'ability-type',
    stem: 'ability-type-',
    templateSite: 'about.html:280 -- class="ability-type-badge ability-type-{{ ability.type }}"',
    resolve() {
      const data = loadYaml('_data/special_abilities.yaml');
      const types = new Set(data.abilities.map((a) => a.type));
      return [...types].map((t) => `ability-type-${t}`);
    },
  },
  {
    id: 'section-icon',
    stem: 'section-icon',
    exact: true,
    templateSite: '_includes/components/section-title.html:27 -- class="{{ include.icon }} section-icon" (a static literal token the shared include always appends after the interpolated icon classes, at ~21 call sites -- never typed as a literal "section-icon" class anywhere else, so a naive per-page grep for the string undercounts its true, include-mediated usage)',
    resolve() {
      return ['section-icon'];
    },
  },
];

/**
 * Classifies a single candidate CSS class name (no leading dot) as
 * 'live' or 'dead'. A Liquid-stem match takes priority over the literal
 * scan: a candidate matching a known interpolated stem is ALWAYS live, even
 * with zero literal grep hits, because a plain grep cannot see through
 * `{{ }}` at all -- that is precisely the trap AC-403 exists to close.
 */
export function classify(className) {
  for (const stem of STEMS) {
    const matches = stem.exact ? className === stem.stem : className.startsWith(stem.stem);
    if (matches) {
      const resolved = stem.resolve();
      return {
        classification: 'live',
        reason: `matches Liquid-interpolated stem "${stem.id}" (${stem.templateSite}); resolved instance(s): ${resolved.join(', ')}`,
        resolved,
      };
    }
  }
  const hits = literalRefs(className);
  if (hits.length > 0) {
    return { classification: 'live', reason: `literal reference(s) in: ${hits.join(', ')}`, resolved: [] };
  }
  return {
    classification: 'dead',
    reason: 'zero literal references in markup/JS, and no matching Liquid-interpolated stem',
    resolved: [],
  };
}

export { STEMS };

// ---------------------------------------------------------------------------
// 3. Script mode -- AC-403 fixture + AC-405 justification run.
// ---------------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  console.log('--- AC-403 fixture: post-type-badge--{{ type_key }} and mastery-{{ skill.level }} must classify LIVE ---\n');

  const postTypeStem = STEMS.find((s) => s.id === 'post-type-badge');
  for (const name of postTypeStem.resolve()) {
    const result = classify(name);
    if (result.classification !== 'live') fail(`${name} classified ${result.classification}, expected LIVE (post-type-badge trap, AC-403)`);
    else ok(`${name} -> LIVE (${result.reason})`);
  }

  const masteryStem = STEMS.find((s) => s.id === 'mastery');
  const masteryLevels = masteryStem.resolve();
  if (masteryLevels.length === 0) fail('mastery stem resolved ZERO levels -- _sass/pages/_about.scss .mastery-N pattern not found (resolver broken)');
  for (const name of masteryLevels) {
    const result = classify(name);
    if (result.classification !== 'live') fail(`${name} classified ${result.classification}, expected LIVE (mastery trap, AC-403)`);
    else ok(`${name} -> LIVE (${result.reason})`);
  }

  console.log('\n--- other known Liquid-interpolated stems (also asserted LIVE) ---\n');
  for (const stem of STEMS) {
    if (stem.id === 'post-type-badge' || stem.id === 'mastery') continue;
    const resolved = stem.resolve();
    if (resolved.length === 0) fail(`${stem.id} stem resolved ZERO instances -- resolver or data source broken`);
    for (const name of resolved) {
      const result = classify(name);
      if (result.classification !== 'live') fail(`${name} classified ${result.classification}, expected LIVE (${stem.id})`);
      else ok(`${name} -> LIVE (${result.reason})`);
    }
  }

  console.log('\n--- AC-405 justification: HIGH-confidence removal set must classify DEAD before removal ---\n');
  const HIGH_SET = ['hljs', 'architecture-icon', 'hero__actions', 'page-header', 'post-toc-wrapper', 'col--offset-3'];
  for (const name of HIGH_SET) {
    const result = classify(name);
    if (result.classification !== 'dead') fail(`${name} classified ${result.classification} -- NOT safe to remove: ${result.reason}`);
    else ok(`${name} -> DEAD (${result.reason}) -- justified for removal`);
  }

  console.log(failures === 0 ? '\nPASS (AC-403 fixture + AC-405 justification, 0 failures).' : `\nFAIL (AC-403/AC-405): ${failures} failure(s).`);
  process.exit(failures === 0 ? 0 : 1);
}
