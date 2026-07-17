#!/usr/bin/env node
// scripts/axe-audit.mjs
//
// Real headless-browser verification (Playwright + axe-core) for Phase 4b's
// AC-028, AC-029, AC-032, AC-033, AC-035, AC-036, AC-037 -- run against the
// BUILT _site/ (bundle exec jekyll build first), served over local HTTP so
// relative asset paths resolve exactly as they would on GitHub Pages.
//
// This is the evidence gap the brief named explicitly (AC-025 in Phase 3
// shipped on CSS inspection with no browser) -- this script exists so this
// phase does not repeat it.

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const siteDir = root + '_site';

if (!existsSync(siteDir)) {
  console.error('FAIL: _site/ does not exist -- run `bundle exec jekyll build` first.');
  process.exit(1);
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.json': 'application/json' };

function startServer(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = decodeURIComponent(req.url.split('?')[0]);
      if (path === '/') path = '/index.html';
      let full = join(siteDir, path);
      try {
        if (statSync(full).isDirectory()) full = join(full, 'index.html');
      } catch {
        // try appending .html (extensionless permalinks)
        if (!extname(full) && existsSync(full + '.html')) full += '.html';
      }
      if (!existsSync(full)) {
        res.writeHead(404);
        res.end('not found: ' + path);
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(full)] || 'application/octet-stream' });
      res.end(readFileSync(full));
    });
    server.listen(port, () => resolve(server));
  });
}

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

const PORT = 4173;
const server = await startServer(PORT);
const base = `http://localhost:${PORT}`;

const browser = await chromium.launch();

async function newPage() {
  const context = await browser.newContext();
  return context.newPage();
}

// ---------------------------------------------------------------------
// AC-028 / AC-029: About page HP/MP/ST = role=meter with aria-valuetext;
// EXP = role=progressbar with the required aria-value attributes.
// ---------------------------------------------------------------------
{
  const page = await newPage();
  await page.goto(`${base}/about.html`, { waitUntil: 'networkidle' });

  const meters = await page.locator('[role="meter"]').all();
  if (meters.length !== 3) fail(`About page has ${meters.length} role="meter" elements, expected 3 (HP/MP/ST)`);
  for (const m of meters) {
    const name = await m.getAttribute('aria-label');
    const valuetext = await m.getAttribute('aria-valuetext');
    const valuenow = await m.getAttribute('aria-valuenow');
    const valuemin = await m.getAttribute('aria-valuemin');
    const valuemax = await m.getAttribute('aria-valuemax');
    if (!valuetext || valuetext.trim() === '') fail(`meter "${name}" has empty/missing aria-valuetext`);
    if (valuenow === null || valuemin === null || valuemax === null) fail(`meter "${name}" missing one of aria-valuenow/min/max`);
    if (valuetext && !/^\d+ of \d+ .+/.test(valuetext)) fail(`meter "${name}" aria-valuetext "${valuetext}" doesn't match "N of M ..." shape`);
  }
  if (meters.length === 3 && failures === 0) ok(`3 role="meter" elements (HP/MP/ST), each with a non-empty aria-valuetext like "${await meters[0].getAttribute('aria-valuetext')}"`);

  const bars = await page.locator('[role="progressbar"]').all();
  if (bars.length !== 1) fail(`About page has ${bars.length} role="progressbar" elements, expected 1 (EXP)`);
  else {
    const valuetext = await bars[0].getAttribute('aria-valuetext');
    const valuenow = await bars[0].getAttribute('aria-valuenow');
    const valuemin = await bars[0].getAttribute('aria-valuemin');
    const valuemax = await bars[0].getAttribute('aria-valuemax');
    if (!valuetext || valuenow === null || valuemin === null || valuemax === null) {
      fail(`progressbar (EXP) missing a required aria-value attribute (valuetext="${valuetext}" now=${valuenow} min=${valuemin} max=${valuemax})`);
    } else {
      ok(`role="progressbar" (EXP) with aria-valuetext="${valuetext}"`);
    }
  }

  // axe pass, scoped to the meter/progressbar region -- catches
  // aria-required-attr / aria-valid-attr-value class issues automatically.
  const axeResults = await new AxeBuilder({ page }).include('.status-bars').analyze();
  if (axeResults.violations.length > 0) {
    for (const v of axeResults.violations) fail(`axe (About .status-bars): ${v.id} -- ${v.help} (${v.nodes.length} node(s))`);
  } else {
    ok('axe reports zero violations scoped to .status-bars (About)');
  }

  await page.close();
}

// ---------------------------------------------------------------------
// AC-033: themed nav accessible name contains the visible label ("Notebook").
// ---------------------------------------------------------------------
{
  const page = await newPage();
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  const notebookLink = page.locator('a[href*="notebook"]').first();
  const count = await page.locator('a[href*="notebook"]').count();
  if (count === 0) {
    fail('no link to /notebook found on the homepage');
  } else {
    const accName = await notebookLink.evaluate((el) => el.getAttribute('aria-label') || el.textContent.trim());
    if (!accName.toLowerCase().includes('notebook')) {
      fail(`Notebook nav link accessible name "${accName}" does not contain "Notebook"`);
    } else {
      ok(`Notebook nav link accessible name "${accName}" contains "Notebook"`);
    }
  }

  const axeResults = await new AxeBuilder({ page }).withRules(['label-content-name-mismatch']).analyze();
  if (axeResults.violations.length > 0) {
    for (const v of axeResults.violations) fail(`axe label-in-name (Home): ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
  } else {
    ok('axe reports no label-in-name (label-content-name-mismatch) violation on Home');
  }
  await page.close();
}

// ---------------------------------------------------------------------
// AC-035: 320px-wide render of Home, About, and one post -- no horizontal scrollbar.
// ---------------------------------------------------------------------
{
  const pagesToCheck = ['/index.html', '/about.html'];
  // pick one real post permalink from the sitemap-adjacent _site tree
  const fs = await import('node:fs');
  const postsDir = fs.readdirSync(root + '_posts').filter((f) => f.endsWith('.markdown') || f.endsWith('.md'));
  if (postsDir.length > 0) {
    // Jekyll date-based permalink: /:year/:month/:day/:title
    const m = postsDir[0].match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(markdown|md)$/);
    if (m) pagesToCheck.push(`/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`);
  }
  for (const path of pagesToCheck) {
    const page = await newPage();
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (scrollWidth > clientWidth) {
      fail(`${path} at 320px: scrollWidth (${scrollWidth}) > clientWidth (${clientWidth}) -- horizontal overflow`);
    } else {
      ok(`${path} at 320px: no horizontal overflow (scrollWidth=${scrollWidth}, clientWidth=${clientWidth})`);
    }
    await page.close();
  }
}

// ---------------------------------------------------------------------
// AC-036: keyboard walk -- every interactive element gets a visible focus
// ring, and none is hidden behind the fixed sidebar.
// ---------------------------------------------------------------------
{
  const page = await newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  const interactive = await page.locator('a, button, input, [tabindex]:not([tabindex="-1"])').all();
  let checked = 0;
  let obscured = 0;
  let noOutline = 0;
  for (const el of interactive.slice(0, 40)) {
    if (!(await el.isVisible())) continue;
    await el.focus();
    checked++;
    const box = await el.boundingBox();
    if (!box) continue;
    // F110 check: is the focused element's box entirely within the fixed
    // 60px sidebar's horizontal band while NOT itself being sidebar content?
    const sidebarWidth = 60;
    const inSidebarBand = box.x < sidebarWidth && box.x + box.width <= sidebarWidth;
    const isSidebarEl = await el.evaluate((n) => !!n.closest('.sidebar, .sigil-nav, [class*="sidebar"]'));
    if (inSidebarBand && !isSidebarEl) obscured++;

    const outline = await el.evaluate((n) => {
      const cs = getComputedStyle(n);
      return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow };
    });
    const hasVisibleFocus = (outline.outlineStyle !== 'none' && parseFloat(outline.outlineWidth) > 0) || outline.boxShadow !== 'none';
    if (!hasVisibleFocus) noOutline++;
  }
  if (obscured > 0) fail(`${obscured} focusable element(s) fall entirely within the 60px sidebar band without being sidebar content (F110 risk)`);
  else ok(`${checked} focusable element(s) checked on Home -- none obscured by the 60px sidebar band`);
  if (noOutline > 0) fail(`${noOutline} of ${checked} focusable element(s) have no visible outline/box-shadow when focused`);
  else ok(`all ${checked} checked focusable element(s) on Home show a visible focus indicator (outline or box-shadow)`);
  await page.close();
}

// ---------------------------------------------------------------------
// AC-037: axe target-size check across the sigil nav and social icon row.
// ---------------------------------------------------------------------
{
  const page = await newPage();
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag22aa'])
    .withRules(['target-size'])
    .analyze();
  if (axeResults.violations.length > 0) {
    for (const v of axeResults.violations) {
      for (const n of v.nodes) fail(`axe target-size: ${n.target.join(' ')} -- ${n.failureSummary}`);
    }
  } else {
    ok('axe target-size reports zero violations on Home (sigil nav + social icon row)');
  }
  await page.close();
}

// ---------------------------------------------------------------------
// AC-032: every ornament SVG root carries aria-hidden="true", and none
// carries both aria-hidden and an empty alt (alt only applies to <img>, so
// this is really "no ornament SVG is announced by AT").
// ---------------------------------------------------------------------
{
  for (const path of ['/index.html', '/about.html', '/notebook/', '/laboratory.html', '/letter.html']) {
    const page = await newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const axeResults = await new AxeBuilder({ page }).withRules(['svg-img-alt']).analyze();
    if (axeResults.violations.length > 0) {
      for (const v of axeResults.violations) fail(`axe svg-img-alt (${path}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    }
    await page.close();
  }
  if (failures === 0) ok('axe svg-img-alt reports zero violations across Home/About/Notebook/Laboratory/Letter');
}

// ---------------------------------------------------------------------
// AC-105 (normalize-p1): axe-core's color-contrast rule against each built
// page, under BOTH a default and a colorScheme:'dark' browser context.
// Scoped to the five themed pages P1's dark-cascade consolidation touches
// sitewide (Home/About/Notebook/Laboratory/Letter -- the same set the
// svg-img-alt sweep above already uses); AC-110 enumerates the "about dark"
// and "notebook light/dark" viewports as the only PIXEL-level expected diffs
// for this phase, so this is where a color-contrast regression on any of
// these five pages, in either theme, would surface.
// ---------------------------------------------------------------------
{
  for (const scheme of ['light', 'dark']) {
    for (const path of ['/index.html', '/about.html', '/notebook/', '/laboratory.html', '/letter.html']) {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(base + path, { waitUntil: 'networkidle' });
      const axeResults = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      if (axeResults.violations.length > 0) {
        for (const v of axeResults.violations) {
          for (const n of v.nodes) fail(`axe color-contrast (${path}, ${scheme}): ${n.target.join(' ')} -- ${n.failureSummary.replace(/\n/g, ' ')}`);
        }
      }
      await context.close();
    }
  }
  if (failures === 0) ok('axe color-contrast reports zero violations across Home/About/Notebook/Laboratory/Letter, in both default and colorScheme:\'dark\' contexts (AC-105)');
}

// ---------------------------------------------------------------------
// Full-page axe pass (WCAG2AA), informational -- the blocking CI gate is
// pa11y-ci (AC-039); this is an extra local signal in the same run.
// ---------------------------------------------------------------------
{
  console.log('\n--- informational: full-page axe (wcag2a, wcag2aa) per page ---');
  for (const path of ['/index.html', '/about.html', '/notebook/', '/laboratory.html', '/letter.html']) {
    const page = await newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const axeResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    console.log(`${path}: ${axeResults.violations.length} violation(s)${axeResults.violations.length ? ' -- ' + axeResults.violations.map((v) => v.id).join(', ') : ''}`);
    await page.close();
  }
}

await browser.close();
server.close();

console.log(failures === 0 ? '\nPASS (axe-audit: AC-028, AC-029, AC-032, AC-033, AC-035, AC-036, AC-037).' : `\nFAIL: ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
