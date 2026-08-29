import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, normalize, sep } from 'node:path';
import { createHash } from 'node:crypto';

const MANIFEST = 'manifest.json';

function isDimensions(value) {
  return Array.isArray(value)
    && value.length === 2
    && value.every((dimension) => Number.isInteger(dimension) && dimension > 0);
}

function readJson(path, label) {
  let value;
  try {
    value = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${label} is missing or invalid JSON at ${path}: ${error.message}`);
  }
  return value;
}

export function loadVisualApprovals({ approvalDir, baselineDir, plannedPaths }) {
  if (!approvalDir) return null;

  const manifestPath = join(approvalDir, MANIFEST);
  const sourcePath = join(baselineDir, 'source.json');
  const manifest = readJson(manifestPath, 'visual approval manifest');
  const source = readJson(sourcePath, 'master visual reference metadata');

  if (!manifest || typeof manifest.baseSha !== 'string' || !Array.isArray(manifest.approvals)) {
    throw new Error(`visual approval manifest must contain a string baseSha and an approvals array: ${manifestPath}`);
  }
  if (!source || typeof source.sha !== 'string' || !source.sha) {
    throw new Error(`master visual reference metadata must contain a non-empty sha: ${sourcePath}`);
  }
  if (manifest.baseSha !== source.sha) {
    throw new Error(`visual approvals are stale: manifest baseSha ${manifest.baseSha} does not match master reference ${source.sha}`);
  }

  const planned = new Set(plannedPaths);
  const approved = new Map();
  for (const entry of manifest.approvals) {
    const relPath = entry?.path;
    if (typeof relPath !== 'string' || !relPath.endsWith('.png') || isAbsolute(relPath)) {
      throw new Error(`invalid visual approval path: ${String(relPath)}`);
    }
    if (typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw new Error(`visual approval must include a lowercase SHA-256 digest: ${relPath}`);
    }
    if (!isDimensions(entry.fromDimensions) || !isDimensions(entry.toDimensions)) {
      throw new Error(`visual approval must declare positive integer fromDimensions and toDimensions: ${relPath}`);
    }
    const safePath = normalize(relPath);
    if (safePath !== relPath || safePath === '..' || safePath.startsWith(`..${sep}`)) {
      throw new Error(`visual approval path must be a normalized repository-relative PNG path: ${relPath}`);
    }
    if (!planned.has(relPath)) {
      throw new Error(`visual approval is not in the current capture plan: ${relPath}`);
    }
    if (approved.has(relPath)) {
      throw new Error(`duplicate visual approval: ${relPath}`);
    }
    const path = join(approvalDir, relPath);
    if (!existsSync(path)) {
      throw new Error(`approved visual is missing: ${path}`);
    }
    const actualSha = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (actualSha !== entry.sha256) {
      throw new Error(`approved visual digest mismatch for ${relPath}: expected ${entry.sha256}, found ${actualSha}`);
    }
    approved.set(relPath, {
      path,
      fromDimensions: entry.fromDimensions,
      toDimensions: entry.toDimensions,
    });
  }

  return { baseSha: manifest.baseSha, manifestPath, approved };
}

export function selectVisualReference(relPath, masterPath, approvals) {
  const approval = approvals?.approved.get(relPath);
  return approval
    ? { ...approval, referenceKind: 'approved' }
    : { path: masterPath, referenceKind: 'master' };
}

function dimensionsOf(image) {
  return [image.width, image.height];
}

function sameDimensions(actual, expected) {
  return actual[0] === expected[0] && actual[1] === expected[1];
}

export function validateVisualApprovalDimensions(reference, { master, approved, candidate }) {
  if (reference.referenceKind !== 'approved') return;

  const checks = [
    ['master', dimensionsOf(master), reference.fromDimensions],
    ['approved', dimensionsOf(approved), reference.toDimensions],
    ['candidate', dimensionsOf(candidate), reference.toDimensions],
  ];
  for (const [label, actual, expected] of checks) {
    if (!sameDimensions(actual, expected)) {
      throw new Error(`${label} dimensions ${actual.join('x')} do not match declared ${expected.join('x')}`);
    }
  }
}
