#!/usr/bin/env node
// scripts/text-spacing-height.test.mjs
//
// AC-038: "GIVEN a themed chip, badge, banner, or stat row WHEN a user
// overrides text spacing to the 1.4.12 values THEN no text SHALL be clipped
// by a fixed height." VERIFY (exact pattern):
//   grep -rnE '(^|[^-[:alnum:]])height:[[:space:]]*[0-9]' _sass/
// returns zero hits WITHIN themed chip, badge, or banner rule
// blocks (excludes min-height/max-height/line-height); the text-spacing
// bookmarklet clips nothing.
//
// The grep pattern alone matches ~110 `height:` declarations sitewide --
// almost all of them icon circles, image frames, decorative bars, and
// progress-bar TRACKS (non-text containers, where a fixed height is
// correct, not a defect). AC-038 scopes the obligation to rule blocks whose
// selector identifies it as a themed chip/badge/banner -- this
// script uses the shared SCSS scanner's brace-depth selector tracking to
// apply the grep pattern ONLY inside matching selector blocks, per the
// VERIFY's own "within themed chip, badge, or banner rule blocks"
// qualifier.

import { scanFile, listScssFiles, assertScanCoverage } from './lib/scss-scan.mjs';

const root = process.cwd() + '/';

// Selector-name keywords identifying a themed chip/badge/banner
// component (case-insensitive substring match against the selector stack).
// Deliberately keyword-based, not a hand-picked list of selectors, so a
// future `.new-badge { height: 2rem }` is caught without editing this file.
const KEYWORDS = /(chip|badge|banner|\.status-bar|\btag\b)/i;

// AC-038's own literal grep, applied per-line: matches `height:` but not
// `min-height:`/`max-height:`/`line-height:`.
const HEIGHT_RE = /(^|[^-a-zA-Z0-9])height:\s*[0-9]/;

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };

// AC-202 (normalize-p2): shared anti-vacuity structural guard. This suite
// calls listScssFiles() directly, so it gets the same scanner-coverage
// protection as token-usage.test.mjs rather than staying blind to a
// scanner silently under-scanning _sass/.
const coverage = assertScanCoverage();
if (!coverage.ok) fail(coverage.message);
else console.log(`ok: ${coverage.message}`);

// Narrow, individually-justified exemptions: a themed-keyword selector whose
// fixed height sizes a FIXED-SIZE ICON GLYPH (never reflowable text) rather
// than a text container -- 1.4.12 governs text spacing, not icon geometry.
// Short, explicit exemptions prevent this from becoming a blanket escape hatch.
const EXEMPTIONS = new Set([
  '_sass/pages/_about.scss:.badge-icon', // 24x24 circular icon swatch inside .status-badge; text lives in the sibling .badge-name, not here.
]);

let scanned = 0;
let flaggedBlocks = 0;

for (const file of listScssFiles()) {
  const records = scanFile(file);
  for (const rec of records) {
    if (!HEIGHT_RE.test(rec.text)) continue;
    scanned++;
    const themedSelector = rec.selectorStack.find((sel) => KEYWORDS.test(sel));
    if (!themedSelector) continue;
    const exemptionKey = `${file.replace(root, '')}:${themedSelector}`;
    if (EXEMPTIONS.has(exemptionKey)) {
      console.log(`info: ${file.replace(root, '')}:${rec.line} exempted (${exemptionKey}) -- icon glyph, not text.`);
      continue;
    }
    flaggedBlocks++;
    fail(`${file.replace(root, '')}:${rec.line} -- fixed height inside ${JSON.stringify(rec.selectorStack)}: ${rec.text.trim()}`);
  }
}

console.log(`${scanned} height:<number> declaration(s) matched the AC-038 grep pattern sitewide; ${flaggedBlocks} fall inside a themed chip/badge/banner selector block.`);
if (flaggedBlocks === 0) {
  console.log('ok: zero fixed-height declarations inside a themed chip/badge/banner selector block (the rest are icon circles and image frames, where fixed height is correct, not a 1.4.12 risk).');
}

console.log(failures === 0 ? '\nPASS (AC-038, mechanical).' : `\nFAIL: ${failures} failure(s) (AC-038).`);
console.log('Manual follow-up still owed: run the text-spacing bookmarklet on live chips and badges at a milestone.');
process.exit(failures === 0 ? 0 : 1);
