import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const source = readFileSync(new URL('./visual-baseline.mjs', import.meta.url), 'utf8');

test('visual CLI exposes isolated reference, candidate, and report paths', () => {
  for (const contract of ['--baseline-dir', '--output-dir', '--report']) {
    assert.match(source, new RegExp(contract));
  }
  assert.match(source, /capturePlan\.length !== 100/);
  assert.match(source, /inventory mismatch/);
  assert.match(source, /source\.json/);
});

test('visual CLI rejects a shared reference and candidate directory', () => {
  const result = spawnSync(process.execPath, [
    new URL('./visual-baseline.mjs', import.meta.url).pathname,
    '--baseline-dir', '.visual/same',
    '--output-dir', '.visual/same',
  ], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must resolve to different directories/);
});
