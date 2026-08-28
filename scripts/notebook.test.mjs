import fs from 'node:fs';

let failures = 0;
function check(condition, message) {
  if (condition) console.log(`✓ ${message}`);
  else { console.error(`✗ ${message}`); failures += 1; }
}

const notebook = fs.readFileSync('_site/notebook/index.html', 'utf8');
const tech = fs.readFileSync('_site/notebook/tech/index.html', 'utf8');
const post = fs.readFileSync('_site/2026/02/18/llm-model-routing-claude.html', 'utf8');
const sftpPost = fs.readFileSync('_site/2019/12/12/setup-simple-sftp-server-in-minutes.html', 'utf8');
const notebookSource = fs.readFileSync('assets/js/notebook.js', 'utf8');
const postSource = fs.readFileSync('assets/js/post.js', 'utf8');
const postCount = fs.readdirSync('_posts').filter((name) => /\.(md|markdown)$/.test(name)).length;

check(notebook.includes('Notes from the workbench'), 'Field Journal heading is data-driven and rendered');
check((notebook.match(/data-journal-entry/g) || []).length === postCount, `all ${postCount} posts render exactly once`);
check((notebook.match(/class="journal-feature"/g) || []).length === 1, 'latest post has one editorial feature');
check(!notebook.includes('scroll-rarity') && !notebook.includes('magic-particle'), 'rarity and particle UI are absent');
check(/data-journal-tools hidden/.test(notebook), 'search controls start hidden for progressive enhancement');
check(/aria-current="page"/.test(tech), 'category pages retain server-rendered current navigation');
check(notebookSource.includes('tools.hidden = false') && !notebookSource.includes('IntersectionObserver') && !notebookSource.includes('Math.random'), 'search enhances deterministically without visibility gates');
check(post.includes('class="post-article"') && post.includes('On this page'), 'post renders calm article and optional server-side TOC');
check(post.includes('aria-describedby="assay-description-speculative"') && post.includes('id="assay-description-speculative"'), 'assay chip has a visible programmatic description');
check(post.includes('Speculative assay:') && post.includes('Reviewed <time datetime="2026-08-28"') && post.includes('/codex/#assays'), 'assay explanation renders its review date and covenant link');
check(!sftpPost.includes('post-assay-label') && !sftpPost.includes('post-assay-description'), 'unassayed historical SFTP entry renders no assay UI');
check(!post.includes('post-layout--without-toc'), 'post with a table of contents keeps the two-column reading layout');
const postWithoutToc = fs.readFileSync('_site/2023/02/16/taming-your-app-with-domains.html', 'utf8');
check(postWithoutToc.includes('post-layout post-layout--without-toc'), 'post without a table of contents uses the centered single-column layout');
check((post.match(/class="journal-entry"/g) || []).length === 3, 'post renders at most three deterministic related entries');
check(post.includes('Older entry') && post.includes('More Field Notes'), 'post preserves adjacent and related navigation');
check(post.includes('assets/js/post.js') && !post.includes('toggle-dark-mode'), 'post behavior is deferred and competing theme toggle is removed');
check(!postSource.includes('Math.random') && !postSource.includes('IntersectionObserver'), 'post enhancements remain quiet and deterministic');
check(postSource.includes("article.querySelectorAll('pre')") && postSource.includes("button.textContent = 'Copy code'"), 'post code blocks receive progressive copy controls');
check(postSource.includes("shell.querySelector('.rouge-code code')") && postSource.includes("document.execCommand('copy')"), 'code copy uses plain code content with a guarded fallback');
check(postSource.includes("pre.scrollWidth > pre.clientWidth + 1") && postSource.includes("pre.setAttribute('tabindex', '0')") && postSource.includes("pre.removeAttribute('tabindex')"), 'only horizontally overflowing code blocks enter the keyboard tab order');
check(postSource.includes("'ResizeObserver' in window") && postSource.includes("window.addEventListener('resize'"), 'code overflow focusability responds to layout changes with a guarded fallback');
const postStyles = fs.readFileSync('_sass/pages/_post.scss', 'utf8');
check(/\.article-content pre \{[\s\S]*?width: 100%/.test(postStyles) && postStyles.includes('overflow-x: auto'), 'post code blocks fill the reading column and scroll locally');
check(postStyles.includes('--post-kicker: #8f611d') && postStyles.includes('--post-kicker: #d1a765') && postStyles.includes('outline: 3px solid #e2bd75'), 'post kicker contrast and code-region keyboard focus are explicit in both themes');

if (failures) process.exit(1);
