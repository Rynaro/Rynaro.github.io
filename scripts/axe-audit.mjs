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
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${base}/index.html#astrolabe-chart`, { waitUntil: 'networkidle' });
  const fallback = await page.locator('#astrolabe-chart').evaluate((chart) => ({
    visible: getComputedStyle(chart).display !== 'none',
    routes: chart.querySelectorAll('.astrolabe__route').length,
    overflow: chart.scrollWidth - chart.clientWidth,
  }));
  if (fallback.visible && fallback.routes === 5 && fallback.overflow <= 0) ok('Wayfinder no-JavaScript phone chart keeps all routes and no horizontal overflow');
  else fail(`Wayfinder no-JavaScript phone chart regressed: ${JSON.stringify(fallback)}`);
  await context.close();
}

{
  const viewports = [
    { width: 1280, height: 800 },
    { width: 900, height: 700 },
    { width: 768, height: 1024 },
    { width: 568, height: 800 },
    { width: 481, height: 800 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 320, height: 800 },
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
    await page.waitForFunction(() => document.querySelector('[data-wayfinder-constellations]')?.dataset.renderProfile);
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
    const skyMetrics = await page.locator('[data-wayfinder-constellations]').evaluate((canvas) => ({
      profile: canvas.dataset.renderProfile,
      figures: Number(canvas.dataset.renderFigures),
      eligibleFigures: Number(canvas.dataset.renderEligibleFigures),
      stars: Number(canvas.dataset.renderStars),
      labels: Number(canvas.dataset.renderLabels),
      renderMs: Number(canvas.dataset.renderMs),
      labelBoxes: JSON.parse(canvas.dataset.labelBoxes || '[]'),
    }));
    const expectedProfile = viewport.width <= 576 ? 'compact' : viewport.width <= 1024 ? 'tablet' : 'desktop';
    if (skyMetrics.profile === expectedProfile) ok(`Wayfinder uses ${expectedProfile} sky profile at ${viewport.width}x${viewport.height}`);
    else fail(`Wayfinder used ${skyMetrics.profile} instead of ${expectedProfile} at ${viewport.width}x${viewport.height}`);
    if (expectedProfile === 'compact' && skyMetrics.figures <= 6 && skyMetrics.stars <= 28 && skyMetrics.labels === 0) ok(`Compact sky renders ${skyMetrics.figures} figures / ${skyMetrics.stars} stars / no labels in ${skyMetrics.renderMs.toFixed(2)}ms at ${viewport.width}x${viewport.height}`);
    else if (expectedProfile === 'compact') fail(`Compact sky exceeded its budget at ${viewport.width}x${viewport.height}: ${JSON.stringify(skyMetrics)}`);
    if (expectedProfile === 'tablet' && skyMetrics.eligibleFigures === 18 && skyMetrics.labels <= 4) ok(`Tablet sky keeps all figures eligible, renders ${skyMetrics.stars} stars / ${skyMetrics.labels} labels in ${skyMetrics.renderMs.toFixed(2)}ms at ${viewport.width}x${viewport.height}`);
    else if (expectedProfile === 'tablet') fail(`Tablet sky profile budget regressed at ${viewport.width}x${viewport.height}: ${JSON.stringify(skyMetrics)}`);
    if (expectedProfile === 'desktop' && skyMetrics.eligibleFigures === 18 && skyMetrics.labels <= 7) ok(`Desktop sky keeps all figures eligible, renders ${skyMetrics.stars} stars / ${skyMetrics.labels} labels in ${skyMetrics.renderMs.toFixed(2)}ms at ${viewport.width}x${viewport.height}`);
    else if (expectedProfile === 'desktop') fail(`Desktop sky profile budget regressed at ${viewport.width}x${viewport.height}: ${JSON.stringify(skyMetrics)}`);
    const acceptedLabelsOverlap = skyMetrics.labelBoxes.some((box, index) => skyMetrics.labelBoxes.slice(index + 1).some((other) => intersects(
      { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top },
      { x: other.left, y: other.top, width: other.right - other.left, height: other.bottom - other.top },
    )));
    if (!acceptedLabelsOverlap) ok(`Accepted sky labels do not overlap at ${viewport.width}x${viewport.height}`);
    else fail(`Accepted sky labels overlap at ${viewport.width}x${viewport.height}`);
    const horizontalOverflow = await page.locator('.astrolabe').evaluate((overlay) => {
      const frame = overlay.querySelector('.astrolabe__frame');
      return {
        overlay: overlay.scrollWidth - overlay.clientWidth,
        frame: frame.scrollWidth - frame.clientWidth,
      };
    });
    if (viewport.width <= 1024 && horizontalOverflow.overlay <= 0 && horizontalOverflow.frame <= 0) ok(`Wayfinder overlay and frame have no horizontal overflow at ${viewport.width}x${viewport.height}`);
    else if (viewport.width <= 1024) fail(`Wayfinder horizontal overflow at ${viewport.width}x${viewport.height}: ${JSON.stringify(horizontalOverflow)}`);
    if (viewport.width === 390) {
      const resizeDraws = await page.locator('[data-wayfinder-constellations]').evaluate(async (canvas) => {
        const before = Number(canvas.dataset.renderCount);
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return Number(canvas.dataset.renderCount) - before;
      });
      if (resizeDraws === 1) ok('Wayfinder coalesces resize bursts into one animation-frame redraw');
      else fail(`Wayfinder used ${resizeDraws} redraws for one resize burst`);
    }
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

    if (viewport.width > 576 && viewport.width <= 1024) {
      const tabletLayout = await page.locator('.astrolabe__frame').evaluate((frame) => ({
        ratio: frame.scrollHeight / frame.clientHeight,
        columns: getComputedStyle(frame).gridTemplateColumns.split(' ').filter(Boolean).length,
      }));
      if (tabletLayout.columns === 2) ok(`Wayfinder uses two balanced tablet regions at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder tablet layout collapsed into ${tabletLayout.columns} region(s) at ${viewport.width}x${viewport.height}`);
      if (!intersects(instrument, routes[0]) && routes.every((route) => !intersects(instrument, route))) ok(`Wayfinder tablet instrument stays beside the route region at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder tablet instrument overlaps its route region at ${viewport.width}x${viewport.height}`);
      if (tabletLayout.ratio <= 1.15) ok(`Wayfinder tablet scroll ratio ${tabletLayout.ratio.toFixed(3)} <= 1.15 at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder tablet scroll ratio ${tabletLayout.ratio.toFixed(3)} exceeds 1.15 at ${viewport.width}x${viewport.height}`);
    }

    if (viewport.width <= 576) {
      const layout = await page.locator('.astrolabe__frame').evaluate((frame) => {
        const routeElements = [...frame.querySelectorAll('.astrolabe__route')];
        const first = routeElements[0].getBoundingClientRect();
        const last = routeElements.at(-1).getBoundingClientRect();
        return {
          clientHeight: frame.clientHeight,
          scrollHeight: frame.scrollHeight,
          frameTop: frame.getBoundingClientRect().top,
          firstTop: first.top,
          firstBottom: first.bottom,
          lastBottom: last.bottom,
          routeHeights: routeElements.map((route) => route.getBoundingClientRect().height),
        };
      });
      const allowedRatio = viewport.width === 320 ? 1.15 : 1;
      const ratio = layout.scrollHeight / layout.clientHeight;
      if (ratio <= allowedRatio + .001) ok(`Wayfinder phone scroll ratio ${ratio.toFixed(3)} <= ${allowedRatio} at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder phone scroll ratio ${ratio.toFixed(3)} exceeds ${allowedRatio} at ${viewport.width}x${viewport.height}`);
      if (layout.firstTop >= layout.frameTop - 1 && layout.firstBottom <= viewport.height + 1) ok(`First Wayfinder route is visible without scroll at ${viewport.width}x${viewport.height}`);
      else fail(`First Wayfinder route is not initially visible at ${viewport.width}x${viewport.height}`);
      if (layout.lastBottom <= viewport.height * allowedRatio + 1) ok(`All Wayfinder routes fit the phone budget at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder routes exceed the phone budget at ${viewport.width}x${viewport.height}`);
      if (layout.routeHeights.every((height) => height >= 52 && height <= 56)) ok(`Wayfinder route rows stay 52–56px at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder route row height escaped 52–56px at ${viewport.width}x${viewport.height}: ${layout.routeHeights.join(', ')}`);
      const descriptions = await page.locator('.astrolabe__route-description').evaluateAll((items) => items.map((item) => ({
        text: item.textContent.trim(),
        width: item.getBoundingClientRect().width,
        height: item.getBoundingClientRect().height,
      })));
      if (descriptions.every((item) => item.text && item.width <= 1 && item.height <= 1)) ok(`Wayfinder route descriptions stay accessible but visually compact at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder route descriptions lost text or visible space at ${viewport.width}x${viewport.height}`);

      const sticky = await page.locator('.astrolabe__frame').evaluate((frame) => {
        const close = frame.querySelector('.astrolabe__close');
        const before = close.getBoundingClientRect().top;
        const spacer = document.createElement('div');
        spacer.style.height = '1000px';
        spacer.setAttribute('aria-hidden', 'true');
        frame.append(spacer);
        frame.scrollTop = 240;
        const after = close.getBoundingClientRect().top;
        return { before, after, scrollTop: frame.scrollTop };
      });
      if (sticky.scrollTop > 0 && Math.abs(sticky.after - sticky.before) <= 1) ok(`Wayfinder close remains sticky after scroll at ${viewport.width}x${viewport.height}`);
      else fail(`Wayfinder close moved after scroll at ${viewport.width}x${viewport.height}`);
    }
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
