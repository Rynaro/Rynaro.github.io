#!/usr/bin/env node
// scripts/palette-contrast.test.mjs
//
// AC-026: "every palette token whose manifest role is `content` SHALL reach
// a contrast ratio of at least 4.5:1 against each declared background it is
// used on." VERIFY: enumerates every (token, background) pair in which a
// content-role token is used across the declared light-background set --
// cream, light, and parchment-dark -- and
// asserts every pair is >= 4.5 WITHOUT ROUNDING; fails if the content set is
// empty.
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
    const ratio = contrastRatio(token.hex, bgHex);
    pairsChecked++;
    if (!(ratio >= CONTENT_MIN)) {
      fail(`${token.name} (${token.hex}) vs ${bgName} (${bgHex}) = ${ratio.toFixed(4)} < ${CONTENT_MIN}`);
    }
  }
}

console.log(`AC-026: ${contentTokens.length} content/ink token(s), ${pairsChecked} (token, background) pair(s) checked.`);

console.log(failures === 0 ? '\nPASS (AC-026).' : `\nFAIL: ${failures} failure(s) (AC-026).`);
process.exit(failures === 0 ? 0 : 1);
