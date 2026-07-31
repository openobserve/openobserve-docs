/**
 * Post-processing for the static export, reproducing three MkDocs behaviours
 * that Next has no equivalent for.
 *
 *  1. Raw Markdown alongside the HTML — the `hooks/llm_markdown.py` hook, so
 *     /docs/<page>.md keeps resolving for LLM crawlers and the "Copy page" menu.
 *  2. `llms.txt` — the `mkdocs-llmstxt` plugin's section index.
 *  3. Redirects — the `mkdocs-redirects` plugin. A static bucket can't issue
 *     30x responses, so each old URL becomes a meta-refresh stub carrying a
 *     canonical link to the new page.
 *
 * Runs as `postbuild`, against `out/`.
 */
import fs from 'node:fs';
import path from 'node:path';

const DOCS = path.resolve('docs');
const OUT = path.resolve('out');
const SITE = 'https://openobserve.ai/docs';

if (!fs.existsSync(OUT)) {
  console.error('[post-export] out/ not found - run `next build` first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Raw Markdown
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

    const rel = path.relative(DOCS, src).replace(/\\/g, '/');
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);

    // `foo/index.md` is also published as `foo.md`, matching the MkDocs hook.
    if (path.basename(rel) === 'index.md' && rel !== 'index.md') {
      fs.copyFileSync(src, path.join(OUT, rel.replace(/\/index\.md$/, '.md')));
    }
    pages.push({ rel, src });
  }
}
walk(DOCS);

// ---------------------------------------------------------------------------
// 2. llms.txt
// ---------------------------------------------------------------------------
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

/** Minimal frontmatter read: only the scalar keys we need. */
function frontmatter(file) {
  const m = FRONTMATTER_RE.exec(fs.readFileSync(file, 'utf8'));
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(title|metaTitle|description):\s*(.*)$/.exec(line);
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

/** Page URL for a docs-relative Markdown path. */
function urlFor(rel) {
  const slug = rel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
  return slug ? `${SITE}/${slug}/` : `${SITE}/`;
}

// Section layout copied from the `llmstxt` block of mkdocs.yml.
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

function toRegExp(pattern) {
  // Small glob subset: `*` matches inside one path segment, `**/` any number.
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
}

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
    const title = fm.title || page.rel;
    const description = fm.description ? `: ${fm.description}` : '';
    lines.push(`- [${title}](${urlFor(page.rel)})${description}`);
  }
  lines.push('');
}

fs.writeFileSync(path.join(OUT, 'llms.txt'), lines.join('\n'));

// ---------------------------------------------------------------------------
// 3. Redirects
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
  const target = `${SITE}/${to}/`;
  const dest = path.join(OUT, from, 'index.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(
    dest,
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting&hellip;</title>
<link rel="canonical" href="${target}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
</head>
<body>
<p>Redirecting to <a href="${target}">${target}</a>&hellip;</p>
<script>location.replace(${JSON.stringify(target)} + location.hash);</script>
</body>
</html>
`,
  );
}

console.log(
  `[post-export] ${pages.length} markdown files, llms.txt, ` +
    `${Object.keys(REDIRECTS).length} redirect stubs -> out/`,
);
