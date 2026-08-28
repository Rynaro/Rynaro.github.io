#!/usr/bin/env node
import readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { DEFAULTS, EXIT, NotebookAuthoringError, createEntry, loadNotebookConfig, prepareEntry, repositoryRoot } from './lib/notebook-authoring.mjs';

export const HELP = `Create a Notebook entry

Usage:
  npm run notebook:new -- [options]

Options:
  --title <text>       Entry title (required)
  --resume <text>      Short summary (required)
  --category <key>     Notebook category
  --type <key>         Post type
  --author <key>       Human or Eidolon author
  --assay <key|none>   Epistemic status (default: none)
  --tags <tags>        Repeatable; accepts comma-separated lowercase slugs
  --draft              Create under _drafts
  --publish            Create a dated file under _posts
  --date <date>        YYYY-MM-DD or ISO timestamp with explicit offset
  --slug <slug>        Explicit lowercase ASCII slug
  --dry-run            Print exact Markdown without writing
  --help               Show this help
`;

function parseArgs(argv) {
  const options = { tags: [] };
  const values = new Set(['title', 'resume', 'category', 'type', 'author', 'assay', 'tags', 'date', 'slug']);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new NotebookAuthoringError(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (['draft', 'publish', 'dry-run', 'help'].includes(key)) {
      options[key === 'dry-run' ? 'dryRun' : key] = true;
      continue;
    }
    if (!values.has(key)) throw new NotebookAuthoringError(`Unknown option: --${key}`);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new NotebookAuthoringError(`Option --${key} requires a value.`);
    index += 1;
    if (key === 'tags') options.tags.push(value);
    else options[key] = value;
  }
  return options;
}

const describe = (items) => items.join(', ');

async function collectInteractive(options, config, prompt) {
  const ask = async (label, fallback = '') => {
    const suffix = fallback ? ` [${fallback}]` : '';
    const answer = await prompt(`${label}${suffix}: `);
    return answer.trim() || fallback;
  };
  const result = { ...options };
  result.title = await ask('Title', result.title);
  result.resume = await ask('Summary', result.resume);
  result.author = await ask(`Author (${describe(Object.keys(config.authors))})`, result.author ?? DEFAULTS.author);
  result.type = await ask(`Type (${describe(config.types)})`, result.type ?? DEFAULTS.type);
  result.assay = await ask(`Assay (${describe([...config.assays, 'none'])})`, result.assay ?? DEFAULTS.assay);
  result.category = await ask(`Category (${describe(config.categories)})`, result.category ?? DEFAULTS.category);
  const tags = await ask('Tags (comma-separated)', result.tags?.join(',') ?? '');
  result.tags = tags ? [tags] : [];
  result.status = await ask('Status (draft, publish)', result.publish ? 'publish' : result.draft ? 'draft' : DEFAULTS.status);
  const confirmed = (await ask('Create this entry? (y/N)', 'N')).toLowerCase();
  if (!['y', 'yes'].includes(confirmed)) throw new NotebookAuthoringError('Cancelled.', EXIT.CANCELLED);
  return result;
}

export async function run(argv, environment = {}) {
  const stdout = environment.stdout ?? process.stdout;
  const stderr = environment.stderr ?? process.stderr;
  const isTTY = environment.isTTY ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const root = environment.root ?? repositoryRoot();
  try {
    const options = parseArgs(argv);
    if (options.help) {
      stdout.write(HELP);
      return EXIT.OK;
    }
    if (options.draft && options.publish) throw new NotebookAuthoringError('Choose exactly one of --draft or --publish.');
    const config = loadNotebookConfig(root);
    let raw;
    if (isTTY) {
      let rl;
      const prompt = environment.prompt ?? (async (question) => {
        rl ??= readline.createInterface({ input: process.stdin, output: process.stderr });
        return rl.question(question);
      });
      try { raw = await collectInteractive(options, config, prompt); } finally { rl?.close(); }
    } else {
      if (!options.title || !options.resume || Boolean(options.draft) === Boolean(options.publish)) {
        throw new NotebookAuthoringError('Non-interactive use requires --title, --resume, and exactly one of --draft or --publish.');
      }
      raw = {
        ...DEFAULTS,
        ...options,
        status: options.publish ? 'publish' : 'draft',
      };
    }
    const entry = prepareEntry(raw, config, { now: environment.now });
    const result = createEntry(root, entry, { dryRun: options.dryRun });
    if (options.dryRun) {
      stderr.write(`${result.relativePath}\n`);
      stdout.write(result.markdown);
    } else {
      stdout.write(`${result.relativePath}\n`);
      stderr.write(`Created ${result.relativePath}. Open it and begin writing below the marker.\n`);
    }
    return EXIT.OK;
  } catch (error) {
    const known = error instanceof NotebookAuthoringError;
    stderr.write(`${known ? error.message : `Unexpected error: ${error.message}`}\n`);
    return known ? error.exitCode : EXIT.IO;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await run(process.argv.slice(2));
}
