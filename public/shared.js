/* shared.js — Shared component utilities for The Morning Wire
 *
 * Eliminates duplicated HTML across the six pages:
 *   1. Ticker auto-duplication  (items written once, cloned for CSS loop)
 *   2. Topbar / navigation      (rendered once, active link auto-detected)
 *   3. Breadcrumb               (rendered from page config)
 *   4. Cross-section CTA        (rendered from site-config.js)
 *   5. Footer                   (rendered from page config)
 *
 * Each page sets a minimal `window.PAGE` object before loading this script:
 *   window.PAGE = { section: 'tech', breadcrumb: 'Tech &amp; AI', footerTagline: '...' }
 * Then site-config.js provides edition-wide data in window.WIRE_CONFIG.
 */
(function () {
  'use strict';

  var SECTION_NAV = [
    { id: 'tech',    href: 'tech-ai.html',  label: 'Tech &amp; AI' },
    { id: 'crypto',  href: 'crypto.html',   label: 'Crypto' },
    { id: 'markets', href: 'markets.html',  label: 'Markets' },
    { id: 'world',   href: 'world.html',    label: 'World' },
    { id: 'science', href: 'science.html',  label: 'Science' }
  ];

  var SECTION_HREF = {
    tech: 'tech-ai.html',
    crypto: 'crypto.html',
    markets: 'markets.html',
    world: 'world.html',
    science: 'science.html'
  };

  /* ─── helpers ─── */
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  /* ─── 1. Ticker auto-duplication ───
   * The CSS animation `translateX(-50%)` needs 2× the items.
   * Pages now write ticker items only once; this clones them. */
  function initTicker() {
    var track = document.querySelector('.ticker-track');
    if (!track) return;
    var items = Array.from(track.children);
    items.forEach(function (el) {
      track.appendChild(el.cloneNode(true));
    });
  }

  /* ─── 2. Topbar ─── */
  function renderTopbar() {
    var mount = document.getElementById('topbar-mount');
    if (!mount) return;
    var cfg = window.WIRE_CONFIG || {};
    var page = window.PAGE || {};
    var meta = (cfg.dateShort || '') + ' · № ' + (cfg.edition || '');

    var navLinks = SECTION_NAV.map(function (s) {
      var active = s.id === page.section ? ' class="is-active"' : '';
      return '<a' + active + ' href="' + s.href + '">' + s.label + '</a>';
    }).join('\n      ');

    mount.outerHTML =
      '<header class="topbar">\n' +
      '  <div class="topbar-inner">\n' +
      '    <a class="topbar-brand" href="index.html">The Morning <em>Wire</em></a>\n' +
      '    <nav class="topbar-nav" aria-label="Sections">\n' +
      '      ' + navLinks + '\n' +
      '    </nav>\n' +
      '    <span class="topbar-meta">' + esc(meta) + '</span>\n' +
      '  </div>\n' +
      '</header>';
  }

  /* ─── 3. Breadcrumb ─── */
  function renderBreadcrumb() {
    var mount = document.getElementById('breadcrumb-mount');
    if (!mount) return;
    var page = window.PAGE || {};
    var inner;
    if (!page.section || page.section === 'hub') {
      inner = '<span class="current">The Wire · Today\'s Hub</span>';
    } else {
      inner = '<a href="index.html">The Wire</a>' +
              '<span class="sep">/</span>' +
              '<span class="current">' + (page.breadcrumb || '') + '</span>';
    }
    mount.outerHTML =
      '<nav class="breadcrumb" aria-label="Breadcrumb">' + inner + '</nav>';
  }

  /* ─── 4. Cross-CTA ─── */
  function renderCrossCTA() {
    var mount = document.getElementById('cross-cta-mount');
    if (!mount) return;
    var cfg = window.WIRE_CONFIG || {};
    var page = window.PAGE || {};
    var sections = cfg.sections || {};
    var isHub = !page.section || page.section === 'hub';
    var heading = isHub ? 'Jump to the deep dives' : 'Keep reading across the Wire';

    var links = Object.keys(sections).filter(function (id) {
      return id !== page.section;
    }).map(function (id) {
      return '    <a class="cross-link" href="' + SECTION_HREF[id] + '" data-section="' + id + '">\n' +
             '      <span class="cc-label">' + sections[id].label + '</span>\n' +
             '      <span class="cc-title">' + sections[id].title + '</span>\n' +
             '    </a>';
    }).join('\n');

    if (!isHub) {
      var selfId = page.section;
      links += '\n    <a class="cross-link" href="index.html" data-section="' + selfId + '">\n' +
               '      <span class="cc-label">Back</span>\n' +
               '      <span class="cc-title">Return to the <em>Hub</em></span>\n' +
               '    </a>';
    }

    mount.outerHTML =
      '<section class="cross-cta">\n' +
      '  <h4>' + heading + '</h4>\n' +
      '  <div class="cross-grid">\n' +
      links + '\n' +
      '  </div>\n' +
      '</section>';
  }

  /* ─── 5. Footer ─── */
  function renderFooter() {
    var mount = document.getElementById('footer-mount');
    if (!mount) return;
    var cfg = window.WIRE_CONFIG || {};
    var page = window.PAGE || {};
    var sectionMeta = page.section && page.section !== 'hub'
      ? (page.breadcrumb || '') + ' · '
      : '';
    var tagline = page.footerTagline || '';

    mount.outerHTML =
      '<footer class="site-foot">\n' +
      '  <div class="inner">\n' +
      '    <div class="brand">The Morning <em>Wire</em></div>\n' +
      '    <span class="meta">' + sectionMeta + '№ ' + esc(cfg.edition || '') + '</span>\n' +
      '  </div>\n' +
      '  <div class="inner" style="margin-top:14px">\n' +
      '    <p>' + tagline + '</p>\n' +
      '    <span class="meta">' + esc(cfg.dateMeta || '') + '</span>\n' +
      '  </div>\n' +
      '</footer>';
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', function () {
    initTicker();
    renderTopbar();
    renderBreadcrumb();
    renderCrossCTA();
    renderFooter();
  });
})();
