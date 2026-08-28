import fs from 'node:fs';
import yaml from 'js-yaml';

let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`ok: ${message}`);
  else { console.error(`FAIL: ${message}`); failures += 1; }
};

const source = fs.readFileSync('uses.html', 'utf8');
const data = yaml.load(fs.readFileSync('_data/uses.yml', 'utf8'));
const projects = yaml.load(fs.readFileSync('_data/projects.yaml', 'utf8')).projects;
const authors = yaml.load(fs.readFileSync('_data/notebook_authors.yml', 'utf8'));
const output = fs.readFileSync('_site/uses/index.html', 'utf8');

check(source.includes('site.data.projects.projects | where: "key", key'), 'workshop projects resolve from canonical project data');
check(source.includes('site.data.notebook_authors[member.author_id]'), 'party names resolve from canonical author data');
check(data.updated_at instanceof Date || data.updated_at === '2026-08-27', 'loadout has an explicit review date');
check(data.workshop.project_keys.every((key) => projects.some((project) => project.key === key)), 'every workshop key exists in the project catalogue');
check(data.familiars.members.every((member) => authors[member.author_id]), 'every party member exists in the author roster');
check(!/Claude|GPT|Perplexity|MacBook|VS Code/i.test(output), 'page makes no unconfirmed hardware, editor, provider, or model claims');
check(output.includes('The tools I keep within reach.') && output.includes('The inventory matters when it leaves a trace.'), 'approved hero and threshold copy render');
check((output.match(/class="uses-projects"/g) || []).length === 1, 'workshop renders as one semantic project list');
check((output.match(/class="uses-party"/g) || []).length === 1, 'Eidolon party renders as one semantic list');
check(!/<script[^>]+uses/i.test(source), 'Uses adds no page JavaScript');

if (failures) process.exit(1);
