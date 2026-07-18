#!/usr/bin/env node
// scripts/dark-root-consolidation.test.mjs
//
// AC-102: "the dark token overrides SHALL be authored from exactly one
// canonical source." VERIFY: asserts `_sass/` contains exactly one authoring
// site for dark `:root` custom-property overrides, that the three enumerated
// dead declarations (`_notebook.scss:805` `--dnd-parchment:#2c2c2c`,
// `_notebook.scss:808` `--dnd-ink:#d0d0d0`, `_laboratory.scss:693`
// `--dnd-parchment:#2c2c2c`) no longer appear, and that the built
// `_site/assets/css/main.css` shows each dark token once per selector context.

import { readFileSync, existsSync } from 'node:fs';
import { listScssFiles } from './lib/scss-scan.mjs';

const root = new URL('../', import.meta.url).pathname;
const sassDir = root + '_sass/';
const cssPath = root + '_site/assets/css/main.css';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

// --- 1. exactly one authoring site for a dark `:root { --custom-prop: ...; }`
// block across every _sass/*.scss partial. "Authoring site" = a `:root { ... }`
// rule (custom-property declarations) nested inside a dark-mode at-rule
// (`@media (prefers-color-scheme: dark)` or the `@include dark-mode` mixin,
// which expands to the same at-rule). AC-201 (normalize-p2): uses the shared
// recursive scss-scan.mjs walker rather than this suite's own former flat
// `readdirSync(sassDir).filter(...)`, so an ITCSS split into subdirectories
// (`_sass/pages/`, `_sass/objects/`, etc.) doesn't silently blind this
// suite the way the old flat scan would have.
const files = listScssFiles(sassDir);

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^[ \t]*\/\/.*$/gm, (m) => ' '.repeat(m.length));
}

const authoringSites = [];
for (const file of files) {
  const src = stripComments(readFileSync(file, 'utf8'));
  const lines = src.split('\n');
  // Track brace depth + a small "are we inside a dark at-rule" marker so a
  // nested `:root {` can be attributed correctly regardless of file layout.
  let depth = 0;
  const darkAtRuleDepths = []; // depth values at which a dark at-rule opened
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    // A dark at-rule opens on this line if it matches BEFORE we walk its braces.
    const opensDarkAtRule = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)|@include\s+dark-mode\b/.test(line);
    const opensRoot = /(^|[^a-zA-Z0-9_-]):root(\s|\{)/.test(line) && !/\[\s*data-theme/.test(line);

    if (opensRoot && darkAtRuleDepths.length > 0) {
      authoringSites.push({ file, line: idx + 1, text: line.trim() });
    }

    for (const ch of line) {
      if (ch === '{') {
        depth++;
        if (opensDarkAtRule && !darkAtRuleDepths.includes(depth - 1)) {
          // mark: everything from this depth downward is "inside a dark at-rule"
          darkAtRuleDepths.push(depth);
        }
      } else if (ch === '}') {
        if (darkAtRuleDepths.length > 0 && darkAtRuleDepths[darkAtRuleDepths.length - 1] === depth) {
          darkAtRuleDepths.pop();
        }
        depth--;
      }
    }
  }
}

if (authoringSites.length !== 1) {
  fail(`expected exactly ONE dark :root authoring site across _sass/, found ${authoringSites.length}: ${authoringSites.map((s) => `${s.file.replace(sassDir, '_sass/')}:${s.line}`).join(', ')}`);
} else {
  ok(`exactly one dark :root authoring site across _sass/: ${authoringSites[0].file.replace(sassDir, '_sass/')}:${authoringSites[0].line}`);
}

// --- 2. the three enumerated dead declarations no longer appear anywhere in _sass/ ---
// AC-201: looked up by BASENAME against the recursive `files` list above
// (rather than a hardcoded `join(sassDir, file)` flat path), so this stays
// correct regardless of which ITCSS subdirectory `_notebook.scss` /
// `_laboratory.scss` live in.
const filesByBasename = new Map(files.map((f) => [f.split('/').pop(), f]));
const deadDeclarations = [
  { file: '_notebook.scss', pattern: /--dnd-parchment\s*:\s*#2c2c2c/ },
  { file: '_notebook.scss', pattern: /--dnd-ink\s*:\s*#d0d0d0/ },
  { file: '_laboratory.scss', pattern: /--dnd-parchment\s*:\s*#2c2c2c/ },
];
let deadFound = 0;
for (const { file, pattern } of deadDeclarations) {
  const fullPath = filesByBasename.get(file);
  if (!fullPath) {
    fail(`could not locate ${file} anywhere under _sass/ -- relocated without updating this check?`);
    deadFound++;
    continue;
  }
  const src = readFileSync(fullPath, 'utf8');
  if (pattern.test(src)) {
    fail(`${file} still contains the dead declaration matching ${pattern}`);
    deadFound++;
  }
}
if (deadFound === 0) {
  ok('the three enumerated dead declarations (_notebook.scss --dnd-parchment:#2c2c2c, _notebook.scss --dnd-ink:#d0d0d0, _laboratory.scss --dnd-parchment:#2c2c2c) no longer appear in _sass/');
}

// --- 3. the built main.css shows each dark token once per selector context
// (no duplicate `--name:` declaration within the SAME :root rule body) ---
if (!existsSync(cssPath)) {
  fail('_site/assets/css/main.css does not exist -- run `bundle exec jekyll build` first.');
} else {
  const css = readFileSync(cssPath, 'utf8');
  const mediaMatch = css.match(/@media\(prefers-color-scheme:\s*dark\)\{:root\{([^}]*)\}/);
  if (!mediaMatch) {
    fail('could not locate the consolidated `@media(prefers-color-scheme:dark){:root{...}}` rule in the built main.css');
  } else {
    const names = mediaMatch[1].split(';').map((d) => d.trim().match(/^(--[a-zA-Z0-9-]+)/)).filter(Boolean).map((m) => m[1]);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    if (dupes.length > 0) {
      fail(`the compiled dark :root rule declares a token more than once in the same selector context: ${[...new Set(dupes)].join(', ')}`);
    } else {
      ok(`the compiled dark :root rule declares each of its ${names.length} token(s) exactly once`);
    }
  }
}

console.log(failures === 0 ? '\nPASS (AC-102).' : `\nFAIL: ${failures} failure(s) (AC-102).`);
process.exit(failures === 0 ? 0 : 1);
