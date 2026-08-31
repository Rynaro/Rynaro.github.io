#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const root = new URL('../', import.meta.url).pathname;
const canonicalPath = `${root}_site/letter/index.html`;
const legacyPath = `${root}_site/letter.html`;
let failures = 0;
const check = (condition, message) => condition ? console.log(`ok: ${message}`) : (console.error(`FAIL: ${message}`), failures += 1);
const plain = (value) => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().replace(/&amp;/g, '&');

check(!existsSync(legacyPath), 'obsolete /letter.html compatibility output stays absent');
if (!existsSync(canonicalPath)) {
  check(false, 'canonical Letter output exists; run bundle exec jekyll build first');
} else {
  const html = readFileSync(canonicalPath, 'utf8');
  const source = readFileSync(`${root}letter.html`, 'utf8');
  const script = readFileSync(`${root}assets/js/letter.js`, 'utf8');
  const data = yaml.load(readFileSync(`${root}_data/letter.yml`, 'utf8'));
  const approved = [data.hero.eyebrow, data.hero.title, data.hero.intro, data.hero.marginalia, data.prompts.heading, data.prompts.intro, ...data.prompts.items.flatMap((item) => [item.title, item.text]), data.channels.heading, data.channels.intro, data.form.heading, data.form.intro, data.form.privacy, data.form.success.title, data.form.success.text, data.form.error.title, data.form.error.text];
  for (const copy of approved) check(plain(html).includes(copy), `approved copy renders: ${copy.slice(0, 46)}`);
  check(/<form[^>]+action="https:\/\/formspree\.io\/f\/xjvapdgb"[^>]+method="post"[^>]+data-letter-form/.test(html), 'native Formspree POST is the baseline');
  for (const [name, type, autocomplete] of [['name', 'text', 'name'], ['email', 'email', 'email'], ['subject', 'text', 'off']]) check(new RegExp(`name="${name}"[^>]+type="${type}"[^>]+autocomplete="${autocomplete}"[^>]+required`).test(html), `${name} field is labelled-compatible, required, and autofill-aware`);
  check(/<textarea[^>]+name="message"[^>]+rows="8"[^>]+required/.test(html), 'message field is required with approved row count');
  check(/name="_gotcha"/.test(html), 'honeypot field remains present');
  check((html.match(/mailto:hi@hlavezzo\.me/g) || []).length >= 3, 'direct email fallback remains available throughout');
  check(/aria-live="polite"/.test(html) && /data-letter-success hidden/.test(html) && /data-letter-error hidden/.test(html), 'submission feedback has a live region and truthful initial state');
  check(!/(letter-particle|input-sparkle|magical-burst|Math\.random)/.test(source + script), 'obsolete particle effects are absent');
  check(/typeof window\.fetch/.test(script) && /typeof window\.FormData/.test(script), 'enhancement guards fetch and FormData');
  check(/if \(!form\.checkValidity\(\)\) return;\s*event\.preventDefault\(\)/.test(script), 'native submit is only intercepted after validity and capability checks');
  check(/if \(!response\.ok\)/.test(script) && /form\.reset\(\);\s*showStatus\('success'\)/.test(script), 'reset occurs only after a successful response');
  check(!/innerHTML/.test(script), 'form behavior does not inject HTML');
}
console.log(failures ? `\nFAIL: ${failures} Letter check(s).` : '\nPASS (correspondence desk).');
process.exit(failures ? 1 : 0);
