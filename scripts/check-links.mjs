/**
 * Fails the build on internal links that 404 in the exported site.
 *
 * This runs against `out/`, not the Markdown sources, because two of the three
 * failure modes are invisible earlier:
 *
 *   - A link written inside a heading is copied into the table of contents as a
 *     bare <a>, bypassing next/link and so never getting the /docs basePath.
 *     The remark stage sees a correct link; the render is what breaks it.
 *   - Fully-qualified https://openobserve.ai/docs/... links are left alone by
 *     remarkMkdocsLinks, so a page move never updates them.
 *
 * The third — a relative link to a file that does not exist — is caught by
 * `onBrokenLink` too, but is cheap to re-check here and keeps one report.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
const BASE_PATH = '/docs';
const SITE_HOST = 'openobserve.ai';

if (!fs.existsSync(OUT)) {
  console.error(`check-links: ${OUT} does not exist — run the export first.`);
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(OUT);

/** Every path the export can serve, normalised without a trailing slash. */
const served = new Set();
for (const file of files) {
  const rel = path.relative(OUT, file).replace(/\\/g, '/');
  served.add(`${BASE_PATH}/${rel}`);
  if (rel === 'index.html') served.add(BASE_PATH);
  else if (rel.endsWith('/index.html')) {
    served.add(`${BASE_PATH}/${rel.slice(0, -'/index.html'.length)}`);
  }
}

const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const resolves = (p) => served.has(norm(p)) || served.has(`${norm(p)}.html`);

// Bounded and lazy so a 250 KB single-line document cannot make this quadratic.
const ANCHOR = /<a\b[^>]{0,600}?href="([^"]{0,600})"/gi;

const broken = new Map(); // "class\ttarget" -> Set of pages
function report(kind, target, page) {
  const key = `${kind}\t${target}`;
  if (!broken.has(key)) broken.set(key, new Set());
  broken.get(key).add(page);
}

let checked = 0;
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(OUT, file).replace(/\\/g, '/');
  const pageUrl = norm(`${BASE_PATH}/${rel.replace(/(^|\/)index\.html$/, '')}`);

  for (const match of html.matchAll(ANCHOR)) {
    const href = match[1];
    if (!href || href.startsWith('#')) continue;
    if (/^(mailto:|tel:|data:|javascript:)/i.test(href)) continue;
    checked++;

    const bare = href.split('#')[0].split('?')[0];
    if (!bare) continue;

    if (/^https?:\/\//i.test(href)) {
      let url;
      try {
        url = new URL(href);
      } catch {
        report('malformed URL', href, pageUrl);
        continue;
      }
      // Only our own docs paths are checkable; the marketing site and third
      // parties are out of scope for a static check.
      if (url.hostname !== SITE_HOST && !url.hostname.endsWith(`.${SITE_HOST}`)) continue;
      if (url.pathname !== BASE_PATH && !url.pathname.startsWith(`${BASE_PATH}/`)) continue;
      if (!resolves(url.pathname)) report('stale absolute URL', url.pathname, pageUrl);
      continue;
    }

    if (bare.startsWith('//')) continue; // protocol-relative, external

    if (bare.startsWith('/')) {
      // A root-relative link that is not under basePath lands on the marketing
      // site. This is what a link inside a heading produces.
      if (bare !== BASE_PATH && !bare.startsWith(`${BASE_PATH}/`)) {
        report(`missing ${BASE_PATH} basePath`, bare, pageUrl);
      } else if (!resolves(bare)) {
        report('broken root-relative link', bare, pageUrl);
      }
      continue;
    }

    const resolved = norm(path.posix.resolve(pageUrl, bare));
    if (!resolves(resolved)) report('unresolved relative link', `${bare} -> ${resolved}`, pageUrl);
  }
}

if (broken.size === 0) {
  console.log(`check-links: ${checked} links checked, no broken internal links.`);
  process.exit(0);
}

console.error(`\ncheck-links: ${broken.size} broken internal link target(s):\n`);
const byKind = new Map();
for (const [key, pages] of broken) {
  const [kind, target] = key.split('\t');
  if (!byKind.has(kind)) byKind.set(kind, []);
  byKind.get(kind).push([target, pages]);
}
for (const [kind, entries] of [...byKind.entries()].sort()) {
  console.error(`  ${kind} (${entries.length}):`);
  for (const [target, pages] of entries.sort()) {
    console.error(`    ${target}`);
    for (const page of [...pages].sort().slice(0, 5)) console.error(`        on ${page}`);
    if (pages.size > 5) console.error(`        ...and ${pages.size - 5} more page(s)`);
  }
}
console.error('');
process.exit(1);
