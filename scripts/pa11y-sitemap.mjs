#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

export function discoverAuditUrls(xml, excludePattern = String.raw`\.xml(?:$|[?#])`) {
  const exclude = new RegExp(excludePattern, 'i');
  const urls = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter((url) => url && !exclude.test(url));
  const unique = [...new Set(urls)];
  if (unique.length === 0) throw new Error('Pa11y sitemap preflight discovered zero auditable URLs.');
  if (unique.length !== urls.length) throw new Error(`Pa11y sitemap contains ${urls.length - unique.length} duplicate auditable URL(s).`);
  return unique;
}

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

async function run() {
  const sitemap = argument('--sitemap');
  const exclude = argument('--exclude', String.raw`\.xml(?:$|[?#])`);
  if (!sitemap) throw new Error('Usage: pa11y-sitemap.mjs --sitemap <url> [--exclude <pattern>]');

  const response = await fetch(sitemap);
  if (!response.ok) throw new Error(`Unable to load sitemap ${sitemap}: HTTP ${response.status}`);
  const expectedUrls = discoverAuditUrls(await response.text(), exclude);
  console.error(`Pa11y preflight: ${expectedUrls.length} unique canonical non-XML URL(s) discovered.`);
  console.error('Manual-review findings are capped at warning by .pa11yci; confirmed violations remain blocking at threshold 0.');

  const binary = fileURLToPath(new URL('../node_modules/pa11y-ci/bin/pa11y-ci.js', import.meta.url));
  const child = spawn(process.execPath, [binary, '--sitemap', sitemap, '--sitemap-exclude', exclude, '--threshold', '0', '--json'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    env: { ...process.env, PUPPETEER_EXECUTABLE_PATH: chromium.executablePath() },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code) => resolve(code ?? 1));
  });
  if (stderr.trim()) process.stderr.write(stderr);

  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    throw new Error(`Pa11y did not emit a valid JSON report (exit ${exitCode}).\n${stdout.slice(0, 1000)}`);
  }
  const audited = Number(report.total);
  if (!Number.isInteger(audited) || audited === 0) throw new Error('Pa11y reported zero audited URLs.');
  if (audited !== expectedUrls.length) {
    throw new Error(`Pa11y audited ${audited} URL(s), but sitemap preflight discovered ${expectedUrls.length}.`);
  }
  const resultCount = Object.keys(report.results || {}).length;
  if (resultCount !== audited) throw new Error(`Pa11y returned results for ${resultCount} of ${audited} audited URL(s).`);

  console.log(`Pa11y audit: ${audited} page(s), ${report.passes} passing page(s), ${report.errors} blocking violation(s).`);
  if (exitCode !== 0) process.exitCode = exitCode;
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invokedDirectly) run().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
