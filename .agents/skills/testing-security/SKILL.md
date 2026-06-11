---
name: testing-security-headers
description: Test Vercel security headers, CSP configuration, and site rendering for the Morning Wire static site. Use when verifying security header changes in vercel.json.
---

# Testing Security Headers on Morning Wire

## Overview

Morning Wire is a static HTML/CSS news site deployed on Vercel. Security headers are configured in `vercel.json` under the `headers` key.

## Prerequisites

- Access to production URL: `https://morning-wire-rho.vercel.app`
- Preview deployments may be behind Vercel SSO — plan to verify headers via curl even if the preview returns 401

## Devin Secrets Needed

- None required for basic testing (production is public)
- Vercel SSO login may be needed to access preview deployments in browser

## Testing Procedure

### 1. Header verification via curl

Compare production vs preview headers:
```bash
# Production baseline
curl -sI https://morning-wire-rho.vercel.app/ | grep -iE "(content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|strict-transport)"

# Preview (may return 401 if SSO-protected — headers still apply)
curl -sI https://<preview-url>/ | grep -iE "(content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|strict-transport)"
```

Note: Vercel SSO intercept pages may only show a subset of custom headers (typically X-Frame-Options and HSTS). The remaining headers (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) might only appear on authenticated pages.

### 2. Verify vercel.json config programmatically

```bash
python3 -c "
import json
with open('vercel.json') as f:
    config = json.load(f)
headers = {h['key']: h['value'] for h in config['headers'][0]['headers']}
for k, v in headers.items():
    print(f'{k}: {v}')
print(f'Total: {len(headers)} headers')
"
```

### 3. Verify CSP allows required external resources

The site loads Google Fonts from:
- `fonts.googleapis.com` (CSS stylesheets)
- `fonts.gstatic.com` (font files)

CSP must include:
- `style-src 'self' https://fonts.googleapis.com`
- `font-src https://fonts.gstatic.com`

### 4. Verify site rendering in browser

Open the production site and check:
- Fonts loaded: Fraunces (headlines), Inter (body), JetBrains Mono (data/ticker)
- No CSP violation errors in browser console
- All 5 section cards visible on hub page
- Navigation to section pages works
- Ticker scrolls

Use browser console to verify fonts:
```javascript
const fonts = document.fonts;
let loaded = [];
fonts.forEach(f => { if (f.status === 'loaded') loaded.push(f.family + ' ' + f.weight); });
console.log('LOADED:', loaded.join(', '));
```

### 5. File-level checks

```bash
# .gitignore covers critical patterns
for p in ".env" "node_modules/" ".DS_Store" "*.log"; do grep -q "$p" .gitignore && echo "OK: $p" || echo "MISSING: $p"; done

# Workflow uses scoped git add
grep "git add public/" .github/workflows/daily-build.yml && echo "OK" || echo "FAIL"
grep "git add -A" .github/workflows/daily-build.yml && echo "FAIL: still has git add -A" || echo "OK: git add -A removed"

# No project ID in README
grep -c "prj_" README.md && echo "FAIL" || echo "OK: no project ID"
```

## Known Issues

- Preview deployments might be behind Vercel SSO, returning 401. This blocks browser-based testing but curl still shows some headers.
- Production site currently has `access-control-allow-origin: *` which is overly permissive. This is a Vercel default, not something set in vercel.json.
- The `interest-cohort=()` directive in Permissions-Policy is deprecated (FLoC was replaced by Topics API) but is harmless to include.
