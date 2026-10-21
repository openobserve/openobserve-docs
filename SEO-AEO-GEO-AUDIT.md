# OpenObserve Docs — SEO / AEO / GEO Audit

**Project:** `openobserve-docs` (Fumadocs 16.14 + Next 16.2, `output: 'export'`, `basePath: /docs`)
**Audited:** 2026-08-03
**Method:** static inspection of `app/`, `lib/`, `components/`, `scripts/`, `source.config.ts`, all 455 Markdown sources under `docs/`, and the committed static export in `out/` (464 HTML pages).

Every number in this document was measured against the actual repo or the actual build output. Where a claim could not be verified from the codebase (real Core Web Vitals field data, live crawl behaviour), it is labelled as such rather than asserted.

---

## Overall Scores

| Dimension | Score | One-line rationale |
|---|---|---|
| **SEO** | **78 / 100** | Metadata, canonicals, sitemap and structured data are excellent and build-enforced; the crawl graph and image weight are the drags. |
| **AEO** | **62 / 100** | Per-page Markdown alternates and freshness dates are ahead of the field; question-shaped content, FAQ/HowTo markup and E-E-A-T signals are absent. |
| **GEO** | **65 / 100** | Strong JSON-LD and machine-readable Markdown; `llms.txt` covers 7% of the corpus and the HTML has no semantic landmarks. |
| **Fumadocs Best Practices** | **85 / 100** | Idiomatic and well-documented use of nearly every relevant API; misses `footer` (prev/next), page `icon`, and silently drops `keywords`. |

### Measured baseline

| Metric | Value |
|---|---|
| Markdown pages | 455 |
| Exported HTML pages | 464 (455 docs + 7 redirect stubs + 404 + `_not-found`) |
| Pages with `title` frontmatter | 455 / 455 (100%) |
| Pages with `description` frontmatter | 455 / 455 (100%) |
| Pages with a hand-tuned `metaTitle` | 203 / 455 (45%) |
| Description length | min 72, avg 132, max 160 chars — all inside the 70–160 gate |
| Title length after brand suffix | max 60 chars — all inside the gate |
| Duplicate rendered titles | 0 (build-enforced) |
| Pages with >1 `<h1>` | 0 |
| Pages with a heading-level skip (h2→h4) | 0 |
| Broken internal links in the export | **33 distinct targets** — see the correction note below |
| Images without `alt` | 4 of 935 (0.4%) |
| Code blocks without a language | 274 of 1,791 (15%) |
| Pages containing tables | 202 (4,252 table rows) |
| Pages with numbered step lists | 290 |
| `sitemap.xml` URLs | 455, all with `<lastmod>` |
| `llms.txt` entries | **34 of 455 (7.5%)** |
| Pages with zero outbound internal links | **138 of 455 (30%)** |
| Unique internal doc links in a leaf page's HTML | **8** |
| Thin pages (<150 words of body) | 80 |
| Question-style headings | 223 of 4,242 (5.3%) |
| `public/images` weight | 267 MB; 207 files >500 KB, 18 >1 MB; only 18 WebP |
| JS chunks shipped | 1.4 MB total, largest 224 KB |
| Search index | 36.4 MB raw → 4.5 MB gzip |

---

## ✅ Already Implemented

### Fumadocs

- **`defineDocs` with a custom dir and schema** — [source.config.ts](source.config.ts). Content stays in `docs/` as `.md`; `frontmatterSchema` is extended with `metaTitle` so the long MkDocs `<title>` survives alongside the short sidebar label.
- **Meta collection** — `meta: { files: ['**/meta.json'] }`; 82 `meta.json` files drive the sidebar, migrated from MkDocs `.pages`.
- **`lastModified: true`** — per-page git mtime, and all three CI workflows check out with `fetch-depth: 0` so the dates actually resolve ([.github/workflows/](.github/workflows/)).
- **`loader()` with a `basePath`-aware `baseUrl`** — [lib/source.ts](lib/source.ts). `baseUrl: '/'` because `next/link` prepends `/docs` itself; the reasoning is documented so it does not get "fixed" into `/docs/docs/...`.
- **`generateStaticParams` + `generateMetadata`** — [app/[[...slug]]/page.tsx:93-139](app/%5B%5B...slug%5D%5D/page.tsx#L93-L139). Full static metadata per page.
- **`DocsPage` / `DocsBody` / `DocsLayout` / `RootProvider`** — idiomatic layout composition, with `full` + `tableOfContent: { enabled: false }` on the landing route only.
- **Table of contents** — generated from `page.data.toc`, rendered as "On this page" on every non-landing page; verified present in the export.
- **Breadcrumbs** — `getBreadcrumbItems` from `fumadocs-core/breadcrumb`, and the *same* trail is reused to build the `BreadcrumbList` JSON-LD so the rendered and structured versions cannot drift ([app/[[...slug]]/page.tsx:30-35](app/%5B%5B...slug%5D%5D/page.tsx#L30-L35)).
- **Missing-H1 fallback** — 131 pages carry no `# H1` (Material for MkDocs injected one). The page detects `toc.some(d === 1)` and renders `<h1>{title}</h1>` inside `DocsBody` so prose styling matches. Result: every one of 464 pages has exactly one `<h1>`.
- **Static search index** — `createFromSource(...).staticGET` at [app/api/search.json/route.ts](app/api/search.json/route.ts), with `dynamic = 'force-static'`. The `.json` extension is deliberate (documented CloudFront 301 behaviour) and `post-export.mjs` **fails the build** if the file is missing.
- **Custom `SearchDialog`** — [components/search-dialog.tsx](components/search-dialog.tsx), recomposed from fumadocs-ui primitives so search queries and result clicks can be tracked, with a 600 ms debounce.
- **MDX component overrides** — [components/mdx-components.tsx](components/mdx-components.tsx): `img → ZoomableImage`, plus `Details`, `MkTabs`, `MkTab` for migrated MkDocs directives.
- **Custom remark/rehype pipeline** — `remarkMkdocsDirectives`, `remarkMkdocsLinks`, `remarkDocsImages`, `rehype-raw` ordered *after* Shiki with `passThrough` for MDX nodes, `transformerMetaHighlight` for `{4,9,20-24}` line highlighting, and `fallbackLanguage: 'plaintext'` so an unknown fence language can never break a deploy.
- **Custom 404** — [app/not-found.tsx](app/not-found.tsx), rendered inside the docs shell with `robots: { index: false, follow: true }` and four onward links.

### SEO

- **`<title>` on every page** — `composeTitle(metaTitle ?? title)` ([lib/seo.ts](lib/seo.ts)), which appends `| OpenObserve` only when the title is unbranded *and* still fits in 60 chars.
- **`<meta name="description">` on every page** — 100% coverage, 72–160 chars.
- **Build-time SEO gate** — [scripts/check-seo.mjs](scripts/check-seo.mjs) runs as `prebuild` and **fails the build** on: missing frontmatter, missing title, missing description, title >60 chars *after* brand composition, description outside 70–160, or a duplicate rendered title across two pages. This is the single strongest thing in the project — it makes the metadata quality non-regressible.
- **Canonical URLs** — `alternates.canonical: absoluteUrl(page.url)`, trailing-slash normalised, verified in the export.
- **Open Graph** — `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type=article`, `og:image` (1200×630 with width/height/alt), and `article:modified_time`.
- **Twitter Cards** — `summary_large_image` with title, description, image.
- **JSON-LD** — two blocks per page: `Organization` + `WebSite` (site-wide, with `sameAs`), and `BreadcrumbList` + `TechArticle` (per page, with `dateModified`, `inLanguage`, `isPartOf`, `publisher` `@id` references that resolve).
- **`sitemap.xml`** — 455 URLs, every one with `<lastmod>` from `git log -1 --format=%cs`, sorted, trailing-slash-consistent with the canonicals, plus a `.gz` copy. Registered in the root `sitemap-index.xml` (verified in `website5/dist/sitemap-index.xml`).
- **`robots.txt`** — at the domain root (`website5/public/robots.txt`), fully open, with explicit `Allow` for GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, cohere-ai, AmazonBot and Bytespider. Correct placement: `robots.txt` must live at the origin root, so `/docs` cannot own it.
- **Redirects** — 7 retired URLs get meta-refresh stubs carrying `<link rel="canonical">` to the replacement **and** `<meta name="robots" content="noindex">`, plus a JS `location.replace` that preserves the hash. They are excluded from the sitemap. The hop is root-relative (staging stays on staging) while the canonical is absolute.
- **Zero broken root-relative links** — all 12,635 `href="/docs/…"` instances in the export resolve. (This was originally reported as "zero broken links" full stop. That was wrong — see the correction below.)
- **Clean heading hierarchy** — 0 multi-H1 pages, 0 level skips across 4,242 headings.
- **Alt text** — 931 of 935 images have it.
- **URL structure** — lowercase, hyphenated, hierarchical, trailing-slash, stable across the MkDocs migration.
- **`<html lang="en">`** set.

### AEO / GEO

- **Per-page raw Markdown, published and advertised.** Every page emits `<link rel="alternate" type="text/markdown" href="…/user-guide/streams.md">`, and `copy-assets.mjs` mirrors all 455 `.md` files into `public/` (with `foo/index.md → foo.md` aliases). The deploy uploads them with `Content-Type: text/markdown; charset=utf-8`. This is genuinely ahead of most documentation sites — an AI crawler can fetch clean, chunkable source instead of parsing 270 KB of HTML.
- **`llms.txt`** at `/docs/llms.txt`, advertised from the root layout's `alternates`.
- **"Copy page / Open in ChatGPT / Open in Claude"** — [components/llm-page-actions.tsx](components/llm-page-actions.tsx), on every doc page, pre-filling a prompt that points the model at the absolute `.md` URL.
- **Freshness signals, three ways** — a rendered `<time dateTime="…">Last updated on …</time>`, `article:modified_time`, and `TechArticle.dateModified`.
- **Structured, extractable content** — 202 pages with tables (4,252 rows), 290 pages with numbered step lists, 1,791 code blocks.
- **Marketing-site `llms.txt` / `llms-full.txt`** at the domain root are rich (337 / 452 lines) and reference `/docs/` 150 times each, so docs are reachable from the root LLM index.
- **Search is crawlable-adjacent** — the full index is a plain static JSON file at a stable URL.

### Performance

- **Fully static export** — every page is prerendered HTML on S3/CloudFront. No SSR latency, no cold starts.
- **`next/font` with `display: swap`** — Inter self-hosted and preloaded, so no FOIT and no third-party font request.
- **Search index gzipped at build time** — 36.4 MB → 4.5 MB, uploaded with `Content-Encoding: gzip`, because CloudFront's auto-compression stops at 10 MB. Without this every search user downloaded 36 MB.
- **Lean JS** — 1.4 MB of chunks total, largest 224 KB.
- **LCP image preload** — the export shows `<link rel="preload" as="image" fetchPriority="high">` on the first content image.
- **Analytics deferred** — all tags use `strategy="afterInteractive"` and are gated off on localhost ([lib/telemetry.ts](lib/telemetry.ts)).

---

---

## ✅ Correction: the export had 33 broken links, not zero — now fixed

> **Resolved.** All three classes below are fixed, and [scripts/check-links.mjs](scripts/check-links.mjs) runs as part of `postbuild` so they cannot come back silently. The basePath class was fixed at the source — the links were inside headings, which the table of contents copies out as a bare `<a>` — by replacing those hand-written lists with `::child-pages` on the two hub pages and unlinking the headings on `features/frontend.md`. See M5.

The first version of this audit reported **0 broken internal links**. That scan only matched `href="/docs/…"`. Three other href forms appear in the export and none were checked. Re-scanned across all forms (12,635 root-relative + 79 absolute + 26 relative `<a href>`s):

| Class | Distinct targets | Occurrences | Cause |
|---|---|---|---|
| `href="/docs/…"` root-relative | **0** | — | The original claim, and it holds for this class. |
| **Missing the `/docs` basePath** | **20** | 20 | Links written inside headings inside callouts — `- ### [Stream Details](stream-details.md)`. `remarkMkdocsLinks` rewrites them to `/user-guide/…` (correct — `next/link` is expected to add the prefix), but this copy is rendered as a plain `<a>`, so the prefix never gets added. Lands on `openobserve.ai/user-guide/…`, which is the marketing root → 404. |
| **Stale absolute URLs** | **9** | 14 | Hardcoded `https://openobserve.ai/docs/user-guide/alerts/` and similar, pointing at pages that moved. Untouched by the link rewriter because they are already fully qualified. |
| **Unrewritten relative links** | **4** | 4 | `[docker-compose.yml](docker-compose.yml)` on `keycloak-sso`, referencing files that do not exist in `docs/`. `remarkMkdocsLinks` leaves a non-`.md` target alone when it cannot resolve it, so it ships as-authored and resolves against the page URL. |

Worst offenders: `user-guide/account-administration/management/index.md` (10 basePath-less links), `user-guide/data-processing/streams/index.md` (7), and the three migration guides pointing at `/docs/user-guide/alerts/` and `/docs/user-guide/logs/`.

One further link — `user-guide/index.md` → `/docs/user-guide/rum/` — resolves to a **redirect stub** rather than the real page. It works, but costs a hop and passes through a `noindex` page.

### One URL cannot be linked correctly: `/migration/v0.5.3`

`docs/migration/v0.5.3.md` exports to `migration/v0.5.3/index.html`, and both its canonical tag and its sitemap entry use the slashed form `…/v0.5.3/`. But **no internal link to it can be rendered in that form**: `trailingSlash: true` skips normalisation when the last path segment contains a dot, reading `v0.5.3` as a filename, and `next/link` strips a trailing slash back off if one is set explicitly. The CloudFront Function in front of the bucket only rewrites *extension-less* paths, so `/docs/migration/v0.5.3` is passed through untouched and hits a key that does not exist.

Nothing linked to this page before, so it never surfaced. Adding prev/next navigation gave it two inbound links, which is how it was found.

**Fix:** rename the file to a dot-free slug (`v0-5-3.md`) and add the old path to the `REDIRECTS` map in [scripts/post-export.mjs](scripts/post-export.mjs), which already generates canonical-carrying stubs for seven other retired URLs. A build-time guard rejecting dots in slugs would stop it recurring.

### Note: `llms.txt` files at two levels of one domain

The marketing site (`website5`) and the docs deploy to the same bucket — `s3://…/` and `s3://…/docs` — so four files coexist: `/llms.txt`, `/llms-full.txt`, `/docs/llms.txt`, `/docs/llms-full.txt`. There is no collision; the marketing sync runs with `--exclude "docs/*"`, so it cannot overwrite the docs pair.

They were not cross-linked. `website5/public/llms.txt` has an *Optional* section pointing at its own `/llms-full.txt`, and it deep-links ~150 individual docs pages, but it named neither `/docs/llms.txt` nor `/docs/llms-full.txt` — so an agent fetching the root file had no single-hop route to the full documentation corpus.

**Ownership.** The generator stays in this repo, because this is where the content is: the two files are derived from the 455 Markdown sources under `docs/`, which `website5` cannot see. The ~150 docs links hand-maintained in the root `llms.txt` are the counter-example — they cover a third of the corpus and drift as pages are added, which is the same failure that left the docs index at 34 of 455. `website5` owns discovery instead: two lines in its *Optional* section point at the generated pair, making the root file the entry point for the whole domain.

Done on `website5` branch `seo/link-docs-llms-files` (commit `3680d09`), in both `public/llms.txt` and `public/llms-full.txt`.

This makes **M5 (wire up `onBrokenLink`) a High-Impact item, not Medium**: the hook exists in [lib/remark/mkdocs-links.ts:25](lib/remark/mkdocs-links.ts#L25) and is passed no handler, so none of the above fails the build. The check also has to cover the rendered HTML, not just the remark stage — the basePath class is introduced *after* the rewriter runs.

---

## ⚠️ Partially Implemented

### 1. `llms.txt` covers 7.5% of the documentation

**Current:** `writeLlmsTxt()` in [scripts/copy-assets.mjs:101-191](scripts/copy-assets.mjs#L101-L191) emits **34 entries**. The section patterns were carried over verbatim from the MkDocs `llmstxt` config and use single-`*` globs:

```js
{ title: 'User guide', patterns: ['user-guide/*.md'] },   // matches 4 of 156 files
{ title: 'Integrations', patterns: ['integration/*.md'] }, // matches 1 of 157 files
```

`*` does not cross `/`, so only top-level files match. Two whole trees — `overview/` (7 pages) and `enterprise-setup/` (10 pages) — have no section entry at all and are omitted entirely.

**Missing:** 421 of 455 pages. An AI agent handed this file sees `user-guide/`, `integration/`, `reference/` as near-empty.

**Fix:** change the patterns to `**/*.md` and add the two missing sections. One-line-per-pattern change:

```js
const SECTIONS = [
  { title: 'Getting started', patterns: ['index.md', 'getting-started.md', 'architecture.md'] },
  { title: 'Overview',        patterns: ['overview/**/*.md'] },      // NEW
  { title: 'User guide',      patterns: ['user-guide/**/*.md'] },    // was user-guide/*.md
  { title: 'Ingestion',       patterns: ['ingestion/**/*.md'] },
  { title: 'Integrations',    patterns: ['integration/**/*.md'] },
  { title: 'Features',        patterns: ['features/**/*.md'] },
  { title: 'Enterprise setup',patterns: ['enterprise-setup/**/*.md'] }, // NEW
  { title: 'Administration',  patterns: ['administration/**/*.md'] },
  { title: 'Reference',       patterns: ['reference/**/*.md'] },
  { title: 'Migration',       patterns: ['migration/**/*.md'] },
  { title: 'Releases',        patterns: ['releases.md'] },
];
```

The `toRegExp` helper already supports `**/`. Note the emitted list will jump from 34 to 455 lines — worth also nesting by directory so the file stays readable.

**Also observed:** one entry renders as `- [ingestion-format-support](…)` — the frontmatter `title` is a literal slug, not a human title. Worth grepping for others.

### 2. Internal link graph is shallow, and the sidebar is not in the HTML

**Current:** `DocsLayout` renders the sidebar tree, but collapsed folders are client-only. Measured unique `/docs/*` page links in the static HTML:

| Page | Unique internal doc links |
|---|---|
| `user-guide/streams/index.html` | **8** |
| `getting-started/index.html` | **13** |
| `index.html` (landing) | 37 |

A crawler landing on a leaf page sees eight onward links, all top-level sections. Meanwhile **138 of 455 pages (30%) contain zero internal links in their body prose**, and the corpus averages 3.0 internal links per page.

**Missing:** prev/next navigation. `DocsPage` accepts a `footer` prop that Fumadocs renders as previous/next links from the page tree — it is not passed. That alone would add two high-relevance links to every page and materially flatten crawl depth.

**Fix (immediate, ~10 lines):**

```tsx
// app/[[...slug]]/page.tsx
import { source } from '@/lib/source';

const pages = source.getPages();           // flat, in tree order
const i = pages.findIndex((p) => p.url === page.url);

<DocsPage
  toc={toc}
  full={false}
  footer={{
    previous: i > 0 ? { name: pages[i - 1].data.title, url: pages[i - 1].url } : undefined,
    next: i < pages.length - 1 ? { name: pages[i + 1].data.title, url: pages[i + 1].url } : undefined,
  }}
>
```

**Fix (structural):** ensure section index pages (`user-guide/index.md`, `integration/index.md`, …) render a full child-page list. Several are currently near-empty (see item 4), so the hub-and-spoke graph that both Google and retrieval systems rely on does not exist below the top level.

### 3. `keywords` frontmatter is written but silently discarded

**Current:** 7 pages carry `keywords:` in frontmatter. The Zod schema in [source.config.ts](source.config.ts) is `frontmatterSchema.extend({ metaTitle: z.string().optional() })` — `keywords` is not declared, so it is stripped, and `generateMetadata` never reads it.

**Missing:** either the field should work or the 7 pages should be cleaned up. Making it work is three lines:

```ts
schema: frontmatterSchema.extend({
  metaTitle: z.string().optional(),
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
}),
```

```ts
// generateMetadata
keywords: page.data.keywords,
```

Caveat worth stating plainly: **Google ignores `<meta name="keywords">`**. The real value here is (a) not shipping dead frontmatter, and (b) LLM retrieval systems that *do* read the tag. Low priority, trivial effort.

### 4. Thin and near-empty pages

**Current:** 80 pages have under 150 words of body content. The worst are section index pages that exist purely as sidebar containers:

| Page | Body words |
|---|---|
| `user-guide/analytics/dashboards/filters/index.md` | **0** |
| `reference/api/ingestion/traces/index.md` | 8 |
| `reference/api/ingestion/metrics/index.md` | 10 |
| `reference/api/search/index.md` | 11 |
| `user-guide/data-exploration/metrics/index.md` | 11 |
| `reference/api/stream/index.md` | 13 |

These are all in `sitemap.xml` and all indexable. A zero-word page with a title and description is exactly what Google's thin-content and Search Console "Crawled – currently not indexed" heuristics target, and it is useless to a retrieval system.

**Fix:** turn each into a real hub — 2–3 sentences of orientation plus a linked, described list of its children. This resolves the thin-content problem and the crawl-graph problem (item 2) in one edit. Consider a shared `<ChildPages />` MDX component driven by `source.getPageTree()` so the lists cannot go stale.

### 5. Semantic HTML has no landmarks

**Current, measured on the export:**

| Element | Count on a doc page |
|---|---|
| `<article>` | 1 |
| `<aside>` | 1 |
| `<header>` | 2 |
| `<main>` | **0** |
| `<nav>` | **0** |
| `<footer>` | **0** |
| `<section>` | **0** |
| `role="main"` / `role="navigation"` | **0** |

Fumadocs uses `<div id="nd-…">` for its shell. `aria-label` is used 35 times, so accessibility is partly covered, but there is no `<main>` landmark and no `<nav>` around the sidebar or breadcrumbs.

**Why it matters for GEO specifically:** content-extraction pipelines (Readability, trafilatura, and the boilerplate strippers most crawlers front their parsers with) key on `<main>` and `<article>` to find the primary content and on `<nav>`/`<footer>` to discard chrome. With no `<nav>`, sidebar link text is at risk of being extracted as body content.

**Fix:** wrap children in `<main>` in the root layout, and pass semantic wrappers where Fumadocs allows. Cheap, low-risk:

```tsx
<DocsLayout tree={source.pageTree} {...baseOptions}>
  <main id="content">{children}</main>
</DocsLayout>
```

### 6. Image weight — 267 MB, mostly unoptimised PNG

**Current:** `public/images` is 267 MB across 972 files. 207 files exceed 500 KB; 18 exceed 1 MB. Only 18 are WebP. `images.unoptimized: true` is set (correct and unavoidable — `output: 'export'` has no optimiser), and `remarkImageOptions: false` means images render as plain `<img>`.

**Missing:** width/height attributes. Plain `<img>` with no dimensions is the classic CLS cause; every screenshot on a page shifts layout as it loads. Note `image-size` is *already* a devDependency — the tooling to fix this is installed but unused.

**Fix:**
1. Extend [lib/remark/docs-images.ts](lib/remark/docs-images.ts) to call `image-size` at build time and stamp `width`/`height` onto each node. Eliminates CLS.
2. Add `loading="lazy" decoding="async"` to `ZoomableImage` for below-the-fold images (keep the first image eager — the LCP preload already exists).
3. Convert the 207 large PNGs to WebP/AVIF in a build step. Typical saving on UI screenshots is 60–80%, so ~267 MB → ~70 MB.

**Honest caveat:** LCP/CLS/INP field data was not available for this audit. The CLS and payload conclusions are inferred from the markup and file sizes, not measured in a browser. Run PageSpeed Insights against a deployed page before sizing this work.

### 7. `TechArticle.headline` uses the short sidebar title

**Current:** [components/structured-data.tsx](components/structured-data.tsx) is passed `page.data.title`, so the streams page emits `"headline": "Streams"` while `<title>` and `<h1>` say *"Streams in OpenObserve — Ingestion, Storage, and Querying"*.

**Fix:** pass `page.data.metaTitle ?? page.data.title` to `PageStructuredData`, matching what `generateMetadata` does. One-line change, and it makes the structured data agree with the visible page — which is what Google's structured-data guidelines require.

### 8. Code blocks: 274 without a language

15% of the 1,791 fenced blocks have no language. `fallbackLanguage: 'plaintext'` means they render safely, but they get no syntax highlighting and — more importantly for AEO — no language signal for a model deciding whether a block is Bash, YAML or SQL. The top languages already in use (`bash` 406, `sql` 185, `shell` 168, `json` 165, `javascript` 159, `python` 126, `yaml` 124) make most of these mechanically classifiable.

Also worth normalising: `shell`/`sh`/`bash` are used interchangeably (168 / 45 / 406) and `js`/`javascript` split 18 / 159.

### 9. Search index is 36.4 MB

Gzipped to 4.5 MB, which is handled well — but it is still a 4.5 MB download the first time any visitor opens search, on a site whose HTML pages are ~270 KB. Fumadocs' static Orama client has no incremental-load mode, so the options are to trim indexed fields (index headings + first paragraph rather than full body) or move to a hosted search backend. Not urgent; noted because it is the single largest runtime asset.

---

## ❌ Missing

### AEO / GEO

- **`llms-full.txt`** — the root marketing site has one; `/docs` does not. Given all 455 `.md` sources are already in `public/`, concatenating them is a small addition to `copy-assets.mjs` and is the single highest-leverage GEO item after fixing `llms.txt` itself.
- **FAQ pages and `FAQPage` JSON-LD** — no dedicated FAQ page exists anywhere in 455 pages (8 pages merely mention the word). `FAQPage` is one of the few schema types Google still renders as a rich result and is heavily consumed by AI Overviews.
- **`HowTo` JSON-LD** — 290 pages already contain numbered step lists. None are marked up.
- **Glossary** — no glossary page and no `DefinedTerm` markup, on a product with heavy domain vocabulary (streams, pipelines, functions, VRL, partitioning, RUM, organizations, alerts, folders). A glossary is the classic entity-anchor for GEO: it is what a retrieval system cites when asked "what is a stream in OpenObserve".
- **Question-style headings** — only 223 of 4,242 headings (5.3%) are phrased as a question or start with how/what/why. Answer engines match user queries against headings; this is the largest single AEO gap.
- **Short-answer blocks** — no "TL;DR", callout summary, or key-takeaway convention. Nothing on any page is shaped to be lifted verbatim as a 40-word answer.
- **E-E-A-T signals** — 0 pages carry author metadata. No `author`, no reviewer, no `Person`/`Organization` authorship in the `TechArticle`. `dateModified` is present but `datePublished` is not.
- **"See also" / "Related pages"** — 14 pages of 455. `Next steps` appears on 73, `Prerequisites` on 29.
- **Troubleshooting coverage** — 3 troubleshooting pages across the whole corpus.
- **MCP server** — no MCP endpoint or manifest. Fumadocs supports exposing docs over MCP; for a developer-tools product whose users are increasingly in agent workflows, this is a real differentiator, but it is a larger build than anything else in this list.

### SEO / Fumadocs

- **Prev/next navigation** (`DocsPage footer`) — covered in ⚠️ 2; listed here too because it is a straight omission, not a partial.
- **Page `icon` frontmatter** — 0 of 455 pages set one, so the sidebar and page tree are text-only. Cosmetic, but it is a Fumadocs feature that is free once `source.config.ts` maps icon names to components.
- **Dynamic per-page OG images** — every page shares one static `o2-seo-image.png`. Fumadocs' `createMetadataImage` can generate a per-page card; under `output: 'export'` this requires `generateImageMetadata` + a static `opengraph-image` route, which is workable but not trivial. Impact is on social CTR, not ranking.
- **`/docs/robots.txt`** — genuinely not needed (root `robots.txt` governs the whole origin and is already correct). Noted only so it is not flagged as an oversight later.
- **`changefreq` / `priority` in the sitemap** — absent. Google has publicly stated it ignores both. **Do not add these.**
- **i18n** — single-language site; `inLanguage: 'en'` and `<html lang="en">` are set correctly. Not applicable.
- **Versioned docs** — not implemented. Whether this is a gap depends on product policy, which the codebase does not encode.
- **Anchor-link validation** — `check-seo.mjs` validates frontmatter; `remarkMkdocsLinks` has an `onBrokenLink` hook that **is never wired to anything** (`options` is always `{}`). Page-level links are fine today, but `#fragment` targets are unvalidated and nothing would fail the build if a link broke tomorrow.

---

## 🚀 Priority Roadmap

> **Status:** H1 and the engineering half of H2 are implemented on branch
> `seo/llms-txt-coverage-and-page-navigation`. H3, H4, the hub prose, and M5 remain open.

### 1. High Impact

---

#### H1. Fix `llms.txt` to cover all 455 pages, and add `llms-full.txt` — ✅ **DONE**

**Why:** the file exists, is advertised in `<link rel="alternate">`, and describes 7.5% of the documentation. Any agent that trusts it as the index will conclude the docs are 34 pages. This is a one-character-per-pattern bug (`*` → `**/*`) plus two missing sections.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Negligible | **High** | **Very high** | **~1 hour** |

Change the `SECTIONS` globs in [scripts/copy-assets.mjs](scripts/copy-assets.mjs) as shown in ⚠️ 1, then append a `llms-full.txt` writer:

```js
function writeLlmsFullTxt(pages) {
  const parts = ['# OpenObserve Documentation — full text\n'];
  for (const p of pages.sort((a, b) => a.rel.localeCompare(b.rel))) {
    const raw = fs.readFileSync(p.src, 'utf8').replace(/\r\n/g, '\n');
    const end = raw.indexOf('\n---', 3);
    const fm = frontmatter(p.src);
    parts.push(
      `\n\n---\n\n# ${fm.title ?? p.rel}\n`,
      `Source: ${urlFor(p.rel)}\n\n`,
      raw.slice(end + 4).trim(),
    );
  }
  fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), parts.join(''));
  written.push('llms-full.txt');
}
```

At ~696 words/page average this lands around 4–5 MB — large but well within what the root site already ships and what LLM crawlers handle. Consider gzipping it in `post-export.mjs` alongside the sitemap.

---

#### H2. Add prev/next navigation and turn section indexes into real hubs — ⚠️ **PARTLY DONE**

> Prev/next is live on all 454 content pages, and a `::child-pages` directive now renders
> child lists on the 5 hubs that linked nowhere. The remaining work is prose: 18 hubs whose
> hand-written lists are shorter than their child count (listed below), and orienting
> sentences for the hubs that now show only a list.


**Why:** 30% of pages have no internal links, a leaf page exposes 8 crawlable links, and six section indexes have under 15 words. The metadata on those pages is flawless and pointing at nothing. This is simultaneously the biggest SEO issue (crawl depth, thin content) and a significant GEO issue (no topic clusters, no internal knowledge graph).

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| **High** | Medium | **High** | 1 day for prev/next + a shared component; ~1 week to write hub copy for the ~30 worst index pages |

Two parts:

1. **Prev/next** — the `footer` prop snippet in ⚠️ 2. Ten lines, adds 910 crawlable links across the site.
2. **Hub pages** — add a `<ChildPages />` MDX component reading the page tree, then drop it into every section `index.md` along with 2–3 sentences of orientation:

```tsx
// components/child-pages.tsx
import Link from 'next/link';
import { source } from '@/lib/source';

export function ChildPages({ path }: { path: string }) {
  const children = source.getPages().filter(
    (p) => p.url.startsWith(path) && p.url !== path
      && p.url.slice(path.length).replace(/^\/|\/$/g, '').split('/').length === 1,
  );
  return (
    <ul>
      {children.map((p) => (
        <li key={p.url}>
          <Link href={p.url}>{p.data.title}</Link> — {p.data.description}
        </li>
      ))}
    </ul>
  );
}
```

Because it emits each child's `description`, one component call fixes the thin-content problem *and* the link-graph problem on the same page.

**Remaining follow-up — 18 hubs whose hand-written list is shorter than their child count.** These were left alone deliberately: adding `::child-pages` would duplicate a curated list rather than replace it, and deciding between the two is a content call.

| Hub | Links | Children |
|---|---|---|
| `user-guide/analytics/dashboards/config/index.md` | 2 | 5 |
| `user-guide/data-exploration/metrics/index.md` | 2 | 4 |
| `user-guide/data-processing/enrichment-tables/index.md` | 2 | 3 |
| `user-guide/analytics/dashboards/panels/index.md` | 3 | 5 |
| `reference/api/search/index.md` | 3 | 4 |
| `user-guide/data-exploration/logs/index.md` | 4 | 8 |
| `user-guide/advanced/query-tuning/index.md` | 4 | 6 |
| `user-guide/analytics/dashboards/custom-charts/index.md` | 4 | 6 |
| `features/index.md` | 5 | 7 |
| `user-guide/data-processing/pipelines/index.md` | 6 | 9 |
| `administration/maintenance/operator-guide/index.md` | 7 | 10 |
| `user-guide/analytics/dashboards/index.md` | 7 | 11 |
| `enterprise-setup/index.md` | 7 | 9 |
| `integration/ai/index.md` | 8 | 13 |
| `user-guide/account-administration/identity-and-access-management/index.md` | 9 | 11 |
| `ingestion/logs/index.md` | 10 | 11 |
| `integration/cloud/aws/index.md` | 14 | 16 |
| `integration/ai/providers/index.md` | 22 | 23 |

Two more — `user-guide/data-processing/streams/index.md` and `user-guide/account-administration/management/index.md` — have lists that *do* cover their children, but every link in them is one of the basePath-less 404s described in the correction section. Replacing those lists with `::child-pages` would fix the links and the drift in one edit, and is the obvious first candidate.

---

#### H3. Convert headings to question form and add short-answer blocks

**Why:** 5.3% question-style headings is the binding constraint on AEO. Google AI Overviews, Perplexity and ChatGPT search all match a user's natural-language query against heading text and then lift the first 30–60 words beneath it. Content that answers "How do I set retention on a stream?" under a heading that reads `Retention` is much less likely to be surfaced or cited.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Medium (long-tail + featured snippets) | **Very high** | **High** | ~2–3 weeks across the corpus; prioritise the top 50 pages by traffic |

Pattern to apply — the answer sits immediately under the heading, before any preamble:

```markdown
## How do I set data retention for a stream?

Set retention per stream from **Streams → *stream name* → Stream Settings → Data Retention (days)**.
The value overrides the org-wide default; leave it empty to inherit. Changes apply to new
ingestion immediately and to existing data at the next compaction cycle.

### Steps
1. Open **Streams** from the left navigation.
...
```

Do not rewrite all 455 pages. Pull the top 50 pages by GA4 sessions (GA4 is already wired via [components/analytics.tsx](components/analytics.tsx)) and convert those first.

---

#### H4. Add a Glossary and an FAQ, with `DefinedTerm` and `FAQPage` JSON-LD

**Why:** the corpus has no entity-anchor page. "What is a stream in OpenObserve", "what is VRL", "what is a pipeline" are exactly the definitional queries answer engines serve most, and there is currently no page shaped to be the citation. `FAQPage` is also one of the last schema types Google still renders as a rich result.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| **High** (definitional long-tail) | **Very high** | **Very high** (entity consistency, citation anchor) | 2–4 days |

Glossary page with `DefinedTermSet`:

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": "https://openobserve.ai/docs/reference/glossary/#set",
  "name": "OpenObserve Glossary",
  "hasDefinedTerm": [{
    "@type": "DefinedTerm",
    "@id": "https://openobserve.ai/docs/reference/glossary/#stream",
    "name": "Stream",
    "description": "A named collection of records of one type — logs, metrics, or traces — within an organization. Streams carry their own schema, partitioning and retention settings.",
    "inDefinedTermSet": { "@id": "https://openobserve.ai/docs/reference/glossary/#set" },
    "url": "https://openobserve.ai/docs/user-guide/streams/"
  }]
}
```

Each term links out to its full doc page, which converts the glossary into a hub feeding H2's link-graph fix.

For the FAQ, add an MDX `<Faq>` component that renders the Q&A *and* emits `FAQPage` JSON-LD from the same source, so the two cannot drift — the same discipline already applied to breadcrumbs.

---

### 2. Medium Impact

---

#### M1. Add `<main>`, `<nav>`, `<footer>` landmarks

**Why:** boilerplate-removal pipelines in front of most crawlers and LLM ingestion use these landmarks to separate content from chrome. Currently a doc page has zero of them.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Low–Medium | Medium | **High** | 2–4 hours |

---

#### M2. Stamp `width`/`height` on every image, add lazy loading, convert PNG→WebP

**Why:** 267 MB of images, 207 over 500 KB, rendered as dimensionless `<img>`. CLS and LCP both suffer. `image-size` is already installed.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| **High** (Core Web Vitals) | Low | Low | 1 day for dimensions + lazy loading; 1–2 days for a conversion pipeline |

Measure with PageSpeed Insights first — the CLS claim here is inferred from markup, not observed.

---

#### M3. Add `HowTo` JSON-LD to step-based pages

**Why:** 290 pages already have numbered step lists. Marking them up is mechanical and makes each page eligible to be lifted as a procedure by answer engines.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Medium | **High** | Medium | 2–3 days (a remark plugin that detects `## Steps` + an `<ol>` and emits the JSON-LD) |

---

#### M4. Add author / reviewer metadata and `datePublished`

**Why:** E-E-A-T. Zero pages carry authorship today, and `TechArticle` has `dateModified` but no `datePublished`. For technical documentation, crediting the engineering org and a named reviewer is a legitimate and inexpensive trust signal.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Medium | **High** | Medium | 1 day (default to `Organization` OpenObserve; `datePublished` from `git log --diff-filter=A`, using the same `execFileSync` approach already in `post-export.mjs`) |

---

#### M5. Wire up `onBrokenLink` and add a link check over the built HTML → ✅ **post-export check done; `onBrokenLink` still unwired**

[scripts/check-links.mjs](scripts/check-links.mjs) now runs as part of `postbuild` and fails the build on all three classes below. All 33 links are fixed; the checker reports zero against the current export. The remark-stage hook in [lib/remark/mkdocs-links.ts:25](lib/remark/mkdocs-links.ts#L25) is still passed no handler — redundant for catching breakage, but it would move the 4th class earlier and give a file/line rather than a page URL.

**Why:** see the correction section above — there were 33 broken links shipping, and nothing caught them.

Two checks are needed, because they catch different classes:

1. **`onBrokenLink` at the remark stage** — catches the 4 unrewritten relative links and any future `.md` target that does not exist.
2. **A post-export scan over `out/`** — catches the 20 basePath-less links and the 9 stale absolute URLs. Neither is visible at the remark stage: the first is introduced during rendering, the second was never a relative link to begin with. Fits alongside `post-export.mjs`, which already walks `out/`.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| **High** | Low | Medium | 1 day for both checks; the 33 existing links then need fixing (mostly one-line content edits) |

---

#### M6. Add "Related pages" / "See also" to the top 100 pages

**Why:** 14 of 455 pages have one. Directly compounds H2 — related-page blocks are what turn a tree into a graph.

| SEO | AEO | GEO | Effort |
|---|---|---|---|
| Medium | Medium | **High** (topic clusters) | 1 week, or partly automated from shared frontmatter tags |

---

### 3. Low Impact

---

#### L1. Fix `TechArticle.headline` to use `metaTitle`

Structured data should match the visible page. One-line change in [app/[[...slug]]/page.tsx](app/%5B%5B...slug%5D%5D/page.tsx).
**SEO:** Low · **AEO:** Low · **GEO:** Low · **Effort:** 5 minutes

#### L2. Add a language to the 274 unlabelled code fences; normalise `sh`/`shell`/`bash` and `js`/`javascript`

**SEO:** Low · **AEO:** Medium · **GEO:** Medium · **Effort:** 1 day, mostly mechanical

#### L3. Declare `keywords` in the schema or delete it from the 7 pages that set it

Google ignores the tag; some LLM retrieval systems read it. Either way, dead frontmatter should not persist.
**SEO:** Negligible · **AEO:** Low · **GEO:** Low · **Effort:** 15 minutes

#### L4. Add `icon` frontmatter support for sidebar icons

Pure UX/navigation polish; no measurable search effect.
**SEO:** Negligible · **AEO:** Negligible · **GEO:** Negligible · **Effort:** 2 hours + design time

#### L5. Dynamic per-page OG images

Improves social CTR, not ranking. Needs `generateImageMetadata` under `output: 'export'`.
**SEO:** Low · **AEO:** Negligible · **GEO:** Negligible · **Effort:** 1–2 days

#### L6. Trim the 36.4 MB search index

Index headings + lead paragraph instead of full body. Trades some recall for a much smaller first-search download.
**SEO:** Negligible · **AEO:** Negligible · **GEO:** Low · **Effort:** 1 day + relevance testing

#### L7. Investigate MCP

Exposing the docs as an MCP server would let coding agents query OpenObserve documentation natively. Highest ceiling in this document, lowest certainty — scope it as a spike, not a task.
**SEO:** None · **AEO:** Medium · **GEO:** **High** · **Effort:** 1–2 weeks

#### Explicitly do NOT do

- **Add `changefreq` / `priority` to the sitemap** — Google has stated it ignores both.
- **Add `/docs/robots.txt`** — `robots.txt` is only valid at the origin root, and the root one is already correct and AI-crawler-friendly.
- **Add `hreflang`** — single-language site.

---

## Suggested Sequencing

| Phase | Items | Rough effort | What it buys |
|---|---|---|---|
| **Week 1** | H1, H2 (prev/next only), L1, L3, M5 | ~3 days | `llms.txt` goes 34 → 455 entries; +910 crawlable links; link health becomes build-enforced |
| **Weeks 2–3** | H2 (hub pages), M1, M2 | ~2 weeks | Thin content resolved, topic clusters exist, CWV improves |
| **Weeks 4–6** | H4, H3 (top 50 pages) | ~3 weeks | Glossary + FAQ as citation anchors; the highest-traffic pages become answer-engine-shaped |
| **Ongoing** | H3 (remainder), M3, M4, M6 | continuous | Corpus-wide AEO conversion |
| **Spike** | L7 (MCP) | 1–2 weeks | Agent-native docs access |

---

## Closing Note

This is a well-built documentation site. The migration off MkDocs preserved URL structure, kept 13,809 internal links intact, and left behind a build-time SEO gate ([scripts/check-seo.mjs](scripts/check-seo.mjs)) that makes metadata quality non-regressible — that gate is worth more than most of the recommendations above, and the pattern should be extended to cover the new checks (anchor validation, `llms.txt` coverage, image dimensions).

The gaps are not in *how* the pages are built; they are in **how the pages point at each other** (H2, M6) and **how the content is shaped for a question-answering system rather than a reader browsing a sidebar** (H3, H4). The `llms.txt` glob bug (H1) is the one outright defect, and it is roughly an hour's work.
