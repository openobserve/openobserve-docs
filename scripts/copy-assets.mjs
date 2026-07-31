/**
 * Mirrors every non-Markdown file from `docs/` into `public/`, preserving paths.
 *
 * MkDocs served images from alongside the Markdown. Next serves static files
 * from `public/`, so `docs/images/logo.png` has to become `public/images/logo.png`
 * — which, under `basePath: '/docs'`, is served back at `/docs/images/logo.png`.
 * That is exactly the URL lib/remark/docs-images.ts rewrites image paths to.
 *
 * Copies are skipped when the destination is already newer, so repeat builds and
 * `next dev` restarts stay fast despite the ~350 MB of images.
 */
import fs from 'node:fs';
import path from 'node:path';

const DOCS = path.resolve('docs');
const PUBLIC = path.resolve('public');

// Managed by this script; listed in .gitignore.
const MANIFEST = path.join(PUBLIC, '.copied-assets.json');

let copied = 0;
let skipped = 0;
const written = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(src);
      continue;
    }
    // Markdown is compiled by Fumadocs; meta.json drives the sidebar.
    if (entry.name.endsWith('.md') || entry.name === 'meta.json') continue;

    const rel = path.relative(DOCS, src);
    const dest = path.join(PUBLIC, rel);
    written.push(rel);

    const srcStat = fs.statSync(src);
    let destStat = null;
    try {
      destStat = fs.statSync(dest);
    } catch {
      // not copied yet
    }
    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs && destStat.size === srcStat.size) {
      skipped++;
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied++;
  }
}

fs.mkdirSync(PUBLIC, { recursive: true });
walk(DOCS);

// Remove files that were copied by a previous run but no longer exist in docs/.
let removed = 0;
if (fs.existsSync(MANIFEST)) {
  const previous = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const current = new Set(written);
  for (const rel of previous) {
    if (current.has(rel)) continue;
    const stale = path.join(PUBLIC, rel);
    if (fs.existsSync(stale)) {
      fs.rmSync(stale);
      removed++;
    }
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(written.sort(), null, 0));

console.log(
  `[copy-assets] ${copied} copied, ${skipped} up to date, ${removed} removed -> public/`,
);
