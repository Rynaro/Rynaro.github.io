#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`ok: ${message}`);
  else { console.error(`FAIL: ${message}`); failures++; }
};
const read = (path) => readFileSync(join(root, path), 'utf8');

for (const path of [
  '_data/character_build.yml',
  '_data/traits.yml',
  '_data/attributes.yml',
  '_data/special_abilities.yaml',
  '_includes/components/section-title.html',
  '_sass/components/_components.scss',
  'assets/js/exp-bar.js',
  'assets/js/main.js',
  'scripts/repoint-ink-tokens.mjs',
]) check(!existsSync(join(root, path)), `${path} stays removed`);

const profile = yaml.load(read('_data/profile.yml'));
check(profile.social_links.every(({ name, url, ...rest }) => name && url && Object.keys(rest).length === 0), 'profile social links retain only name and URL');

const skills = yaml.load(read('_data/skills.yml'));
check(skills.categories.every((category) => category.name && category.skills.every(({ name, ...rest }) => name && Object.keys(rest).length === 0)), 'skills retain only category and skill names');

const source = [
  read('_sass/settings/_variables.scss'),
  read('_data/palette-manifest.yml'),
  read('assets/css/main.scss'),
].join('\n');
for (const stale of [
  '--stat-track-hairline', '--stat-fill-edge', '--rarity-common',
  '--rarity-uncommon', '--rarity-rare', '--rarity-epic', '--rarity-legendary',
  '--dnd-brown', '--ff-purple-ink',
  '--ink-color', '--letter-', '--parchment-', '--scroll-shadow',
  'animateOnScroll', 'components/components',
]) check(!source.includes(stale), `${stale} stays absent from live configuration`);
for (const stale of ['--ff-purple', '--ff-purple-light']) {
  const declaration = new RegExp(`(?:^|\\n)\\s*(?:- name: )?${stale.replaceAll('-', '\\-')}(?=\\s*:|\\s*$)`, 'm');
  check(!declaration.test(source), `${stale} declaration stays absent from live configuration`);
}

const identity = yaml.load(read('_data/identity.yml'));
check(typeof identity.tagline === 'string' && identity.tagline.includes('Code Alchemist'), 'canonical identity data remains intact');
check(existsSync(join(root, '_data/post_types.yml')), 'post type registry remains intact');
check(read('_includes/head/fonts.html').includes('fontawesome.min.css'), 'Font Awesome remains available for live icons');
check(read('_data/notebook_authors.yml').includes('vivi'), 'Eidolon authorship remains intact');
check(!read('_layouts/default.html').includes('assets/js/main.js'), 'default layout does not restore the anchor-hijacking script');

const variables = read('_sass/settings/_variables.scss');
for (const token of ['$pastel-purple', '$pastel-purple-ink', '$pastel-purple-ink-hover', '--bg-primary', '--text-body', '--border-light', '$content-max-width', '$tablet-breakpoint']) {
  check(variables.includes(token), `${token} remains available to living styles`);
}
const utilities = read('_sass/utilities/_utilities.scss');
for (const deadClass of ['.fade-in', '.slide-up', '.force-light-mode', '.force-dark-mode', '.focus-visible', '.text-center', '.mt-3']) {
  check(!utilities.includes(deadClass), `${deadClass} stays removed`);
}
check(read('assets/js/sigil-navigation.js').includes('astrolabe'), 'Wayfinder sigil behavior remains intact');
const letterScript = read('assets/js/letter.js');
check(letterScript.includes("matchMedia('(prefers-reduced-motion: reduce)').matches"), 'Letter status scrolling detects reduced-motion preference');
check(letterScript.includes("reduceMotion ? 'auto' : 'smooth'"), 'Letter status scrolling uses instant movement for reduced motion');

console.log(failures === 0 ? '\nPASS: dormant legacy surface removed and live identity protected.' : `\nFAIL: ${failures} legacy-cleanup assertion(s).`);
process.exit(failures === 0 ? 0 : 1);
