#!/usr/bin/env node
// scripts/accessibility-page.test.mjs
//
// AC-040: "THEN the site SHALL publish an `/accessibility` page stating the
// conformance target and the known gaps." VERIFY: `_site/accessibility/`
// renders and names WCAG 2.2 AA, the automated axe check, and a contact
// route for reports.
//
// Story 4.11 / spec.yaml: ships LAST in Phase 4, after 4a and both CI checks
// (palette contrast + pa11y-ci) are green -- a conformance claim the site
// does not meet is worse than no page. This script only asserts the page's
// mechanical content; it does not certify the claim itself (that's the rest
// of Phase 4a/4b's test suite + the manual milestone checklist).

import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const path = root + '_site/accessibility/index.html';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

if (!existsSync(path)) {
  console.error(`FAIL: ${path} does not exist -- run \`bundle exec jekyll build\` first.`);
  process.exit(1);
}

const html = readFileSync(path, 'utf8');

if (/WCAG\s*2\.2.{0,10}AA/i.test(html)) ok('names WCAG 2.2 AA as the conformance target');
else fail('does not name "WCAG 2.2 ... AA" as the conformance target');

if (/axe-core|axe\b.*(automat|blocking)|pa11y/i.test(html)) ok('names the automated axe check');
else fail('does not name the automated axe/pa11y-ci check');

if (/mailto:[^"]+@[^"]+/i.test(html)) ok('provides a mailto: contact route for reports');
else fail('does not provide a mailto: contact route');

if (/known gaps|not yet|hasn't happened|not fixed/i.test(html)) ok('names at least one known gap (not a bare compliance claim)');
else fail('does not appear to name any known gap -- a page claiming perfection is the exact D&D Beyond failure mode this page exists to avoid');

console.log(failures === 0 ? '\nPASS (AC-040).' : `\nFAIL: ${failures} failure(s) (AC-040).`);
process.exit(failures === 0 ? 0 : 1);
