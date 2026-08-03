/**
 * Fails the build when a page's `<title>` or `<meta name="description">` would
 * be truncated or padded out in search results.
 *
 * The migration from MkDocs carried over 48 titles above the truncation point
 * (up to 70 characters) and 13 descriptions above it, so this guards the fix
 * rather than describing an aspiration. It checks the *rendered* title, meaning
 * `metaTitle ?? title` with the brand suffix `lib/seo.ts` appends — checking the
 * raw frontmatter would miss pages pushed over the limit by the suffix.
 *
 * Runs as `prebuild`, alongside scripts/copy-assets.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const DOCS = path.resolve('docs');

// Google renders both as pixel widths, so these are the conventional character
// proxies: ~580px of title and ~920px of description. Kept in step with the
// exported limits in lib/seo.ts, which is what the app itself uses.
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;
const BRAND_SUFFIX = ' | OpenObserve';

/** Mirrors composeTitle() in lib/seo.ts. */
function composeTitle(title) {
  if (/openobserve/i.test(title)) return title;
  if (title.length + BRAND_SUFFIX.length > TITLE_MAX) return title;
  return title + BRAND_SUFFIX;
}

/**
 * Frontmatter only. Line endings are normalised first: the repo has CRLF files,
 * and a trailing `\r` left on the closing quote of a value makes the YAML parser
 * reject an otherwise valid block.
 */
function frontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  return parse(text.slice(4, end)) ?? {};
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const problems = [];
const pages = walk(DOCS).sort();
const titleOwners = new Map();

for (const file of pages) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  let data;
  try {
    data = frontmatter(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    problems.push(`${rel}: frontmatter does not parse - ${error.message}`);
    continue;
  }
  if (!data) {
    problems.push(`${rel}: no frontmatter block`);
    continue;
  }

  const source = data.metaTitle ?? data.title;
  if (!source) {
    problems.push(`${rel}: no title`);
  } else {
    const rendered = composeTitle(source);
    if (rendered.length > TITLE_MAX) {
      problems.push(`${rel}: title is ${rendered.length} chars, max ${TITLE_MAX} - "${rendered}"`);
    }
    // Two pages competing on one title split their own ranking signals. This is
    // easy to reintroduce by accident because composeTitle() brands a bare
    // "Enterprise Features" into the same string a hand-written `metaTitle`
    // already spells out in full.
    titleOwners.set(rendered, [...(titleOwners.get(rendered) ?? []), rel]);
  }

  const description = data.description;
  if (!description) {
    problems.push(`${rel}: no description`);
  } else if (description.length > DESCRIPTION_MAX) {
    problems.push(`${rel}: description is ${description.length} chars, max ${DESCRIPTION_MAX}`);
  } else if (description.length < DESCRIPTION_MIN) {
    problems.push(`${rel}: description is ${description.length} chars, min ${DESCRIPTION_MIN}`);
  }
}

for (const [title, owners] of titleOwners) {
  if (owners.length > 1) {
    problems.push(`duplicate title "${title}" on ${owners.length} pages: ${owners.join(', ')}`);
  }
}

if (problems.length > 0) {
  console.error(`SEO check failed - ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    `\nTitles are capped at ${TITLE_MAX} chars and descriptions kept to ` +
      `${DESCRIPTION_MIN}-${DESCRIPTION_MAX}. Set a shorter \`metaTitle\` in the page's ` +
      `frontmatter to keep the sidebar label as it is.`
  );
  process.exit(1);
}

console.log(`SEO check passed for ${pages.length} pages.`);
