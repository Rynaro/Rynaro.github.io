#!/usr/bin/env node
// scripts/accessibility-page.test.mjs
//
// AC-040: "THEN the site SHALL publish an `/accessibility` page stating the
// accessibility target and the known gaps." VERIFY: `_site/accessibility/`
// renders and names WCAG 2.2 AA, the automated axe check, and a contact
// route for reports.
//
// This script verifies the published target and evidence language. It does
// not turn those checks into a claim of complete conformance.

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

if (/not a claim|does not constitute|cannot verify|cannot guarantee/i.test(html)) ok('explicitly distinguishes the target and evidence from full conformance');
else fail('does not explicitly distinguish its target or evidence from a conformance claim');

for (const [label, expression] of [
  ['HP/MP/ST/EXP', /HP\/MP\/ST\/EXP/i],
  ['rarity', /rarity/i],
  ['ultimate ability', /ultimate ability/i],
  ['screen-reader testing on every change', /screen.reader.{0,80}every change|every change.{0,80}screen.reader/i],
]) {
  if (expression.test(html)) fail(`retains stale ${label} claim`);
  else ok(`does not retain stale ${label} claim`);
}

console.log(failures === 0 ? '\nPASS (AC-040).' : `\nFAIL: ${failures} failure(s) (AC-040).`);
process.exit(failures === 0 ? 0 : 1);
