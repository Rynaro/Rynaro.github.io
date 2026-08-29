import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';
import { loadVisualApprovals, selectVisualReference, validateVisualApprovalDimensions } from './visual-approval.mjs';
import { createHash } from 'node:crypto';

const source = readFileSync(new URL('./visual-baseline.mjs', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('visual CLI exposes isolated reference, candidate, and report paths', () => {
  for (const contract of ['--baseline-dir', '--output-dir', '--report', '--approval-dir']) {
    assert.match(source, new RegExp(contract));
  }
  assert.match(source, /capturePlan\.length !== 100/);
  assert.match(source, /inventory mismatch/);
  assert.match(source, /source\.json/);
  assert.match(source, /dataset\.renderProfile/, 'Wayfinder captures wait for the catalog-backed sky render');
});

function approvalFixture(baseSha = 'accepted-master') {
  const dir = mkdtempSync(join(tmpdir(), 'visual-approval-'));
  const baselineDir = join(dir, 'reference');
  const approvalDir = join(dir, 'approvals');
  mkdirSync(join(approvalDir, 'wayfinder'), { recursive: true });
  mkdirSync(baselineDir, { recursive: true });
  const reviewed = 'reviewed';
  const digest = createHash('sha256').update(reviewed).digest('hex');
  writeFileSync(join(baselineDir, 'source.json'), JSON.stringify({ sha: 'accepted-master' }));
  writeFileSync(join(approvalDir, 'manifest.json'), JSON.stringify({ baseSha, approvals: [{
    path: 'wayfinder/mobile-light.png',
    sha256: digest,
    fromDimensions: [320, 10866],
    toDimensions: [320, 11035],
  }] }));
  writeFileSync(join(approvalDir, 'wayfinder/mobile-light.png'), reviewed);
  return { approvalDir, baselineDir };
}

test('an omitted approval directory selects every visual from master', () => {
  assert.doesNotMatch(packageJson.scripts['ci:visual:compare'], /--approval-dir/, 'CI compares all 100 paths to master when no approvals are active');
  const approvals = loadVisualApprovals({ approvalDir: null, baselineDir: '/unused', plannedPaths: ['wayfinder/mobile-light.png'] });
  assert.equal(approvals, null);
  assert.deepEqual(selectVisualReference('wayfinder/mobile-light.png', '/master/mobile.png', approvals), {
    path: '/master/mobile.png', referenceKind: 'master',
  });
});

test('only exact manifest paths select an approved reference', () => {
  const fixture = approvalFixture();
  const approvals = loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png', 'wayfinder/desktop-light.png'] });
  assert.deepEqual(selectVisualReference('wayfinder/mobile-light.png', '/master/mobile.png', approvals), {
    path: join(fixture.approvalDir, 'wayfinder/mobile-light.png'),
    referenceKind: 'approved',
    fromDimensions: [320, 10866],
    toDimensions: [320, 11035],
  });
  assert.deepEqual(selectVisualReference('wayfinder/desktop-light.png', '/master/desktop.png', approvals), {
    path: '/master/desktop.png', referenceKind: 'master',
  });
});

test('stale approvals fail closed against master source metadata', () => {
  const fixture = approvalFixture('old-master');
  assert.throws(
    () => loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png'] }),
    /approvals are stale/,
  );
});

test('unplanned approval paths are rejected instead of silently ignored', () => {
  const fixture = approvalFixture();
  assert.throws(
    () => loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/desktop-light.png'] }),
    /not in the current capture plan/,
  );
});

test('a perturbed approved image fails its reviewed digest', () => {
  const fixture = approvalFixture();
  writeFileSync(join(fixture.approvalDir, 'wayfinder/mobile-light.png'), 'perturbed');
  assert.throws(
    () => loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png'] }),
    /digest mismatch/,
  );
});

test('missing declared dimensions fail closed at manifest load', () => {
  const fixture = approvalFixture();
  const manifestPath = join(fixture.approvalDir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  delete manifest.approvals[0].fromDimensions;
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(
    () => loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png'] }),
    /must declare positive integer fromDimensions and toDimensions/,
  );
});

test('an explicitly declared dimension change validates old, approved, and candidate images', () => {
  const fixture = approvalFixture();
  const approvals = loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png'] });
  const reference = selectVisualReference('wayfinder/mobile-light.png', '/master/mobile.png', approvals);
  assert.doesNotThrow(() => validateVisualApprovalDimensions(reference, {
    master: { width: 320, height: 10866 },
    approved: { width: 320, height: 11035 },
    candidate: { width: 320, height: 11035 },
  }));
});

for (const [label, images, error] of [
  ['old master', { master: { width: 320, height: 10865 }, approved: { width: 320, height: 11035 }, candidate: { width: 320, height: 11035 } }, /master dimensions/],
  ['approved image', { master: { width: 320, height: 10866 }, approved: { width: 320, height: 11034 }, candidate: { width: 320, height: 11035 } }, /approved dimensions/],
  ['candidate image', { master: { width: 320, height: 10866 }, approved: { width: 320, height: 11035 }, candidate: { width: 320, height: 11036 } }, /candidate dimensions/],
]) {
  test(`a wrong ${label} dimension fails closed`, () => {
    const fixture = approvalFixture();
    const approvals = loadVisualApprovals({ ...fixture, plannedPaths: ['wayfinder/mobile-light.png'] });
    const reference = selectVisualReference('wayfinder/mobile-light.png', '/master/mobile.png', approvals);
    assert.throws(() => validateVisualApprovalDimensions(reference, images), error);
  });
}

test('visual CLI rejects a shared reference and candidate directory', () => {
  const result = spawnSync(process.execPath, [
    new URL('./visual-baseline.mjs', import.meta.url).pathname,
    '--baseline-dir', '.visual/same',
    '--output-dir', '.visual/same',
  ], { encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must resolve to different directories/);
});
