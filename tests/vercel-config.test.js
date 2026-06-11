import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { repoFile } from './helpers.js';

const PUBLIC = resolve(import.meta.dirname, '..', 'public');

describe('vercel.json — routing configuration', () => {
  const config = JSON.parse(repoFile('vercel.json'));

  it('is valid JSON with a rewrites array', () => {
    expect(Array.isArray(config.rewrites)).toBe(true);
    expect(config.rewrites.length).toBeGreaterThan(0);
  });

  it('has rewrites for all 5 sections', () => {
    const sources = config.rewrites.map((r) => r.source);
    expect(sources).toContain('/tech');
    expect(sources).toContain('/crypto');
    expect(sources).toContain('/markets');
    expect(sources).toContain('/world');
    expect(sources).toContain('/science');
  });

  it('maps /tech to /tech-ai.html', () => {
    const rule = config.rewrites.find((r) => r.source === '/tech');
    expect(rule.destination).toBe('/tech-ai.html');
  });

  it('maps /crypto to /crypto.html', () => {
    const rule = config.rewrites.find((r) => r.source === '/crypto');
    expect(rule.destination).toBe('/crypto.html');
  });

  it('maps /markets to /markets.html', () => {
    const rule = config.rewrites.find((r) => r.source === '/markets');
    expect(rule.destination).toBe('/markets.html');
  });

  it('maps /world to /world.html', () => {
    const rule = config.rewrites.find((r) => r.source === '/world');
    expect(rule.destination).toBe('/world.html');
  });

  it('maps /science to /science.html', () => {
    const rule = config.rewrites.find((r) => r.source === '/science');
    expect(rule.destination).toBe('/science.html');
  });

  it('every rewrite destination file exists in public/', () => {
    for (const rule of config.rewrites) {
      const dest = rule.destination.replace(/^\//, '');
      const fullPath = resolve(PUBLIC, dest);
      expect(existsSync(fullPath), `missing ${dest}`).toBe(true);
    }
  });

  it('every rewrite has both source and destination', () => {
    for (const rule of config.rewrites) {
      expect(rule.source).toBeTruthy();
      expect(rule.destination).toBeTruthy();
      expect(rule.source.startsWith('/')).toBe(true);
      expect(rule.destination.endsWith('.html')).toBe(true);
    }
  });
});
