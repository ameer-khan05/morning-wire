#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const strictDate = process.argv.includes("--strict-date") || process.env.STRICT_DATE === "true";
const publicFiles = [
  "public/index.html",
  "public/tech-ai.html",
  "public/crypto.html",
  "public/markets.html",
  "public/world.html",
  "public/science.html",
];

const now = new Date();
const fullDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(now);
const shortDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(now);

const failures = [];
const warnings = [];
const pages = new Map();

for (const file of publicFiles) {
  try {
    pages.set(file, readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    failures.push(`${file}: could not be read (${error.message})`);
  }
}

function stripTags(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8470;|&numero;/g, "No.")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function getEditions(html) {
  return [...html.matchAll(/Edition\s+(?:№|No\.|No)\s*0*(\d+)/gi)].map((match) => match[1]);
}

function getExternalLinks(html) {
  return [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map((match) => match[1]);
}

function getTickerItems(html) {
  const track = html.match(/<div class="ticker-track">([\s\S]*?)<\/div>\s*<\/div>/i)?.[1];
  if (!track) return null;

  return track
    .split('<span class="ticker-item">')
    .slice(1)
    .map((chunk) => {
      const item = chunk.split("</span></span>")[0];
      return stripTags(`${item}</span>`);
    });
}

let canonicalEdition = null;
let canonicalTicker = null;

for (const [file, html] of pages) {
  const title = getTitle(html);
  if (!title) failures.push(`${file}: missing <title>`);

  const editions = getEditions(html);
  if (editions.length === 0) {
    failures.push(`${file}: missing edition marker`);
  } else {
    const uniqueEditions = [...new Set(editions)];
    if (uniqueEditions.length > 1) {
      failures.push(`${file}: inconsistent edition markers (${uniqueEditions.join(", ")})`);
    }
    canonicalEdition ??= uniqueEditions[0];
    if (uniqueEditions[0] !== canonicalEdition) {
      failures.push(`${file}: edition ${uniqueEditions[0]} differs from ${canonicalEdition}`);
    }
  }

  const hasCurrentDate = html.includes(fullDate) || html.includes(shortDate);
  if (!hasCurrentDate) {
    const message = `${file}: does not contain today's New York date (${fullDate})`;
    if (strictDate) failures.push(message);
    else warnings.push(message);
  }

  const externalLinks = getExternalLinks(html);
  if (externalLinks.length < 3) {
    failures.push(`${file}: expected at least 3 external source links, found ${externalLinks.length}`);
  }

  const hasInlineStyle = /\sstyle="/i.test(html);
  if (hasInlineStyle) warnings.push(`${file}: contains inline style attributes`);

  const hasScript = /<script[\s>]/i.test(html);
  if (hasScript) failures.push(`${file}: contains script tags`);

  const tickerItems = getTickerItems(html);
  if (!tickerItems || tickerItems.length === 0) {
    failures.push(`${file}: missing ticker items`);
  } else if (tickerItems.length % 2 !== 0) {
    failures.push(`${file}: ticker item count should be duplicated evenly`);
  } else {
    const half = tickerItems.length / 2;
    const firstHalf = tickerItems.slice(0, half);
    const secondHalf = tickerItems.slice(half);
    if (JSON.stringify(firstHalf) !== JSON.stringify(secondHalf)) {
      failures.push(`${file}: duplicated ticker items are not identical`);
    }
    canonicalTicker ??= JSON.stringify(firstHalf);
    if (JSON.stringify(firstHalf) !== canonicalTicker) {
      failures.push(`${file}: ticker differs from public/index.html`);
    }
  }
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length > 0) {
  console.error("Validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validation passed for edition ${canonicalEdition ?? "unknown"}.`);
if (!strictDate && warnings.length > 0) {
  console.log("Run with --strict-date to fail on stale edition dates.");
}
