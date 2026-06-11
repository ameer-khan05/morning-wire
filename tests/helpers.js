import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';

const PUBLIC = resolve(import.meta.dirname, '..', 'public');

/** All section page filenames (not index). */
export const SECTION_FILES = [
  'tech-ai.html',
  'crypto.html',
  'markets.html',
  'world.html',
  'science.html',
];

/** Every HTML page filename including index. */
export const ALL_PAGES = ['index.html', ...SECTION_FILES];

/** Theme class each section page must set on <body>. */
export const THEME_MAP = {
  'tech-ai.html': 'theme-tech',
  'crypto.html': 'theme-crypto',
  'markets.html': 'theme-markets',
  'world.html': 'theme-world',
  'science.html': 'theme-science',
};

/** Expected nav link hrefs in order. */
export const NAV_LINKS = [
  'tech-ai.html',
  'crypto.html',
  'markets.html',
  'world.html',
  'science.html',
];

/** Load a file from public/ and return a Cheerio root. */
export function load(filename) {
  const html = readFileSync(resolve(PUBLIC, filename), 'utf-8');
  return cheerio.load(html);
}

/** Read raw file content from public/. */
export function raw(filename) {
  return readFileSync(resolve(PUBLIC, filename), 'utf-8');
}

/** Read a file relative to repo root. */
export function repoFile(relPath) {
  return readFileSync(resolve(PUBLIC, '..', relPath), 'utf-8');
}
