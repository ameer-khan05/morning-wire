---
name: testing-morning-wire
description: Test the Morning Wire static site end-to-end. Use when verifying shared component rendering, navigation, or ticker behavior across the 6 HTML pages.
---

# Testing Morning Wire

## Overview

The Morning Wire is a static site with 6 HTML pages (1 hub + 5 deep dives) that share components rendered by `shared.js` + `site-config.js`. Testing verifies these shared components render correctly with section-specific behavior.

## Local Server Setup

```bash
cd /home/ubuntu/repos/morning-wire
python3 -m http.server 8080 --directory public &
```

Pages are accessible at:
- `http://localhost:8080/index.html` (hub)
- `http://localhost:8080/tech-ai.html`
- `http://localhost:8080/crypto.html`
- `http://localhost:8080/markets.html`
- `http://localhost:8080/world.html`
- `http://localhost:8080/science.html`

## Vercel Preview

Vercel preview deployments may require SSO authentication. If blocked by a Vercel login page, test locally instead — the `public/` directory served locally is identical to what Vercel deploys.

## What to Test

### 5 Shared Components (rendered by `shared.js`)

1. **Ticker auto-duplication**: `.ticker-track` should have 2× the original `.ticker-item` children (cloned by JS for CSS animation loop)
2. **Topbar/nav**: `<header class="topbar">` with brand, 5 nav links, and meta text "№ {edition}"
3. **Breadcrumb**: Hub shows "The Wire · Today's Hub"; deep dives show "The Wire / {Section Name}"
4. **Cross-section CTA**: Hub shows "Jump to the deep dives" with all 5 sections; deep dives show "Keep reading across the Wire" with 4 sections + "Back to Hub"
5. **Footer**: Hub shows "№ {edition}"; deep dives show "{Section Name} · № {edition}"

### Active Nav State

- Hub: NO nav link should have `is-active` class
- Each deep-dive: only its own section link should have `is-active`

### Ticker Animation

- CSS animation `ticker-scroll` should be running (60s, infinite)
- `translateX` should be actively changing
- Items must be duplicated for seamless loop (if only original items, animation will snap/jump)

## Browser Console Verification Script

Run this on any page to quickly check all shared components:

```javascript
const active = document.querySelectorAll('.topbar-nav a.is-active');
const bc = document.querySelector('nav.breadcrumb');
const cta = document.querySelector('.cross-cta h4');
const links = Array.from(document.querySelectorAll('.cross-link')).map(a => a.querySelector('.cc-label').textContent);
const footer = document.querySelector('footer.site-foot');
const ft = footer ? footer.textContent.replace(/\s+/g, ' ').trim().substring(0, 80) : 'MISSING';
const ticker = document.querySelectorAll('.ticker-track .ticker-item').length;
console.log('active=' + Array.from(active).map(a=>a.textContent) + ' bc="' + bc.textContent.trim().replace(/\s+/g,' ') + '" cta="' + cta.textContent + '" links=' + links.join(',') + ' footer="' + ft + '" ticker=' + ticker);
```

## Key Architecture Notes

- Each page sets `window.PAGE = {section, breadcrumb, footerTagline}` before loading `shared.js`
- `site-config.js` provides `window.WIRE_CONFIG` with edition-wide data
- `shared.js` replaces mount-point `<div>` elements (e.g., `#topbar-mount`, `#breadcrumb-mount`) with rendered HTML at DOMContentLoaded
- Ticker items per page vary (hub has ~11, deep dives have 5-8 depending on section)

## Devin Secrets Needed

None — this is a static site with no authentication required for local testing.
