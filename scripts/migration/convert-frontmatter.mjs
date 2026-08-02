/**
 * One-time migration: give every page a short `title` and preserve the long
 * SEO title as `metaTitle`.
 *
 * Under MkDocs the sidebar label came from `.pages` while frontmatter `title`
 * was the long `<title>` tag (e.g. "Getting Started with OpenObserve - Cloud and
 * Self-Hosted Setup Guide | OpenObserve"). Fumadocs uses frontmatter `title` for
 * the sidebar, breadcrumbs and search, so the two need separating:
 *
 *   title:     short nav label   (sidebar / breadcrumb / search)
 *   metaTitle: original long title (rendered into <title> by generateMetadata)
 *
 * The short label is resolved, in order, from: the `.pages` nav label for the
 * file, the owning folder's title for an `index.md`, the page's first H1, and
 * finally the existing title.
 *
 * Run BEFORE convert-nav.mjs deletes the `.pages` files, or against a checkout
 * where they still exist. Usage: node scripts/migration/convert-frontmatter.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { findMarkdownFiles, buildLabelMap, buildDirTitleMap, DOCS_DIR } from './lib-pages.mjs';

const DRY = process.argv.includes('--dry');

const labels = buildLabelMap();
const dirTitles = buildDirTitleMap();

if (labels.size === 0) {
  console.error(
    'No .pages files found - run this BEFORE convert-nav.mjs, or restore them with:\n' +
      '  git checkout -- docs/',
  );
  process.exit(1);
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** First ATX H1 in the body, ignoring fenced code blocks. */
function firstHeading(body) {
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s{0,3}(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^#\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) return m[1].trim();
  }
  return null;
}

/** Strip trailing " | OpenObserve"-style site suffixes for fallback labels. */
function stripSuffix(title) {
  return title.replace(/\s*\|\s*OpenObserve\s*$/i, '').trim();
}

const stats = { labelled: 0, fromDir: 0, fromHeading: 0, unchanged: 0, missingFm: 0 };

for (const file of findMarkdownFiles()) {
  const raw = fs.readFileSync(file, 'utf8');
  const fmMatch = FRONTMATTER_RE.exec(raw);

  if (!fmMatch) {
    stats.missingFm++;
    console.warn(`  no frontmatter: ${path.relative('.', file)}`);
    continue;
  }

  const body = raw.slice(fmMatch[0].length);
  const data = YAML.parse(fmMatch[1]) ?? {};
  const originalTitle = typeof data.title === 'string' ? data.title.trim() : null;

  // Resolve the short sidebar label.
  let short = labels.get(file) ?? null;
  if (short) stats.labelled++;

  if (!short && path.basename(file) === 'index.md') {
    const dirTitle = dirTitles.get(path.dirname(file));
    if (dirTitle) {
      short = dirTitle;
      stats.fromDir++;
    }
  }
  if (!short) {
    const heading = firstHeading(body);
    if (heading) {
      short = heading;
      stats.fromHeading++;
    }
  }
  if (!short) {
    short = originalTitle ? stripSuffix(originalTitle) : path.basename(file, '.md');
    stats.unchanged++;
  }

  // Rebuild frontmatter with a stable key order, dropping the MkDocs-only
  // `template` key (the custom landing template is gone).
  const rest = { ...data };
  delete rest.title;
  delete rest.description;
  delete rest.template;

  const next = { title: short };
  if (originalTitle && originalTitle !== short) next.metaTitle = originalTitle;
  if (data.description !== undefined) next.description = data.description;
  Object.assign(next, rest);

  const yaml = YAML.stringify(next, { lineWidth: 0 }).trimEnd();
  const out = `---\n${yaml}\n---\n${body.startsWith('\n') ? body : '\n' + body}`;

  if (!DRY) fs.writeFileSync(file, out);
}

console.log(`
frontmatter rewritten under ${DOCS_DIR}${DRY ? ' (dry run)' : ''}
  title from .pages label : ${stats.labelled}
  title from folder title : ${stats.fromDir}
  title from first H1     : ${stats.fromHeading}
  title kept as-is        : ${stats.unchanged}
  files without frontmatter: ${stats.missingFm}
`);
