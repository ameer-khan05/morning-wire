import { describe, it, expect } from 'vitest';
import { ALL_PAGES, SECTION_FILES, NAV_LINKS, THEME_MAP, load } from './helpers.js';

describe.each(ALL_PAGES)('%s — navigation consistency', (page) => {
  const $ = load(page);

  it('has exactly 5 section nav links in the correct order', () => {
    const hrefs = $('.topbar-nav a')
      .toArray()
      .map((el) => $(el).attr('href'));
    expect(hrefs).toEqual(NAV_LINKS);
  });

  it('brand link points to index.html', () => {
    expect($('.topbar-brand').attr('href')).toBe('index.html');
  });

  it('topbar-meta contains edition number', () => {
    const meta = $('.topbar-meta').text();
    expect(meta).toMatch(/№\s*\d+/);
  });
});

describe.each(SECTION_FILES)('%s — section-specific nav', (page) => {
  const $ = load(page);

  it('marks exactly one nav link as is-active', () => {
    const active = $('.topbar-nav a.is-active');
    expect(active.length).toBe(1);
  });

  it('the is-active link href matches the current page', () => {
    const activeHref = $('.topbar-nav a.is-active').attr('href');
    expect(activeHref).toBe(page);
  });

  it('sets the correct theme class on <body>', () => {
    const expected = THEME_MAP[page];
    expect($('body').hasClass(expected)).toBe(true);
  });

  it('breadcrumb links back to index.html', () => {
    const crumbLink = $('nav.breadcrumb a');
    expect(crumbLink.length).toBeGreaterThanOrEqual(1);
    expect(crumbLink.first().attr('href')).toBe('index.html');
  });

  it('has a deep-hero section', () => {
    expect($('.deep-hero').length).toBe(1);
  });

  it('deep-hero has a kicker with the section name', () => {
    const kicker = $('.deep-hero .kicker').text();
    expect(kicker).toContain('Deep Dive');
  });
});

describe('index.html — hub-specific elements', () => {
  const $ = load('index.html');

  it('has no is-active nav link', () => {
    expect($('.topbar-nav a.is-active').length).toBe(0);
  });

  it('has a masthead', () => {
    expect($('.masthead').length).toBe(1);
  });

  it('masthead contains edition info and h1', () => {
    expect($('.masthead .edition').length).toBe(1);
    expect($('.masthead h1').length).toBe(1);
    expect($('.masthead h1').text()).toContain('Morning');
  });

  it('has no theme-* class on <body>', () => {
    const classes = $('body').attr('class') || '';
    expect(classes).not.toMatch(/theme-/);
  });
});
