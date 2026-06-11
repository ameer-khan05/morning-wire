import { describe, it, expect } from 'vitest';
import { ALL_PAGES, load } from './helpers.js';

describe.each(ALL_PAGES)('%s — ticker duplication', (page) => {
  const $ = load(page);

  it('ticker items are duplicated for seamless scrolling loop', () => {
    const items = $('.ticker-item')
      .toArray()
      .map((el) => $(el).text().trim());
    expect(items.length).toBeGreaterThanOrEqual(4);
    const half = items.length / 2;
    expect(Number.isInteger(half), 'ticker item count should be even').toBe(true);
    const first = items.slice(0, half);
    const second = items.slice(half);
    expect(first).toEqual(second);
  });

  it('every ticker item has a .lbl span', () => {
    $('.ticker-item').each((_i, el) => {
      const lbl = $(el).find('.lbl');
      expect(lbl.length, 'ticker item missing .lbl').toBeGreaterThanOrEqual(1);
    });
  });
});

describe('ticker values across pages share key market data', () => {
  it('index and markets pages both show S&P 500', () => {
    const $index = load('index.html');
    const $markets = load('markets.html');
    const indexLabels = $index('.ticker-item .lbl')
      .toArray()
      .map((el) => $index(el).text().trim());
    const marketsLabels = $markets('.ticker-item .lbl')
      .toArray()
      .map((el) => $markets(el).text().trim());
    expect(indexLabels).toContain('S&P 500');
    expect(marketsLabels).toContain('S&P 500');
  });

  it('index and crypto pages both show BTC', () => {
    const $index = load('index.html');
    const $crypto = load('crypto.html');
    const indexLabels = $index('.ticker-item .lbl')
      .toArray()
      .map((el) => $index(el).text().trim());
    const cryptoLabels = $crypto('.ticker-item .lbl')
      .toArray()
      .map((el) => $crypto(el).text().trim());
    expect(indexLabels).toContain('BTC');
    expect(cryptoLabels).toContain('BTC');
  });
});
