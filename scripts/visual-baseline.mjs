#!/usr/bin/env node
// scripts/visual-baseline.mjs
//
// Captures deterministic full-page screenshots from a built _site/ across the
// site's route, viewport, theme, and interaction-state matrix.
//
// Two modes:
//   node scripts/visual-baseline.mjs           -- compare mode (default):
//     capture fresh screenshots, diff against the local baselines,
//     exit non-zero if any target exceeds the tolerance.
//   node scripts/visual-baseline.mjs --update  -- write/refresh baselines.
//
// PNG decoding and pixel comparison use node:zlib; Playwright screenshots are
// 8-bit, non-interlaced PNGs.
//
// Determinism (see the brief this script was built against -- flaky
// baselines are worse than none):
//   - reducedMotion: 'reduce' on every context, so every
//     matchMedia('(prefers-reduced-motion: reduce)') gate in
//     assets/js/{home,about,laboratory,notebook,letter,sigil-navigation}.js
//     short-circuits BEFORE any JS-driven inline `animation` style is set --
//     this is the primary defense, not an afterthought.
//   - a stylesheet that collapses animation/transition duration+delay to
//     ~0 and iteration-count to 1 instead of a blunt `animation: none`, so
//     every finite animation deterministically reaches its final frame.
//   - a frozen `Date` (see installFixedClock below) injected before any
//     page script runs. Keeping the clock deterministic prevents future
//     date-sensitive content or scripts from making baselines drift.
//   - a hardened render-stability barrier (waitForStableRender), not just
//     `document.fonts.ready`. Empirically, `fonts.ready` + `networkidle`
//     was NOT sufficient under this script's own full-matrix load (many sequential
//     browser contexts in one long-running process): repeated full-suite
//     runs with zero source changes reproduced both scattered few-pixel
//     diffs (About) and a genuine document-height DIMENSION MISMATCH
//     (Accessibility/mobile-dark: 4893px vs 4604px baseline, a real ~289px
//     late layout shift) -- font-swap/image-decode finishing slightly after
//     `fonts.ready` resolves under load. The barrier now also awaits every
//     <img>'s decode() (networkidle only guarantees *fetched*, not
//     *decoded*) and polls document height across consecutive rAF ticks
//     until it holds steady for 3 in a row (bounded to 30 ticks) instead of
//     assuming one wait is enough. Re-verified stable across 3+ consecutive
//     full-suite runs after this fix -- see the completion report.
//   - fullPage: true, deviceScaleFactor: 1, pinned per the brief.
//
// Known residual (post target) + fix, root-caused after the font
// self-hosting change made the other targets bit-exact:
//   Every target except the representative blog post was pixel-perfect
//   (0.0000%) run over run. That post alone was bistable: on
//   mobile/tablet its document height alternated between two values
//   (e.g. mobile 3163<->3165, tablet 2481<->2506) between the
//   baseline-writing capture and the compare capture; on desktop the
//   height stayed IDENTICAL (2033) but ~0.8% of pixels still differed.
//   Same height + nonzero pixel diff on desktop rules out layout/JS
//   timing (already independently ruled out: no network race -- post has
//   no emoji/external images; no localStorage bleed -- fresh
//   newContext()+close() per capture; no smooth-scroll interference --
//   gated behind `@include motion-ok` and reducedMotion:'reduce' disables
//   it) and instead points at run-to-run SUBPIXEL TEXT RENDERING
//   variance. "post" is the only long-form-prose target and the only one
//   whose CSS pulls in SYSTEM fonts instead of the self-hosted woff2s:
//   body copy falls back through `Georgia, serif` and code blocks through
//   `Menlo, Monaco, "Courier New", monospace` (_sass/_post.scss:675,708).
//   System-font glyph rasterization in headless Chromium's FreeType/Skia
//   path is not guaranteed bit-stable across runs (LCD/subpixel
//   antialiasing + hinting can nondeterministically tip a near-boundary
//   prose line into wrapping on narrow viewports, which is what produces
//   the bistable heights on mobile/tablet).
//   Fix (tier 1, applied below in the chromium.launch() args): force
//   grayscale antialiasing and disable subpixel positioning/hinting so
//   glyph rasterization is bit-stable run to run. Each flag was verified
//   against the actual installed chromium binary
//   (~/.cache/ms-playwright/.../chrome) before relying on it -- an
//   unrecognized flag is silently ignored by Chromium (no error), so
//   accepting a flag on faith would be worthless:
//     --disable-lcd-text                    present (blink switch; string
//                                            literal found via `strings`
//                                            on the binary) -- forces
//                                            grayscale-only AA, killing
//                                            subpixel (ClearType-style)
//                                            RGB-fringe variance.
//     --disable-font-subpixel-positioning   present (content switch,
//                                            confirmed via `strings`) --
//                                            snaps glyph origins to whole
//                                            pixels instead of letting
//                                            them land at a subpixel
//                                            offset that can rasterize
//                                            with run-to-run jitter.
//     --disable-skia-runtime-opts           present (Skia switch,
//                                            confirmed via `strings`) --
//                                            disables Skia's CPU-feature-
//                                            detected code path selection,
//                                            which otherwise is a known
//                                            source of run-to-run
//                                            rasterization differences on
//                                            shared/loaded CI hardware.
//     --force-color-profile=srgb            present (gfx switch,
//                                            confirmed via `strings`) --
//                                            pins the color management
//                                            pipeline so glyph blending
//                                            isn't run through a
//                                            system/monitor-profile-
//                                            dependent path.
//     --font-render-hinting=none            NOT present in the installed
//                                            chromium build (Chrome for
//                                            Testing 149.0.7827.55,
//                                            bundled with Playwright
//                                            1.61.1) -- `strings` on the
//                                            binary and every co-located
//                                            .so turns up zero occurrences
//                                            of the literal
//                                            "font-render-hinting"
//                                            anywhere (content_switches.cc
//                                            appears to have dropped this
//                                            switch in a recent Chromium
//                                            release). Passing it would
//                                            be a silent no-op, so it is
//                                            deliberately OMITTED rather
//                                            than left in as dead
//                                            decoration -- --disable-lcd-
//                                            text already forces grayscale
//                                            AA, which was this flag's
//                                            main practical effect anyway.
//   Empirically, tier 1 alone was sufficient -- see the completion report
//   for two consecutive `npm run test:visual` runs, both exit 0, "post"
//   at exact 0.0000% across all 9 of its viewport x theme variants, same
//   as the other 13 targets. No tier-2 per-target noise floor was needed
//   (grep NOISE-FLOOR in this file if one is ever reintroduced -- there
//   should be none as of this writing).

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import {
  readFileSync,
  existsSync,
  statSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { extname, join, dirname, relative, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { loadVisualApprovals, selectVisualReference, validateVisualApprovalDimensions } from './visual-approval.mjs';

const root = new URL('../', import.meta.url).pathname;
const siteDir = root + '_site';
function option(name, fallback) {
  const equals = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (equals) return equals.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')
    ? process.argv[index + 1]
    : fallback;
}

const baselineDir = resolve(root, option('--baseline-dir', 'scripts/baselines'));
const outputDir = resolve(root, option('--output-dir', '.visual/candidate'));
const reportPath = resolve(root, option('--report', '.visual/report.json'));
const approvalDirOption = option('--approval-dir', null);
const approvalDir = approvalDirOption ? resolve(root, approvalDirOption) : null;

const UPDATE = process.argv.includes('--update');
if (baselineDir === outputDir) {
  console.error('FAIL: --baseline-dir and --output-dir must resolve to different directories.');
  process.exit(1);
}
if (!existsSync(siteDir)) {
  console.error('FAIL: _site/ does not exist -- run `bundle exec jekyll build` first.');
  process.exit(1);
}
const toleranceArg = process.argv.find((a) => a.startsWith('--tolerance='));
// Percentage of pixels allowed to differ (per-pixel color delta beyond
// CHANNEL_THRESHOLD below) before a target is reported as a failure. 0.1%
// absorbs anti-aliasing/sub-pixel font-hinting noise; it is NOT a license
// to ignore real diffs -- see VERIFY in the P0 brief: a clean run must
// report ~0%, not "just under tolerance".
const TOLERANCE_PERCENT = toleranceArg ? parseFloat(toleranceArg.split('=')[1]) : 0.1;
// Per-channel (0-255) delta above which a pixel counts as "different" at
// all. Absorbs single-bit rendering jitter without hiding real color/layout
// changes -- 24/255 is well below any perceptible color shift.
const CHANNEL_THRESHOLD = 24;

// ---------------------------------------------------------------------
// Static server -- identical in shape to scripts/axe-audit.mjs's
// startServer(port), so the built _site/ resolves relative asset paths and
// extensionless permalinks exactly as it does there (and as it will on
// GitHub Pages).
// ---------------------------------------------------------------------
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
        // try appending .html (extensionless permalinks). Strip any
        // trailing slash first -- a URL like /2019/03/06/my-notebook/
        // (Jekyll's date permalink, always trailing-slash) otherwise
        // resolves to .../my-notebook/.html (a bogus nested path) instead
        // of the real .../my-notebook.html.
        const stripped = full.endsWith('/') ? full.slice(0, -1) : full;
        if (!extname(stripped) && existsSync(stripped + '.html')) full = stripped + '.html';
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

// ---------------------------------------------------------------------
// Target discovery -- enumerated from the BUILT _site/, not hardcoded
// assumptions about permalinks, because several root pages (codex, log,
// now, uses, start-here, accessibility, notebook) render to
// <name>/index.html via an explicit `permalink:` while others (index,
// about, laboratory, letter, 404) stay flat at <name>.html.
// ---------------------------------------------------------------------
const ROOT_PAGE_NAMES = ['index', 'about', 'laboratory', 'notebook', 'letter', 'codex', 'log', 'now', 'uses', 'start-here', 'accessibility', '404'];

function resolveRootPage(name) {
  if (name === 'index' && existsSync(join(siteDir, 'index.html'))) return { name, url: '/' };
  if (name === 'laboratory' && existsSync(join(siteDir, 'laboratory', 'index.html'))) return { name, url: '/laboratory/' };
  const flat = join(siteDir, `${name}.html`);
  if (existsSync(flat)) return { name, url: `/${name}.html` };
  const dirIndex = join(siteDir, name, 'index.html');
  if (existsSync(dirIndex)) return { name, url: `/${name}/` };
  return null;
}

// Representative post permalink -- same approach as axe-audit.mjs:149-159
// (pick a real post from _posts/, derive its date-based permalink, verify
// it actually built), sorted for determinism (fs.readdirSync order is not
// contractually stable across platforms).
function postTargetForFile(filename, name) {
  const m = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(markdown|md)$/);
  if (!m) return null;
  const [, y, mo, d, slug] = m;
  const flatPath = join(siteDir, y, mo, d, `${slug}.html`);
  const dirPath = join(siteDir, y, mo, d, slug, 'index.html');
  return existsSync(flatPath) || existsSync(dirPath)
    ? { name, url: `/${y}/${mo}/${d}/${slug}/` }
    : null;
}

function resolveRepresentativeHumanPost() {
  const postFiles = readdirSync(join(root, '_posts'))
    .filter((f) => f.endsWith('.markdown') || f.endsWith('.md'))
    .sort();
  for (const f of postFiles) {
    const source = readFileSync(join(root, '_posts', f), 'utf8');
    if (/^author_id:\s*["']?(vivi|ramza|atlas|forge|gilgamesh|idg|kupo)["']?\s*$/mi.test(source)) continue;
    const target = postTargetForFile(f, 'post-human');
    if (target) return target;
  }
  return null;
}

function resolveViviPost() {
  const preferred = '2026-08-27-rebranding-the-atelier-as-a-party-quest.md';
  const postFiles = readdirSync(join(root, '_posts'))
    .filter((f) => f.endsWith('.markdown') || f.endsWith('.md'))
    .sort();
  const ordered = postFiles.includes(preferred)
    ? [preferred, ...postFiles.filter((f) => f !== preferred)]
    : postFiles;
  for (const f of ordered) {
    const source = readFileSync(join(root, '_posts', f), 'utf8');
    if (!/^author_id:\s*["']?vivi["']?\s*$/mi.test(source)) continue;
    const target = postTargetForFile(f, 'post-eidolon-vivi');
    if (target) return target;
  }
  return null;
}

// Representative notebook/ category page (hobby/llm/tech) -- distinct from
// the notebook root index above.
function resolveNotebookSubpage() {
  const notebookDir = join(siteDir, 'notebook');
  if (!existsSync(notebookDir)) return null;
  const subdirs = readdirSync(notebookDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  for (const name of subdirs) {
    if (existsSync(join(notebookDir, name, 'index.html'))) {
      return { name: `notebook-${name}`, url: `/notebook/${name}/` };
    }
  }
  return null;
}

const targets = [];
for (const name of ROOT_PAGE_NAMES) {
  const t = resolveRootPage(name);
  if (t) targets.push(t);
  else fail(`expected root page "${name}" not found in built _site/ (checked ${name}.html and ${name}/index.html)`);
}
const humanPost = resolveRepresentativeHumanPost();
if (humanPost) targets.push(humanPost);
else fail('no representative human post permalink resolved from _posts/ against the built _site/ tree');
const viviPost = resolveViviPost();
if (viviPost) targets.push(viviPost);
else fail('no published Vivi post permalink resolved from _posts/ against the built _site/ tree');
const notebookSub = resolveNotebookSubpage();
if (notebookSub) targets.push(notebookSub);
else fail('no representative notebook/ category subpage found under built _site/notebook/');

targets.push({
  name: 'index-wayfinder-open',
  url: '/',
  state: 'wayfinder-open',
  viewportNames: ['mobile', 'desktop'],
});

if (failures > 0) {
  console.error(`\nFAIL: ${failures} target-resolution failure(s) -- aborting before any capture.`);
  process.exit(1);
}

// ---------------------------------------------------------------------
// Viewport matrix
// ---------------------------------------------------------------------
const VIEWPORTS = [
  ['mobile', { width: 320, height: 800 }],
  ['tablet', { width: 768, height: 1024 }],
  ['desktop', { width: 1280, height: 900 }],
];

// Every target gets light + dark (prefers-color-scheme, mechanism (a) --
// _sass/_notebook.scss:800 direct media query, _laboratory.scss:688 /
// _letter.scss:820 via the `dark-mode` mixin in _sass/_breakpoints.scss,
// same underlying `@media (prefers-color-scheme: dark)`). Only the post
// target additionally exercises mechanism (b): the JS-toggled
// `body.dark-mode` class (_layouts/post.html:308-322), which is a plain
// class selector independent of the OS color-scheme preference.
function themesFor(target) {
  return target.name.startsWith('post-') ? ['light', 'dark', 'dark-class'] : ['light', 'dark'];
}

// Collapses (not disables -- see the header comment above) animation and
// transition timing so every keyframe/transition, including one-shot
// reveal animations, plays out and lands on its final frame in an
// imperceptible fraction of a millisecond.
const KILL_ANIMATIONS_CSS = `*, *::before, *::after {
  animation-duration: 0.001ms !important;
  animation-delay: 0ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  transition-delay: 0ms !important;
}`;

// document.fonts.ready + networkidle turned out not to be a sufficient
// readiness barrier under this script's own full-matrix load (many sequential contexts in
// one browser process): repeated full-suite runs with zero source changes
// occasionally reproduced (a) scattered few-pixel diffs on About and (b) a
// genuine document-height DIMENSION MISMATCH on Accessibility/mobile-dark
// (4893px vs 4604px baseline -- a real ~289px late layout shift, not noise)
// -- both point at font-swap/image-decode completing slightly after
// `fonts.ready` resolves under load, not a source-content difference.
// Hardened barrier: wait for every <img>'s decode() (networkidle only
// guarantees *fetched*, not *decoded*), then poll document height across
// consecutive rAF ticks until it holds steady for 3 in a row (bounded to
// 30 ticks, ~0.5s worst case) instead of assuming one wait is enough.
async function waitForStableRender(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve())));
  });
  await page.evaluate(async () => {
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    let prevHeight = -1;
    let stableTicks = 0;
    for (let i = 0; i < 30 && stableTicks < 3; i++) {
      await nextFrame();
      const h = document.documentElement.scrollHeight;
      stableTicks = h === prevHeight ? stableTicks + 1 : 0;
      prevHeight = h;
    }
  });
}

// Injected via context.addInitScript -- runs before any page script, on
// every navigation. Multi-arg / string / timestamp Date construction still
// delegates to the real constructor; only the no-arg "current instant" form
// is pinned.
function installFixedClock() {
  const FIXED_TIME = new Date('2026-01-01T12:00:00Z').getTime();
  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(FIXED_TIME);
      } else {
        super(...args);
      }
    }
    static now() {
      return FIXED_TIME;
    }
  }
  // eslint-disable-next-line no-global-assign
  window.Date = FixedDate;
}

// The homepage intentionally chooses one plate per page load. Pin randomness
// in visual captures so the accepted arrival fallback is compared every time,
// rather than letting screenshot references alternate between valid plates.
function installFixedRandom() {
  Math.random = () => 0;
}

async function captureScreenshot(browser, base, target, viewport, theme) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  await context.addInitScript(installFixedClock);
  await context.addInitScript(installFixedRandom);
  const page = await context.newPage();
  await page.goto(base + target.url, { waitUntil: 'networkidle' });
  if (theme === 'dark-class') {
    // Mechanism (b): the real toggle is a click handler on
    // #toggle-dark-mode that also writes localStorage; for a baseline
    // screenshot the class itself is the only thing that affects layout/
    // paint, so applying it directly is equivalent and avoids depending on
    // the button's DOM structure staying exactly as-is.
    await page.evaluate(() => document.body.classList.add('dark-mode'));
  }
  await page.addStyleTag({ content: KILL_ANIMATIONS_CSS });
  if (target.state === 'wayfinder-open') {
    const trigger = page.locator('button.wayfinder__trigger');
    await trigger.waitFor({ state: 'visible' });
    await trigger.click();
    await page.locator('#astrolabe-chart.is-open').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('[data-wayfinder-constellations]')?.dataset.renderProfile);
  }
  await waitForStableRender(page);
  const buffer = await captureStableScreenshot(page);
  await context.close();
  return buffer;
}

// Even with waitForStableRender passing, a full-matrix run (one
// long-lived browser process, ~80+ prior contexts) reproduced a residual
// paint/compositor-level lag that a layout-height poll doesn't catch: the
// "post" target intermittently differed by 2px of document height and up
// to ~1.3% of pixels between two otherwise-identical consecutive full-suite
// runs, while it was rock-stable across 8 isolated repeated captures in a
// fresh short-lived script. Layout can report itself stable while the
// composited frame Playwright reads back still hasn't caught up under
// sustained load. This is the empirical fix: take a screenshot, wait
// briefly, take another, and only accept it once two consecutive captures
// are byte-identical (bounded retries -- falls back to the last capture
// rather than looping forever if something is genuinely still animating).
async function captureStableScreenshot(page, maxAttempts = 5, settleMs = 150) {
  let prev = await page.screenshot({ fullPage: true });
  for (let attempt = 1; attempt < maxAttempts; attempt++) {
    await page.waitForTimeout(settleMs);
    const next = await page.screenshot({ fullPage: true });
    if (next.equals(prev)) return next;
    prev = next;
  }
  return prev;
}

// ---------------------------------------------------------------------
// Dependency-free PNG decode (8-bit, non-interlaced -- the only shape
// Playwright/Chromium ever emits for page.screenshot()) + pixel diff.
// ---------------------------------------------------------------------
function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

const CHANNELS_BY_COLOR_TYPE = { 0: 1, 2: 3, 4: 2, 6: 4 };

function decodePNG(buffer) {
  const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG (bad signature)');

  let offset = 8;
  let ihdr = null;
  const idatChunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset); offset += 4;
    const type = buffer.toString('ascii', offset, offset + 4); offset += 4;
    const data = buffer.subarray(offset, offset + length); offset += length;
    offset += 4; // CRC, unchecked -- decode-only, not a corruption detector
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data.readUInt8(8),
        colorType: data.readUInt8(9),
        interlace: data.readUInt8(12),
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }
  if (!ihdr) throw new Error('invalid PNG: missing IHDR');
  if (ihdr.bitDepth !== 8) throw new Error(`unsupported PNG bit depth ${ihdr.bitDepth} (only 8 supported)`);
  if (ihdr.interlace !== 0) throw new Error('unsupported interlaced PNG');
  const channels = CHANNELS_BY_COLOR_TYPE[ihdr.colorType];
  if (!channels) throw new Error(`unsupported PNG color type ${ihdr.colorType} (palette PNGs are not supported)`);

  const raw = inflateSync(Buffer.concat(idatChunks));
  const bpp = channels; // bitDepth 8 => 1 byte/sample
  const rowBytes = ihdr.width * bpp;
  const out = Buffer.alloc(rowBytes * ihdr.height);
  let pos = 0;
  let prevRow = Buffer.alloc(rowBytes);

  for (let y = 0; y < ihdr.height; y++) {
    const filterType = raw[pos]; pos += 1;
    const row = raw.subarray(pos, pos + rowBytes); pos += rowBytes;
    const outRow = out.subarray(y * rowBytes, (y + 1) * rowBytes);
    for (let x = 0; x < rowBytes; x++) {
      const rawByte = row[x];
      const a = x >= bpp ? outRow[x - bpp] : 0;
      const b = prevRow[x];
      const c = x >= bpp ? prevRow[x - bpp] : 0;
      let recon;
      switch (filterType) {
        case 0: recon = rawByte; break;
        case 1: recon = rawByte + a; break;
        case 2: recon = rawByte + b; break;
        case 3: recon = rawByte + Math.floor((a + b) / 2); break;
        case 4: recon = rawByte + paethPredictor(a, b, c); break;
        default: throw new Error(`unsupported PNG filter type ${filterType}`);
      }
      outRow[x] = recon & 0xff;
    }
    prevRow = outRow;
  }

  // Normalize to RGBA regardless of source color type, so diffing never
  // has to special-case channel count.
  const rgba = Buffer.alloc(ihdr.width * ihdr.height * 4);
  for (let i = 0, p = 0; i < ihdr.width * ihdr.height; i++, p += channels) {
    const o = i * 4;
    if (channels === 4) {
      rgba[o] = out[p]; rgba[o + 1] = out[p + 1]; rgba[o + 2] = out[p + 2]; rgba[o + 3] = out[p + 3];
    } else if (channels === 3) {
      rgba[o] = out[p]; rgba[o + 1] = out[p + 1]; rgba[o + 2] = out[p + 2]; rgba[o + 3] = 255;
    } else if (channels === 2) {
      rgba[o] = out[p]; rgba[o + 1] = out[p]; rgba[o + 2] = out[p]; rgba[o + 3] = out[p + 1];
    } else {
      rgba[o] = out[p]; rgba[o + 1] = out[p]; rgba[o + 2] = out[p]; rgba[o + 3] = 255;
    }
  }
  return { width: ihdr.width, height: ihdr.height, data: rgba };
}

function diffImages(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return { dimensionMismatch: true, diffPixels: null, totalPixels: null, diffPercent: 100 };
  }
  const total = a.width * a.height;
  let diffCount = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const dr = Math.abs(a.data[o] - b.data[o]);
    const dg = Math.abs(a.data[o + 1] - b.data[o + 1]);
    const db = Math.abs(a.data[o + 2] - b.data[o + 2]);
    const da = Math.abs(a.data[o + 3] - b.data[o + 3]);
    if (dr > CHANNEL_THRESHOLD || dg > CHANNEL_THRESHOLD || db > CHANNEL_THRESHOLD || da > CHANNEL_THRESHOLD) diffCount++;
  }
  return { dimensionMismatch: false, diffPixels: diffCount, totalPixels: total, diffPercent: (diffCount / total) * 100 };
}

function dirSizeBytes(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) total += dirSizeBytes(p);
    else total += statSync(p).size;
  }
  return total;
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------
// Capture / compare loop
// ---------------------------------------------------------------------
const PORT = 4174; // distinct from axe-audit.mjs's 4173 -- safe to run alongside it
const server = await startServer(PORT);
const base = `http://localhost:${PORT}`;
// See the "post" determinism note in the header comment for why each of
// these is here (and why --font-render-hinting is deliberately absent).
const FONT_DETERMINISM_ARGS = [
  '--disable-lcd-text',
  '--disable-font-subpixel-positioning',
  '--disable-skia-runtime-opts',
  '--force-color-profile=srgb',
];
let browser;
try {
  browser = await chromium.launch({ args: FONT_DETERMINISM_ARGS });
} catch (error) {
  await new Promise((resolveClose) => server.close(resolveClose));
  throw error;
}

let capturedCount = 0;
const results = [];

const capturePlan = targets.flatMap((target) => {
  const viewports = target.viewportNames
    ? VIEWPORTS.filter(([name]) => target.viewportNames.includes(name))
    : VIEWPORTS;
  return viewports.flatMap(([viewportName, viewport]) => (
    themesFor(target).map((theme) => ({ target, viewportName, viewport, theme }))
  ));
});

let visualApprovals = null;
if (!UPDATE && approvalDir) {
  try {
    visualApprovals = loadVisualApprovals({
      approvalDir,
      baselineDir,
      plannedPaths: capturePlan.map(({ target, viewportName, theme }) => `${target.name}/${viewportName}-${theme}.png`),
    });
    console.log(`Visual approvals: ${visualApprovals.approved.size} exact path(s) from ${relative(root, visualApprovals.manifestPath)}, bound to master ${visualApprovals.baseSha}.`);
  } catch (error) {
    fail(error.message);
  }
}

console.log(`${UPDATE ? 'UPDATE' : 'COMPARE'} mode -- ${targets.length} target(s), ${capturePlan.length} planned screenshot(s), tolerance ${TOLERANCE_PERCENT}% (channel threshold ${CHANNEL_THRESHOLD}/255).\n`);

if (capturePlan.length !== 100) {
  fail(`capture inventory changed: expected exactly 100 planned screenshots, found ${capturePlan.length}; review the matrix before accepting a new reference`);
}

if (UPDATE) {
  mkdirSync(baselineDir, { recursive: true });
} else {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
}

try {
for (const { target, viewportName, viewport, theme } of capturePlan) {
      const relPath = `${target.name}/${viewportName}-${theme}.png`;
      const outPath = join(baselineDir, target.name, `${viewportName}-${theme}.png`);
      const candidatePath = join(outputDir, target.name, `${viewportName}-${theme}.png`);
      let buffer;
      try {
        buffer = await captureScreenshot(browser, base, target, viewport, theme);
      } catch (err) {
        fail(`${relPath}: capture error -- ${err.message}`);
        results.push({ path: relPath, status: 'capture-error', error: err.message });
        continue;
      }
      capturedCount++;

      if (UPDATE) {
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, buffer);
        ok(`wrote ${relPath} (${buffer.length} bytes)`);
        results.push({ path: relPath, status: 'updated', actual: relative(root, outPath) });
        continue;
      }

      mkdirSync(dirname(candidatePath), { recursive: true });
      writeFileSync(candidatePath, buffer);

      if (!existsSync(outPath)) {
        fail(`${relPath}: no reference found at ${relative(root, outPath)}; seed a successful master visual-reference artifact first`);
        results.push({ path: relPath, status: 'missing-reference', expected: relative(root, outPath), actual: relative(root, candidatePath) });
        continue;
      }
      const reference = selectVisualReference(relPath, outPath, visualApprovals);
      const referencePath = reference.path;
      let baselineImg, currentImg;
      try {
        baselineImg = decodePNG(readFileSync(referencePath));
        currentImg = decodePNG(buffer);
      } catch (err) {
        fail(`${relPath}: PNG decode error -- ${err.message}`);
        results.push({ path: relPath, status: 'decode-error', referenceKind: reference.referenceKind, error: err.message, expected: relative(root, referencePath), actual: relative(root, candidatePath) });
        continue;
      }
      if (reference.referenceKind === 'approved') {
        try {
          const masterImg = decodePNG(readFileSync(outPath));
          validateVisualApprovalDimensions(reference, { master: masterImg, approved: baselineImg, candidate: currentImg });
        } catch (err) {
          fail(`${relPath}: approval validation error -- ${err.message}`);
          results.push({ path: relPath, status: 'invalid-approval', referenceKind: reference.referenceKind, error: err.message, expected: relative(root, referencePath), master: relative(root, outPath), actual: relative(root, candidatePath) });
          continue;
        }
      }
      const diff = diffImages(baselineImg, currentImg);
      if (diff.dimensionMismatch) {
        fail(`${relPath} [${reference.referenceKind}]: dimension mismatch (baseline ${baselineImg.width}x${baselineImg.height} vs current ${currentImg.width}x${currentImg.height})`);
        results.push({ path: relPath, status: 'dimension-mismatch', referenceKind: reference.referenceKind, expected: relative(root, referencePath), actual: relative(root, candidatePath), dimensions: { expected: [baselineImg.width, baselineImg.height], actual: [currentImg.width, currentImg.height] }, diff });
      } else if (diff.diffPercent > TOLERANCE_PERCENT) {
        fail(`${relPath} [${reference.referenceKind}]: ${diff.diffPercent.toFixed(4)}% pixels differ (${diff.diffPixels}/${diff.totalPixels}) -- exceeds ${TOLERANCE_PERCENT}% tolerance`);
        results.push({ path: relPath, status: 'different', referenceKind: reference.referenceKind, expected: relative(root, referencePath), actual: relative(root, candidatePath), dimensions: { expected: [baselineImg.width, baselineImg.height], actual: [currentImg.width, currentImg.height] }, diff });
      } else {
        ok(`${relPath} [${reference.referenceKind}]: ${diff.diffPercent.toFixed(4)}% pixels differ (${diff.diffPixels}/${diff.totalPixels})`);
        results.push({ path: relPath, status: 'matched', referenceKind: reference.referenceKind, expected: relative(root, referencePath), actual: relative(root, candidatePath), dimensions: { expected: [baselineImg.width, baselineImg.height], actual: [currentImg.width, currentImg.height] }, diff });
      }
}
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

const pngInventory = (dir) => existsSync(dir)
  ? readdirSync(dir, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.png')).length
  : 0;
const inventoryDir = UPDATE ? baselineDir : outputDir;
const inventoryCount = pngInventory(inventoryDir);
if (inventoryCount !== capturePlan.length) {
  fail(`${UPDATE ? 'reference' : 'candidate'} inventory mismatch: expected ${capturePlan.length} PNGs, found ${inventoryCount} in ${relative(root, inventoryDir)}`);
}

if (UPDATE && failures === 0) {
  writeFileSync(join(baselineDir, 'source.json'), JSON.stringify({
    sha: process.env.GITHUB_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
    generatedAt: new Date().toISOString(),
    screenshots: capturePlan.length,
  }, null, 2) + '\n');
}

const report = {
  status: failures === 0 ? 'passed' : 'failed',
  mode: UPDATE ? 'update' : 'compare',
  matrix: capturePlan.map(({ target, viewportName, viewport, theme }) => ({ target: target.name, url: target.url, viewport: viewportName, dimensions: viewport, theme, state: target.state || null })),
  config: { baselineDir: relative(root, baselineDir), outputDir: relative(root, outputDir), approvalDir: approvalDir ? relative(root, approvalDir) : null, tolerancePercent: TOLERANCE_PERCENT, channelThreshold: CHANNEL_THRESHOLD },
  totals: { planned: capturePlan.length, captured: capturedCount, inventory: inventoryCount, failures, matched: results.filter((r) => r.status === 'matched').length },
  results,
};
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');

console.log(`\n${capturedCount} screenshot(s) captured across ${targets.length} target(s): ${targets.map((t) => t.name).join(', ')}.`);
if (existsSync(baselineDir)) {
  console.log(`Baseline tree ${relative(root, baselineDir)}/: ${humanSize(dirSizeBytes(baselineDir))} total.`);
}
console.log(`Report: ${relative(root, reportPath)}.`);

console.log(failures === 0 ? '\nPASS (visual-baseline).' : `\nFAIL: ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
