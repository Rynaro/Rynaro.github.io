#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
const catalogue = yaml.load(readFileSync(`${root}_data/projects.yaml`, 'utf8'));
const homepage = yaml.load(readFileSync(`${root}_data/homepage.yml`, 'utf8'));
const categories = new Set(['flagship', 'research', 'tools', 'personal', 'archive']);
const featured = new Set(['flagship', 'primary', 'supporting', 'archive']);
const tones = new Set(['ember', 'leaf', 'brass', 'indigo']);
const required = ['key', 'title', 'category', 'repository_url', 'role', 'status_label', 'summary', 'story', 'proof', 'tags', 'featured', 'tone'];
const editorialSnapshot = {
  eidolons: { status: 'Released v3.2.0', language: 'Shell', category: 'flagship' },
  ariramba: { status: 'Research prototype', language: 'Python', category: 'research' },
  'cardboard-box': { status: 'Released v0.16.0', language: 'Rust', category: 'tools' },
  magicite: { status: 'Experimental v0.3.1', language: 'Python', category: 'research' },
  crystalium: { status: 'Released v2.2.0', language: 'Python', category: 'research' },
  sunforge: { status: 'Released v1.2.0', language: 'Shell', category: 'tools' },
  termaup: { status: 'Work in progress', language: 'Rust', category: 'tools' },
  lararium: { status: 'Living companion · v1.8', language: 'Python', category: 'personal' },
};
let failures = 0;
const fail = (message) => { console.error(`FAIL: ${message}`); failures += 1; };

if (!Array.isArray(catalogue.categories) || catalogue.categories.map(({ key }) => key).join(',') !== [...categories].join(',')) fail('category order/vocabulary must be flagship, research, tools, personal, archive');
if (!Array.isArray(catalogue.projects) || catalogue.projects.length !== 20) fail('catalogue must contain exactly 20 curated projects');
const keys = new Set();
for (const project of catalogue.projects || []) {
  for (const field of required) if (project[field] === undefined || project[field] === '') fail(`${project.key || project.title || 'unknown'} lacks ${field}`);
  if (keys.has(project.key)) fail(`duplicate key ${project.key}`);
  keys.add(project.key);
  if (!categories.has(project.category)) fail(`${project.key} has invalid category ${project.category}`);
  if (!featured.has(project.featured)) fail(`${project.key} has invalid featured value ${project.featured}`);
  if (!tones.has(project.tone)) fail(`${project.key} has invalid tone ${project.tone}`);
  if (!Array.isArray(project.tags) || !project.tags.length) fail(`${project.key} must have tags`);
  for (const tag of project.tags || []) if (tag !== tag.toLocaleLowerCase()) fail(`${project.key} tag ${tag} must use canonical lowercase`);
  if (new Set((project.tags || []).map((tag) => tag.toLocaleLowerCase())).size !== project.tags?.length) fail(`${project.key} has duplicate tags (case-insensitive)`);
  if (project.language && (project.tags || []).some((tag) => tag.toLocaleLowerCase() === project.language.toLocaleLowerCase())) fail(`${project.key} repeats language ${project.language} in tags`);
  if (!/^https:\/\/github\.com\/Rynaro\//.test(project.repository_url)) fail(`${project.key} repository must be an explicit Rynaro GitHub URL`);
}
for (const [key, expected] of Object.entries(editorialSnapshot)) {
  const project = catalogue.projects?.find((candidate) => candidate.key === key);
  if (!project) {
    fail(`editorial snapshot project ${key} is missing`);
    continue;
  }
  if (project.status_label !== expected.status) fail(`${key} editorial status changed`);
  if (project.language !== expected.language) fail(`${key} editorial language changed`);
  if (project.category !== expected.category) fail(`${key} editorial category changed`);
}
const expectedHomepage = ['eidolons', 'ariramba', 'cardboard-box', 'magicite', 'lararium', 'alchemists-orchid'];
if (homepage.artifact_keys?.join(',') !== expectedHomepage.join(',')) fail('homepage artifact keys/order changed');
for (const key of homepage.artifact_keys || []) if (!keys.has(key)) fail(`homepage references missing project ${key}`);
if (catalogue.projects?.filter(({ category }) => category === 'flagship').map(({ key }) => key).join(',') !== 'eidolons') fail('Eidolons must be the sole flagship');

console.log(failures ? `\nFAIL: ${failures} project data check(s).` : '\nPASS (canonical project catalogue).');
process.exit(failures ? 1 : 0);
