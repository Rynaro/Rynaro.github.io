#!/usr/bin/env node
import { readFileSync } from 'node:fs';

let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`ok: ${message}`);
  else { console.error(`FAIL: ${message}`); failures += 1; }
};

const home = readFileSync('_site/index.html', 'utf8');
const homeSource = readFileSync('index.html', 'utf8');
const sass = readFileSync('_sass/pages/_home.scss', 'utf8');
const fieldNotes = home.match(/<section[^>]+id="field-notes"[\s\S]*?<\/section>/)?.[0] ?? '';
const socialLinks = [
  ['GitHub', 'https://github.com/Rynaro'],
  ['LinkedIn', 'https://www.linkedin.com/in/hlavezzo'],
  ['Dev.to', 'https://dev.to/rynaro'],
];

check(fieldNotes.length > 0, 'homepage renders the Field Notes section');
check((fieldNotes.match(/class="journal-entry"/g) ?? []).length === 3, 'Field Notes renders exactly three journal entries');
check(sass.includes('grid-template-columns: repeat(3, minmax(0, 1fr))'), 'Field Notes defines a three-column desktop grid');
check(/@supports \(grid-template-rows: subgrid\)[\s\S]*\.atelier-home \.atelier-notes__grid \.journal-entry\s*\{[\s\S]*?grid-row: span 6;[\s\S]*?grid-template-rows: subgrid;/.test(sass), 'Field Notes progressively aligns cards across six shared editorial tracks');
check(/@supports \(grid-template-rows: subgrid\)[\s\S]*\.atelier-home \.atelier-notes__grid \.journal-entry__body\s*\{[\s\S]*?display: grid;[\s\S]*?grid-row: span 4;[\s\S]*?grid-template-rows: subgrid;/.test(sass), 'Field Notes body shares metadata, title, excerpt, and tag tracks');
check(/\.atelier-home \.atelier-notes__grid \.journal-entry\s*\{[\s\S]*?grid-template: auto 1fr auto \/ minmax\(0, 1fr\);/.test(sass), 'Field Notes retains a natural-flow fallback for browsers without subgrid');
check(/\.atelier-home \.atelier-notes__grid \.journal-entry__meta\s*\{[^}]*align-content: start;/.test(sass), 'Field Notes metadata starts consistently within its shared track');
check(/\.atelier-home \.atelier-notes__grid \.authorship-mark\s*\{[^}]*max-width: 100%;/.test(sass), 'Field Notes authorship marks remain bounded by their cards');
check(/@media \(max-width: 767px\)[\s\S]*\.atelier-artifact-grid, \.atelier-notes__grid/.test(sass), 'Field Notes collapses to one column on small screens');
check(!/(?:min-height|height):[^;]+;[^}]*\/\*[^*]*equal/i.test(sass), 'Field Notes alignment does not depend on equalizing fixed heights');
check(!/\.atelier-notes__grid \.scroll-(?:item|card)/.test(sass), 'homepage Sass contains no obsolete scroll-item or scroll-card selectors');
check(sass.includes('.atelier-home .atelier-notes__grid .authorship-mark--eidolon'), 'homepage visibly distinguishes Eidolon authorship');
for (const [name, url] of socialLinks) {
  check(home.includes(`href="${url}"`) && home.includes(`aria-label="${name}"`), `homepage renders the canonical ${name} social link`);
}
check(homeSource.includes('site.data.profile.social_links'), 'homepage reads social links from the canonical profile data');
check(!homeSource.includes('identity.social_links'), 'homepage has no stale identity social-link reference');

process.exitCode = failures ? 1 : 0;
