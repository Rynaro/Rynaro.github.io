import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { EXIT, NotebookAuthoringError, createEntry, loadNotebookConfig, normalizeDate, parseTags, prepareEntry, renderEntry, slugify } from './lib/notebook-authoring.mjs';
import { run } from './notebook-new.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function treeDigest(directory) {
  if (!fs.existsSync(directory)) return 'absent';
  const hash = crypto.createHash('sha256');
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(current, entry.name);
      hash.update(path.relative(directory, target));
      if (entry.isDirectory()) walk(target);
      else hash.update(fs.readFileSync(target));
    }
  };
  walk(directory);
  return hash.digest('hex');
}

const realContentBefore = {
  posts: treeDigest(path.join(root, '_posts')),
  drafts: treeDigest(path.join(root, '_drafts')),
};

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'notebook-authoring-'));
  fs.mkdirSync(path.join(directory, '_data'));
  const files = ['notebook_authors.yml', 'post_types.yml', 'assay.yml', 'notebook_categories.yml'];
  for (const file of files) fs.copyFileSync(path.join(root, '_data', file), path.join(directory, '_data', file));
  return directory;
}

function capture() {
  let value = '';
  return { stream: { write(chunk) { value += chunk; } }, read: () => value };
}

test.after(() => {
  assert.equal(treeDigest(path.join(root, '_posts')), realContentBefore.posts, 'tests must not mutate real _posts');
  assert.equal(treeDigest(path.join(root, '_drafts')), realContentBefore.drafts, 'tests must not mutate real _drafts');
});

test('loads all closed vocabularies from canonical YAML', () => {
  const config = loadNotebookConfig(root);
  assert.ok(config.authors.henrique);
  assert.ok(config.authors.vivi);
  assert.deepEqual(config.types, yaml.load(fs.readFileSync(path.join(root, '_data/post_types.yml'), 'utf8')).order);
  assert.deepEqual(config.assays, ['speculative', 'tested', 'proven']);
  assert.deepEqual(config.categories, ['tech', 'hobby', 'llm']);
});

test('normalizes slugs and strictly validates and deduplicates tags', () => {
  assert.equal(slugify('  Olá, Cozy WORLD!  '), 'ola-cozy-world');
  assert.deepEqual(parseTags(['ruby,architecture', 'ruby', 'local-first']), ['ruby', 'architecture', 'local-first']);
  assert.throws(() => parseTags(['Not-Safe']), NotebookAuthoringError);
  assert.throws(() => parseTags(Array.from({ length: 13 }, (_, index) => `tag-${index}`)), /at most 12/);
});

test('formats dates in America/Sao_Paulo, including historical daylight saving time', () => {
  assert.deepEqual(normalizeDate('2026-08-27'), { date: '2026-08-27 09:00:00 -0300', day: '2026-08-27' });
  assert.deepEqual(normalizeDate('2018-12-01'), { date: '2018-12-01 09:00:00 -0200', day: '2018-12-01' });
  assert.deepEqual(normalizeDate('2026-08-27T15:30:12+02:00'), { date: '2026-08-27 10:30:12 -0300', day: '2026-08-27' });
  assert.throws(() => normalizeDate('2026/08/27'), /YYYY-MM-DD/);
  assert.throws(() => normalizeDate('2026-02-30'), /real calendar/);
  assert.throws(() => normalizeDate('2026-02-30T09:00:00-03:00'), /valid strict ISO/);
});

test('prepares stable front matter and derives the author display name', () => {
  const config = loadNotebookConfig(root);
  const entry = prepareEntry({
    title: 'A “small” field note', resume: 'Evidence, plainly stated.', author: 'vivi', type: 'transmutation',
    assay: 'tested', category: 'llm', tags: ['ai,field-note'], status: 'publish', date: '2026-08-27',
  }, config);
  assert.equal(entry.author, 'Vivi');
  assert.equal(entry.relativePath, '_posts/2026-08-27-a-small-field-note.md');
  assert.equal(renderEntry(entry), `---
layout: post
author: "Vivi"
author_id: "vivi"
title: "A “small” field note"
resume: "Evidence, plainly stated."
date: "2026-08-27 09:00:00 -0300"
categories: "llm"
tags: ["ai", "field-note"]
type: "transmutation"
assay: "tested"
---

<!-- Begin writing here. -->
`);
});

test('writes drafts exclusively and refuses collisions without suffixing', () => {
  const directory = fixture();
  const entry = prepareEntry({ title: 'Safe Draft', resume: 'A fixture only.', author: 'henrique', type: 'log', assay: 'none', category: 'tech', tags: [], status: 'draft', date: '2026-08-27' }, loadNotebookConfig(directory));
  const result = createEntry(directory, entry);
  assert.equal(result.relativePath, '_drafts/safe-draft.md');
  assert.ok(fs.readFileSync(path.join(directory, result.relativePath), 'utf8').includes('<!-- Begin writing here. -->'));
  assert.throws(() => createEntry(directory, entry), (error) => error.exitCode === EXIT.COLLISION);
  assert.deepEqual(fs.readdirSync(path.join(directory, '_drafts')), ['safe-draft.md']);
});

test('dry run emits exact markdown and creates no directory', async () => {
  const directory = fixture();
  const stdout = capture();
  const stderr = capture();
  const code = await run(['--title', 'Dry Ink', '--resume', 'Never touches disk.', '--draft', '--dry-run', '--date', '2026-08-27'], { root: directory, isTTY: false, stdout: stdout.stream, stderr: stderr.stream });
  assert.equal(code, EXIT.OK);
  assert.match(stdout.read(), /^---\nlayout: post/);
  assert.match(stdout.read(), /author: "Henrique A\. Lavezzo"/);
  assert.equal(stderr.read(), '_drafts/dry-ink.md\n');
  assert.equal(fs.existsSync(path.join(directory, '_drafts')), false);
});

test('non-TTY incomplete input exits 2 promptly', async () => {
  const stdout = capture();
  const stderr = capture();
  const code = await run(['--title', 'Incomplete'], { root: fixture(), isTTY: false, stdout: stdout.stream, stderr: stderr.stream });
  assert.equal(code, EXIT.VALIDATION);
  assert.equal(stdout.read(), '');
  assert.match(stderr.read(), /requires --title, --resume/);
});

test('interactive adapter uses defaults, confirms before creating directories, and can cancel', async () => {
  const directory = fixture();
  const answers = ['Cozy Log', 'A human thought.', '', '', '', '', 'writing,cozy', '', 'yes'];
  const stdout = capture();
  const stderr = capture();
  const code = await run([], { root: directory, isTTY: true, prompt: async () => answers.shift(), now: new Date('2026-08-27T14:00:00Z'), stdout: stdout.stream, stderr: stderr.stream });
  assert.equal(code, EXIT.OK);
  assert.equal(stdout.read(), '_drafts/cozy-log.md\n');
  assert.ok(fs.existsSync(path.join(directory, '_drafts/cozy-log.md')));

  const cancelled = fixture();
  const cancelAnswers = ['No Ink', 'Do not write.', '', '', '', '', '', '', 'n'];
  const cancelCode = await run([], { root: cancelled, isTTY: true, prompt: async () => cancelAnswers.shift(), stdout: capture().stream, stderr: capture().stream });
  assert.equal(cancelCode, EXIT.CANCELLED);
  assert.equal(fs.existsSync(path.join(cancelled, '_drafts')), false);
});

test('child CLI smoke test keeps stdout machine-readable and returns contract exit codes', () => {
  const script = path.join(root, 'scripts/notebook-new.mjs');
  const created = spawnSync(process.execPath, [script, '--title', 'CLI Smoke', '--resume', 'Printed only.', '--draft', '--dry-run', '--date', '2026-08-27'], { encoding: 'utf8' });
  assert.equal(created.status, EXIT.OK);
  assert.match(created.stdout, /^---\n/);
  assert.equal(created.stderr, '_drafts/cli-smoke.md\n');
  const invalid = spawnSync(process.execPath, [script, '--title', 'No status', '--resume', 'Invalid.'], { encoding: 'utf8' });
  assert.equal(invalid.status, EXIT.VALIDATION);
  assert.equal(invalid.stdout, '');
  assert.match(invalid.stderr, /exactly one/);
  assert.match(execFileSync(process.execPath, [script, '--help'], { encoding: 'utf8' }), /npm run notebook:new/);
});
