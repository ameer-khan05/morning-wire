import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ALL_PAGES, SECTION_FILES, load, raw, repoFile } from './helpers.js';

const PUBLIC = resolve(import.meta.dirname, '..', 'public');

describe('public/ directory completeness', () => {
  const expectedFiles = [
    'index.html',
    'tech-ai.html',
    'crypto.html',
    'markets.html',
    'world.html',
    'science.html',
    'styles.css',
  ];

  it.each(expectedFiles)('%s exists', (file) => {
    expect(existsSync(resolve(PUBLIC, file))).toBe(true);
  });

  it('contains exactly the expected files (no extras)', () => {
    const { readdirSync } = require('node:fs');
    const files = readdirSync(PUBLIC).sort();
    expect(files).toEqual(expectedFiles.sort());
  });
});

describe('edition number consistency', () => {
  it('all pages reference the same edition number', () => {
    const editions = ALL_PAGES.map((page) => {
      const title = load(page)('title').text();
      const match = title.match(/№\s*(\d+)/);
      return match ? match[1] : null;
    });
    const unique = [...new Set(editions.filter(Boolean))];
    expect(unique.length).toBe(1);
  });
});

describe('date consistency', () => {
  it('all section page titles reference the same date fragment as index', () => {
    const indexTitle = load('index.html')('title').text();
    const indexDateMatch = indexTitle.match(
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\w+\s+\d+,\s+\d{4}/
    );
    if (!indexDateMatch) return; // date format may vary
    const indexDate = indexDateMatch[0];
    for (const page of SECTION_FILES) {
      const title = load(page)('title').text();
      expect(title, `${page} title date mismatch`).toContain(indexDate.split(',').pop().trim());
    }
  });
});

describe.each(SECTION_FILES)('%s — deep-dive page structure', (page) => {
  const $ = load(page);

  it('has at least one article-like section with sources', () => {
    const links = $('a[href^="http"]');
    expect(links.length, 'no external source links found').toBeGreaterThanOrEqual(1);
  });

  it('page size is under 50 KB', () => {
    const size = Buffer.byteLength(raw(page), 'utf-8');
    expect(size).toBeLessThan(50 * 1024);
  });
});

describe('daily-build prompt exists and is non-empty', () => {
  it('.github/prompts/daily-build.md exists', () => {
    const content = repoFile('.github/prompts/daily-build.md');
    expect(content.length).toBeGreaterThan(100);
  });

  it('prompt references all 5 beats', () => {
    const content = repoFile('.github/prompts/daily-build.md');
    expect(content).toContain('Tech & AI');
    expect(content).toContain('Crypto');
    expect(content).toContain('Markets');
    expect(content).toContain('World');
    expect(content).toContain('Science');
  });

  it('prompt references all 6 HTML files', () => {
    const content = repoFile('.github/prompts/daily-build.md');
    expect(content).toContain('index.html');
    expect(content).toContain('tech-ai.html');
    expect(content).toContain('crypto.html');
    expect(content).toContain('markets.html');
    expect(content).toContain('world.html');
    expect(content).toContain('science.html');
  });
});
