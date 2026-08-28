#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
let failures = 0;
const check = (condition, message) => condition ? console.log(`ok: ${message}`) : (console.error(`FAIL: ${message}`), failures += 1);
const load = (path) => yaml.load(readFileSync(`${root}${path}`, 'utf8'));

const identity = load('_data/identity.yml');
const homepage = load('_data/homepage.yml');
const about = load('_data/about.yml');
const now = load('_data/now.yml');
const letter = load('_data/letter.yml');
const jobs = load('_data/jobs.yaml');
const config = load('_config.yml');
const aboutHtml = readFileSync(`${root}_site/about/index.html`, 'utf8');
const nowHtml = readFileSync(`${root}_site/now/index.html`, 'utf8');

check(identity.facts_reviewed_at === '2026-08-28', 'canonical facts review date is current');
check(identity.tagline === config.description, 'feed description mirrors the canonical tagline');
check(identity.professional.generic_role === 'Engineering leader', 'generic English role is canonical');
check(identity.professional.current_title === 'Director of Engineering' && identity.professional.current_company === 'ElectionBuddy Inc.' && identity.professional.current_since === '2022-08', 'current role is recorded canonically');
check(identity.location.born_in === 'Brazil' && identity.location.lives_in === 'Brazil', 'birthplace and residence are explicit');
check(identity.practice.broad_ai_term === 'AI-assisted engineering', 'broad AI term is canonical');
check(identity.personal.learning.includes('Chinese'), 'Chinese learning remains current');
check(/cats, a fish, plants, terrariums, and small ecosystems/.test(identity.personal.home_glimpse), 'household uses a durable glimpse rather than animal counts');

const publicBio = JSON.stringify({ homepage, about, now, letter });
check(!/five cats|two fish/i.test(publicBio), 'stale animal counts are absent from public biography data');
check(!/local-first AI/i.test(publicBio), 'broad biography copy does not overstate local-first practice');
check((now.focus.items || []).some(({ project_key, marker, note }) => project_key === 'crystalium' && marker === 'Research' && note === 'Exploring how specialist agents can carry useful memory across sessions without weakening provenance, trust boundaries, or deliberate forgetting.'), 'Crystalium is a canonical current research project');
check(now.updated_at instanceof Date && now.updated_at.toISOString().startsWith('2026-08-28'), 'Now review date matches the facts review');

check(jobs.filter(({ ended_at }) => ended_at == null).length === 1, 'exactly one career entry is current');
check(jobs.every(({ started_at, ended_at }) => /^\d{4}-\d{2}-01$/.test(started_at) && (ended_at == null || /^\d{4}-\d{2}-01$/.test(ended_at))), 'career dates use first-of-month machine precision');
check(jobs.every((job, index) => index === 0 || jobs[index - 1].started_at >= job.started_at), 'career entries remain newest-first');
const interlude = jobs.find(({ kind }) => kind === 'interlude');
check(interlude?.display_period === '2014 — mid-2015' && interlude?.date_precision === 'approximate', 'confirmed study and freelance interlude keeps honest precision');
check(aboutHtml.includes('Personal facts reviewed <time datetime="2026-08-28">August 28, 2026</time>'), 'About renders the canonical review annotation');
check((aboutHtml.match(/class="is-current"/g) || []).length === 1 && aboutHtml.includes('2014 — mid-2015'), 'career renders one current role and the confirmed interlude');
check(nowHtml.includes('Crystalium') && nowHtml.includes('Released v2.2.0') && nowHtml.includes('/laboratory/#project-crystalium'), 'canonical Crystalium facts render in Current Quests');

console.log(failures ? `\nFAIL: ${failures} personal fact check(s).` : '\nPASS (canonical personal facts).');
process.exit(failures ? 1 : 0);
