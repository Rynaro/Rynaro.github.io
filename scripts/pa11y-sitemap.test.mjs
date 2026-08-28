#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { discoverAuditUrls } from './pa11y-sitemap.mjs';

const root = new URL('../', import.meta.url).pathname;

test('sitemap preflight rejects a zero-URL fixture', () => {
  assert.throws(() => discoverAuditUrls('<?xml version="1.0"?><urlset></urlset>'), /zero auditable URLs/);
});

test('sitemap preflight excludes XML and rejects duplicate canonical URLs', () => {
  const xml = '<urlset><url><loc>http://localhost:4000/</loc></url><url><loc>http://localhost:4000/feed.xml</loc></url></urlset>';
  assert.deepEqual(discoverAuditUrls(xml), ['http://localhost:4000/']);
  assert.throws(() => discoverAuditUrls(xml.replace('</urlset>', '<url><loc>http://localhost:4000/</loc></url></urlset>')), /duplicate/);
});

test('workflow invokes the guarded sitemap audit explicitly', () => {
  const workflow = readFileSync(join(root, '.github/workflows/a11y.yml'), 'utf8');
  assert.match(workflow, /pa11y-sitemap\.mjs --sitemap http:\/\/localhost:4000\/sitemap\.xml --exclude/);
  assert.match(workflow, /pa11y-ratchet:[\s\S]*?playwright install --with-deps chromium[\s\S]*?pa11y-sitemap\.mjs/);
  const config = JSON.parse(readFileSync(join(root, '.pa11yci'), 'utf8'));
  assert.equal(config.defaults.standard, 'WCAG2AA');
  assert.equal(config.defaults.levelCapWhenNeedsReview, 'warning');
  assert.deepEqual(config.defaults.ignore.sort(), ['notice', 'warning']);
  assert.equal(config.sitemap, undefined, 'ignored top-level sitemap configuration must not return');
});

test('built pages have no dangling aria-describedby or aria-label on generic divs', () => {
  const site = join(root, '_site');
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (path.endsWith('.html')) files.push(path);
    }
  };
  walk(site);
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]));
    for (const match of html.matchAll(/\saria-describedby=["']([^"']+)["']/gi)) {
      for (const id of match[1].trim().split(/\s+/)) assert(ids.has(id), `${file} describes missing #${id}`);
    }
    for (const match of html.matchAll(/<div\b[^>]*\saria-label=["'][^"']+["'][^>]*>/gi)) {
      assert.match(match[0], /\srole=["'][^"']+["']/i, `${file} labels a generic div without a role`);
    }
  }
});
