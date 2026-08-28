#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
const canonicalPath = `${root}_site/about/index.html`;
const legacyPath = `${root}_site/about.html`;
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures += 1; };
const check = (condition, message) => condition ? console.log(`ok: ${message}`) : fail(message);

if (!existsSync(canonicalPath) || !existsSync(legacyPath)) {
  fail('canonical or legacy About output missing; run bundle exec jekyll build first');
} else {
  const html = readFileSync(canonicalPath, 'utf8');
  const legacy = readFileSync(legacyPath, 'utf8');
  const about = yaml.load(readFileSync(`${root}_data/about.yml`, 'utf8'));
  const homepage = yaml.load(readFileSync(`${root}_data/homepage.yml`, 'utf8'));
  const jobs = yaml.load(readFileSync(`${root}_data/jobs.yaml`, 'utf8'));
  const skills = yaml.load(readFileSync(`${root}_data/skills.yml`, 'utf8'));

  for (const copy of [about.hero.eyebrow, about.hero.title, about.hero.introduction, about.hero.note, about.principles.title, about.threshold.title, about.threshold.text]) {
    check(html.includes(copy.replace(/&/g, '&amp;')), `approved copy renders: ${copy.slice(0, 42)}`);
  }
  check((html.match(/class="about-era"/g) || []).length === homepage.eras.length, 'all canonical homepage eras render');
  check((html.match(/class="about-career__list"/g) || []).length === 1, 'career uses one semantic sequence');
  check((html.match(/data-career-entry/g) || []).length === jobs.length, 'every career role is available before enhancement');
  check(/data-career-toggle[^>]+aria-expanded="false"/.test(html), 'career toggle has a truthful initial accessible state');
  check(/assets\/js\/about\.js/.test(html), 'career progressive enhancement is loaded');
  for (const job of jobs) check(html.includes(job.title) && html.includes(job.company), `${job.title} at ${job.company} renders`);
  for (const category of skills.categories) {
    check(html.includes(category.name), `${category.name} skill group renders`);
    for (const skill of category.skills) check(html.includes(skill.name), `${skill.name} renders without a mastery score`);
  }
  check(html.includes('Rust') && !html.includes('Elixir'), 'Rust replaces Elixir');
  check(html.includes('Agentic Orchestration') && !html.includes('Microservices'), 'Agentic Orchestration replaces Microservices');
  check(html.includes('<dt>Class</dt><dd>Code Alchemist</dd>'), 'compact Code Alchemist class annotation renders');
  check(html.includes('<dt>Discipline</dt><dd>Systems Cartography</dd>'), 'compact Systems Cartography discipline annotation renders');
  check((html.match(/Chapter 0[1-4]/g) || []).length === homepage.eras.length, 'each transformation has a visible chapter marker');
  check((html.match(/about-era__rune/g) || []).length === homepage.eras.length, 'each transformation has one decorative rune');
  check(html.includes('Quest chronicle') && html.includes('Active quest'), 'career uses restrained quest language');
  check(html.includes('Open the complete chronicle'), 'career control uses chronicle language');
  check(html.includes('Workbench inventory'), 'craft section uses workbench inventory language');
  check((html.match(/about-craft__proficiency/g) || []).length === skills.categories.length, 'each skill category has a proficiency label');
  check(html.includes('Field inventory'), 'marginalia uses field inventory language');
  check(!/(role="meter"|role="progressbar"|mastery-|MP Cost|exp-bar\.js)/.test(html), 'legacy stats, mastery, mana, and obsolete scripts are absent');
  check(/rel="canonical" href="https?:\/\/[^\"]+\/about\/"/.test(legacy), 'legacy page declares the canonical route');
  check(/http-equiv="refresh"[^>]+\/about\//.test(legacy), 'legacy page redirects to the canonical route');
}

console.log(failures ? `\nFAIL: ${failures} About check(s).` : '\nPASS (About portrait).');
process.exit(failures ? 1 : 0);
