/**
 * Phase 0 — baseline capture.
 *
 * Reads the pre-migration MkDocs build in `site-baseline/` and records exactly what
 * the live site serves today. Everything the §9 verification harness asserts is
 * derived from these artefacts, so this script is the definition of "before".
 *
 *   baseline/urls.txt       every URL the current site serves
 *   baseline/anchors.json   every heading id on every page, keyed by URL
 *   baseline/links.json     every resolved outgoing href on every page
 *   baseline/images.json    every resolved <img> src on every page
 *   baseline/nav.txt        the sidebar tree, serialised
 *   baseline/pages.json     per-page title + text length (harness check 5)
 *   baseline/redirects.json the redirect stubs and their targets
 *
 * Run: npm run capture:baseline
 * Requires: python -m mkdocs build --site-dir site-baseline --clean
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import type { AnyNode, Element } from 'domhandler';
import { BASELINE_DIR, BASELINE_SITE_DIR, BASE_PATH, toPosix } from './lib/paths.mts';
import { normaliseText, parseHtml, resolveUrl, type Dom } from './lib/html.mts';

interface NavNode {
  label: string;
  href: string | null;
  children: NavNode[];
}

/** Material renders the full sidebar on every page; scrape it from a known deep
 *  page so relative-href resolution is exercised. Never 404.html — Material
 *  renders that one with absolute links. */
const NAV_PAGE = 'architecture/index.html';

/** `site-baseline/a/b/index.html` → `/docs/a/b/` */
function urlForHtmlFile(rel: string): string {
  const posix = toPosix(rel);
  if (posix === 'index.html') return `${BASE_PATH}/`;
  if (posix.endsWith('/index.html')) return `${BASE_PATH}/${posix.slice(0, -'index.html'.length)}`;
  return `${BASE_PATH}/${posix}`; // 404.html
}

function serialiseNav(nodes: NavNode[], depth = 0, out: string[] = []): string[] {
  for (const node of nodes) {
    out.push(`${'  '.repeat(depth)}- ${node.label}${node.href ? ` -> ${node.href}` : ''}`);
    serialiseNav(node.children, depth + 1, out);
  }
  return out;
}

/** Walk Material's `nav.md-nav--primary` into a label/href tree. */
function extractNav($: Dom, navEl: AnyNode, pageUrl: string): NavNode[] {
  const list = $(navEl).children('ul.md-nav__list').first();
  if (!list.length) return [];
  const items: NavNode[] = [];

  list.children('li').each((_, li) => {
    const anchor = $(li).children('a.md-nav__link').first();
    const label = $(li).children('label.md-nav__link').first();
    const childNav = $(li).children('nav.md-nav').first();

    if (anchor.length) {
      items.push({
        label: normaliseText(anchor.text()),
        href: resolveUrl(pageUrl, anchor.attr('href') ?? ''),
        children: [],
      });
      return;
    }
    if (label.length || childNav.length) {
      // The <label> also contains a decorative <span class="md-nav__icon">; take
      // the direct text nodes only so the folder title comes out clean.
      const text = label
        .contents()
        .filter((_i, n) => n.type === 'text')
        .text();
      items.push({
        label: normaliseText(text),
        href: null,
        children: childNav.length ? extractNav($, childNav[0]!, pageUrl) : [],
      });
    }
  });
  return items;
}

async function main() {
  const siteExists = await fs
    .stat(BASELINE_SITE_DIR)
    .then(() => true)
    .catch(() => false);
  if (!siteExists) {
    console.error(
      `[capture-baseline] ${BASELINE_SITE_DIR} not found.\n` +
        `Build the MkDocs baseline first:\n` +
        `  python -m mkdocs build --site-dir site-baseline --clean`,
    );
    process.exit(1);
  }

  const allFiles = (await fg('**/*', { cwd: BASELINE_SITE_DIR, onlyFiles: true })).sort();
  const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

  const urls = new Set<string>();
  const anchors: Record<string, string[]> = {};
  const links: Record<string, string[]> = {};
  const images: Record<string, string[]> = {};
  const pages: Record<string, { title: string; textLength: number }> = {};
  const redirects: Record<string, string> = {};
  const noArticle: string[] = [];

  let nav: NavNode[] = [];
  let navSource = '';

  for (const rel of htmlFiles) {
    const url = urlForHtmlFile(rel);
    urls.add(url);

    const $ = parseHtml(await fs.readFile(path.join(BASELINE_SITE_DIR, rel), 'utf8'));

    const refresh = $('meta[http-equiv="refresh"]').first();
    const article = $('article.md-content__inner').first();

    if (refresh.length && !article.length) {
      const content = refresh.attr('content') ?? '';
      redirects[url] = resolveUrl(url, content.replace(/^\s*\d+\s*;\s*url\s*=\s*/i, '').trim());
      continue;
    }

    if (toPosix(rel) === NAV_PAGE) {
      const navEl = $('nav.md-nav--primary').first();
      if (navEl.length) {
        nav = extractNav($, navEl[0]!, url);
        navSource = url;
      }
    }

    if (!article.length) {
      noArticle.push(url);
      continue;
    }

    anchors[url] = article
      .find('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
      .toArray()
      .map((h) => (h as Element).attribs.id!)
      .filter(Boolean);

    // Material injects a ¶ permalink into every heading. It is theme chrome, not a
    // content link, and it skews the text-length comparison — drop it first.
    article.find('a.headerlink').remove();

    links[url] = unique(
      article
        .find('a[href]')
        .toArray()
        .map((a) => resolveUrl(url, (a as Element).attribs.href ?? ''))
        .filter(isContentLink),
    );

    images[url] = unique(
      article
        .find('img[src]')
        .toArray()
        .map((i) => resolveUrl(url, (i as Element).attribs.src ?? '')),
    );

    pages[url] = {
      title: normaliseText($('title').first().text()),
      textLength: normaliseText(article.text()).length,
    };
  }

  // Non-HTML URLs: raw markdown endpoints, llms.txt, sitemap.xml, every asset.
  for (const rel of allFiles) {
    if (rel.endsWith('.html')) continue;
    urls.add(`${BASE_PATH}/${toPosix(rel)}`);
  }

  // Classify the non-page URLs. Rule S-3 covers everything the site serves *from
  // its own content*; it cannot sensibly cover Material's own hashed theme
  // bundles, which stop existing when Material does. The distinction is made from
  // the source tree, not by pattern-matching URLs: an asset is "content" iff a
  // file for it exists under docs/.
  const docsAssets = new Set(
    (await fg('**/*', { cwd: path.join(BASELINE_SITE_DIR, '..', 'docs'), onlyFiles: true, dot: true }))
      .filter((f) => !f.endsWith('.md') && !f.endsWith('.pages'))
      .map((f) => `${BASE_PATH}/${toPosix(f)}`),
  );

  const classified = {
    pages: [] as string[],
    redirects: Object.keys(redirects).sort(),
    rawMarkdown: [] as string[],
    contentAssets: [] as string[],
    themeAssets: [] as string[],
    special: [] as string[],
  };
  const SPECIAL = new Set([`${BASE_PATH}/llms.txt`, `${BASE_PATH}/sitemap.xml`, `${BASE_PATH}/404.html`]);

  for (const url of [...urls].sort()) {
    if (url in redirects) continue;
    if (SPECIAL.has(url)) classified.special.push(url);
    else if (url.endsWith('/') || url.endsWith('.html')) classified.pages.push(url);
    else if (url.endsWith('.md')) classified.rawMarkdown.push(url);
    else if (docsAssets.has(url)) classified.contentAssets.push(url);
    else classified.themeAssets.push(url);
  }

  await fs.mkdir(BASELINE_DIR, { recursive: true });
  const sortedUrls = [...urls].sort();
  const navLines = serialiseNav(nav);

  await write('urls.txt', sortedUrls.join('\n') + '\n');
  await writeJson('urls.json', classified);
  await write('nav.txt', navLines.join('\n') + '\n');
  await writeJson('anchors.json', anchors);
  await writeJson('links.json', links);
  await writeJson('images.json', images);
  await writeJson('pages.json', pages);
  await writeJson('redirects.json', redirects);

  console.log('[capture-baseline] wrote baseline/');
  console.table({
    'urls.txt entries': sortedUrls.length,
    'content pages': Object.keys(pages).length,
    'redirect stubs': Object.keys(redirects).length,
    'heading anchors': count(anchors),
    'content links': count(links),
    'content images': count(images),
    'nav lines': navLines.length,
    'nav scraped from': navSource,
  });
  console.table({
    'url: pages': classified.pages.length,
    'url: redirects': classified.redirects.length,
    'url: raw markdown': classified.rawMarkdown.length,
    'url: content assets': classified.contentAssets.length,
    'url: theme assets (Material-owned, not carried over)': classified.themeAssets.length,
    'url: special': classified.special.length,
  });

  if (noArticle.length) {
    console.log(
      `[capture-baseline] ${noArticle.length} page(s) render outside the standard article\n` +
        `  container (custom template) — no anchors/links recorded:\n    ${noArticle.join('\n    ')}`,
    );
  }
  if (!navLines.length) throw new Error(`[capture-baseline] no nav found in ${NAV_PAGE}`);
  if (Object.keys(redirects).length !== 6) {
    throw new Error(
      `[capture-baseline] expected 6 redirect stubs (§6.1), found ${Object.keys(redirects).length}`,
    );
  }
}

/**
 * `pymdownx.highlight` with `anchor_linenums: true` emits an `<a href="#__codelineno-N-M">`
 * for every line of every code block — 16k of them across the site. They are a
 * renderer artefact of Material, not links in the content, and Shiki has no
 * equivalent. Excluding them keeps link parity meaningful rather than
 * structurally unsatisfiable.
 */
function isContentLink(href: string): boolean {
  return !href.includes('#__codelineno-');
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((v) => v !== ''))].sort();
}
function count(map: Record<string, string[]>): number {
  return Object.values(map).reduce((n, a) => n + a.length, 0);
}
function write(name: string, content: string) {
  return fs.writeFile(path.join(BASELINE_DIR, name), content);
}
function writeJson(name: string, value: unknown) {
  return write(name, JSON.stringify(value, null, 2) + '\n');
}

await main();
