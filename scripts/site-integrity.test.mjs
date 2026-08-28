#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const site = join(root, '_site');
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures += 1; };

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
  });
}

function pageUrl(file) {
  const path = relative(site, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  return `/${path.replace(/index\.html$/, '')}`;
}

function targetFile(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const relativePath = decoded.replace(/^\/+/, '');
  const direct = resolve(site, relativePath);
  if (direct !== site && !direct.startsWith(`${site}${sep}`)) return null;
  if (existsSync(direct)) {
    return statSync(direct).isDirectory() ? join(direct, 'index.html') : direct;
  }
  if (existsSync(`${direct}.html`)) return `${direct}.html`;
  if (existsSync(join(direct, 'index.html'))) return join(direct, 'index.html');
  return null;
}

if (!existsSync(site)) fail('_site is missing; run the Jekyll build first');
const files = existsSync(site) ? walk(site) : [];
const pages = new Map(files.map((file) => [pageUrl(file), readFileSync(file, 'utf8')]));

for (const [url, html] of pages) {
  const mainCount = (html.match(/<main\b/gi) || []).length;
  const isRedirect = /<meta[^>]+http-equiv=["']refresh["']/i.test(html);
  if (!isRedirect && mainCount !== 1) fail(`${url} contains ${mainCount} main elements (expected one)`);
  if (isRedirect && mainCount > 1) fail(`${url} redirect contains more than one main element`);

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(`${url} contains duplicate IDs: ${duplicateIds.join(', ')}`);

  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (!href || /^(?:https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(href)) continue;
    const [rawPath, fragment] = href.split('#', 2);
    const pathname = (rawPath || url).split('?', 1)[0];
    const absolutePath = pathname.startsWith('/')
      ? pathname
      : `/${relative(site, resolve(dirname(targetFile(url) || site), pathname)).split(sep).join('/')}`;
    const target = targetFile(absolutePath);
    if (!target) { fail(`${url} links to missing internal target ${href}`); continue; }
    if (fragment) {
      const targetHtml = readFileSync(target, 'utf8');
      let decodedFragment;
      try { decodedFragment = decodeURIComponent(fragment); } catch { fail(`${url} has malformed fragment ${href}`); continue; }
      const escaped = decodedFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\sid=["']${escaped}["']`, 'i').test(targetHtml)) fail(`${url} links to missing fragment ${href}`);
    }
  }
}

const notebookRoutes = {
  '/notebook/': 'Working notes on software architecture, tools, AI, and the side paths that keep the craft interesting.',
  '/notebook/tech/': 'Architecture, code, and the systems around them.',
  '/notebook/llm/': 'Experiments and observations from working with AI systems.',
  '/notebook/hobby/': 'Curiosities, stories, and work done for the joy of it.',
};
for (const [url, expectedDescription] of Object.entries(notebookRoutes)) {
  const html = pages.get(url) || '';
  if (!html) { fail(`${url} was not built`); continue; }
  const description = html.match(/<meta name="description" content="([^"]*)">/i)?.[1];
  if (description !== expectedDescription) fail(`${url} has a missing, global, or unexpected description`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1];
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)">/i)?.[1];
  if (!canonical?.endsWith(url)) fail(`${url} has an incorrect canonical URL`);
  if (ogUrl !== canonical) fail(`${url} Open Graph URL does not match its canonical URL`);
  const ogDescription = html.match(/<meta property="og:description" content="([^"]*)">/i)?.[1];
  if (ogDescription !== expectedDescription) fail(`${url} Open Graph description does not match its page description`);
  if (/<meta name="keywords"/i.test(html)) fail(`${url} retains the obsolete keywords meta tag`);
}

console.log(failures ? `\nFAIL: ${failures} built-site integrity issue(s).` : `PASS (${files.length} HTML pages; structure, links, fragments, and Notebook metadata).`);
process.exit(failures ? 1 : 0);
