#!/usr/bin/env node
// scripts/palette-contrast.test.mjs
//
// AC-026: "every palette token whose manifest role is `content` SHALL reach
// a contrast ratio of at least 4.5:1 against each declared background it is
// used on." VERIFY: enumerates every (token, background) pair in which a
// content-role token is used across the declared-background set -- cream,
// light, parchment-dark, and the hero gradient stops #211C30/#312A45 -- and
// asserts every pair is >= 4.5 WITHOUT ROUNDING; fails if the content set is
// empty.
//
// AC-027: "every meaning-bearing non-text boundary SHALL reach a contrast
// ratio of at least 3:1 against its adjacent colour." VERIFY: asserts the
// stat-bar track hairline and fill-edge tokens are >= 3:1 against the
// adjacent surface without rounding.
//
// AC-049: this script IS "the palette contrast test" that CI must invoke and
// fail on (see .github/workflows/a11y.yml).

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { contrastRatio } from './lib/color-math.mjs';

const root = new URL('../', import.meta.url).pathname;
const manifest = yaml.load(readFileSync(root + '_data/palette-manifest.yml', 'utf8'));
const bg = manifest.meta.declared_backgrounds;
const CONTENT_MIN = manifest.meta.content_threshold; // 4.5, no rounding
const BOUNDARY_MIN = manifest.meta.boundary_threshold; // 3.0, no rounding

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };

// --- AC-026: every content/ink token vs every declared background ---
const contentTokens = manifest.tokens.filter((t) => t.role === 'content' && t.obligation === 'ink' && t.hex);
if (contentTokens.length === 0) {
  fail('the content-role token set is EMPTY -- AC-026 explicitly requires this test to fail in that case.');
}

// cream / light / parchment-dark: BLANKET cross-product, every content/ink
// token against all three. These are three interchangeable LIGHT surfaces
// any of these tokens could plausibly end up rendered on (matching
// research-ui-a11y.md §2.1's own table methodology -- it tests every
// foreground token against all three light backgrounds uniformly, not just
// the one each token's current call sites happen to sit on). This is what
// caught --ff-blue-dark missing parchment-dark by 0.31 despite passing on
// both backgrounds its 10 real usages actually touch -- see
// _data/palette-manifest.yml's note on that token.
let pairsChecked = 0;
for (const token of contentTokens) {
  for (const [bgName, bgHex] of Object.entries(bg)) {
    if (bgName.startsWith('hero-gradient')) continue; // see hero-gradient note below
    const ratio = contrastRatio(token.hex, bgHex);
    pairsChecked++;
    if (!(ratio >= CONTENT_MIN)) {
      fail(`${token.name} (${token.hex}) vs ${bgName} (${bgHex}) = ${ratio.toFixed(4)} < ${CONTENT_MIN}`);
    }
  }
}

// Hero-gradient stops: fundamentally different from the three light surfaces
// above (dark, saturated) -- generic -ink tokens are deliberately dark-on-
// light and were never designed against it (a blanket cross-product here
// would report every -ink token as "failing" a background nothing actually
// uses it on, which is not a real defect). Per the manifest's own
// usage_exemptions, the tokens ACTUALLY rendered against the hero gradient
// are $pastel-blue (.hero-description), $background-cream
// (.hero-content/.hero-title), and rgba($pastel-purple, 0.8)
// (.hero-trademark) -- assert those three specific, real pairings directly.
const heroChecks = [
  { label: '$pastel-blue (.hero-description) vs hero-gradient-1', hex: '#B9C9E6', against: bg['hero-gradient-1'] },
  { label: '$pastel-blue (.hero-description) vs hero-gradient-2', hex: '#B9C9E6', against: bg['hero-gradient-2'] },
  { label: '$background-cream (.hero-content/.hero-title) vs hero-gradient-1', hex: '#F8F5F2', against: bg['hero-gradient-1'] },
  { label: '$background-cream (.hero-content/.hero-title) vs hero-gradient-2', hex: '#F8F5F2', against: bg['hero-gradient-2'] },
];
for (const c of heroChecks) {
  const ratio = contrastRatio(c.hex, c.against);
  pairsChecked++;
  if (!(ratio >= CONTENT_MIN)) fail(`${c.label} = ${ratio.toFixed(4)} < ${CONTENT_MIN}`);
}
// rgba($pastel-purple, 0.8) (.hero-trademark) -- alpha-blended, checked separately (not a flat hex).
{
  const blend = (fg, alpha, base) => {
    const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });
    const a = hex(fg), b2 = hex(base);
    const c = (k) => Math.round(a[k] * alpha + b2[k] * (1 - alpha));
    return `#${[c('r'), c('g'), c('b')].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
  };
  for (const [bgName, bgHex] of [['hero-gradient-1', bg['hero-gradient-1']], ['hero-gradient-2', bg['hero-gradient-2']]]) {
    const blended = blend('#CDB4DB', 0.8, bgHex);
    const ratio = contrastRatio(blended, bgHex);
    pairsChecked++;
    if (!(ratio >= CONTENT_MIN)) fail(`rgba($pastel-purple,0.8) (.hero-trademark) vs ${bgName} = ${ratio.toFixed(4)} < ${CONTENT_MIN}`);
  }
}

console.log(`AC-026: ${contentTokens.length} content/ink token(s), ${pairsChecked} (token, background) pair(s) checked.`);

// --- AC-027: stat-bar track hairline + fill-edge vs adjacent surface ---
const boundaryChecks = [
  {
    label: '--stat-track-hairline (--dnd-ink) vs .attribute-bar blended track',
    hex: '#4e342e',
    against: '#efe5e3', // rgba(153,102,204,0.1) over --dnd-parchment #f9f3e6, precomputed
  },
  {
    label: '--stat-track-hairline (--dnd-ink) vs --dnd-parchment',
    hex: '#4e342e',
    against: '#f9f3e6',
  },
  {
    label: '--stat-fill-edge (--dnd-ink) vs .attribute-bar blended track',
    hex: '#4e342e',
    against: '#efe5e3',
  },
];
for (const c of boundaryChecks) {
  const ratio = contrastRatio(c.hex, c.against);
  if (!(ratio >= BOUNDARY_MIN)) fail(`${c.label} = ${ratio.toFixed(4)} < ${BOUNDARY_MIN}`);
  else console.log(`ok: ${c.label} = ${ratio.toFixed(2)} >= ${BOUNDARY_MIN}`);
}

console.log(failures === 0 ? '\nPASS (AC-026, AC-027).' : `\nFAIL: ${failures} failure(s) (AC-026/AC-027).`);
process.exit(failures === 0 ? 0 : 1);
