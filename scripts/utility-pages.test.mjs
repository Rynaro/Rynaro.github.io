#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const site = join(root, '_site');
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures++; };
const ok = (message) => console.log(`ok: ${message}`);

const pages = [
  { key: 'start-here', file: 'start-here/index.html', modifier: 'bearings' },
  { key: 'codex', file: 'codex/index.html', modifier: 'covenant' },
  { key: 'accessibility', file: 'accessibility/index.html', modifier: 'ledger' },
  { key: 'log', file: 'log/index.html', modifier: 'log' },
  { key: '404', file: '404.html', modifier: 'lost' },
];

function count(html, expression) { return (html.match(expression) || []).length; }
function builtTarget(href) {
  if (!href.startsWith('/') || href.startsWith('//')) return true;
  const clean = href.split(/[?#]/)[0];
  if (clean === '/') return existsSync(join(site, 'index.html'));
  const direct = join(site, clean);
  if (existsSync(direct)) {
    try { return statSync(direct).isDirectory() ? existsSync(join(direct, 'index.html')) : true; } catch { return false; }
  }
  const trimmed = direct.endsWith('/') ? direct.slice(0, -1) : direct;
  return existsSync(`${trimmed}.html`) || existsSync(join(trimmed, 'index.html'));
}

const htmlByKey = {};
for (const page of pages) {
  const path = join(site, page.file);
  if (!existsSync(path)) { fail(`${page.file} does not exist`); continue; }
  const html = readFileSync(path, 'utf8');
  htmlByKey[page.key] = html;
  const article = html.match(/<article class="antechamber[\s\S]*?<\/article>/i)?.[0] || '';
  if (count(html, /<main\b/gi) !== 1) fail(`${page.key} does not contain exactly one main`);
  if (count(html, /<h1\b/gi) !== 1) fail(`${page.key} does not contain exactly one h1`);
  if (!html.includes(`antechamber--${page.modifier}`)) fail(`${page.key} lacks its Antechamber modifier`);
  for (const stale of ['rpg-hero', 'rpg-scrolls', 'related-scroll', 'now-content', 'hero__', 'fade-in', 'fas fa-']) {
    if (article.includes(stale)) fail(`${page.key} retains legacy marker ${stale}`);
  }
  const pageScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/gi)].map((match) => match[1]).filter((src) => !/\/assets\/js\/(main|sigil-navigation)\.js/.test(src));
  if (pageScripts.length) fail(`${page.key} adds a page-specific script: ${pageScripts.join(', ')}`);
  const internal = [...html.matchAll(/href="(\/[^"#]*)"/gi)].map((match) => match[1]);
  for (const href of internal) if (!builtTarget(href)) fail(`${page.key} has unresolved internal link ${href}`);
}

const start = htmlByKey['start-here'] || '';
if (count(start, /<li class="antechamber__route\b/g) === 4) ok('Start Here renders four trails'); else fail('Start Here must render four trails');
if (count(start, /class="antechamber__route-link"/g) === 8) ok('Start Here renders eight destination links'); else fail('Start Here must render eight destination links');
for (const route of ['/about/', '/now/', '/notebook/', '/2026/08/27/rebranding-the-atelier-as-a-party-quest', '/laboratory/', '/uses/', '/letter/']) if (!start.includes(`href="${route}"`)) fail(`Start Here lacks ${route}`);

const codex = htmlByKey.codex || '';
for (const route of ['/notebook/', '/2026/08/27/rebranding-the-atelier-as-a-party-quest', '/letter/']) if (!codex.includes(`href="${route}"`)) fail(`Codex lacks ${route}`);
for (const phrase of ['Authorship stays visible', 'Post type', 'assay']) if (!codex.includes(phrase)) fail(`Codex lacks ${phrase}`);
if (/Claude, mostly/i.test(codex)) fail('Codex retains stale Claude-specific copy');

const accessibility = htmlByKey.accessibility || '';
for (const expression of [/WCAG 2\.2 Level AA/i, /axe-core|pa11y-ci/i, /mailto:/i, /Known gaps/i, /not a claim|do not constitute|cannot verify/i]) if (!expression.test(accessibility)) fail(`Accessibility lacks ${expression}`);
for (const expression of [/HP\/MP\/ST\/EXP/i, /rarity/i, /ultimate ability/i, /icon-fill/i, /ambient glyph/i]) if (expression.test(accessibility)) fail(`Accessibility retains legacy claim ${expression}`);

const missing = htmlByKey['404'] || '';
if (!existsSync(join(site, '404.html')) || existsSync(join(site, '404', 'index.html'))) fail('404 must build only at /404.html');
if (count(missing, /class="antechamber__route-link"/g) !== 5) fail('404 must render five recovery links');
if (/<(?:form|input)\b/i.test(missing) || /type="search"/i.test(missing)) fail('404 adds a form or search control');

const log = htmlByKey.log || '';
if (!log.includes('Entries between expeditions')) fail('Log lacks its focused short-entry purpose');
if (!log.includes('href="/now/"') || !log.includes('href="/notebook/"')) fail('Log does not distinguish itself from Now and Notebook');
if (count(log, /class="journal-entry"/g) !== 2) fail('Log must render the two current type: log entries');
if (/empty-archive|scrolls-collection|notebook-hero/i.test(log)) fail('Log retains a deleted legacy collection selector');

console.log(failures ? `\nFAIL: ${failures} utility-page contract failure(s).` : '\nPASS (utility pages).');
process.exit(failures ? 1 : 0);
