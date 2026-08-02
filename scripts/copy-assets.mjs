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

// llms.txt is written here rather than after the export so that it resolves in
// `next dev` too - the root layout advertises it via <link rel="alternate">.
writeLlmsTxt();

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
// llms.txt - the section index the `mkdocs-llmstxt` plugin used to generate.
// ---------------------------------------------------------------------------
function writeLlmsTxt() {
  const SITE = 'https://openobserve.ai/docs';
  const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

  // Section layout carried over from the `llmstxt` block of mkdocs.yml.
  const SECTIONS = [
    { title: 'Getting started', patterns: ['index.md', 'getting-started.md', 'architecture.md'] },
    { title: 'User guide', patterns: ['user-guide/*.md'] },
    { title: 'Ingestion', patterns: ['ingestion/*.md'] },
    { title: 'Integrations', patterns: ['integration/*.md'] },
    { title: 'Features', patterns: ['features/*.md'] },
    { title: 'Administration', patterns: ['administration/*.md'] },
    { title: 'Reference', patterns: ['reference/*.md'] },
    { title: 'Migration', patterns: ['migration/**/*.md'] },
    { title: 'Releases', patterns: ['releases.md'] },
  ];

  /** Small glob subset: `*` matches within a segment, `**​/` any number. */
  const toRegExp = (pattern) => {
    let body = '';
    for (let i = 0; i < pattern.length; i++) {
      const rest = pattern.slice(i);
      if (rest.startsWith('**/')) {
        body += '(?:[^/]+/)*';
        i += 2;
      } else if (rest.startsWith('*')) {
        body += '[^/]*';
      } else {
        body += pattern[i].replace(/[.*+?^${}()|[\]\\]/, '\\$&');
      }
    }
    return new RegExp(`^${body}$`);
  };

  const frontmatter = (file) => {
    const m = FRONTMATTER_RE.exec(fs.readFileSync(file, 'utf8'));
    const out = {};
    if (!m) return out;
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^(title|description):\s*(.*)$/.exec(line);
      if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
    return out;
  };

  const urlFor = (rel) => {
    const slug = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
    return slug ? `${SITE}/${slug}/` : `${SITE}/`;
  };

  // Only the real sources, not the `foo/index.md` -> `foo.md` aliases.
  const pages = [];
  const collect = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const src = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(src);
      else if (entry.name.endsWith('.md')) {
        pages.push({ rel: path.relative(DOCS, src).replace(/\\/g, '/'), src });
      }
    }
  };
  collect(DOCS);

  const lines = [
    '# OpenObserve Documentation',
    '',
    '> OpenObserve (O2) is a cloud-native observability platform that unifies logs,',
    '> metrics, and traces into a single solution, built for petabyte scale with up',
    '> to 140x lower storage cost than Elasticsearch.',
    '',
  ];

  for (const section of SECTIONS) {
    const regexes = section.patterns.map(toRegExp);
    const matched = pages
      .filter((p) => regexes.some((r) => r.test(p.rel)))
      .sort((a, b) => a.rel.localeCompare(b.rel));
    if (!matched.length) continue;

    lines.push(`## ${section.title}`, '');
    for (const page of matched) {
      const fm = frontmatter(page.src);
      const description = fm.description ? `: ${fm.description}` : '';
      lines.push(`- [${fm.title || page.rel}](${urlFor(page.rel)})${description}`);
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), lines.join('\n'));
  written.push('llms.txt');
}
