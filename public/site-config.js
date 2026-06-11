/*  site-config.js — Edition-wide data (updated once per daily build)
 *  The daily build edits ONLY this file for edition-wide values,
 *  instead of repeating them across all six HTML pages.
 */
window.WIRE_CONFIG = {
  edition: '065',
  vol: 'MMXXVI',
  date: 'Sunday, May 31, 2026',
  dateShort: 'Sun · May 31',
  dateMeta: 'May 31, 2026',

  /* Cross-CTA headlines (shown on every deep-dive page) */
  sections: {
    tech:    { label: 'Tech &amp; AI', title: 'Dell <em>+32%</em>' },
    crypto:  { label: 'Crypto',       title: 'BTC <em>$74,054</em>' },
    markets: { label: 'Markets',      title: 'S&amp;P <em>Record</em>' },
    world:   { label: 'World',        title: 'Iran: <em>Day 92</em>' },
    science: { label: 'Science',      title: 'CKD <em>788M</em>' }
  }
};
