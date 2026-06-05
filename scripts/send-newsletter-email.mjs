#!/usr/bin/env node

import { readFileSync } from "node:fs";

const enabled = process.env.EMAIL_ENABLED === "true";
const dryRun = process.env.DRY_RUN_EMAIL === "true";
const baseUrl = process.env.NEWSLETTER_BASE_URL || "https://morning-wire-rho.vercel.app";
const indexHtml = readFileSync("public/index.html", "utf8");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when EMAIL_ENABLED=true`);
  return value;
}

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function absolutize(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}/${url.replace(/^\//, "")}`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function matchOne(pattern, fallback = "") {
  return indexHtml.match(pattern)?.[1]?.trim() ?? fallback;
}

const title = stripTags(matchOne(/<title>([\s\S]*?)<\/title>/i, "The Morning Wire"));
const description = matchOne(/<meta name="description" content="([^"]*)"/i);
const ledeHeadline = stripTags(matchOne(/<section class="lede">[\s\S]*?<h2>([\s\S]*?)<\/h2>/i));
const ledeBody = matchOne(/<div class="lede-body">([\s\S]*?)<\/div>\s*<aside/i);
const ledeParagraphs = [...ledeBody.matchAll(/<p(?! class="sources")[^>]*>([\s\S]*?)<\/p>/gi)]
  .slice(0, 3)
  .map((match) => stripTags(match[1]))
  .filter(Boolean);

const storyCards = [...indexHtml.matchAll(/<article class="story-card[\s\S]*?<\/article>/gi)]
  .slice(0, 5)
  .map((match) => {
    const card = match[0];
    const headline = stripTags(card.match(/<h4>([\s\S]*?)<\/h4>/i)?.[1] ?? "");
    const summary = stripTags(card.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? "");
    const ctaMatch = card.match(/<a class="cta" href="([^"]+)">([\s\S]*?)<\/a>/i);
    const href = ctaMatch ? absolutize(ctaMatch[1]) : baseUrl;
    const sourceLinks = [...card.matchAll(/<a href="(https?:\/\/[^"]+)">([\s\S]*?)<\/a>/gi)]
      .map((source) => `<a href="${escapeHtml(source[1])}">${escapeHtml(stripTags(source[2]))}</a>`)
      .join(" · ");
    return { headline, summary, href, sourceLinks };
  })
  .filter((story) => story.headline && story.summary);

const subjectPrefix = process.env.NEWSLETTER_SUBJECT_PREFIX || "";
const subject = `${subjectPrefix}${title}`;

const html = `<!doctype html>
<html>
<body style="margin:0;background:#fafaf7;color:#111113;font-family:Arial,sans-serif;line-height:1.55;">
  <main style="max-width:680px;margin:0 auto;padding:28px 20px;">
    <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b6b73;margin:0 0 8px;">The Morning Wire</p>
    <h1 style="font-size:30px;line-height:1.1;margin:0 0 12px;">${escapeHtml(title)}</h1>
    ${description ? `<p style="color:#2a2a2f;margin:0 0 22px;">${escapeHtml(description)}</p>` : ""}
    ${ledeHeadline ? `<h2 style="font-size:22px;line-height:1.2;margin:24px 0 12px;">${escapeHtml(ledeHeadline)}</h2>` : ""}
    ${ledeParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
    <hr style="border:0;border-top:1px solid #e5e5ea;margin:28px 0;">
    ${storyCards
      .map(
        (story) => `<section style="margin:0 0 26px;">
      <h3 style="font-size:19px;line-height:1.25;margin:0 0 8px;">${escapeHtml(story.headline)}</h3>
      <p style="margin:0 0 8px;">${escapeHtml(story.summary)}</p>
      ${story.sourceLinks ? `<p style="font-size:13px;color:#6b6b73;margin:0 0 8px;">Sources: ${story.sourceLinks}</p>` : ""}
      <p style="margin:0;"><a href="${escapeHtml(story.href)}">Read more</a></p>
    </section>`
      )
      .join("\n")}
    <p style="margin-top:30px;"><a href="${escapeHtml(baseUrl)}">Open the full Morning Wire site</a></p>
  </main>
</body>
</html>`;

const text = [
  title,
  description,
  ledeHeadline,
  ...ledeParagraphs,
  ...storyCards.flatMap((story) => [story.headline, story.summary, story.href]),
  baseUrl,
]
  .filter(Boolean)
  .join("\n\n");

if (!enabled) {
  console.log("Email send skipped because EMAIL_ENABLED is not true.");
  process.exit(0);
}

const apiKey = required("RESEND_API_KEY");
const from = required("NEWSLETTER_FROM");
const to = required("NEWSLETTER_TO")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (to.length === 0) throw new Error("NEWSLETTER_TO must include at least one recipient");

const payload = {
  from,
  to,
  subject,
  html,
  text,
};

if (process.env.NEWSLETTER_REPLY_TO) {
  payload.reply_to = process.env.NEWSLETTER_REPLY_TO;
}

if (dryRun) {
  console.log(JSON.stringify({ ...payload, html: "[html omitted]", text: text.slice(0, 500) }, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const body = await response.text();
if (!response.ok) {
  throw new Error(`Resend email failed with ${response.status}: ${body}`);
}

console.log(`Newsletter email sent to ${to.join(", ")}.`);

