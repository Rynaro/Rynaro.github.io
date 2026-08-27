// scripts/repoint-ink-tokens.mjs
//
// ONE-TIME codemod for Story 4.1 (AC-026/047/048): repoints every
// color/border-color usage of a themed ornament token that renders body text
// or a meaning-bearing boundary to its `-ink` sibling. Run once, by hand,
// then delete-or-keep for audit trail (kept -- see repoint log at the bottom
// of this file's run output, captured in the completion report).
//
// Deliberately explicit line-by-line (not a global sed) so ornament usages of
// the SAME token (backgrounds, gradients, box-shadow glows, decorative
// echo-borders) are left untouched. The exemptions list documents every
// non-logotype color/border-color usage that stays on the ornament token, and
// why -- this is the same mechanism as the logotype selector-set carve-out,
// generalized, and it is the anti-vacuity discipline AC-047/048 require.

import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const abs = (p) => root + p;

// [file, line, findSubstring, replaceSubstring]
const edits = [
  // --- --ff-purple -> --ff-purple-ink (34 `color:` + 5 `border-color:` /
  // :focus /.active state usages; zero exemptions -- every non-logotype
  // border-color usage of ff-purple in this codebase is a genuine UI-state
  // indicator: :focus rings and .active nav/filter pills, both squarely
  // "meaning-bearing boundary" under 1.4.11's UI-Components clause). ---
  ['_sass/_about.scss', 526, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 643, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 805, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 844, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 869, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 1188, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_about.scss', 1259, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 203, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 297, 'border-color: var(--ff-purple)', 'border-color: var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 331, 'border-color: var(--ff-purple)', 'border-color: var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 436, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 505, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_laboratory.scss', 529, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_letter.scss', 95, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_letter.scss', 168, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_letter.scss', 246, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_letter.scss', 528, 'border-color: var(--ff-purple)', 'border-color: var(--ff-purple-ink)'],
  ['_sass/_letter.scss', 538, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 244, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 302, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 307, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 314, 'border-color: var(--ff-purple)', 'border-color: var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 348, 'border-color: var(--ff-purple)', 'border-color: var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 363, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 545, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 638, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_notebook.scss', 644, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_pages.scss', 36, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_pages.scss', 71, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_pages.scss', 87, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 377, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 385, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 431, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 603, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 645, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 909, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 949, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 1056, 'var(--ff-purple)', 'var(--ff-purple-ink)'],
  ['_sass/_post.scss', 1112, 'var(--ff-purple)', 'var(--ff-purple-ink)'],

  // --- --ff-purple-light -> --ff-purple-light-ink (all 4 `color:` usages;
  // the other 11 usages are gradient/background/border-shorthand ornament,
  // untouched) ---
  ['_sass/_post.scss', 353, 'var(--ff-purple-light)', 'var(--ff-purple-light-ink)'],
  ['_sass/_post.scss', 585, 'var(--ff-purple-light)', 'var(--ff-purple-light-ink)'],
  ['_sass/_post.scss', 665, 'var(--ff-purple-light)', 'var(--ff-purple-light-ink)'],
  ['_sass/_post.scss', 1165, 'var(--ff-purple-light)', 'var(--ff-purple-light-ink)'],

  // --- --ff-gold -> --ff-gold-ink. EXEMPT (left on --ff-gold, documented in
  // _data/palette-manifest.yml exemptions): about.scss:69 (logotype,
  // .hero-subtitle-container h2), 351 & 828 (decorative color-echo
  // border-color on an already-obvious background state change),
  // 940/952/963/969/970/1159 (.ability-ultimate / .ability-type-ultimate /
  // .cta-title -- pre-existing dark-card-gradient context outside the AC-026
  // declared background set; logged, not fixed here -- see report),
  // home.scss:91 / laboratory.scss:11 / letter.scss:33 / notebook.scss:32
  // (all logotype, .hero-subtitle), notebook.scss:160 (.glyph -- decorative
  // ambient Unicode glyph, ornament not content). ---
  ['_sass/_about.scss', 442, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],
  // about.scss:455 (`.highlight::after` underline gradient) is a `background`
  // gradient, not `color`/`border-color`/`fill` -- ornament, deliberately
  // untouched (still bright ff-gold under the now-inked .highlight text).
  ['_sass/_about.scss', 487, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],
  ['_sass/_about.scss', 516, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],
  ['_sass/_about.scss', 603, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],
  ['_sass/_about.scss', 631, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],
  ['_sass/_notebook.scss', 160, '__SKIP__', '__SKIP__'], // ornament, see exemption note above -- kept as a documented no-op marker
  ['_sass/_post.scss', 238, 'color: var(--ff-gold)', 'color: var(--ff-gold-ink)'],

  // --- --ff-blue's one content usage: reuse the EXISTING --ff-blue-dark
  // (5.12:1, already legal) rather than mint a new token (plan: "already
  // exists"). ---
  ['_sass/_about.scss', 1024, 'color: var(--ff-blue)', 'color: var(--ff-blue-dark)'],

  // --- --ff-green / --ff-red: sole usage each, both real content (message
  // icon color on the letter contact form). ---
  ['_sass/_letter.scss', 741, 'color: var(--ff-green)', 'color: var(--ff-green-ink)'],
  ['_sass/_letter.scss', 746, 'color: var(--ff-red)', 'color: var(--ff-red-ink)'],

  // --- $pastel-purple direct text usages -> $pastel-purple-ink ---
  ['_sass/_about.scss', 461, 'color: $pastel-purple;', 'color: $pastel-purple-ink;'],
  ['_sass/_base.scss', 53, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
  ['_sass/_base.scss', 58, 'darken($pastel-purple, 25%)', '$pastel-purple-ink-hover'],
  ['_sass/_components.scss', 17, 'darken($pastel-purple, 35%)', '$pastel-purple-ink'],
  ['_sass/_components.scss', 28, 'darken($pastel-purple, 25%)', '$pastel-purple-ink-hover'],
  ['_sass/_components.scss', 118, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
  ['_sass/_components.scss', 164, 'darken($pastel-purple, 25%)', '$pastel-purple-ink-hover'],
  ['_sass/_layout.scss', 102, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
  ['_sass/_layout.scss', 120, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
  ['_sass/_layout.scss', 136, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
  ['_sass/_layout.scss', 156, 'darken($pastel-purple, 15%)', '$pastel-purple-ink'],
];

let applied = 0;
let skipped = 0;
const byFile = new Map();
for (const [file, line, find, replace] of edits) {
  if (find === '__SKIP__') { skipped++; continue; }
  if (!byFile.has(file)) byFile.set(file, readFileSync(abs(file), 'utf8').split('\n'));
  const lines = byFile.get(file);
  const idx = line - 1;
  if (!lines[idx].includes(find)) {
    console.error(`MISMATCH ${file}:${line} -- expected to find ${JSON.stringify(find)} in ${JSON.stringify(lines[idx])}`);
    process.exitCode = 1;
    continue;
  }
  lines[idx] = lines[idx].replace(find, replace);
  applied++;
}

for (const [file, lines] of byFile) {
  writeFileSync(abs(file), lines.join('\n'));
}

console.log(`Applied ${applied} edits across ${byFile.size} files (${skipped} documented no-ops skipped).`);
