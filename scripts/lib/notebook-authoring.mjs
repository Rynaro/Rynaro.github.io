import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const EXIT = Object.freeze({ OK: 0, IO: 1, VALIDATION: 2, COLLISION: 3, CANCELLED: 130 });
export const DEFAULTS = Object.freeze({ author: 'henrique', type: 'log', assay: 'none', category: 'tech', status: 'draft' });

export class NotebookAuthoringError extends Error {
  constructor(message, exitCode = EXIT.VALIDATION) {
    super(message);
    this.name = 'NotebookAuthoringError';
    this.exitCode = exitCode;
  }
}

export function repositoryRoot(importMetaUrl = import.meta.url) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..', '..');
}

function readYaml(root, filename) {
  try {
    return yaml.load(fs.readFileSync(path.join(root, '_data', filename), 'utf8'));
  } catch (error) {
    throw new NotebookAuthoringError(`Could not read _data/${filename}: ${error.message}`, EXIT.IO);
  }
}

export function loadNotebookConfig(root) {
  const authors = readYaml(root, 'notebook_authors.yml');
  const postTypes = readYaml(root, 'post_types.yml');
  const assays = readYaml(root, 'assay.yml');
  const categoryData = readYaml(root, 'notebook_categories.yml');
  return {
    authors,
    types: postTypes?.order ?? [],
    assays: assays?.order ?? [],
    categories: categoryData?.order ?? [],
  };
}

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;
const TAG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(value, label, max) {
  const result = String(value ?? '').trim();
  if (!result) throw new NotebookAuthoringError(`${label} is required.`);
  if (CONTROL_CHARACTERS.test(result)) throw new NotebookAuthoringError(`${label} cannot contain control characters.`);
  if ([...result].length > max) throw new NotebookAuthoringError(`${label} must be at most ${max} characters.`);
  return result;
}

export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function validateSlug(value, explicit) {
  const slug = explicit ? String(value ?? '').trim() : slugify(value);
  if (!slug || slug.length > 80 || !SLUG.test(slug)) {
    throw new NotebookAuthoringError('Slug must be lowercase ASCII words separated by hyphens (maximum 80 characters).');
  }
  return slug;
}

export function parseTags(values = []) {
  const tags = [];
  for (const item of values) {
    for (const raw of String(item).split(',')) {
      const tag = raw.trim();
      if (!tag) continue;
      if (tag.length > 40 || !TAG.test(tag)) {
        throw new NotebookAuthoringError(`Invalid tag "${tag}". Tags must be lowercase ASCII slugs of at most 40 characters.`);
      }
      if (!tags.includes(tag)) tags.push(tag);
    }
  }
  if (tags.length > 12) throw new NotebookAuthoringError('A post can have at most 12 tags.');
  return tags;
}

function localDateParts(date, timeZone = 'America/Sao_Paulo') {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  const offsetMinutes = Math.round((asUtc - date.getTime()) / 60000);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  return { ...parts, offset: `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}${String(absolute % 60).padStart(2, '0')}` };
}

export function normalizeDate(input, now = new Date(), timeZone = 'America/Sao_Paulo') {
  let instant;
  if (!input) {
    instant = now;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    const probe = new Date(Date.UTC(year, month - 1, day, 12));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
      throw new NotebookAuthoringError('Date must be a real calendar date in YYYY-MM-DD format.');
    }
    // Resolve 09:00 wall time through Intl so historical/future zone rules, rather
    // than the machine's timezone, determine the offset.
    const targetWallTime = Date.UTC(year, month - 1, day, 9, 0, 0);
    instant = new Date(targetWallTime);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const p = localDateParts(instant, timeZone);
      const representedWallTime = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
      const correction = targetWallTime - representedWallTime;
      if (correction === 0) break;
      instant = new Date(instant.getTime() + correction);
    }
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?[+-]\d{2}:\d{2}$/.test(input)) {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?([+-])(\d{2}):(\d{2})$/);
    const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = match;
    const calendarProbe = new Date(Date.UTC(+year, +month - 1, +day));
    const invalidCalendar = calendarProbe.getUTCFullYear() !== +year || calendarProbe.getUTCMonth() !== +month - 1 || calendarProbe.getUTCDate() !== +day;
    if (invalidCalendar || +hour > 23 || +minute > 59 || +second > 59 || +offsetHour > 23 || +offsetMinute > 59) {
      throw new NotebookAuthoringError('Date must be a valid strict ISO timestamp with an explicit offset.');
    }
    instant = new Date(input);
    if (Number.isNaN(instant.getTime())) throw new NotebookAuthoringError('Date must be a strict ISO timestamp with an explicit offset.');
  } else {
    throw new NotebookAuthoringError('Date must be YYYY-MM-DD or a strict ISO timestamp with an explicit offset.');
  }
  const p = localDateParts(instant, timeZone);
  return { date: `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} ${p.offset}`, day: `${p.year}-${p.month}-${p.day}` };
}

function choice(value, allowed, label) {
  if (!allowed.includes(value)) throw new NotebookAuthoringError(`Unknown ${label} "${value}". Choose one of: ${allowed.join(', ')}.`);
  return value;
}

export function prepareEntry(raw, config, { now = new Date() } = {}) {
  const title = text(raw.title, 'Title', 140);
  const resume = text(raw.resume, 'Summary', 240);
  const authorId = choice(raw.author, Object.keys(config.authors ?? {}), 'author');
  const author = text(config.authors[authorId]?.name, 'Author display name', 140);
  const type = choice(raw.type, config.types, 'post type');
  const category = choice(raw.category, config.categories, 'category');
  const assay = raw.assay === 'none' ? null : choice(raw.assay, config.assays, 'assay');
  const status = choice(raw.status, ['draft', 'publish'], 'status');
  const tags = parseTags(raw.tags);
  const slug = validateSlug(raw.slug ?? title, raw.slug !== undefined);
  const normalized = normalizeDate(raw.date, now);
  const relativePath = status === 'draft' ? `_drafts/${slug}.md` : `_posts/${normalized.day}-${slug}.md`;
  return { title, resume, author, authorId, type, category, assay, status, tags, slug, date: normalized.date, relativePath };
}

const quote = (value) => JSON.stringify(value);

export function renderEntry(entry) {
  const lines = [
    '---',
    'layout: post',
    `author: ${quote(entry.author)}`,
    `author_id: ${quote(entry.authorId)}`,
    `title: ${quote(entry.title)}`,
    `resume: ${quote(entry.resume)}`,
    `date: ${quote(entry.date)}`,
    `categories: ${quote(entry.category)}`,
    `tags: [${entry.tags.map(quote).join(', ')}]`,
    `type: ${quote(entry.type)}`,
  ];
  if (entry.assay) lines.push(`assay: ${quote(entry.assay)}`);
  lines.push('---', '', '<!-- Begin writing here. -->', '');
  return lines.join('\n');
}

export function createEntry(root, entry, { dryRun = false } = {}) {
  const markdown = renderEntry(entry);
  if (dryRun) return { markdown, relativePath: entry.relativePath };
  const target = path.join(root, entry.relativePath);
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, markdown, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') throw new NotebookAuthoringError(`Entry already exists: ${entry.relativePath}`, EXIT.COLLISION);
    throw new NotebookAuthoringError(`Could not create ${entry.relativePath}: ${error.message}`, EXIT.IO);
  }
  return { markdown, relativePath: entry.relativePath };
}
