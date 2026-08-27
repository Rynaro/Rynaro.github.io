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

import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';
import { scanTokenUsages, isLogotypeContext, assertScanCoverage, listAllSelectors, LOGOTYPE_SELECTORS } from './lib/scss-scan.mjs';

const root = new URL('../', import.meta.url).pathname;
const manifestPath = root + '_data/palette-manifest.yml';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };
const ok = (msg) => console.log(`ok: ${msg}`);

const manifest = yaml.load(readFileSync(manifestPath, 'utf8'));
const rows = manifest.tokens;

// AC-203 (normalize-p2, Story 2.1): `meta.source` is a LIST of literal paths
// and/or `dir/*.scss`-style globs naming the settings layer (see
// _data/palette-manifest.yml's own header comment for why a list rather
// than one fixed path). Expanding it here -- rather than hardcoding
// `_sass/_variables.scss` as this test used to -- means an ITCSS split of
// the settings layer across multiple files only requires growing this
// list in the manifest, never reshaping this test.
function expandSourceGlobs(patterns, rootDir) {
  const files = [];
  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      const starIdx = pattern.indexOf('*');
      const slashIdx = pattern.lastIndexOf('/', starIdx);
      const dirPart = pattern.slice(0, slashIdx);
      const filePart = pattern.slice(slashIdx + 1);
      const filePartRe = new RegExp(
        '^' + filePart.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'
      );
      const dirAbs = rootDir + dirPart + '/';
      const matched = readdirSync(dirAbs).filter((f) => filePartRe.test(f)).sort();
      for (const f of matched) files.push(dirAbs + f);
    } else {
      files.push(rootDir + pattern);
    }
  }
  return files;
}

const sourcePatterns = Array.isArray(manifest.meta.source) ? manifest.meta.source : [manifest.meta.source];
const sourceFiles = expandSourceGlobs(sourcePatterns, root);
if (sourceFiles.length === 0) {
  fail(`meta.source (${JSON.stringify(sourcePatterns)}) resolved to ZERO files -- the settings-layer glob is broken or the settings layer moved without updating the manifest.`);
} else {
  ok(`meta.source (${JSON.stringify(sourcePatterns)}) resolves to ${sourceFiles.length} settings-layer file(s): ${sourceFiles.map((f) => f.replace(root, '')).join(', ')}`);
}

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

// --- 3. completeness: every color-bearing token declared across the
// settings layer (meta.source, expanded above) appears in the manifest
// exactly once. AC-203: reads every resolved sourceFile, not one hardcoded
// path, so this stays correct once the settings layer splits. ---
const varsSrc = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
const NON_PALETTE_SASS_VARS = new Set([
  '$sidebar-width', '$content-max-width', '$tablet-breakpoint', '$mobile-breakpoint',
  '$radius-3', '$radius-4', '$radius-5', '$radius-6', '$radius-8', '$radius-10',
  '$radius-12', '$radius-20', '$radius-24', '$radius-30', '$radius-40',
]);
const ALIAS_VARS = new Set(['$soft-pink', '$soft-purple', '$soft-blue', '$background-white']); // aliases of already-manifested tokens

const declaredSassVars = [...varsSrc.matchAll(/^\$([a-zA-Z0-9-]+):/gm)].map((m) => `$${m[1]}`)
  .filter((v) => !NON_PALETTE_SASS_VARS.has(v) && !ALIAS_VARS.has(v));
const declaredCssVars = [...varsSrc.matchAll(/^\s*(--[a-zA-Z0-9-]+):/gm)].map((m) => m[1]);

const manifestNames = new Set(rows.map((r) => r.name));
const declared = [...declaredSassVars, ...declaredCssVars];
const unclassified = declared.filter((name) => !manifestNames.has(name));
if (unclassified.length > 0) {
  fail(`${unclassified.length} token(s) declared in the settings layer (meta.source) are NOT in the manifest: ${unclassified.join(', ')}`);
} else {
  ok(`every palette token declared in the settings layer (meta.source) is classified (${declared.length} declared tokens; non-palette dimensions and aliases excluded)`);
}

// Reverse check: no manifest row claims a name that isn't actually declared
// (catches typos / stale rows independent of the completeness check above).
const dangling = rows.filter((r) => !declared.includes(r.name) && !ALIAS_VARS.has(r.name));
if (dangling.length > 0) {
  fail(`manifest rows reference tokens not declared in the settings layer (meta.source): ${dangling.map((r) => r.name).join(', ')}`);
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

// --- 6. AC-202 (normalize-p2): shared anti-vacuity structural guard. This
// suite calls scanTokenUsages() (via listScssFiles()) directly above, so it
// gets the same scanner-coverage protection as token-usage.test.mjs rather
// than staying blind to a scanner silently under-scanning _sass/. ---
const coverage = assertScanCoverage();
if (!coverage.ok) fail(coverage.message);
else ok(coverage.message);

// --- 7. AC-205 (normalize-p2): every entry in scss-scan.mjs's
// LOGOTYPE_SELECTORS must match at least one selector actually present
// anywhere under _sass/ (recursively, via listScssFiles()/listAllSelectors()
// -- structure-agnostic exactly like AC-201). A stale entry (e.g. left
// behind after a future BEM rename touches `.hero-subtitle` without
// updating this list) would otherwise silently reclassify which token
// usages isLogotypeContext() -- and therefore AC-047's ink-obligation
// check -- treats as logotype, with no error. "Matches" uses the SAME
// substring semantics isLogotypeContext() itself uses (sel.includes(wm)),
// so this exercises the exact rule the classifier relies on. ---
const allSelectors = [...listAllSelectors()];
let staleLogotypeSelectors = 0;
for (const wm of LOGOTYPE_SELECTORS) {
  const hit = allSelectors.some((sel) => sel.includes(wm));
  if (!hit) {
    fail(`LOGOTYPE_SELECTORS entry "${wm}" matches NO selector present anywhere in _sass/ -- stale entry (AC-205). A rename touching this selector must update LOGOTYPE_SELECTORS in the same commit.`);
    staleLogotypeSelectors++;
  }
}
if (staleLogotypeSelectors === 0) {
  ok(`every LOGOTYPE_SELECTORS entry (${LOGOTYPE_SELECTORS.length}) matches at least one real selector in _sass/ (AC-205)`);
}

console.log(failures === 0 ? `\nPASS (AC-048): ${rows.length} tokens, 0 failures.` : `\nFAIL (AC-048): ${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
