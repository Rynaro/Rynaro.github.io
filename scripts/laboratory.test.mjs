#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const canonicalPath = `${root}_site/laboratory/index.html`;
const legacyPath = `${root}_site/laboratory.html`;
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures += 1; };
const check = (condition, message) => condition ? console.log(`ok: ${message}`) : fail(message);
check(!existsSync(legacyPath), 'obsolete /laboratory.html compatibility output stays absent');
if (!existsSync(canonicalPath)) {
  fail('canonical Laboratory output missing; run bundle exec jekyll build first');
} else {
  const html = readFileSync(canonicalPath, 'utf8');
  check((html.match(/ data-project data-project-key=/g) || []).length === 20, 'all 20 projects render server-side');
  check((html.match(/data-project-section=/g) || []).length === 5, 'five semantic collections render');
  check(/data-laboratory-controls hidden/.test(html), 'enhancement controls start hidden');
  check(!/data-project[^>]+hidden/.test(html), 'projects remain visible without JavaScript');
  check(/role="group" aria-label="Filter projects by collection"/.test(html), 'filters use a labelled button group');
  check(/aria-live="polite"/.test(html), 'result count is announced politely');
  check(/class="laboratory-card laboratory-card--flagship/.test(html), 'Eidolons receives the flagship presentation');
  const cards = [...html.matchAll(/<article class="laboratory-card[^>]+data-project-key="([^"]+)"[\s\S]*?<ul class="laboratory-card__tags"[^>]*>([\s\S]*?)<\/ul>/g)];
  check(cards.length === 20, 'all project badge lists are available for validation');
  for (const [, key, tagList] of cards) {
    const badges = [...tagList.matchAll(/<li>([^<]+)<\/li>/g)].map((match) => match[1].trim());
    check(badges.every((badge) => badge === badge.toLocaleLowerCase()), `${key} badge text is canonical lowercase`);
    check(new Set(badges.map((badge) => badge.toLocaleLowerCase())).size === badges.length, `${key} has no duplicate badges`);
  }
  for (const key of ['eidolons', 'ariramba', 'magicite', 'crystalium']) check(html.includes(`id="project-${key}"`), `${key} has a stable project anchor`);
  for (const category of ['flagship', 'research', 'tools', 'personal', 'archive']) check(html.includes(`id="${category}"`), `${category} collection has an anchor`);
}
const script = readFileSync(`${root}assets/js/laboratory.js`, 'utf8');
for (const contract of ['aria-pressed', 'dataset.search', 'hidden']) check(script.includes(contract), `enhancement script includes ${contract}`);

console.log(failures ? `\nFAIL: ${failures} Laboratory check(s).` : '\nPASS (Laboratory landing).');
process.exit(failures ? 1 : 0);
