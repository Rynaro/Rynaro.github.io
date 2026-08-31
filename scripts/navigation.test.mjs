#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures++; };
const ok = (message) => console.log(`ok: ${message}`);

const renderedHome = `${root}_site/index.html`;
if (!existsSync(renderedHome)) {
  fail('rendered homepage is absent; run bundle exec jekyll build first');
} else {
  const html = readFileSync(renderedHome, 'utf8');
  if (html.indexOf('skip-to-content') < html.indexOf('class="wayfinder"')) ok('skip link precedes the Wayfinder');
  else fail('skip link must remain the first focusable control');

  if (/class="wayfinder__trigger" href="#astrolabe-chart" aria-label="Wayfinder — Open the chart"/.test(html)) ok('no-JS trigger is a named in-page anchor');
  else fail('server-rendered trigger must remain an anchor to the chart');

  const routes = ['/', '/about/', '/notebook/', '/laboratory/', '/letter/'];
  routes.forEach((route) => {
    if (html.includes(`href="${route}"`)) ok(`chart renders ${route}`);
    else fail(`chart does not render ${route}`);
  });

  if (/href="\/" aria-current="page"/.test(html)) ok('home route exposes aria-current');
  else fail('home route lacks aria-current');

  if (/Field Notes/.test(html) && !/astrolabe__route-alias[^>]*>\s*Notebook/i.test(html)) ok('Field Notes uses its current public name without a legacy Notebook alias');
  else fail('Field Notes must use its current public name without a legacy Notebook alias');

  const modalCount = (html.match(/id="astrolabe-chart"/g) || []).length;
  if (modalCount === 1 && (html.match(/data-wayfinder-view=/g) || []).length === 2) ok('one shared shell contains chart and game sibling views');
  else fail('chart and game must share exactly one astrolabe shell');

  if (/data-harmonic-seal-invitation hidden/.test(html) && /data-wayfinder-open="harmonic-seal"/.test(html)) ok('whole Play invitation is inert until successful enhancement');
  else fail('server-rendered Play invitation must start hidden');
}

const post = `${root}_site/2026/02/18/llm-model-routing-claude/index.html`;
if (existsSync(post)) {
  const html = readFileSync(post, 'utf8');
  if (/href="\/notebook\/" aria-current="page"/.test(html)) ok('dated posts resolve to Field Notes');
  else fail('dated post does not mark Field Notes current');
}

const footer = readFileSync(`${root}_includes/footer.html`, 'utf8');
if (/site\.data\.navigation\.secondary/.test(footer)) ok('footer reuses navigation YAML');
else fail('footer duplicates route data instead of reusing navigation YAML');

const script = readFileSync(`${root}assets/js/sigil-navigation.js`, 'utf8');
for (const contract of ['aria-modal', 'aria-hidden', 'Escape', 'inert', 'returnFocus']) {
  if (script.includes(contract)) ok(`modal behavior includes ${contract}`);
  else fail(`modal behavior is missing ${contract}`);
}
for (const contract of ['setView', 'harmonic-seal', 'playTriggers', 'wayfinderViewCurrent']) {
  if (script.includes(contract)) ok(`shared view controller includes ${contract}`);
  else fail(`shared view controller is missing ${contract}`);
}
if (/gameInvitation[\s\S]*gameInvitation\.hidden\s*=\s*false/.test(script)) ok('successful game mount reveals the whole invitation');
else fail('controller must reveal the invitation only after game mount');
if (!/createElement\(['"](?:dialog|section)['"]\)/.test(script)) ok('controller does not create another dialog shell');
else fail('controller must not create another dialog shell');
for (const contract of ['WayfinderConstellations', 'getCurrentPosition', 'São Paulo', 'toISOString']) {
  if (script.includes(contract)) ok(`live constellations include ${contract}`);
  else fail(`live constellations are missing ${contract}`);
}
if (/anchor\.getAttribute\(['"]aria-label['"]\)/.test(script) && /trigger\.setAttribute\(['"]aria-label['"], triggerLabel\)/.test(script)) ok('enhanced trigger preserves the fallback accessible name');
else fail('enhanced trigger does not preserve the fallback accessible name');

console.log(failures ? `\nFAIL: ${failures} navigation check(s).` : '\nPASS (Wayfinder navigation).');
process.exit(failures ? 1 : 0);
