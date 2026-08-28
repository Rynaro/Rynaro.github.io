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
const FULL_PAGE_PATHS = [
  '/index.html', '/about/', '/notebook/', '/laboratory/', '/letter/', '/now/', '/uses/',
  '/start-here/', '/codex/', '/accessibility/', '/404.html',
  '/log/',
  '/2019/12/12/setup-simple-sftp-server-in-minutes.html',
  '/2026/02/18/llm-model-routing-claude.html',
  '/2026/08/27/rebranding-the-atelier-as-a-party-quest.html',
];
const UTILITY_PATHS = ['/start-here/', '/codex/', '/accessibility/', '/log/', '/404.html'];

const browser = await chromium.launch();

async function newPage() {
  const context = await browser.newContext();
  return context.newPage();
}

// The Wayfinder keeps a stable name as its fallback anchor becomes a button,
// and code regions enter the tab order only while they genuinely overflow.
{
  const postPath = '/2019/12/12/setup-simple-sftp-server-in-minutes.html';
  for (const width of [320, 768, 769]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
    const page = await context.newPage();
    await page.goto(base + postPath, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => [...document.querySelectorAll('.article-content pre')].every((pre) => (
      (pre.scrollWidth > pre.clientWidth + 1) === (pre.getAttribute('tabindex') === '0')
    )));

    const triggerName = await page.locator('.wayfinder__trigger').getAttribute('aria-label');
    if (triggerName === 'Wayfinder — Open the chart') ok(`Wayfinder has its stable accessible name at ${width}px`);
    else fail(`Wayfinder accessible name at ${width}px is "${triggerName}"`);

    const codeState = await page.locator('.article-content pre').evaluateAll((blocks) => blocks.map((pre) => ({
      overflow: pre.scrollWidth > pre.clientWidth + 1,
      tabindex: pre.getAttribute('tabindex'),
    })));
    const overflowing = codeState.filter((block) => block.overflow);
    const nonoverflowing = codeState.filter((block) => !block.overflow);
    if (overflowing.length && overflowing.every((block) => block.tabindex === '0')) ok(`${overflowing.length} overflowing SFTP code region(s) are keyboard-focusable at ${width}px`);
    else fail(`SFTP needs at least one correctly focusable overflowing code region at ${width}px`);
    if (nonoverflowing.every((block) => block.tabindex === null)) ok(`non-overflowing SFTP code regions stay outside the tab order at ${width}px`);
    else fail(`a non-overflowing SFTP code region has tabindex at ${width}px`);

    const firstOverflow = page.locator('.article-content pre[tabindex="0"]').first();
    await firstOverflow.focus();
    const focusStyle = await firstOverflow.evaluate((pre) => {
      const style = getComputedStyle(pre);
      return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor, offset: style.outlineOffset };
    });
    if (focusStyle.width === '3px' && focusStyle.style === 'solid' && focusStyle.color === 'rgb(226, 189, 117)' && focusStyle.offset === '-3px') ok(`overflow focus outline is visible and inset at ${width}px`);
    else fail(`overflow focus outline is incorrect at ${width}px: ${JSON.stringify(focusStyle)}`);

    const copyButton = page.locator('.code-copy-button').first();
    await copyButton.click();
    await page.waitForFunction(() => document.querySelector('.code-copy-button')?.textContent === 'Copied');
    const copiedText = await page.evaluate(() => navigator.clipboard.readText());
    if (copiedText.trim().length > 0) ok(`code copy remains operational at ${width}px`);
    else fail(`code copy produced no clipboard content at ${width}px`);
    await context.close();
  }
}

// Utility thresholds remain complete without JavaScript and do not overflow
// the narrowest supported viewport.
{
  for (const path of UTILITY_PATHS) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
    const page = await context.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      articleVisible: !!document.querySelector('.antechamber') && getComputedStyle(document.querySelector('.antechamber')).display !== 'none',
      links: [...document.querySelectorAll('.antechamber a')].filter((link) => getComputedStyle(link).display !== 'none').length,
    }));
    if (state.scrollWidth > state.clientWidth) fail(`${path} at 320px overflows horizontally (${state.scrollWidth} > ${state.clientWidth})`);
    else ok(`${path} at 320px has no horizontal overflow`);
    if (!state.articleVisible || state.links === 0) fail(`${path} does not retain visible content and routes without JavaScript`);
    else ok(`${path} retains visible content and ${state.links} route(s) without JavaScript`);
    await context.close();
  }
}

// ---------------------------------------------------------------------
// AC-033: themed nav accessible name contains the visible label ("Field Notes").
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
    if (!accName.toLowerCase().includes('field notes')) {
      fail(`Field Notes nav link accessible name "${accName}" does not contain "Field Notes"`);
    } else {
      ok(`Field Notes nav link accessible name "${accName}" contains "Field Notes"`);
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
// AC-035: 320px-wide render of primary pages and one post -- no horizontal scrollbar.
// ---------------------------------------------------------------------
{
  const pagesToCheck = ['/index.html', '/about/', '/now/', '/uses/'];
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
// ring. The old sidebar obstruction check is retired with the sidebar itself.
// ---------------------------------------------------------------------
{
  const page = await newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  const interactive = await page.locator('a, button, input, [tabindex]:not([tabindex="-1"])').all();
  let checked = 0;
  let noOutline = 0;
  for (const el of interactive.slice(0, 40)) {
    if (!(await el.isVisible())) continue;
    await el.focus();
    checked++;
    const box = await el.boundingBox();
    if (!box) continue;
    const outline = await el.evaluate((n) => {
      const cs = getComputedStyle(n);
      return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow };
    });
    const hasVisibleFocus = (outline.outlineStyle !== 'none' && parseFloat(outline.outlineWidth) > 0) || outline.boxShadow !== 'none';
    if (!hasVisibleFocus) noOutline++;
  }
  ok(`${checked} visible focusable element(s) checked on Home`);
  if (noOutline > 0) fail(`${noOutline} of ${checked} focusable element(s) have no visible outline/box-shadow when focused`);
  else ok(`all ${checked} checked focusable element(s) on Home show a visible focus indicator (outline or box-shadow)`);
  await page.close();
}

// ---------------------------------------------------------------------
// AC-037: axe target-size check across the Wayfinder and social icon row.
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
    ok('axe target-size reports zero violations on Home (Wayfinder + social icon row)');
  }
  await page.close();
}

// The enhanced chart is a real modal: audit both states and its keyboard contract.
{
  const page = await newPage();
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  const trigger = page.locator('.wayfinder__trigger');
  await trigger.focus();
  await trigger.press('Enter');
  await page.locator('.astrolabe.is-open').waitFor();
  const openResults = await new AxeBuilder({ page }).withTags(['wcag22aa']).analyze();
  if (openResults.violations.length) {
    openResults.violations.forEach((violation) => fail(`open Wayfinder axe: ${violation.id}`));
  } else ok('open Wayfinder chart has zero axe violations');

  const focusIsInside = await page.evaluate(() => !!document.activeElement?.closest('.astrolabe'));
  if (focusIsInside) ok('opening the chart moves focus inside it');
  else fail('opening the chart did not move focus inside it');

  await page.keyboard.press('Escape');
  const restored = await trigger.evaluate((element) => document.activeElement === element);
  if (restored) ok('Escape closes the chart and restores trigger focus');
  else fail('Escape did not restore focus to the Wayfinder trigger');
  await page.close();
}

// Dynamic constellation copy lives in a compact utility strip beside the close
// control and must never cover chart content at supported viewports.
{
  const viewports = [
    { width: 1280, height: 800 },
    { width: 900, height: 700 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];
  const intersects = (a, b) => !!a && !!b && a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  const contains = (outer, inner, tolerance = 1) => !!outer && !!inner
    && inner.x >= outer.x - tolerance
    && inner.y >= outer.y - tolerance
    && inner.x + inner.width <= outer.x + outer.width + tolerance
    && inner.y + inner.height <= outer.y + outer.height + tolerance;
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('.wayfinder__trigger').click();
    await page.locator('.astrolabe.are-constellations-ready.is-open').waitFor();
    await page.locator('[data-constellation-status]').evaluate((status) => {
      status.textContent = 'Location could not be determined after waiting for permission · the constellation chart continues using the São Paulo fallback sky';
    });

    const utility = await page.locator('.astrolabe__utility').boundingBox();
    const controls = await page.locator('.astrolabe__constellation-controls').boundingBox();
    const close = await page.locator('.astrolabe__close').boundingBox();
    const instrument = await page.locator('.astrolabe__instrument').boundingBox();
    const header = await page.locator('.astrolabe__header').boundingBox();
    const status = await page.locator('.astrolabe__constellation-status').boundingBox();
    const locate = await page.locator('.astrolabe__locate').boundingBox();
    const privacy = await page.locator('.astrolabe__privacy').boundingBox();
    const routes = await page.locator('.astrolabe__route').evaluateAll((items) => items.map((item) => {
      const box = item.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    const routeOverlap = routes.some((route) => intersects(controls, route));
    if (!routeOverlap) ok(`Wayfinder controls clear every route at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder controls overlap a route at ${viewport.width}x${viewport.height}`);
    if (!intersects(controls, instrument)) ok(`Wayfinder controls clear the instrument at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder controls overlap the instrument at ${viewport.width}x${viewport.height}`);
    if (!intersects(controls, header)) ok(`Wayfinder controls clear the header at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder controls overlap the header at ${viewport.width}x${viewport.height}`);

    const childrenContained = [status, locate, privacy].every((child) => contains(controls, child));
    if (childrenContained) ok(`Wayfinder status, locate button, and privacy copy stay inside their strip at ${viewport.width}x${viewport.height}`);
    else fail(`A Wayfinder control child escapes its strip at ${viewport.width}x${viewport.height}`);
    const childrenOverlap = intersects(status, locate) || intersects(status, privacy) || intersects(locate, privacy);
    if (!childrenOverlap) ok(`Wayfinder control children do not overlap at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder control children overlap at ${viewport.width}x${viewport.height}`);

    if (contains(utility, controls) && contains(utility, close)) ok(`Wayfinder utility contains its strip and close control at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder utility loses a child at ${viewport.width}x${viewport.height}`);
    if (!intersects(controls, close) && controls.x + controls.width <= close.x + 1) ok(`Wayfinder strip stays left of the close control at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder strip does not stay left of the close control at ${viewport.width}x${viewport.height}`);
    if (viewport.width <= 1024 && header.y >= utility.y + utility.height - 1) ok(`Wayfinder heading follows its utility zone at ${viewport.width}x${viewport.height}`);
    else if (viewport.width <= 1024) fail(`Wayfinder utility zone does not reserve space above the heading at ${viewport.width}x${viewport.height}`);
    await context.close();
  }
}

// ---------------------------------------------------------------------
// AC-032: every ornament SVG root carries aria-hidden="true", and none
// carries both aria-hidden and an empty alt (alt only applies to <img>, so
// this is really "no ornament SVG is announced by AT").
// ---------------------------------------------------------------------
{
  for (const path of ['/index.html', '/about/', '/notebook/', '/laboratory/', '/letter/', '/now/', '/uses/']) {
    const page = await newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const axeResults = await new AxeBuilder({ page }).withRules(['svg-img-alt']).analyze();
    if (axeResults.violations.length > 0) {
      for (const v of axeResults.violations) fail(`axe svg-img-alt (${path}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    }
    await page.close();
  }
  if (failures === 0) ok('axe svg-img-alt reports zero violations across Home/About/Notebook/Laboratory/Letter/Now/Uses');
}

// ---------------------------------------------------------------------
// AC-105 (normalize-p1): axe-core's color-contrast rule against each built
// page, under BOTH a default and a colorScheme:'dark' browser context.
// Scoped to the currently rebranded pages, under both theme preferences.
// ---------------------------------------------------------------------
{
  for (const scheme of ['light', 'dark']) {
    for (const path of FULL_PAGE_PATHS) {
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
  if (failures === 0) ok('axe color-contrast reports zero violations across every rebranded page in light and dark contexts (AC-105)');
}

// ---------------------------------------------------------------------
// Full-page blocking axe pass (WCAG2AA) across every rebranded page.
// ---------------------------------------------------------------------
{
  console.log('\n--- blocking: full-page axe (wcag2a, wcag2aa) per page ---');
  for (const path of FULL_PAGE_PATHS) {
    const page = await newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const axeResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    console.log(`${path}: ${axeResults.violations.length} violation(s)${axeResults.violations.length ? ' -- ' + axeResults.violations.map((v) => v.id).join(', ') : ''}`);
    for (const violation of axeResults.violations) fail(`full-page axe (${path}): ${violation.id} -- ${violation.help}`);
    await page.close();
  }
}

await browser.close();
server.close();

console.log(failures === 0 ? '\nPASS (axe-audit: AC-032, AC-033, AC-035, AC-036, AC-037).' : `\nFAIL: ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
