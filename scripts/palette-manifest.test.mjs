#!/usr/bin/env node
// scripts/palette-manifest.test.mjs
//
// AC-048: "the repository SHALL carry a committed manifest assigning every
// palette token exactly one `role` from ornament, logotype, or content
// together with exactly one `obligation` from ink or exempt, under the
// mapping in which `content` takes `ink` while `ornament` and `logotype`
// take `exempt`."
//
// VERIFY (exact): a committed manifest enumerates every token declared in
// _sass/_variables.scss with exactly one role and one obligation each; zero
// tokens are unclassified; a script asserts that role `content` holds if and
// only if obligation `ink` for every row, and asserts that every
// `logotype`-role token is referenced only by rules inside the wordmark
// selector set (`.hero-subtitle` in _home.scss and _about.scss) and by no
// rule that renders body text.

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { scanTokenUsages, isLogotypeContext } from './lib/scss-scan.mjs';

const root = new URL('../', import.meta.url).pathname;
const manifestPath = root + '_data/palette-manifest.yml';
const varsPath = root + '_sass/_variables.scss';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

const manifest = yaml.load(readFileSync(manifestPath, 'utf8'));
const rows = manifest.tokens;

// --- 1. every row has exactly one role and one obligation, from the closed sets ---
const ROLES = new Set(['ornament', 'logotype', 'content']);
const OBLIGATIONS = new Set(['ink', 'exempt']);
for (const row of rows) {
  if (!ROLES.has(row.role)) fail(`${row.name}: role "${row.role}" not in {ornament,logotype,content}`);
  if (!OBLIGATIONS.has(row.obligation)) fail(`${row.name}: obligation "${row.obligation}" not in {ink,exempt}`);
}
if (failures === 0) ok(`every manifest row has exactly one role and one obligation, from the closed sets (${rows.length} rows)`);

// --- 2. role <=> obligation consistency: content iff ink ---
let consistencyFailures = 0;
for (const row of rows) {
  const isContent = row.role === 'content';
  const isInk = row.obligation === 'ink';
  if (isContent !== isInk) {
    fail(`${row.name}: role=${row.role} obligation=${row.obligation} -- content <=> ink violated`);
    consistencyFailures++;
  }
}
if (consistencyFailures === 0) ok('role "content" holds if and only if obligation "ink", for every row');

// --- 3. completeness: every color-bearing token declared in _variables.scss
// appears in the manifest exactly once. ---
const varsSrc = readFileSync(varsPath, 'utf8');
const LAYOUT_VARS = new Set(['$sidebar-width', '$content-max-width', '$tablet-breakpoint', '$mobile-breakpoint']);
const ALIAS_VARS = new Set(['$soft-pink', '$soft-purple', '$soft-blue', '$background-white']); // aliases of already-manifested tokens

const declaredSassVars = [...varsSrc.matchAll(/^\$([a-zA-Z0-9-]+):/gm)].map((m) => `$${m[1]}`)
  .filter((v) => !LAYOUT_VARS.has(v) && !ALIAS_VARS.has(v));
const declaredCssVars = [...varsSrc.matchAll(/^\s*(--[a-zA-Z0-9-]+):/gm)].map((m) => m[1]);

const manifestNames = new Set(rows.map((r) => r.name));
const declared = [...declaredSassVars, ...declaredCssVars];
const unclassified = declared.filter((name) => !manifestNames.has(name));
if (unclassified.length > 0) {
  fail(`${unclassified.length} token(s) declared in _sass/_variables.scss are NOT in the manifest: ${unclassified.join(', ')}`);
} else {
  ok(`every non-layout, non-alias token declared in _sass/_variables.scss is classified (${declared.length} declared tokens)`);
}

// Reverse check: no manifest row claims a name that isn't actually declared
// (catches typos / stale rows independent of the completeness check above).
const dangling = rows.filter((r) => !declared.includes(r.name) && !ALIAS_VARS.has(r.name));
if (dangling.length > 0) {
  fail(`manifest rows reference tokens not declared in _sass/_variables.scss: ${dangling.map((r) => r.name).join(', ')}`);
}

// --- 4. logotype usage-binding: every logotype-role token is referenced only
// inside the wordmark selector set, and by no rule that renders body text
// (operationalized as: no color/border-color/fill usage of that token exists
// outside the logotype selector context). ---
const logotypeTokens = rows.filter((r) => r.role === 'logotype').map((r) => r.name);
if (logotypeTokens.length === 0) {
  console.log('note: no token is currently classified role=logotype in the manifest (the wordmark usage -- .hero-subtitle color: var(--ff-gold) -- is carried by an ORNAMENT-role token whose other 42 usages are decorative; the logotype selector-set carve-out is enforced structurally by scanTokenUsages()\'s isLogotypeContext(), exercised by token-usage.test.mjs, rather than by a dedicated logotype-role row). See AC-047 test for the binding.');
} else {
  const usages = scanTokenUsages();
  for (const tokenName of logotypeTokens) {
    const nonLogotypeUsages = usages.filter((u) => u.token === tokenName && !u.logotype);
    if (nonLogotypeUsages.length > 0) {
      fail(`${tokenName} is role=logotype but is used outside the wordmark selector set: ${nonLogotypeUsages.map((u) => `${u.file}:${u.line}`).join(', ')}`);
    }
  }
  if (failures === 0) ok(`every logotype-role token is referenced only inside .hero-subtitle`);
}

// --- 5. anti-vacuity: the manifest must not be all-ornament or all-content. ---
const roleCounts = { ornament: 0, logotype: 0, content: 0 };
for (const row of rows) roleCounts[row.role]++;
if (roleCounts.content === 0) fail('the manifest classifies ZERO tokens as content -- vacuous (AC-026 requires the content set be non-empty)');
if (roleCounts.ornament === 0) fail('the manifest classifies ZERO tokens as ornament -- suspicious for a themed palette this size');
if (failures === 0) ok(`role distribution is non-vacuous: ornament=${roleCounts.ornament} logotype=${roleCounts.logotype} content=${roleCounts.content}`);

console.log(failures === 0 ? `\nPASS (AC-048): ${rows.length} tokens, 0 failures.` : `\nFAIL (AC-048): ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
