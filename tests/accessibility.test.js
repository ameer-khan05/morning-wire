import { describe, it, expect } from 'vitest';
import { ALL_PAGES, SECTION_FILES, load } from './helpers.js';

describe.each(ALL_PAGES)('%s — accessibility', (page) => {
  const $ = load(page);

  it('ticker has an aria-label', () => {
    const label = $('.ticker-wrap').attr('aria-label');
    expect(label).toBeTruthy();
    expect(label.toLowerCase()).toContain('ticker');
  });

  it('topbar nav has aria-label="Sections"', () => {
    const label = $('.topbar-nav').attr('aria-label');
    expect(label).toBe('Sections');
  });

  it('breadcrumb nav has aria-label="Breadcrumb"', () => {
    const label = $('nav.breadcrumb').attr('aria-label');
    expect(label).toBe('Breadcrumb');
  });

  it('all links have non-empty text or aria-label', () => {
    $('a').each((_i, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      expect(text || ariaLabel, `empty link: ${$(el).html()}`).toBeTruthy();
    });
  });

  it('heading hierarchy does not skip levels', () => {
    const headings = $('h1, h2, h3, h4, h5, h6')
      .toArray()
      .map((el) => parseInt(el.tagName.replace('h', ''), 10));
    for (let i = 1; i < headings.length; i++) {
      const gap = headings[i] - headings[i - 1];
      expect(gap, `heading level jump from h${headings[i - 1]} to h${headings[i]}`).toBeLessThanOrEqual(1);
    }
  });

  it('page has at least one <h1> or <h2>', () => {
    const count = $('h1, h2').length;
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe.each(SECTION_FILES)('%s — section page accessibility', (page) => {
  const $ = load(page);

  it('breadcrumb includes a link back to the hub', () => {
    const links = $('nav.breadcrumb a')
      .toArray()
      .map((el) => $(el).attr('href'));
    expect(links).toContain('index.html');
  });
});
