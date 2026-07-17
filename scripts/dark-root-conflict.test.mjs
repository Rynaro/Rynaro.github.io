#!/usr/bin/env node
// scripts/dark-root-conflict.test.mjs
//
// AC-101: "no custom-property name SHALL resolve to more than one distinct
// value across the compiled dark :root scopes." Reads the BUILT
// `_site/assets/css/main.css` (never a source partial -- P1's whole point is
// that `:root` is document-scoped and only the compiled cascade tells the
// truth about which declaration wins), collects every custom-property
// declaration inside a `:root { ... }` rule nested in
// `@media (prefers-color-scheme: dark)`, groups by name, and asserts each name
// has exactly one distinct value.
//
// AC-103: "the identical set of dark custom-property values SHALL be emitted
// under both a `prefers-color-scheme: dark` :root context and a
// `:root[data-theme="dark"]` context." Asserts the {name,value} set collected
// above equals the {name,value} set from the compiled `:root[data-theme="dark"]`
// rule, exactly (same names, same values, nothing extra on either side).

import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const cssPath = root + '_site/assets/css/main.css';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

if (!existsSync(cssPath)) {
  console.error('FAIL: _site/assets/css/main.css does not exist -- run `bundle exec jekyll build` first.');
  process.exit(1);
}

const css = readFileSync(cssPath, 'utf8');

// --- minimal brace-depth block extractor (compiled CSS is single-line/compact,
// so line-based scanning like scss-scan.mjs doesn't apply; walk characters and
// track depth instead). Returns [{ header, body, start, end }] for every
// top-level construct matching `headerRe` (an `@media(...)` at-rule or a bare
// selector), where `body` is the exact text between its outermost `{` and `}`. ---
function extractBlocks(text, headerRe) {
  const out = [];
  headerRe.lastIndex = 0;
  let m;
  while ((m = headerRe.exec(text))) {
    const openIdx = m.index + m[0].length - 1; // position of the opening '{'
    let depth = 0;
    let i = openIdx;
    for (; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push({ header: m[0], body: text.slice(openIdx + 1, i), start: m.index, end: i + 1 });
    headerRe.lastIndex = i + 1;
  }
  return out;
}

// Parses `--name: value;` declarations out of a `:root { ... }` rule body
// (the body may itself contain nested rules in the general case, but a
// `:root` custom-property block in this codebase is flat -- declarations
// only, no nested selectors).
function parseCustomProps(body) {
  const props = [];
  for (const raw of body.split(';')) {
    const decl = raw.trim();
    if (!decl) continue;
    const m = decl.match(/^(--[a-zA-Z0-9-]+)\s*:\s*(.+)$/);
    if (m) props.push({ name: m[1], value: m[2].trim() });
  }
  return props;
}

// --- collect every `:root { ... }` nested inside a
// `@media(prefers-color-scheme: dark)` (or the unminified spacing variant) at-rule ---
const darkMediaBlocks = extractBlocks(css, /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{/g);

let darkRootDecls = [];
for (const block of darkMediaBlocks) {
  const rootRules = extractBlocks(block.body, /:root\s*\{/g);
  for (const r of rootRules) {
    darkRootDecls.push(...parseCustomProps(r.body));
  }
}

if (darkRootDecls.length === 0) {
  fail('found zero custom-property declarations inside any `@media (prefers-color-scheme: dark) :root { ... }` block in the built main.css -- did the build run after the consolidation?');
}

// --- AC-101: group by name, assert exactly one distinct value per name ---
const byName = new Map();
for (const { name, value } of darkRootDecls) {
  if (!byName.has(name)) byName.set(name, new Set());
  byName.get(name).add(value);
}
let conflictCount = 0;
for (const [name, values] of byName) {
  if (values.size > 1) {
    fail(`--${name.replace(/^--/, '')} resolves to ${values.size} distinct values across the compiled dark :root scopes: ${[...values].join(' | ')}`);
    conflictCount++;
  }
}
if (conflictCount === 0) {
  ok(`every one of ${byName.size} dark custom-property name(s) resolves to exactly one distinct value across the compiled dark :root scope(s) (AC-101)`);
}

// --- AC-103: :root[data-theme="dark"] emits the identical {name,value} set ---
const dataThemeBlocks = extractBlocks(css, /:root\s*\[\s*data-theme\s*=\s*"?dark"?\s*\]\s*\{/g);
if (dataThemeBlocks.length === 0) {
  fail('found zero `:root[data-theme="dark"] { ... }` rules in the built main.css -- AC-103 requires the consolidated dark set to also be reachable via the toggle mechanism.');
} else {
  const dataThemeDecls = dataThemeBlocks.flatMap((b) => parseCustomProps(b.body));
  const mediaSet = new Set([...byName.entries()].flatMap(([name, values]) => [...values].map((v) => `${name}::${v}`)));
  const dataThemeSet = new Set(dataThemeDecls.map((d) => `${d.name}::${d.value}`));

  const onlyInMedia = [...mediaSet].filter((x) => !dataThemeSet.has(x));
  const onlyInDataTheme = [...dataThemeSet].filter((x) => !mediaSet.has(x));

  if (onlyInMedia.length > 0) fail(`declared under @media(prefers-color-scheme:dark) :root but missing from :root[data-theme="dark"]: ${onlyInMedia.join(', ')}`);
  if (onlyInDataTheme.length > 0) fail(`declared under :root[data-theme="dark"] but missing from @media(prefers-color-scheme:dark) :root: ${onlyInDataTheme.join(', ')}`);
  if (onlyInMedia.length === 0 && onlyInDataTheme.length === 0) {
    ok(`the {name,value} set emitted under @media(prefers-color-scheme:dark) :root (${mediaSet.size} pair(s)) is identical to the set under :root[data-theme="dark"] (AC-103)`);
  }
}

console.log(failures === 0 ? '\nPASS (AC-101, AC-103).' : `\nFAIL: ${failures} failure(s) (AC-101/AC-103).`);
process.exit(failures === 0 ? 0 : 1);
