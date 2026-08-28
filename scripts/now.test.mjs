#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
const output = `${root}_site/now/index.html`;
let failures = 0;
const check = (condition, message) => condition ? console.log(`ok: ${message}`) : (console.error(`FAIL: ${message}`), failures += 1);

if (!existsSync(output)) {
  check(false, 'canonical Now output exists; run bundle exec jekyll build first');
} else {
  const html = readFileSync(output, 'utf8');
  const data = yaml.load(readFileSync(`${root}_data/now.yml`, 'utf8'));
  const catalogue = yaml.load(readFileSync(`${root}_data/projects.yaml`, 'utf8'));
  for (const copy of [data.hero.eyebrow, data.hero.title, data.hero.introduction, data.focus.title, data.focus.introduction, data.side_paths.title, data.threshold.title, data.stale_note]) {
    check(html.includes(copy.replace(/&/g, '&amp;')), `approved copy renders: ${copy.slice(0, 45)}`);
  }
  check(/<time datetime="2026-08-28">August 28, 2026<\/time>/.test(html), 'manual editorial date renders semantically');
  check((html.match(/class="now-quest"/g) || []).length === data.focus.items.length, 'complete ordered quest ledger renders');
  for (const item of data.focus.items.filter(({ project_key }) => project_key)) {
    const project = catalogue.projects.find(({ key }) => key === item.project_key);
    check(Boolean(project), `${item.project_key} resolves from the canonical catalogue`);
    if (project) check(html.includes(project.title) && html.includes(project.status_label) && html.includes(project.summary) && html.includes(project.repository_url), `${project.title} uses canonical title, status, summary, and repository`);
    check(html.includes(`/laboratory/#project-${item.project_key}`), `${item.project_key} links to its stable Laboratory anchor`);
  }
  check(/<aside class="now-side-paths"/.test(html), 'grounding rituals use a semantic aside');
  check(/<nav aria-label="Continue through the atelier">/.test(html), 'closing routes use labelled navigation');
  check(!/(assets\/js\/now|data-now|progressbar|metric|animation)/i.test(html), 'Now ships without page JavaScript, metrics, or animation hooks');
}

console.log(failures ? `\nFAIL: ${failures} Now check(s).` : '\nPASS (Now living record).');
process.exit(failures ? 1 : 0);
