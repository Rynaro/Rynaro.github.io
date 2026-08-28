import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const socialDir = path.join(root, 'assets/images/social');
const cards = ['atelier.png', 'laboratory.png', 'notebook.png', 'human-note.png', 'eidolon-dispatch.png'];

function readMeta(relativePath) {
  const html = readFileSync(path.join(root, '_site', relativePath), 'utf8');
  const values = new Map();
  for (const match of html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)">/g)) {
    const [, key, value] = match;
    const existing = values.get(key);
    values.set(key, existing ? [...(Array.isArray(existing) ? existing : [existing]), value] : value);
  }
  return values;
}

for (const card of cards) {
  const file = path.join(socialDir, card);
  const png = readFileSync(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${card} must be a PNG`);
  assert.equal(png.readUInt32BE(16), 1200, `${card} width`);
  assert.equal(png.readUInt32BE(20), 630, `${card} height`);
  assert.equal(png[25], 2, `${card} must be opaque RGB, without an alpha channel`);
  assert.ok(statSync(file).size <= 400 * 1024, `${card} must not exceed 400 KiB`);
}

const cases = [
  ['index.html', 'atelier.png', 'Henrique A. Lavezzo — Code Alchemist', 'website'],
  ['laboratory/index.html', 'laboratory.png', 'Laboratory — artifacts from Henrique&#39;s workbench', 'website'],
  ['notebook/index.html', 'notebook.png', 'Notebook — human field notes and Eidolon dispatches', 'website'],
  ['2023/02/16/taming-your-app-with-domains.html', 'human-note.png', 'Field Note by Henrique A. Lavezzo', 'article'],
  ['2026/08/27/rebranding-the-atelier-as-a-party-quest.html', 'eidolon-dispatch.png', 'Eidolon Dispatch from Henrique&#39;s AI party', 'article'],
];

for (const [page, image, alt, type] of cases) {
  const meta = readMeta(page);
  const imageUrl = `https://hlavezzo.me/assets/images/social/${image}`;
  assert.equal(meta.get('og:type'), type, `${page} Open Graph type`);
  assert.equal(meta.get('og:image'), imageUrl, `${page} Open Graph image`);
  assert.equal(meta.get('og:image:secure_url'), imageUrl, `${page} secure image`);
  assert.equal(meta.get('og:image:type'), 'image/png');
  assert.equal(meta.get('og:image:width'), '1200');
  assert.equal(meta.get('og:image:height'), '630');
  assert.equal(meta.get('og:image:alt'), alt);
  assert.equal(meta.get('twitter:card'), 'summary_large_image');
  assert.equal(meta.get('twitter:image'), imageUrl);
  assert.equal(meta.get('twitter:image:alt'), alt);
  assert.match(meta.get('og:url'), /^https:\/\//);
  assert.ok(meta.get('og:title'));
  assert.ok(meta.get('og:description'));
  assert.equal(meta.get('og:site_name'), 'Henrique A. Lavezzo');
}

const vivi = readMeta('2026/08/27/rebranding-the-atelier-as-a-party-quest.html');
assert.equal(vivi.get('article:author'), 'Vivi');
assert.equal(vivi.get('article:section'), 'AI/LLM');
assert.match(vivi.get('article:published_time'), /^2026-08-27T/);
assert.ok(Array.isArray(vivi.get('article:tag')) && vivi.get('article:tag').includes('eidolons'));

const source = readFileSync(path.join(root, '_includes/head/social.html'), 'utf8');
assert.match(source, /page\.social_image/);
assert.match(source, /page\.social_image_alt/);
assert.doesNotMatch(readFileSync(path.join(root, '_includes/head/meta.html'), 'utf8'), /og-card\.png/);

console.log('Social preview assets and metadata pass.');
