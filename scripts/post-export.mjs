/**
 * Post-export steps that need the finished `out/` directory:
 *
 *  1. `sitemap.xml` - MkDocs generated one automatically, and
 *     https://openobserve.ai/sitemap-index.xml points straight at
 *     https://openobserve.ai/docs/sitemap.xml. Without this the deploy's
 *     `aws s3 sync --delete` would remove the existing file and break the
 *     discovery path for every docs page.
 *  2. Redirect stubs replacing the `mkdocs-redirects` plugin. A static bucket
 *     can't issue 30x responses, so each retired URL becomes a meta-refresh page
 *     carrying a canonical link to its replacement.
 *  3. A gzipped copy of the search index, which the deploy uploads in place of
 *     the raw one. CloudFront only auto-compresses objects under 10 MB and the
 *     index is ~37 MB, so without this every visitor who opens search downloads
 *     the whole thing uncompressed.
 *
 * Everything else the old MkDocs hooks produced - the raw Markdown from
 * `hooks/llm_markdown.py` and the `llms.txt` index - is written by
 * scripts/copy-assets.mjs instead, via `public/`, so that it resolves in
 * `next dev` too and not only in the export.
 *
 * Runs as `postbuild`, against `out/`.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const DOCS = path.resolve('docs');
const OUT = path.resolve('out');
const BASE_PATH = '/docs';
const SITE = `https://openobserve.ai${BASE_PATH}`;

if (!fs.existsSync(OUT)) {
  console.error('[post-export] out/ not found - run `next build` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Collect the Markdown sources, purely to verify they reached the export.
// ---------------------------------------------------------------------------
const pages = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(src);
      continue;
    }
    if (!entry.name.endsWith('.md')) continue;
    pages.push({ rel: path.relative(DOCS, src).replace(/\\/g, '/'), src });
  }
}
walk(DOCS);

// Guard against the raw Markdown silently disappearing from the export: it is
// copied via public/ by scripts/copy-assets.mjs, several steps earlier.
const missing = pages.filter((p) => !fs.existsSync(path.join(OUT, p.rel)));
if (missing.length) {
  console.error(
    `[post-export] ${missing.length} markdown file(s) missing from out/, ` +
      `e.g. ${missing[0].rel}. Did scripts/copy-assets.mjs run?`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. sitemap.xml
//
// One <url> per rendered page, using the same trailing-slash URLs as the
// canonical tags. Redirect stubs and the 404 are excluded: they are noindex, and
// listing a redirect in a sitemap is a crawl error.
// ---------------------------------------------------------------------------
const REDIRECT_PATHS = new Set([
  'administration/deployment/openobserve-enterprise-edition-installation-guide',
  'administration/deployment/capacity-planning',
  'administration/deployment/performance',
  'administration/deployment/sre-agent-setup-guide',
  'user-guide/rum',
  'quickstart',
  'downloads',
]);

/** Last commit date for a docs file, as YYYY-MM-DD; null outside a git checkout. */
function lastModified(relMarkdown) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', `docs/${relMarkdown}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

const sitemapEntries = [];
for (const page of pages) {
  const slug = page.rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  if (REDIRECT_PATHS.has(slug)) continue;
  const loc = slug ? `${SITE}/${slug}/` : `${SITE}/`;
  sitemapEntries.push({ loc, lastmod: lastModified(page.rel) });
}
sitemapEntries.sort((a, b) => a.loc.localeCompare(b.loc));

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapEntries
    .map(
      (e) =>
        '    <url>\n' +
        `         <loc>${e.loc}</loc>\n` +
        (e.lastmod ? `         <lastmod>${e.lastmod}</lastmod>\n` : '') +
        '    </url>',
    )
    .join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
// MkDocs also published a gzipped copy; kept so existing references resolve.
fs.writeFileSync(path.join(OUT, 'sitemap.xml.gz'), zlib.gzipSync(sitemap));

// ---------------------------------------------------------------------------
// 2. Redirects
// ---------------------------------------------------------------------------
const REDIRECTS = {
  'administration/deployment/openobserve-enterprise-edition-installation-guide': 'enterprise-setup',
  'administration/deployment/capacity-planning': 'enterprise-setup/capacity-planning',
  'administration/deployment/performance': 'enterprise-setup/performance',
  'administration/deployment/sre-agent-setup-guide': 'enterprise-setup/sre-agent',
  'user-guide/rum': 'user-guide/data-exploration/rum',
  quickstart: 'getting-started',
  downloads: 'getting-started',
};

for (const [from, to] of Object.entries(REDIRECTS)) {
  // The hop itself is root-relative so it stays on whatever host is serving the
  // page: an old URL on staging must land on staging, not bounce to production.
  // Only the canonical is absolute, because that has to name the real page.
  const target = `${BASE_PATH}/${to}/`;
  const canonical = `${SITE}/${to}/`;
  const dest = path.join(OUT, from, 'index.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(
    dest,
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page moved &ndash; OpenObserve Documentation</title>
<link rel="canonical" href="${canonical}">
<meta name="robots" content="noindex">
<meta name="description" content="This documentation page has moved. You are being redirected to its new location.">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<h1>This page has moved</h1>
<p>Redirecting to <a href="${target}">${canonical}</a>&hellip;</p>
<script>location.replace(${JSON.stringify(target)} + location.hash);</script>
</body>
</html>
`,
  );
}

// ---------------------------------------------------------------------------
// 3. Search index
//
// `app/api/search.json/route.ts` exports the prebuilt index here. The name has
// to keep its extension: the CloudFront Function in front of the bucket 301s
// every extension-less path to its trailing-slash form, which for the old
// `/docs/api/search` meant a redirect to a directory with no `index.html` - the
// 404 page - and search failed to load entirely. Fail the build rather than
// ship an export whose search cannot work.
// ---------------------------------------------------------------------------
const SEARCH_INDEX = path.join(OUT, 'api', 'search.json');

if (!fs.existsSync(SEARCH_INDEX)) {
  console.error(
    '[post-export] out/api/search.json not found. The search route must export ' +
      'to a path with a file extension - see app/api/search.json/route.ts.',
  );
  process.exit(1);
}

// Uploaded by the deploy as `api/search.json` with `Content-Encoding: gzip`;
// browsers decode it transparently. CloudFront's own compression stops at
// 10 MB, so this is the only thing keeping the download off ~37 MB.
const rawIndex = fs.readFileSync(SEARCH_INDEX);
const gzippedIndex = zlib.gzipSync(rawIndex, { level: 9 });
fs.writeFileSync(`${SEARCH_INDEX}.gz`, gzippedIndex);

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

console.log(
  `[post-export] sitemap.xml (${sitemapEntries.length} urls), ` +
    `${Object.keys(REDIRECTS).length} redirect stubs, ` +
    `${pages.length} markdown files verified, ` +
    `search.json.gz (${mb(rawIndex.length)} -> ${mb(gzippedIndex.length)}) -> out/`,
);
