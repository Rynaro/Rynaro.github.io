#!/usr/bin/env node
// scripts/dark-cascade-contrast.test.mjs
//
// AC-106: "each enumerated selector SHALL reach a computed contrast ratio of
// at least 4.5 against its cascade-resolved background in every theme it
// renders in." Runs getComputedStyle (Playwright) on the BUILT
// `_site/about.html` (dark) and `_site/notebook.html` (light + dark) for the
// selectors AC-106 names -- `.attribute-name`, `.category-title`,
// `.quest-title`, `.ability-name` (about, dark only -- the surface never
// rendered in light before or after P1) and `.scroll-seal`/`.scroll-seal i`
// (notebook, both themes -- the gold ground never flips) -- and asserts every
// value >= 4.5, computed with `scripts/lib/color-math.mjs` (never rounded).
//
// AC-107: ".item-rarity-label's dark-mode computed contrast SHALL remain at
// least 4.5" with "a computed color equal to the consolidated flipped token
// value (no per-selector dark literal introduced)". Runs the same check on
// built `_site/laboratory.html` (dark).
//
// Never inspects a source partial -- every ratio here is measured against
// what a real browser actually renders for the compiled cascade (the R1
// mistake this phase does not repeat).

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { contrastRatio } from './lib/color-math.mjs';

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

function rgbToHex(rgbStr) {
  const m = rgbStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return null;
  const c = (n) => Math.round(parseFloat(n)).toString(16).padStart(2, '0');
  return `#${c(m[1])}${c(m[2])}${c(m[3])}`;
}

// Walks up from `selector` until a non-transparent `background-color` is
// found -- getComputedStyle on the element itself only reports what THAT
// element declares, and most text elements here are transparent over a card
// ancestor's background (exactly the cascade-resolved pairing AC-106 asks for,
// not a source-partial guess).
async function effectiveBackgroundHex(page, selector) {
  const rgb = await page.evaluate((sel) => {
    let el = document.querySelector(sel);
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
      el = el.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }, selector);
  return rgbToHex(rgb);
}

async function ownColorHex(page, selector) {
  const rgb = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).color : null;
  }, selector);
  return rgb ? rgbToHex(rgb) : null;
}

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);
const MIN = 4.5;

const PORT = 4174;
const server = await startServer(PORT);
const base = `http://localhost:${PORT}`;
const browser = await chromium.launch();

async function newPage(colorScheme) {
  const context = await browser.newContext({ colorScheme });
  return context.newPage();
}

async function checkSelector(page, label, selector, { walkBg = true } = {}) {
  const exists = await page.locator(selector).count();
  if (exists === 0) { fail(`${label}: selector "${selector}" not found on the page`); return; }
  const fg = await ownColorHex(page, selector);
  const bg = walkBg ? await effectiveBackgroundHex(page, selector) : await ownColorHex(page, selector); // unused branch guard
  if (!fg || !bg) { fail(`${label}: could not resolve computed color/background for "${selector}"`); return; }
  const ratio = contrastRatio(fg, bg);
  if (ratio >= MIN) {
    ok(`${label}: "${selector}" ${fg} on ${bg} = ${ratio.toFixed(4)} >= ${MIN}`);
  } else {
    fail(`${label}: "${selector}" ${fg} on ${bg} = ${ratio.toFixed(4)} < ${MIN}`);
  }
  return { fg, bg, ratio };
}

// ---------------------------------------------------------------------
// AC-106(a): /about, dark cascade -- the four enumerated selectors.
// ---------------------------------------------------------------------
{
  const page = await newPage('dark');
  await page.goto(`${base}/about.html`, { waitUntil: 'networkidle' });
  for (const sel of ['.attribute-name', '.category-title', '.quest-title', '.ability-name']) {
    await checkSelector(page, 'about.html (dark)', sel);
  }
  await page.close();
}

// ---------------------------------------------------------------------
// AC-106(b): notebook.html, .scroll-seal / .scroll-seal i -- BOTH themes
// (the gold ground never flips, so both the shipping-light failure and the
// dark failure must be repaired).
// ---------------------------------------------------------------------
for (const scheme of ['light', 'dark']) {
  const page = await newPage(scheme);
  await page.goto(`${base}/notebook/`, { waitUntil: 'networkidle' });
  await checkSelector(page, `notebook/ (${scheme})`, '.scroll-seal');
  await checkSelector(page, `notebook/ (${scheme})`, '.scroll-seal i');
  await page.close();
}

// ---------------------------------------------------------------------
// AC-107: .item-rarity-label, dark cascade -- must remain >= 4.5 AND its
// computed color must equal the consolidated flipped --dnd-brown value
// (#e0e0e0 / rgb(224, 224, 224)) -- i.e. no per-selector dark literal was
// (re)introduced to "fix" a pair that was never broken.
// ---------------------------------------------------------------------
{
  const page = await newPage('dark');
  await page.goto(`${base}/laboratory.html`, { waitUntil: 'networkidle' });
  const result = await checkSelector(page, 'laboratory.html (dark)', '.item-rarity-label');
  if (result) {
    const expected = '#e0e0e0';
    if (result.fg.toLowerCase() === expected) {
      ok(`laboratory.html (dark): ".item-rarity-label" computed color ${result.fg} equals the consolidated flipped --dnd-brown value ${expected} (no per-selector dark literal introduced)`);
    } else {
      fail(`laboratory.html (dark): ".item-rarity-label" computed color ${result.fg} does NOT equal the consolidated flipped --dnd-brown value ${expected} -- a per-selector dark literal may have been (re)introduced`);
    }
  }
  await page.close();
}

await browser.close();
server.close();

console.log(failures === 0 ? '\nPASS (AC-106, AC-107).' : `\nFAIL: ${failures} failure(s) (AC-106/AC-107).`);
process.exit(failures === 0 ? 0 : 1);
