// scripts/lib/scss-scan.mjs
//
// Shared SCSS scanner for the palette-manifest scripts (AC-026/027/047/048/058).
// Dependency-free: tracks brace depth to build a selector-path stack, so callers
// can ask "is this declaration inside the wordmark (logotype) selector set?"
// without pulling in a full SCSS parser.
//
// Not a general-purpose CSS parser -- deliberately narrow to what the acceptance
// criteria need: (a) find `color:` / `border-color:` / `fill:` declarations that
// reference a `var(--token)`, and (b) find every `clamp(...)` call, each together
// with the selector stack it's nested under.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const SASS_DIR = new URL('../../_sass/', import.meta.url).pathname;

// The wordmark / logotype selector set (AC-048's VERIFY names these two exactly).
// A token used ONLY inside declarations whose selector stack includes one of
// these is eligible for `role: logotype`.
export const LOGOTYPE_SELECTORS = ['.hero__subtitle'];

// AC-201 (normalize-p2, Story 2.1): recurses into subdirectories instead of
// the old flat `readdirSync(dir).filter(...)`. `_sass/` is flat today (this
// story moves no partial -- AC-204), so the RESULT is unchanged now; the
// recursion only diverges from the old flat behavior once the later ITCSS
// split (normalize-p2's later stories) moves a partial into a subdirectory
// (e.g. `_sass/components/`), which would otherwise go invisible to every
// scanTokenUsages()/scanClamps() consumer. Return shape is unchanged (a flat
// array of absolute file paths); results are sorted for a deterministic
// order regardless of the underlying filesystem's directory-entry ordering
// (readdirSync's order is not itself a portable guarantee).
function walkScssFiles(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkScssFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.scss')) {
      out.push(full);
    }
  }
}

export function listScssFiles(dir = SASS_DIR) {
  const out = [];
  walkScssFiles(dir, out);
  return out.sort();
}

// AC-202's anti-vacuity structural guard needs an on-disk `.scss` count that
// is INDEPENDENT of listScssFiles()'s own recursion -- comparing
// listScssFiles() to itself would be circular (a regression in
// walkScssFiles above would trivially "agree" with itself). This walk is
// deliberately a separate implementation of the same recursive-count idea,
// so a future regression to a flat, non-recursive listScssFiles() (or one
// that silently skips a subdirectory) is caught by divergence against THIS
// count, not validated by it.
export function countScssFilesOnDisk(dir = SASS_DIR) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countScssFilesOnDisk(full);
    } else if (entry.isFile() && entry.name.endsWith('.scss')) {
      count += 1;
    }
  }
  return count;
}

// AC-202: shared anti-vacuity structural guard. `listScssFiles()` is called
// directly by MULTIPLE suites -- token-usage.test.mjs, palette-manifest
// .test.mjs, clamp.test.mjs, text-spacing-height.test.mjs (P1-era critic's
// N6). A coverage guard living only inside token-usage.test.mjs would leave
// the other three blind to a scanner silently under-scanning _sass/ (e.g. a
// regression back to the old flat readdirSync, or a future bug that skips
// one subdirectory) -- their `usages`/`clamps`/`records` arrays would just
// quietly shrink instead of failing loudly. Exporting the check HERE, next
// to listScssFiles() itself, means every current and future direct consumer
// gets the SAME protection from the SAME source of truth, rather than each
// suite re-implementing (and risking drifting) its own copy.
//
// Returns { ok, scanned, onDisk, message } rather than throwing or calling
// process.exit -- each test file keeps its own reporting/exit-code idiom
// (some use a `fail()` helper, some print directly and set a `failures`
// counter); AC-202's own VERIFY only requires the token-usage suite to FAIL
// on divergence, which every caller below satisfies by exiting non-zero
// when `ok` is false.
export function assertScanCoverage(dir = SASS_DIR) {
  const scanned = listScssFiles(dir).length;
  const onDisk = countScssFilesOnDisk(dir);
  const ok = scanned === onDisk;
  const message = ok
    ? `scanner coverage matches on-disk count (${scanned} of ${onDisk} .scss file(s) under _sass/, via an independent recursive walk)`
    : `scanner coverage diverges from on-disk count -- listScssFiles() returned ${scanned} file(s) but an independent recursive walk of _sass/ found ${onDisk} .scss file(s). The scanner is silently skipping ${Math.abs(onDisk - scanned)} file(s) (AC-202 anti-vacuity structural guard).`;
  return { ok, scanned, onDisk, message };
}

// Strips `//` line comments and `/* */` block comments so they can't produce
// false-positive token/clamp matches. Preserves line numbers (replaces comment
// bodies with spaces rather than deleting lines).
function stripComments(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    if (src[i] === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (src[i] === '/' && src[i + 1] === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += '  ';
      i += 2;
      continue;
    }
    out += src[i];
    i++;
  }
  return out;
}

/**
 * Walks a SCSS file tracking brace depth and the selector opening each brace,
 * yielding one record per line: { line, text, selectorStack }.
 */
export function scanFile(path) {
  const raw = readFileSync(path, 'utf8');
  const src = stripComments(raw);
  const lines = src.split('\n');
  const stack = [];
  const records = [];
  let pendingSelector = '';

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNo = idx + 1;
    const line = lines[idx];
    records.push({ line: lineNo, text: line, selectorStack: [...stack] });

    // Accumulate text until we hit a brace/semicolon so multi-line selectors
    // (rare in this codebase, but cheap to handle) still resolve.
    for (const ch of line) {
      if (ch === '{') {
        const sel = pendingSelector.trim();
        stack.push(sel);
        pendingSelector = '';
      } else if (ch === '}') {
        stack.pop();
        pendingSelector = '';
      } else {
        pendingSelector += ch;
      }
    }
    if (line.includes(';')) pendingSelector = '';
  }
  return records;
}

const TOKEN_RE = /var\(\s*(--[a-zA-Z0-9-]+)/g;
// Sass variables, bare or wrapped in darken()/lighten()/rgba() -- captures the
// variable name plus an optional darken/lighten call so usages can be
// resolved to an actual color for contrast math.
const SASS_VAR_RE = /(darken|lighten)\(\s*(\$[a-zA-Z0-9-]+)\s*,\s*([\d.]+)%\s*\)|(\$[a-zA-Z0-9-]+)(?!-ink|-ornament)/g;

// Matches a declaration's property name at the start of a (trimmed) statement.
// Deliberately narrow to AC-047's three named properties -- NOT `border`
// shorthand, NOT `background`/`background-color`, NOT `box-shadow`, NOT
// `outline`. See docs/palette-manifest.md for the rationale: those properties
// are how this codebase's *ornament* (card borders, glows, backgrounds) is
// drawn, and folding them into `content` would force ink tokens onto pastel
// decoration that carries no information -- the flattening this phase must
// not do.
const PROPERTY_RE = /(^|[^a-zA-Z-])(color|border-color|fill)\s*:\s*([^;{}]+)/g;

export function isLogotypeContext(selectorStack) {
  return selectorStack.some((sel) =>
    LOGOTYPE_SELECTORS.some((wm) => sel.includes(wm))
  );
}

// AC-205 (normalize-p2, Story 2.1): every distinct selector that opens a
// rule block anywhere under `_sass/` (recursively, via listScssFiles() --
// so this stays structure-agnostic exactly like AC-201), regardless of
// whether the block is single-line or spans multiple lines. scanFile()'s
// own per-line `selectorStack` (used by isLogotypeContext()) is captured
// BEFORE each line's characters are scanned, so a selector opened and
// closed on ONE line (e.g. `.foo { color: red; }`) never shows up in any
// record's selectorStack -- fine for token-usage scanning (nothing is
// declared inside such a block worth attributing to it), but NOT fine for
// "does this selector exist at all", which is exactly what a stale
// LOGOTYPE_SELECTORS entry check needs. This walks brace/semicolon
// boundaries directly over the whole (comment-stripped) file text instead,
// so every opened selector is captured, including single-line ones.
export function listAllSelectors(files = listScssFiles()) {
  const selectors = new Set();
  for (const file of files) {
    const src = stripComments(readFileSync(file, 'utf8'));
    let pending = '';
    for (const ch of src) {
      if (ch === '{') {
        const sel = pending.trim();
        if (sel) selectors.add(sel);
        pending = '';
      } else if (ch === '}' || ch === ';') {
        pending = '';
      } else {
        pending += ch;
      }
    }
  }
  return selectors;
}

/**
 * Returns [{ token, property, file, line, selectorStack, logotype, raw }]
 * for every var(--token) reference used inside a color/border-color/fill
 * declaration, across every _sass/*.scss file.
 */
export function scanTokenUsages(files = listScssFiles()) {
  const usages = [];
  for (const file of files) {
    const records = scanFile(file);
    for (const rec of records) {
      PROPERTY_RE.lastIndex = 0;
      let m;
      while ((m = PROPERTY_RE.exec(rec.text))) {
        const property = m[2];
        const value = m[3];

        TOKEN_RE.lastIndex = 0;
        let tm;
        while ((tm = TOKEN_RE.exec(value))) {
          usages.push({
            token: tm[1],
            kind: 'css-var',
            transform: null,
            property,
            file,
            line: rec.line,
            selectorStack: rec.selectorStack,
            logotype: isLogotypeContext(rec.selectorStack),
            raw: rec.text.trim(),
          });
        }

        SASS_VAR_RE.lastIndex = 0;
        let sm;
        while ((sm = SASS_VAR_RE.exec(value))) {
          const isCall = !!sm[1];
          const token = isCall ? sm[2] : sm[4];
          if (!token) continue;
          usages.push({
            token,
            kind: 'sass-var',
            transform: isCall ? { fn: sm[1], amount: parseFloat(sm[3]) } : null,
            property,
            file,
            line: rec.line,
            selectorStack: rec.selectorStack,
            logotype: isLogotypeContext(rec.selectorStack),
            raw: rec.text.trim(),
          });
        }
      }
    }
  }
  return usages;
}

const CLAMP_RE = /clamp\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g;

/**
 * Returns [{ file, line, min, mid, max, raw }] for every clamp(...) call in
 * _sass/*.scss (AC-034 / AC-058).
 */
export function scanClamps(files = listScssFiles()) {
  const out = [];
  for (const file of files) {
    const records = scanFile(file);
    for (const rec of records) {
      CLAMP_RE.lastIndex = 0;
      let m;
      while ((m = CLAMP_RE.exec(rec.text))) {
        out.push({
          file,
          line: rec.line,
          min: m[1].trim(),
          mid: m[2].trim(),
          max: m[3].trim(),
          raw: rec.text.trim(),
        });
      }
    }
  }
  return out;
}
