#!/usr/bin/env node
// scripts/token-usage.test.mjs
//
// AC-047: "GIVEN a palette token referenced by a CSS `color`, `border-color`,
// or `fill` rule that renders body text or a meaning-bearing boundary, and
// whose manifest role is not `logotype` WHEN the token classification
// manifest is applied THEN that token SHALL carry manifest role `content`
// with obligation `ink`, resolving to an `-ink` token rather than an
// `-ornament` one."
//
// VERIFY (exact): a script cross-references every token usage in _sass/
// against the manifest and asserts every non-`logotype` body-text or
// meaning-bearing-boundary usage resolves to a token whose role is `content`
// and obligation is `ink`; zero such usages resolve to an `ornament` or
// `exempt` token.
//
// Operative reading (documented in _data/palette-manifest.yml's header): a
// `color`/`border-color`/`fill` declaration IS, by construction, "rendering
// body text or a meaning-bearing boundary" -- that is what those three
// properties DO (unlike `background`/`box-shadow`/`border` shorthand, which
// this codebase uses for ornament: card borders, glows, gradients). The
// "whose manifest role is not logotype" carve-out is bound BY USAGE (per
// spec.yaml's own trap note: "closes the logotype hatch by usage") --
// operationalized as scss-scan.mjs's isLogotypeContext(), not by a
// manifest-level role=logotype label (see palette-manifest.test.mjs for why
// no token in this repo is purely logotype-only). A short, individually
// justified exemption list in the manifest (usage_exemptions) covers the
// remaining narrow, non-vacuous carve-outs -- documented with the same
// discipline as the logotype selector set, never a blanket escape hatch.

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { scanTokenUsages, assertScanCoverage } from './lib/scss-scan.mjs';

const root = new URL('../', import.meta.url).pathname;
const manifest = yaml.load(readFileSync(root + '_data/palette-manifest.yml', 'utf8'));

const roleByToken = new Map(manifest.tokens.map((r) => [r.name, r]));

// Matched by (file, token-appears-in-the-listed-`token`-field,
// selector-stack contains a substring of the documented `selector`) rather
// than by exact line number: this codebase's shared partials get frequent
// small edits (new comments, new rules) that shift line numbers without
// changing which SELECTOR a usage belongs to -- a line-keyed exemption list
// would need re-syncing on every unrelated edit nearby. Selector-substring
// matching is exactly as narrow (each entry still names one specific
// selector) but survives line drift. `line`/`lines` in the manifest stay as
// human-readable documentation of where the exemption was discovered.
function usageMatchesExemption(u, e) {
  const relFile = u.file.replace(root, '');
  if (e.file !== relFile) return false;
  if (!e.token.includes(u.token)) return false;
  // Pull every `.class-name` (dot-prefixed identifier) out of the
  // documented selector string, however it's punctuated
  // (".a, .b .c/.d" -> [".a", ".b", ".c", ".d"]), and check whether any of
  // them is a substring of any selector on this usage's stack.
  const classHints = [...e.selector.matchAll(/\.[a-zA-Z0-9_-]+/g)].map((m) => m[0]);
  return u.selectorStack.some((sel) => classHints.some((hint) => sel.includes(hint)));
}

const exemptions = manifest.usage_exemptions || [];

// AC-202: strengthened anti-vacuity guard. The pre-existing check below
// (`usages.length === 0`) only fires on a TOTAL wipeout; it would stay green
// even if the scanner silently skipped an entire subdirectory (e.g. a
// regression of listScssFiles() back to a flat, non-recursive readdirSync)
// as long as at least one usage still turned up elsewhere. This guard
// compares the scanner's scanned-file count against an INDEPENDENT
// recursive on-disk `.scss` count (scss-scan.mjs's assertScanCoverage(),
// shared with palette-manifest.test.mjs/clamp.test.mjs/
// text-spacing-height.test.mjs so the same protection covers every direct
// consumer of listScssFiles(), not just this suite) and fails loudly on any
// divergence, partial or total.
const coverage = assertScanCoverage();
if (!coverage.ok) {
  console.error(`FAIL: ${coverage.message}`);
  process.exit(1);
}
console.log(`ok: ${coverage.message}`);

const usages = scanTokenUsages();
if (usages.length === 0) {
  console.error('FAIL: zero token usages found by the scanner -- the scanner is almost certainly broken (anti-vacuity check).');
  process.exit(1);
}

let failures = 0;
let boundCount = 0;
let exemptionsUsed = 0;
const contentSetTokens = new Set();

for (const u of usages) {
  const key = `${u.file.replace(root, '')}:${u.line}`;
  if (u.logotype) continue; // usage-bound logotype exemption
  const matchedExemption = exemptions.find((e) => usageMatchesExemption(u, e));
  if (matchedExemption) { exemptionsUsed++; continue; } // documented, individually-justified exemption

  const row = roleByToken.get(u.token);
  if (!row) {
    // Token not in manifest at all (e.g. --symbol-color, --ring-color,
    // --post-text -- see _data/palette-manifest.yml's not_manifest_scope).
    // Not a manifest violation (AC-048 scopes the manifest to
    // _sass/_variables.scss-declared tokens); flagged separately as info.
    console.log(`info: ${key} uses ${u.token} (${u.property}), which is outside manifest scope (not declared in _sass/_variables.scss) -- see not_manifest_scope in the manifest.`);
    continue;
  }

  boundCount++;
  if (row.role === 'content' && row.obligation === 'ink') {
    contentSetTokens.add(u.token);
    continue;
  }
  console.error(`FAIL: ${key} -- ${u.raw}`);
  console.error(`      token ${u.token} resolves to role=${row.role} obligation=${row.obligation} (must be content/ink)`);
  failures++;
}

// Anti-vacuity: AC-026's own VERIFY text requires this too, but it binds
// AC-047 just as hard -- a manifest that never actually gates anything
// (because everything is logotype/exempted) would pass this loop vacuously.
if (contentSetTokens.size === 0) {
  console.error('FAIL: the content set is EMPTY -- zero usages resolved to a content/ink token. Vacuous pass.');
  failures++;
} else {
  console.log(`ok: ${contentSetTokens.size} distinct content/ink token(s) actually carry rendered usage: ${[...contentSetTokens].sort().join(', ')}`);
}

console.log(`\n${boundCount} manifest-scoped usage(s) checked (of ${usages.length} total scanned), ${exemptions.length} documented exemption(s) available (${exemptionsUsed} matched a real usage), ${failures} failure(s).`);
console.log(failures === 0 ? 'PASS (AC-047).' : 'FAIL (AC-047).');
process.exit(failures === 0 ? 0 : 1);
