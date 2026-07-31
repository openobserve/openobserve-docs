/**
 * §7 — `/docs/sitemap.xml`, replacing the one Material generated.
 *
 * Built from the pages actually present in `out/`, so it can never claim a URL
 * the deploy does not have. URLs are absolute and carry the `/docs` prefix —
 * this is a static file, not something Next's `basePath` rewrites (§6.2).
 *
 * Material also emitted `sitemap.xml.gz`; it is not reproduced. Nothing links to
 * it, no search engine requires it, and Google stopped honouring gzipped
 * sitemaps discovered this way years ago. It is listed among the theme assets in
 * the baseline, not the content ones.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { BASE_PATH, OUT_DIR, SITE_URL, toPosix } from './lib/paths.mts';

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  );
}

async function main() {
  const pages = (await fg('**/index.html', { cwd: OUT_DIR })).sort();

  const urls = pages.map((relative) => {
    const posix = toPosix(relative);
    const directory = posix === 'index.html' ? '' : posix.slice(0, -'index.html'.length);
    return `${SITE_URL}${BASE_PATH}/${directory}`;
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`),
    '</urlset>',
    '',
  ].join('\n');

  await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), xml);
  console.log(`[gen-sitemap] ${urls.length} URL(s) → out/sitemap.xml`);
}

await main();
