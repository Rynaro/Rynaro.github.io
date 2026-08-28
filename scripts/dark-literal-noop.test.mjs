#!/usr/bin/env node
// scripts/dark-literal-noop.test.mjs
//
// AC-109: "the compiled computed style of that selector in dark mode SHALL be
// unchanged by the deletion [of a per-selector dark literal]." A literal whose
// removal alters the computed value is retained, not deleted (N4).
//
// Methodology (real before/after, not a source-partial guess): for each
// candidate literal this phase removed, load the BUILT page (dark
// colorScheme) -- its current computed style is "AFTER" (the literal is
// already gone from the source). Then inject the OLD literal declaration back
// via `page.addStyleTag` at `!important` (forcing it to be the winning
// declaration again, exactly reproducing "what the page looked like before
// this deletion") and re-measure -- that is "BEFORE". If AFTER === BEFORE for
// the declaration's own property, the deletion was a computed no-op. N4 also
// requires checking pseudo-states (:hover/:focus) where the selector has one,
// not just the base state.
//
// This legacy regression now retains only candidates whose surfaces still
// exist. Notebook's former scroll/inventory selectors were retired by its
// editorial rebrand; testing absent nodes would not prove a computed no-op.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const siteDir = root + '_site';

if (!existsSync(siteDir)) {
  console.error('FAIL: _site/ does not exist -- run `bundle exec jekyll build` first.');
  process.exit(1);
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      let full = join(siteDir, p);
      try {
        if (statSync(full).isDirectory()) full = join(full, 'index.html');
      } catch {
        if (!extname(full) && existsSync(full + '.html')) full += '.html';
      }
      if (!existsSync(full)) { res.writeHead(404); res.end('not found: ' + p); return; }
      res.writeHead(200, { 'Content-Type': MIME[extname(full)] || 'application/octet-stream' });
      res.end(readFileSync(full));
    });
    server.listen(port, () => resolve(server));
  });
}

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

// { url, selector, property, oldValue, pseudo?: 'focus' } -- pseudo is only
// set for form controls whose interactive state N4 requires re-checking.
const CANDIDATES = [
  { file: '_sass/_letter.scss', url: '/letter.html', selector: '.section-title', property: 'color', oldValue: '#e0e0e0' },
  { file: '_sass/_letter.scss', url: '/letter.html', selector: '.grimoire-text', property: 'color', oldValue: '#e0e0e0' },
  { file: '_sass/_letter.scss', url: '/letter.html', selector: '.form-input, .form-textarea', property: 'color', oldValue: '#e0e0e0', pseudo: 'focus' },
];

const PORT = 4175;
const server = await startServer(PORT);
const base = `http://localhost:${PORT}`;
const browser = await chromium.launch();

async function computedValue(page, selector, property, { focus = false } = {}) {
  const first = page.locator(selector).first();
  if (await first.count() === 0) return null;
  if (focus) {
    try { await first.focus(); } catch { /* not focusable in this state -- skip */ }
  }
  return first.evaluate((el, prop) => getComputedStyle(el)[prop], property);
}

const noopResults = [];

for (const c of CANDIDATES) {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto(`${base}${c.url}`, { waitUntil: 'networkidle' });

  const afterBase = await computedValue(page, c.selector, c.property);
  if (afterBase === null) {
    fail(`${c.file} ${c.selector}: selector not found on ${c.url} -- cannot verify no-op`);
    await context.close();
    continue;
  }

  let afterPseudo = null;
  if (c.pseudo === 'focus') {
    afterPseudo = await computedValue(page, c.selector, c.property, { focus: true });
  }

  // Re-inject the OLD literal at !important so it becomes the winning
  // declaration again -- reproduces "BEFORE" without rebuilding the site.
  await page.addStyleTag({ content: `${c.selector} { ${c.property}: ${c.oldValue} !important; }` });
  const beforeBase = await computedValue(page, c.selector, c.property);
  let beforePseudo = null;
  if (c.pseudo === 'focus') {
    beforePseudo = await computedValue(page, c.selector, c.property, { focus: true });
  }

  const baseNoop = afterBase === beforeBase;
  const pseudoNoop = c.pseudo ? afterPseudo === beforePseudo : true;

  if (baseNoop && pseudoNoop) {
    ok(`${c.file} ${c.selector}: base state no-op (${c.property}: ${afterBase})${c.pseudo ? `; ${c.pseudo} state no-op (${afterPseudo})` : ''}`);
    noopResults.push({ ...c, safe: true });
  } else {
    if (!baseNoop) fail(`${c.file} ${c.selector}: base state CHANGED -- after="${afterBase}" before="${beforeBase}" (literal was load-bearing; must be reinstated)`);
    if (!pseudoNoop) fail(`${c.file} ${c.selector}:${c.pseudo}: ${c.pseudo} state CHANGED -- after="${afterPseudo}" before="${beforePseudo}" (literal was load-bearing on :${c.pseudo}; must be reinstated)`);
    noopResults.push({ ...c, safe: false });
  }

  await context.close();
}

await browser.close();
server.close();

console.log(`\n${noopResults.filter((r) => r.safe).length}/${noopResults.length} candidate literal(s) verified as computed no-ops.`);
console.log(failures === 0 ? '\nPASS (AC-109).' : `\nFAIL: ${failures} failure(s) (AC-109) -- reinstate the literal(s) named above, they are load-bearing.`);
process.exit(failures === 0 ? 0 : 1);
