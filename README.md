# The Morning Wire

A daily AI-curated news site that rebuilds itself every morning at 7 AM ET with fresh headlines across five beats: Tech & AI, Crypto, Markets, World, Science & Health.

**Live site:** https://morning-wire-rho.vercel.app

## Architecture

```
GitHub (main branch)  ──┐
                        ├──►  Vercel auto-deploy  ──►  morning-wire-rho.vercel.app
                        │
GitHub Actions cron  ───┘
  (07:00 ET daily)
  generates HTML via
  Claude Code OAuth
```

- **Hosting:** Vercel (project `prj_Lwd9L4htNgSMAVIpsUPc5AcPZyJ8`). Any push to `main` auto-deploys to the production alias.
- **Daily content build:** `.github/workflows/daily-build.yml` runs on GitHub Actions at 11:00 UTC (7 AM ET during EDT, 6 AM ET during EST — accept the 1-hour drift in winter or adjust the cron seasonally). It installs the Claude Code CLI, reads the prompt at `.github/prompts/daily-build.md`, regenerates the 6 HTML files with today's real news (via Claude's web search tool), and pushes the commit. Vercel takes it from there.
- **Manual trigger:** The workflow also has `workflow_dispatch` enabled. Go to GitHub → Actions → "Daily Morning Wire Build" → Run workflow to fire a rebuild on demand.

## Repo layout

```
public/
  index.html         # Daily Hub (masthead, The Brief, 5 section cards)
  tech-ai.html       # Tech & AI deep dive
  crypto.html        # Crypto deep dive
  markets.html       # Markets deep dive
  world.html         # World deep dive
  science.html       # Science & Health deep dive
  styles.css         # Shared stylesheet (Fraunces / Inter / JetBrains Mono)
vercel.json          # Rewrites: /tech → /tech-ai.html, /crypto → /crypto.html, etc.
.github/
  workflows/daily-build.yml    # Scheduled + manual build workflow
  prompts/daily-build.md       # Instruction prompt Claude Code runs each morning
```

## Design system

- **Typography:** Fraunces (serif display, masthead + headlines), Inter (sans body), JetBrains Mono (data labels, tags)
- **Palette:** cream `#FBF8F3` background, `#0B0F14` text
- **Section accent colors:**
  - Tech & AI: `#4338CA` indigo
  - Crypto: `#B45309` amber
  - Markets: `#047857` emerald
  - World: `#B91C1C` red
  - Science: `#0E7490` cyan
- Each deep-dive page sets `<body class="theme-{section}">` which drives its accent via CSS custom properties. The daily build must preserve CSS and page structure — only content, sources, ticker values, date, and edition number change.

## Setup (first-time)

This site needs one GitHub repo secret to run the daily build:

- **`CLAUDE_CODE_OAUTH_TOKEN`** — authorizes the Actions runner to use your Claude subscription (no per-token API billing).

To provision it:

1. In your local Claude Code session, run `/install-github-app`.
2. The flow opens a browser, has you authorize the Claude GitHub App on the `ameer-khan05/morning-wire` repo, and writes `CLAUDE_CODE_OAUTH_TOKEN` into the repo's secrets automatically.
3. Go to GitHub → the repo → Settings → Secrets and variables → Actions, and confirm `CLAUDE_CODE_OAUTH_TOKEN` is listed.

After that: GitHub → Actions → "Daily Morning Wire Build" → Run workflow to test. You should see a new commit on `main` within ~2 minutes and a fresh Vercel deploy shortly after.

## Operations

**Rotating the OAuth token.** Re-run `/install-github-app` — it overwrites the existing secret.

**Changing the build time.** Edit the `cron` line in `.github/workflows/daily-build.yml`. Cron expressions in GitHub Actions are UTC-only; convert from ET manually, or leave the 1-hour seasonal drift.

**Editing the design.** CSS lives in `public/styles.css`. The daily prompt is instructed not to touch CSS — if you change design, do it manually and commit it; the next daily build will keep your changes.

**Editing the content prompt.** `.github/prompts/daily-build.md`. This is the brief Claude follows each morning — beats, tone, sourcing rules, format constraints. Edit and commit; the next run picks it up.

**Killing a bad build.** If a daily build ships something broken, revert the commit:

```bash
git revert <sha>
git push origin main
```

Vercel redeploys the prior state.

## Postmortem: the April 17, 2026 silent-failure incident

**What broke.** From March 26 through April 17, a Cowork-scheduled task rebuilt the site every morning on Ameer's Mac under his local `gh` auth — 16 successful deploys. On/around April 17 the scheduled-task runtime migrated execution into a hosted sandbox environment. The prompt didn't change and the cron fired on time every day, but the sandbox had no GitHub credentials. The build succeeded inside the sandbox; `git commit` succeeded; `git push origin main` silently failed with `fatal: could not read Username for 'https://github.com'`. The sandbox's working directory was discarded when each run ended, so no error surfaced anywhere visible. From the outside it looked like the cron had just stopped working — but the real failure mode was "cron fires, build completes, push rejected, state discarded, no one notified."

**Why it was invisible.** The brief said `lastRunAt` timestamps looked healthy every morning. Lack of a deploy was the only symptom, and there was no alert wired up for "push failed" or "no commits in N days." The redesign that landed on Friday, April 17 (commit `9d51918`) shipped only because Ameer manually pushed from his Desktop — masking the underlying breakage for another 24 hours.

**Why we moved to GitHub Actions.** Actions gives us three things the old setup lacked:

1. **Explicit auth.** The runner authenticates with `CLAUDE_CODE_OAUTH_TOKEN` (for the generation step) and the auto-provisioned `GITHUB_TOKEN` (for the push). Both are stored in GitHub's secret store, not in prompt text. The old setup depended on Ameer's Mac happening to have `gh` logged in — an implicit ambient condition that quietly disappeared when the runtime changed.
2. **Failure visibility.** A failed Actions run shows up in the repo's Actions tab with full logs. No more silent sandbox drops.
3. **Zero local dependencies.** The build runs on GitHub's infrastructure. Ameer's Mac can be asleep, off, or in another timezone. Previously, the whole pipeline silently required the Mac to be awake with Claude Code open.

**Don't reintroduce this.** If you ever find yourself putting this build back into a runtime that relies on `gh` being logged in on a specific machine, or into any scheduled-agent product that doesn't give you explicit control over credentials and failure surfaces — don't. Production cron needs a production execution environment with declared auth. Actions is the cheap, correct answer.

## Credits

Built by Ameer Khan ([ameerkhan2105@gmail.com](mailto:ameerkhan2105@gmail.com)). Design system is a hybrid of Modern Tech × Magazine Glossy. Content curation is model-driven via Claude.
