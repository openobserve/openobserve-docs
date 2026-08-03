/**
 * Mirrors `docs/` into `public/`, preserving paths.
 *
 * MkDocs served images from alongside the Markdown. Next serves static files
 * from `public/`, so `docs/images/logo.png` has to become `public/images/logo.png`
 * — which, under `basePath: '/docs'`, is served back at `/docs/images/logo.png`.
 * That is exactly the URL lib/remark/docs-images.ts rewrites image paths to.
 *
 * The Markdown sources are mirrored too, so `/docs/<page>.md` resolves in `next
 * dev` as well as in the export — that is what the "View as Markdown" and "Copy
 * page" actions fetch.
 *
 * Copies are skipped when the destination is already newer, so repeat builds and
 * `next dev` restarts stay fast despite the ~350 MB of images.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const DOCS = path.resolve('docs');
const PUBLIC = path.resolve('public');

// Managed by this script; listed in .gitignore.
const MANIFEST = path.join(PUBLIC, '.copied-assets.json');

const SITE_URL = 'https://openobserve.ai';
const SITE = `${SITE_URL}/docs`;

/**
 * Section layout for llms.txt, carried over from the `llmstxt` block of mkdocs.yml.
 *
 * The patterns are `**​/*.md`, not `*.md`. The MkDocs config used single-star
 * globs, which do not cross a `/`, so `user-guide/*.md` matched 4 of the 156
 * pages under `user-guide/` and the published index described 34 of 455 pages.
 * `overview/` and `enterprise-setup/` had no entry at all. bucketBySection()
 * now fails the build if any page falls outside every pattern.
 */
const SECTIONS = [
  {
    title: 'Getting started',
    patterns: ['index.md', 'getting-started.md', 'architecture.md', 'screenshots.md'],
  },
  { title: 'Overview', patterns: ['overview/**/*.md'] },
  { title: 'User guide', patterns: ['user-guide/**/*.md'] },
  { title: 'Ingestion', patterns: ['ingestion/**/*.md'] },
  { title: 'Integrations', patterns: ['integration/**/*.md'] },
  { title: 'Features', patterns: ['features/**/*.md'] },
  { title: 'Enterprise setup', patterns: ['enterprise-setup/**/*.md'] },
  { title: 'Administration', patterns: ['administration/**/*.md'] },
  { title: 'Reference', patterns: ['reference/**/*.md'] },
  { title: 'Migration', patterns: ['migration/**/*.md'] },
  { title: 'Releases', patterns: ['releases.md'] },
];

/** Shared blockquote summary, the one thing both llms files open with. */
const SUMMARY = [
  'OpenObserve (O2) is a cloud-native observability platform that unifies logs,',
  'metrics, and traces into a single solution, built for petabyte scale with up',
  'to 140x lower storage cost than Elasticsearch.',
];

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
    // meta.json only drives the sidebar; it is not part of the published site.
    if (entry.name === 'meta.json') continue;

    const rel = path.relative(DOCS, src).replace(/\\/g, '/');
    copy(src, rel);

    // Markdown is also published verbatim, so /docs/<page>.md keeps resolving
    // for LLM crawlers and the "View as Markdown" action. `foo/index.md` gets a
    // `foo.md` alias too, matching the old MkDocs hooks/llm_markdown.py.
    if (rel.endsWith('/index.md')) copy(src, rel.replace(/\/index\.md$/, '.md'));
  }
}

/** Copy one file into public/, skipping it when the destination is current. */
function copy(src, rel) {
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
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  copied++;
}

fs.mkdirSync(PUBLIC, { recursive: true });
walk(DOCS);

// llms.txt and llms-full.txt are written here rather than after the export so
// that they resolve in `next dev` too - the root layout advertises the index via
// <link rel="alternate">.
const llmPages = collectPages();
writeLlmsTxt(llmPages);
writeLlmsFullTxt(llmPages);

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

// ---------------------------------------------------------------------------
// Shared page collection
// ---------------------------------------------------------------------------

/**
 * Every Markdown source under `docs/`, with its frontmatter parsed.
 *
 * Only the real sources, not the `foo/index.md` -> `foo.md` aliases `walk()`
 * also publishes: an alias is the same page under a second URL, and listing it
 * twice would tell an LLM the corpus is bigger than it is.
 */
function collectPages() {
  const pages = [];
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const src = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(src);
      else if (entry.name.endsWith('.md')) {
        const rel = path.relative(DOCS, src).replace(/\\/g, '/');
        const raw = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
        pages.push({ rel, src, ...splitFrontmatter(raw) });
      }
    }
  };
  collect(DOCS);
  pages.sort((a, b) => a.rel.localeCompare(b.rel));
  return pages;
}

/**
 * Splits a source file into `{ data, body }`.
 *
 * Parsed with the real YAML parser rather than a line regex: descriptions
 * routinely contain colons ("Streams: ingestion, storage, and querying"), which
 * a `^(title|description):\s*(.*)$` match truncates at the wrong place. Line
 * endings are normalised by the caller — a trailing `\r` on a quoted value makes
 * the parser reject an otherwise valid block. Same handling as
 * scripts/check-seo.mjs, which is what gates these fields at build time.
 */
function splitFrontmatter(text) {
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: text };
  let data = {};
  try {
    data = parseYaml(text.slice(4, end)) ?? {};
  } catch {
    // check-seo.mjs fails the build on unparseable frontmatter; degrade here.
  }
  return { data, body: text.slice(end + 4).replace(/^\n+/, '') };
}

/** Public URL for a docs-relative path, e.g. `user-guide/streams/index.md`. */
function urlFor(rel) {
  const slug = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  return slug ? `${SITE}/${slug}/` : `${SITE}/`;
}

// ---------------------------------------------------------------------------
// llms.txt - the section index the `mkdocs-llmstxt` plugin used to generate.
// Section layout is in SECTIONS, at the top of this file.
// ---------------------------------------------------------------------------

/** Small glob subset: a single star matches within a segment, a double star any number. */
function toRegExp(pattern) {
  let body = '';
  for (let i = 0; i < pattern.length; i++) {
    const rest = pattern.slice(i);
    if (rest.startsWith('**/')) {
      body += '(?:[^/]+/)*';
      i += 2;
    } else if (rest.startsWith('*')) {
      body += '[^/]*';
    } else {
      body += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${body}$`);
}

/**
 * Buckets every page into its section, and fails if any page falls outside all
 * of them.
 *
 * The guard is the point: the previous index lost 92% of the corpus silently,
 * because nothing checked that the globs still matched the tree they were
 * written against. A new top-level directory or a new root-level `.md` now stops
 * the build instead of quietly going unpublished.
 */
function bucketBySection(pages) {
  const compiled = SECTIONS.map((s) => ({ ...s, regexes: s.patterns.map(toRegExp) }));
  const buckets = new Map(compiled.map((s) => [s.title, []]));
  const orphans = [];

  for (const page of pages) {
    const section = compiled.find((s) => s.regexes.some((r) => r.test(page.rel)));
    if (section) buckets.get(section.title).push(page);
    else orphans.push(page.rel);
  }

  if (orphans.length > 0) {
    console.error(
      `[copy-assets] ${orphans.length} page(s) match no llms.txt section, so they ` +
        `would be missing from the published index:\n` +
        orphans.map((o) => `  docs/${o}`).join('\n') +
        `\n\nAdd a section (or a pattern) for them in SECTIONS, in this file.`,
    );
    process.exit(1);
  }

  return compiled.map((s) => ({ title: s.title, pages: buckets.get(s.title) }));
}

function writeLlmsTxt(pages) {
  const lines = ['# OpenObserve Documentation', '', ...SUMMARY.map((l) => `> ${l}`), ''];

  for (const section of bucketBySection(pages)) {
    if (section.pages.length === 0) continue;
    lines.push(`## ${section.title}`, '');
    for (const page of section.pages) {
      const title = page.data.title || page.rel;
      const description = page.data.description ? `: ${page.data.description}` : '';
      lines.push(`- [${title}](${urlFor(page.rel)})${description}`);
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), lines.join('\n'));
  written.push('llms.txt');
  return lines.length;
}

// ---------------------------------------------------------------------------
// llms-full.txt - every page's text in one file.
//
// llms.txt is an index of URLs; a model still has to fetch 455 of them to answer
// anything. This is the corpus itself, so a single retrieval covers the whole
// product. The marketing site at the domain root publishes the equivalent.
// ---------------------------------------------------------------------------

function writeLlmsFullTxt(pages) {
  const parts = [
    '# OpenObserve Documentation - full text',
    '',
    ...SUMMARY.map((l) => `> ${l}`),
    '',
    `This file contains the full text of all ${pages.length} documentation pages.`,
    'Each page is introduced by its title and canonical URL; cite the URL, not this file.',
    '',
  ];

  for (const page of pages) {
    parts.push(
      '---',
      '',
      `# ${page.data.title || page.rel}`,
      '',
      `Source: ${urlFor(page.rel)}`,
      ...(page.data.description ? ['', page.data.description] : []),
      '',
      absolutiseLinks(stripChildPages(stripComments(stripLeadingH1(page.body))), page.rel).trim(),
      '',
    );
  }

  fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), parts.join('\n'));
  written.push('llms-full.txt');
}

/**
 * Drops the body's own `# Heading` when it opens the page.
 *
 * 324 of the 455 pages carry one and 131 do not (Material for MkDocs injected
 * `<h1>{{ page.title }}</h1>` for those). Since every entry here gets a `# title`
 * of its own, leaving the authored one in place would give a third of the file
 * doubled headings and push each page's real sections down a level relative to
 * the rest.
 */
function stripLeadingH1(body) {
  return body.replace(/^#\s+.*\n+/, '');
}

/**
 * Removes the `::child-pages` block.
 *
 * The directive renders a list of the section's child pages (see
 * components/child-pages.tsx), which is navigation, not content — and in this
 * file every one of those children's full text follows inline anyway, so the
 * list would only restate what the reader already has. Reproducing it here would
 * also mean a second implementation of the page-tree walk, in a build script
 * that cannot see the page tree, free to drift from the component.
 *
 * The heading goes with it: left behind, `## In this section` would introduce
 * nothing.
 */
function stripChildPages(body) {
  return body
    .replace(/^#{2,6}[^\n]*\n+::child-pages[ \t]*$/gm, '')
    .replace(/^::child-pages[ \t]*$/gm, '');
}

/**
 * Removes HTML comments, outside fenced code.
 *
 * MDX drops them, so they are invisible on the site — but a line-oriented reader
 * of this file would treat them as prose. `o2-operator-overview.md` carries a
 * commented-out link block pointing at pages that do not exist (`PRD.md`,
 * `samples/`), which is exactly the sort of thing a model would otherwise
 * surface as a real citation. Fences are preserved: `<!-- -->` inside an HTML or
 * XML sample is content the reader is meant to see.
 */
function stripComments(body) {
  let inFence = false;
  let inComment = false;
  const kept = [];

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      kept.push(line);
      continue;
    }
    if (inFence) {
      kept.push(line);
      continue;
    }

    // Single-line comments first, so `a <!-- b --> c` keeps "a  c".
    let text = line.replace(/<!--[\s\S]*?-->/g, '');
    if (inComment) {
      const close = text.indexOf('-->');
      if (close === -1) continue;
      text = text.slice(close + 3);
      inComment = false;
    }
    const open = text.indexOf('<!--');
    if (open !== -1) {
      text = text.slice(0, open);
      inComment = true;
    }
    if (text.trim() || !line.trim()) kept.push(text);
  }

  return kept.join('\n');
}

/**
 * Rewrites relative links and images to absolute URLs.
 *
 * Concatenating 455 files collapses the directory structure every relative link
 * was written against, so `[Vector](../logs/vector.md)` resolves against nothing
 * and `../images/foo.png` points outside the document. Mirrors the resolution in
 * lib/remark/mkdocs-links.ts and lib/remark/docs-images.ts, which do the same job
 * for the rendered HTML — kept as a separate implementation because those are TS
 * modules in the Next build and this is a plain script run by node.
 *
 * Fenced code is skipped: a shell or JSON sample is not a link, and rewriting
 * inside one would corrupt a command the reader is meant to copy.
 */
function absolutiseLinks(body, rel) {
  const fromDir = path.posix.dirname(rel);
  const pageUrl = urlFor(rel);

  const resolve = (href) => {
    // Fully-qualified URLs and mailto: are already absolute.
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
    // A bare fragment refers to this page, which has a URL of its own here.
    if (href.startsWith('#')) return `${pageUrl}${href}`;
    // Root-absolute links are the marketing site (`/pricing/`) or, less often,
    // an already-prefixed docs path. Both hang off the same origin.
    if (href.startsWith('/')) return `${SITE_URL}${href}`;

    const hashAt = href.indexOf('#');
    const hash = hashAt === -1 ? '' : href.slice(hashAt);
    const target = hashAt === -1 ? href : href.slice(0, hashAt);
    if (!target) return `${pageUrl}${hash}`;

    const resolved = path.posix.normalize(path.posix.join(fromDir, target));
    // Escapes docs/ - a broken link in the source. Leave it visibly as authored
    // rather than inventing a URL for it; lib/remark/mkdocs-links.ts reports
    // these separately.
    if (resolved.startsWith('..')) return href;

    // Pages become directory URLs; assets keep their extension and their path.
    return resolved.endsWith('.md')
      ? `${urlFor(resolved)}${hash}`
      : `${SITE}/${resolved}${hash}`;
  };

  // The text group allows one level of balanced brackets: link labels and alt
  // text in this corpus contain them ("[data[0]]", "Alert if avg of [column]"),
  // and a plain `[^\]]*` stops at the inner `]` and skips the link entirely.
  // The two alternatives cannot match the same first character, so there is no
  // backtracking ambiguity.
  const LINK_RE = /(!?)\[((?:[^[\]]|\[[^[\]]*\])*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g;

  let inFence = false;
  return body
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(
        LINK_RE,
        (_m, bang, text, href, title) => `${bang}[${text}](${resolve(href)}${title ?? ''})`,
      );
    })
    .join('\n');
}
