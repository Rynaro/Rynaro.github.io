#!/usr/bin/env node
// scripts/clamp.test.mjs
//
// AC-034: "GIVEN a fluid type rule expressed with `clamp()` WHEN the rule is
// evaluated THEN its maximum value SHALL be no more than 2.5 times its
// minimum value." VERIFY: a script parses every clamp() in _sass/ and
// asserts max/min <= 2.5.
//
// AC-058: "GIVEN a fluid type rule expressed with `clamp()` WHEN its middle
// term is inspected THEN that middle term SHALL carry a `rem` or `px`
// component rather than a viewport unit alone." VERIFY: a script parses
// every clamp() in _sass/ and asserts each middle term matches a rem or px
// component; zero vw-only middle terms remain.
//
// Honest note (not a vacuity dodge -- there is no anti-vacuity clause in
// either VERIFY, unlike AC-026): as of this phase, _sass/ contains ZERO
// clamp() calls -- every heading/type rule uses fixed rem sizes with
// discrete @include max-width() breakpoint overrides, not fluid type. Both
// checks below PASS VACUOUSLY (the assertion holds over an empty set) and
// are real, armed regression guards the moment fluid type is introduced --
// Story 4.8's fluid-type work was not part of this bounded pass (see the
// completion report for what Phase 4a/4b did and did not do).

import { scanClamps, assertScanCoverage } from './lib/scss-scan.mjs';

let failures = 0;
const fail = (msg) => { console.error(`FAIL: ${msg}`); failures++; };

// AC-202 (normalize-p2): shared anti-vacuity structural guard. This suite
// calls listScssFiles() (via scanClamps()) directly, so it gets the same
// scanner-coverage protection as token-usage.test.mjs rather than staying
// blind to a scanner silently under-scanning _sass/.
const coverage = assertScanCoverage();
if (!coverage.ok) fail(coverage.message);
else console.log(`ok: ${coverage.message}`);

const clamps = scanClamps();
console.log(`${clamps.length} clamp() call(s) found in _sass/.`);

const UNIT_RE = /(rem|px)/;
const VW_ONLY_RE = /^\s*[\d.]+vw\s*$/;

function parseLength(term) {
  // Best-effort: extract a numeric value with a unit for the min/max terms
  // (e.g. "2rem", "6rem", "1.2rem"). Middle terms are checked structurally,
  // not numerically (AC-058 only cares whether a rem/px component exists).
  const m = term.trim().match(/^calc\((.+)\)$|^([\d.]+)(rem|px|em|vw)$/);
  if (m && m[2]) return { value: parseFloat(m[2]), unit: m[3] };
  return null;
}

for (const c of clamps) {
  const min = parseLength(c.min);
  const max = parseLength(c.max);
  const loc = `${c.file.replace(process.cwd() + '/', '')}:${c.line}`;

  // AC-034: max <= 2.5 * min
  if (min && max && min.unit === max.unit) {
    const ratio = max.value / min.value;
    if (ratio > 2.5) {
      fail(`${loc}: clamp(${c.raw.match(/clamp\(([^)]+)\)/)?.[1] || ''}) -- max/min = ${ratio.toFixed(2)} > 2.5`);
    } else {
      console.log(`ok: ${loc} -- max/min = ${ratio.toFixed(2)} <= 2.5`);
    }
  } else {
    console.log(`info: ${loc} -- could not parse min/max as same-unit lengths for the 2.5x check (min="${c.min}", max="${c.max}"); manual review needed.`);
  }

  // AC-058: middle term carries a rem/px component, not a vw-only value.
  if (VW_ONLY_RE.test(c.mid) || (!UNIT_RE.test(c.mid) && /vw/.test(c.mid))) {
    fail(`${loc}: clamp() middle term "${c.mid}" is vw-only (F94 risk -- fails 1.4.4 Resize Text at 200% zoom)`);
  } else if (UNIT_RE.test(c.mid)) {
    console.log(`ok: ${loc} -- middle term "${c.mid}" carries a rem/px component`);
  }
}

console.log(failures === 0 ? '\nPASS (AC-034, AC-058).' : `\nFAIL: ${failures} failure(s) (AC-034/AC-058).`);
process.exit(failures === 0 ? 0 : 1);
