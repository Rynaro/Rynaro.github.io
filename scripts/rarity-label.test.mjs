#!/usr/bin/env node
// scripts/rarity-label.test.mjs
//
// AC-030: "GIVEN a project rendered with a rarity tier WHEN the rarity chip
// is presented THEN the tier SHALL be conveyed by a visible text label,
// never by chip colour alone."
//
// VERIFY (exact): each rarity chip in `_site` contains the tier word as
// text; Color Oracle simulation confirms tiers remain distinguishable
// without hue.
//
// Run AFTER `bundle exec jekyll build` (reads _site/, the built output, per
// the VERIFY's own wording -- not the source templates).
//
// Color Oracle note: Color Oracle is an interactive desktop colorblindness
// simulator (screen-capture based), not a CLI/CI-automatable tool -- it
// cannot be invoked headlessly here. What this script asserts instead, and
// what makes the Color Oracle claim TRUE by construction rather than by
// inspection: the tier is conveyed by the literal WORD ("Legendary",
// "Epic", ...) as real text content, not by the border/strip color alone.
// A word reads identically under every Color Oracle simulation mode
// (protanopia/deuteranopia/tritanopia only remap hue, never remove text) --
// so confirming the word is present AND that the sibling color-only
// indicator is aria-hidden (i.e. formally redundant, not a second,
// hue-only channel) is the CI-checkable proxy for the manual claim. The
// manual Color Oracle pass itself belongs on the milestone checklist
// (research-ui-a11y.md §7.4), not a blocking per-commit gate.

import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const sitePath = root + '_site/laboratory.html';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };

if (!existsSync(sitePath)) {
  console.error(`FAIL: ${sitePath} does not exist -- run \`bundle exec jekyll build\` first (this test reads the BUILT _site/, per AC-030's VERIFY).`);
  process.exit(1);
}

const html = readFileSync(sitePath, 'utf8');
const VALID_TIERS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// Every `data-rarity="X"` indicator must be paired with a sibling
// `.item-rarity-label` carrying the capitalized tier word, and the
// color-only indicator itself must be aria-hidden (so it's redundant, not a
// second information channel).
const cardRe = /<div class="item-rarity-indicator"\s+data-rarity="([a-z]+)"\s+aria-hidden="true">[\s\S]*?<span class="item-rarity-label item-rarity-label--([a-z]+)">([^<]+)<\/span>/g;

let cardCount = 0;
let m;
while ((m = cardRe.exec(html))) {
  cardCount++;
  const [, dataRarity, labelClassTier, labelText] = m;
  if (!VALID_TIERS.includes(dataRarity)) fail(`unrecognized rarity tier "${dataRarity}" (card #${cardCount})`);
  if (dataRarity !== labelClassTier) fail(`data-rarity="${dataRarity}" but label class is --${labelClassTier} (card #${cardCount})`);
  if (labelText.trim().toLowerCase() !== dataRarity) {
    fail(`label text "${labelText.trim()}" does not match tier "${dataRarity}" (card #${cardCount})`);
  }
}

if (cardCount === 0) {
  fail('zero rarity chips found in _site/laboratory.html -- the pattern may not match the built markup (check the indicator/label structure), or _data/projects.yml is empty. Anti-vacuity: this must not silently pass on zero matches.');
} else {
  console.log(`ok: ${cardCount} rarity chip(s) in _site/laboratory.html each carry the tier word as visible text, and the color-only indicator is aria-hidden.`);
}

// Also assert every color-strip indicator (the hue-only channel) is
// aria-hidden, wherever it appears -- redundant with the loop above but
// stated as its own check since it's the operative fact behind the Color
// Oracle claim (a hue-only, aria-hidden strip cannot be the sole channel;
// the text label is).
const indicatorRe = /<div class="item-rarity-indicator"[^>]*>/g;
const indicators = html.match(indicatorRe) || [];
const notHidden = indicators.filter((tag) => !tag.includes('aria-hidden="true"'));
if (notHidden.length > 0) {
  fail(`${notHidden.length} .item-rarity-indicator element(s) are NOT aria-hidden -- the color-only strip would be a second, unlabeled information channel.`);
}

console.log(failures === 0 ? '\nPASS (AC-030, mechanical proxy).' : `\nFAIL: ${failures} failure(s) (AC-030).`);
process.exit(failures === 0 ? 0 : 1);
