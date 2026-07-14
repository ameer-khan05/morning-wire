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

describe('vercel.json — daily build cron', () => {
  const config = JSON.parse(repoFile('vercel.json'));

  it('defines a crons array', () => {
    expect(Array.isArray(config.crons)).toBe(true);
    expect(config.crons.length).toBeGreaterThan(0);
  });

  it('triggers the rebuild function once a day', () => {
    const job = config.crons.find((c) => c.path === '/api/rebuild');
    expect(job).toBeTruthy();
    // Five-field cron expression, fixed hour (not "*") so it runs once daily.
    const parts = job.schedule.split(' ');
    expect(parts.length).toBe(5);
    expect(parts[1]).not.toBe('*');
  });

  it('cron path is backed by a serverless function file', () => {
    const job = config.crons.find((c) => c.path === '/api/rebuild');
    const fnPath = resolve(import.meta.dirname, '..', 'api', 'rebuild.js');
    expect(existsSync(fnPath), 'missing api/rebuild.js').toBe(true);
    expect(job.path).toBe('/api/rebuild');
  });
});
