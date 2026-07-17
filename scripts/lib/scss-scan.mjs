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
export const LOGOTYPE_SELECTORS = ['.hero-subtitle'];

export function listScssFiles(dir = SASS_DIR) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.scss'))
    .map((f) => join(dir, f));
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
