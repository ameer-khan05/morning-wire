// Vercel Cron target. The "crons" block in vercel.json invokes this function
// once a day; it calls the GitHub API to trigger the daily-build workflow via
// workflow_dispatch. API dispatches start within seconds, so this is the
// reliable, on-time replacement for GitHub's own (2–7h late) scheduled trigger.
//
// Required Vercel environment variables (Project → Settings → Environment
// Variables, Production scope):
//   CRON_SECRET           — any random string. Vercel automatically sends it as
//                           `Authorization: Bearer <CRON_SECRET>` on cron
//                           invocations; we check it so only Vercel can trigger.
//   GITHUB_DISPATCH_TOKEN — a fine-grained GitHub PAT scoped to this repo with
//                           "Actions: Read and write" permission.

const OWNER = 'ameer-khan05';
const REPO = 'morning-wire';
const WORKFLOW = 'daily-build.yml';

export default async function handler(req, res) {
  // Only Vercel Cron (which carries the CRON_SECRET) may trigger a build.
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return res
      .status(500)
      .json({ ok: false, error: 'GITHUB_DISPATCH_TOKEN is not configured' });
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`;
  const gh = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'morning-wire-cron',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  // GitHub returns 204 No Content on a successful dispatch.
  if (gh.status === 204) {
    return res.status(200).json({ ok: true, message: 'Daily build dispatched' });
  }

  const detail = await gh.text();
  return res
    .status(502)
    .json({ ok: false, status: gh.status, detail });
}
