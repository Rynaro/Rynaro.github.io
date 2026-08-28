#!/usr/bin/env node
// scripts/dark-cascade-contrast.test.mjs
//
// AC-106: "each enumerated selector SHALL reach a computed contrast ratio of
// at least 4.5 against its cascade-resolved background in every theme it
// renders in." Runs getComputedStyle (Playwright) on the BUILT
// `_site/about/index.html` (dark) and `_site/notebook/index.html` (light + dark)
// for representative editorial text on solid surfaces.
// (notebook, both themes -- the gold ground never flips) -- and asserts every
// value >= 4.5, computed with `scripts/lib/color-math.mjs` (never rounded).
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
    const target = document.querySelector(sel);
    if (!target) return null;

    const layers = [];
    for (let el = target; el; el = el.parentElement) {
      const match = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!match) continue;
      const [r, g, b, a = 1] = match[1].split(',').map(Number);
      if (a > 0) layers.push({ r, g, b, a });
    }

    // Composite translucent element backgrounds over their ancestors instead
    // of treating an rgba declaration as an opaque color.
    let result = { r: 255, g: 255, b: 255 };
    for (const layer of layers.reverse()) {
      result = {
        r: layer.r * layer.a + result.r * (1 - layer.a),
        g: layer.g * layer.a + result.g * (1 - layer.a),
        b: layer.b * layer.a + result.b * (1 - layer.a),
      };
    }
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  }, selector);
  return rgb ? rgbToHex(rgb) : null;
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
// About editorial surfaces, dark browser preference.
// ---------------------------------------------------------------------
{
  const page = await newPage('dark');
  await page.goto(`${base}/about/`, { waitUntil: 'networkidle' });
  for (const sel of ['.about-principles h3', '.about-principles li p', '.about-career__list h3', '.about-career__period']) {
    await checkSelector(page, 'about/ (dark)', sel);
  }
  await page.close();
}

// ---------------------------------------------------------------------
// Notebook editorial cards in both themes.
// ---------------------------------------------------------------------
for (const scheme of ['light', 'dark']) {
  const page = await newPage(scheme);
  await page.goto(`${base}/notebook/`, { waitUntil: 'networkidle' });
  await checkSelector(page, `notebook/ (${scheme})`, '.journal-entry__title a');
  await checkSelector(page, `notebook/ (${scheme})`, '.journal-entry__excerpt');
  await checkSelector(page, `notebook/ featured Eidolon (${scheme})`, '.journal-feature .authorship-mark--eidolon');
  await page.close();
}

await browser.close();
server.close();

console.log(failures === 0 ? '\nPASS (AC-106, AC-107).' : `\nFAIL: ${failures} failure(s) (AC-106/AC-107).`);
process.exit(failures === 0 ? 0 : 1);
