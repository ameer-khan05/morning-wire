import { describe, it, expect } from 'vitest';
import { ALL_PAGES, load, raw } from './helpers.js';

describe.each(ALL_PAGES)('%s — HTML structure', (page) => {
  const $ = load(page);

  it('starts with <!DOCTYPE html>', () => {
    expect(raw(page).trimStart().toLowerCase()).toMatch(/^<!doctype html>/);
  });

  it('has <html lang="en">', () => {
    expect($('html').attr('lang')).toBe('en');
  });

  it('has charset meta', () => {
    const charset = $('meta[charset]').attr('charset');
    expect(charset?.toLowerCase()).toBe('utf-8');
  });

  it('has viewport meta', () => {
    const content = $('meta[name="viewport"]').attr('content');
    expect(content).toContain('width=device-width');
  });

  it('has a non-empty <title> containing "Morning Wire"', () => {
    const title = $('title').text();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain('Morning Wire');
  });

  it('has a meta description', () => {
    const desc = $('meta[name="description"]').attr('content');
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThan(50);
  });

  it('links to styles.css', () => {
    const hrefs = $('link[rel="stylesheet"]')
      .toArray()
      .map((el) => $(el).attr('href'));
    expect(hrefs).toContain('styles.css');
  });

  it('has Google Fonts preconnect links', () => {
    const preconnects = $('link[rel="preconnect"]')
      .toArray()
      .map((el) => $(el).attr('href'));
    expect(preconnects).toContain('https://fonts.googleapis.com');
    expect(preconnects).toContain('https://fonts.gstatic.com');
  });

  it('has a Google Fonts stylesheet link', () => {
    const fontLink = $('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    expect(fontLink.length).toBeGreaterThan(0);
    const href = fontLink.attr('href');
    expect(href).toContain('Fraunces');
    expect(href).toContain('Inter');
    expect(href).toContain('JetBrains+Mono');
  });

  it('has a scrolling ticker', () => {
    expect($('.ticker-wrap').length).toBe(1);
    expect($('.ticker-track').length).toBe(1);
    expect($('.ticker-item').length).toBeGreaterThanOrEqual(2);
  });

  it('has a sticky topbar with brand and nav', () => {
    expect($('header.topbar').length).toBe(1);
    expect($('.topbar-brand').length).toBe(1);
    expect($('.topbar-nav').length).toBe(1);
    expect($('.topbar-meta').length).toBe(1);
  });

  it('has a breadcrumb nav', () => {
    expect($('nav.breadcrumb').length).toBe(1);
  });

  it('contains no inline <style> blocks', () => {
    expect($('style').length).toBe(0);
  });

  it('contains no <script> tags', () => {
    expect($('script').length).toBe(0);
  });
});
