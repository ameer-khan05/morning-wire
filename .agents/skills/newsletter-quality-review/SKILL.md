---
name: newsletter-quality-review
description: Review Morning Wire editions, prompts, and publishing workflows for source quality, editorial trust, stale content, email safety, and automation risks.
---

1. Read `AGENTS.md`, `docs/editorial-policy.md`, `.github/prompts/daily-build.md`, and `.github/workflows/daily-build.yml`.
2. Inspect all six `public/*.html` files for date consistency, edition consistency, source attribution, suspicious or stale claims, ticker consistency, and structural drift.
3. Run `node scripts/validate-edition.mjs` when the validation script exists.
4. Treat live email sending as a safety-sensitive action. Confirm that `EMAIL_ENABLED=true` is required before any send.
5. Report findings first, ordered by severity. Include exact files and line references for actionable issues.
6. Recommend focused fixes that improve publishing trust without adding unnecessary dependencies.

