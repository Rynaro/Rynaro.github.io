import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const posts = fs.readdirSync(path.join(root, '_posts')).filter((name) => /\.(?:md|markdown)$/.test(name));
const assayData = yaml.load(fs.readFileSync(path.join(root, '_data/assay.yml'), 'utf8'));
assert.deepEqual(assayData.order, ['speculative', 'tested', 'proven']);

function readPost(name) {
  const source = fs.readFileSync(path.join(root, '_posts', name), 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  assert.ok(match, `${name} has valid front matter`);
  return { data: yaml.load(match[1]), body: match[2], source };
}

for (const name of posts) {
  const post = readPost(name);
  if (!post.data.assay) continue;
  assert.ok(assayData.order.includes(post.data.assay), `${name} uses the assay vocabulary`);
  assert.ok(post.data.reviewed_at, `${name} records reviewed_at`);
  if (['tested', 'proven'].includes(post.data.assay)) {
    assert.match(post.body, /^## Evidence(?: ledger)?\s*$/mi, `${name} has an evidence heading`);
    assert.match(post.body, /https:\/\//, `${name} links reviewable evidence`);
  }
  if (post.data.assay === 'proven') assert.match(post.body, /known limits/i, `${name} states known limits`);
}

const routing = readPost('2026-02-18-llm-model-routing-claude.md');
assert.equal(routing.data.assay, 'speculative');
assert.equal(routing.data.reviewed_at.toISOString().slice(0, 10), '2026-08-28');
assert.match(routing.body, /^## Sources and evidence boundary$/m);
for (const prohibited of ['70–80%', '150 lines', '7 minutes', '14×', '85% cost reduction', '$6/developer/day', 'evidence-based optimum', 'sub-agents default to Sonnet']) assert.ok(!routing.source.includes(prohibited), `routing post omits unsupported phrase: ${prohibited}`);

const sftp = readPost('2019-12-12-setup-simple-sftp-server-in-minutes.markdown');
assert.equal(sftp.data.assay, undefined);
assert.match(sftp.body, /Historical safety note — reviewed 28 August 2026/);
assert.match(sftp.body, /install -d -o root -g root -m 0755 \/var\/sftp\/partner/);
assert.match(sftp.body, /install -d -o partner -g partner -m 0755 \/var\/sftp\/partner\/files/);
assert.match(sftp.body, /ForceCommand internal-sftp -d \/files/);
assert.match(sftp.body, /PermitTTY no/);
assert.match(sftp.body, /\/usr\/sbin\/sshd -t/);
assert.match(sftp.body, /systemctl reload ssh/);
assert.ok(!sftp.body.includes('chown partner:partner /var/sftp/partner'));
assert.ok(!sftp.body.includes('systemctl restart ssh'));

const vivi = readPost('2026-08-27-rebranding-the-atelier-as-a-party-quest.md');
assert.equal(vivi.data.assay, 'tested');
assert.equal(vivi.data.reviewed_at.toISOString().slice(0, 10), '2026-08-28');
assert.match(vivi.body, /^## Evidence ledger$/m);
assert.match(vivi.body, /does not preserve a public artifact for every local run/);
assert.match(vivi.body, /local run artifacts[\s\S]*are not all preserved/);

console.log(`✓ evidence contracts hold across ${posts.length} Notebook posts`);
