/**
 * Emits the redirect stubs that replace the `mkdocs-redirects` plugin. A static
 * bucket can't issue 30x responses, so each retired URL becomes a meta-refresh
 * page carrying a canonical link to its replacement.
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
// Redirects
// ---------------------------------------------------------------------------
const REDIRECTS = {
  'administration/deployment/openobserve-enterprise-edition-installation-guide': 'enterprise-setup',
  'administration/deployment/capacity-planning': 'enterprise-setup/capacity-planning',
  'administration/deployment/performance': 'enterprise-setup/performance',
  'administration/deployment/sre-agent-setup-guide': 'enterprise-setup/sre-agent',
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
<title>Redirecting&hellip;</title>
<link rel="canonical" href="${canonical}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p>Redirecting to <a href="${target}">${canonical}</a>&hellip;</p>
<script>location.replace(${JSON.stringify(target)} + location.hash);</script>
</body>
</html>
`,
  );
}

console.log(
  `[post-export] ${Object.keys(REDIRECTS).length} redirect stubs, ` +
    `${pages.length} markdown files verified -> out/`,
);
