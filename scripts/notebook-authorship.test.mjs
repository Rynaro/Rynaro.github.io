import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

let failed = false;
const check = (condition, message) => {
  if (condition) console.log(`✓ ${message}`);
  else { console.error(`✗ ${message}`); failed = true; }
};

const authors = yaml.load(fs.readFileSync('_data/notebook_authors.yml', 'utf8'));
const authorIds = Object.keys(authors);
const authorNames = Object.fromEntries(Object.entries(authors).map(([id, author]) => [id, author.name]));
const expectedIds = ['henrique', 'atlas', 'ramza', 'spectra', 'vivi', 'apivr_delta', 'idg', 'forge', 'vigil', 'kupo', 'gilgamesh'];
check(JSON.stringify(authorIds) === JSON.stringify(expectedIds), 'author registry contains Henrique and the complete current Eidolons roster');

const postFiles = fs.readdirSync('_posts').filter((name) => /\.(md|markdown)$/.test(name));
for (const file of postFiles) {
  const source = fs.readFileSync(path.join('_posts', file), 'utf8');
  const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const metadata = yaml.load(frontMatter) || {};
  const author = metadata.author;
  const authorId = metadata.author_id;
  check(Boolean(authorId), `${file} declares author_id`);
  check(authorIds.includes(authorId), `${file} references a registered author`);
  check(author === authorNames[authorId], `${file} keeps author and author_id synchronized`);
}

const includeSource = fs.readFileSync('_includes/notebook/authorship.html', 'utf8');
check(includeSource.includes('Human-authored') && includeSource.includes('AI Eidolon'), 'authorship mark distinguishes human and Eidolon writing');
check(includeSource.includes('Authorship unrecorded'), 'unknown author IDs have a neutral visible fallback');

const notebook = fs.readFileSync('_site/notebook/index.html', 'utf8');
const post = fs.readFileSync('_site/2026/02/18/llm-model-routing-claude.html', 'utf8');
const renderedAuthorshipCount = (notebook.match(/Human-authored|AI Eidolon/g) || []).length;
check(renderedAuthorshipCount === postFiles.length, 'feature and ledger expose authorship on every notebook entry');
check(post.includes('Human-authored') && post.includes('Henrique A. Lavezzo'), 'post byline exposes resolved authorship');
check(post.includes('<meta name="author" content="Henrique A. Lavezzo">'), 'post metadata resolves the page author');
check(/data-search-text="[^"]*henrique a\. lavezzo/.test(notebook), 'notebook search text includes the resolved author name');

if (failed) process.exit(1);
